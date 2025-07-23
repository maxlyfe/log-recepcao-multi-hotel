import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useImageUpload } from './useImageUpload';
import type { Tutorial, CreateTutorialData, TutorialShare } from '../types/tutorial';
import { useLogStore } from '../store';

export function useTutorials(hotelId: string) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [pendingShares, setPendingShares] = useState<TutorialShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteImage } = useImageUpload();

  const fetchTutorials = useCallback(async () => {
    if (!hotelId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [tutorialsRes, sharesRes] = await Promise.all([
        supabase.from('tutorials').select('*').eq('hotel_id', hotelId).eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('tutorial_shares').select(`id, status, source_hotel:source_hotel_id(name), tutorial:tutorial_id_to_share(title)`).eq('target_hotel_id', hotelId).eq('status', 'pending')
      ]);
      if (tutorialsRes.error) throw tutorialsRes.error;
      if (sharesRes.error) throw sharesRes.error;
      setTutorials(tutorialsRes.data || []);
      setPendingShares(sharesRes.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tutoriais';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const fetchTutorialWithSteps = async (tutorialId: string): Promise<Tutorial | null> => {
    try {
      const { data: tutorial, error: tutorialError } = await supabase.from('tutorials').select('*').eq('id', tutorialId).single();
      if (tutorialError) throw tutorialError;
      const { data: steps, error: stepsError } = await supabase.from('tutorial_steps').select('*').eq('tutorial_id', tutorialId).order('step_number', { ascending: true });
      if (stepsError) throw stepsError;
      const stepsWithOptions = await Promise.all(
        (steps || []).map(async (step) => {
          const { data: options, error: optionsError } = await supabase.from('tutorial_step_options').select('*').eq('step_id', step.id).order('order_index', { ascending: true });
          if (optionsError) throw optionsError;
          return { ...step, options: options || [] };
        })
      );
      return { ...tutorial, steps: stepsWithOptions };
    } catch (err) {
      console.error('Full fetchTutorialWithSteps error:', err);
      return null;
    }
  };

  const createTutorial = async (data: CreateTutorialData, createdBy: string): Promise<string | null> => {
    if (!hotelId) return null;
    setIsLoading(true);
    setError(null);

    try {
      const { data: tutorial, error: tutorialError } = await supabase
        .from('tutorials')
        .insert({
          title: data.title,
          description: data.description,
          hotel_id: hotelId,
          created_by: createdBy,
          is_active: true
        })
        .select()
        .single();

      if (tutorialError) throw new Error(`Erro ao criar tutorial: ${tutorialError.message}`);
      
      const stepsToInsert = data.steps.map((step, index) => ({
        tutorial_id: tutorial.id,
        step_number: index + 1,
        title: step.title,
        content: step.content,
        image_url: step.image_url || null,
        question: step.question || null
      }));

      const { data: createdSteps, error: stepsError } = await supabase
        .from('tutorial_steps')
        .insert(stepsToInsert)
        .select();

      if (stepsError) throw new Error(`Erro ao criar passos: ${stepsError.message}`);
      
      for (let i = 0; i < data.steps.length; i++) {
        const stepData = data.steps[i];
        const createdStep = createdSteps[i];

        if (stepData.options && stepData.options.length > 0) {
          const optionsToInsert = stepData.options.map((option, optionIndex) => {
            let nextStepId = null;
            if (option.next_step_number && option.next_step_number <= createdSteps.length) {
              nextStepId = createdSteps[option.next_step_number - 1].id;
            }
            return {
              step_id: createdStep.id,
              option_text: option.option_text,
              next_step_id: nextStepId,
              order_index: optionIndex
            };
          });

          const { error: optionsError } = await supabase.from('tutorial_step_options').insert(optionsToInsert);
          if (optionsError) throw new Error(`Erro ao criar opções para o passo ${i + 1}: ${optionsError.message}`);
        }
      }

      await fetchTutorials();
      return tutorial.id;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao salvar.';
      setError(errorMessage);
      alert(`Erro ao salvar tutorial: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTutorial = async (tutorialId: string, data: CreateTutorialData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error: tutorialError } = await supabase
        .from('tutorials')
        .update({
          title: data.title,
          description: data.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', tutorialId);
      if (tutorialError) throw tutorialError;

      const { data: existingSteps } = await supabase.from('tutorial_steps').select('id').eq('tutorial_id', tutorialId);
      const existingStepIds = (existingSteps || []).map(s => s.id);
      if (existingStepIds.length > 0) {
        await supabase.from('tutorial_step_options').delete().in('step_id', existingStepIds);
      }
      await supabase.from('tutorial_steps').delete().eq('tutorial_id', tutorialId);

      const stepsToInsert = data.steps.map((step, index) => ({
        tutorial_id: tutorialId,
        step_number: index + 1,
        title: step.title,
        content: step.content,
        image_url: step.image_url,
        question: step.question
      }));
      const { data: createdSteps, error: stepsError } = await supabase.from('tutorial_steps').insert(stepsToInsert).select();
      if (stepsError) throw stepsError;

      for (let i = 0; i < data.steps.length; i++) {
        const stepData = data.steps[i];
        const createdStep = createdSteps[i];
        if (stepData.options && stepData.options.length > 0) {
          const optionsToInsert = stepData.options.map((option, optionIndex) => {
            let nextStepId = null;
            if (option.next_step_number && option.next_step_number <= createdSteps.length) {
              nextStepId = createdSteps[option.next_step_number - 1].id;
            }
            return { step_id: createdStep.id, option_text: option.option_text, next_step_id: nextStepId, order_index: optionIndex };
          });
          const { error: optionsError } = await supabase.from('tutorial_step_options').insert(optionsToInsert);
          if (optionsError) throw optionsError;
        }
      }
      await fetchTutorials();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar tutorial';
      setError(msg);
      alert(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTutorial = async (tutorialId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const tutorialWithSteps = await fetchTutorialWithSteps(tutorialId);
      if (tutorialWithSteps?.steps) {
        for (const step of tutorialWithSteps.steps) {
          if (step.image_url && step.image_url.includes('tutorial-images')) {
            await deleteImage(step.image_url);
          }
        }
      }
      const { error } = await supabase.from('tutorials').update({ is_active: false }).eq('id', tutorialId);
      if (error) throw error;
      await fetchTutorials();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar tutorial');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const shareTutorial = async (tutorialId: string, targetHotelIds: string[]) => {
    if (!hotelId) return;
    const { error } = await supabase.rpc('share_tutorial', {
        p_tutorial_id: tutorialId,
        p_source_hotel_id: hotelId,
        p_target_hotel_ids: targetHotelIds
    });
    if (error) throw error;
  };

  const acceptShare = async (shareId: string) => {
    if (!hotelId) return;
    const { error } = await supabase.rpc('accept_tutorial_share', {
        p_share_id: shareId,
        p_target_hotel_id: hotelId
    });
    if (error) throw error;
    await fetchTutorials();
  };

  const rejectShare = async (shareId: string) => {
    const { error } = await supabase.from('tutorial_shares').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', shareId);
    if (error) throw error;
    await fetchTutorials();
  };

  return {
    tutorials,
    pendingShares,
    isLoading,
    error,
    fetchTutorials,
    fetchTutorialWithSteps,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    shareTutorial,
    acceptShare,
    rejectShare
  };
}