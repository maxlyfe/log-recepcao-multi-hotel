import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useImageUpload } from './useImageUpload';
import type { Tutorial, CreateTutorialData, TutorialShare } from '../types/tutorial'; // Adicionar TutorialShare

export function useTutorials(hotelId: string) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [pendingShares, setPendingShares] = useState<TutorialShare[]>([]); // NOVO: Estado para compartilhamentos
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteImage } = useImageUpload();

  const fetchTutorials = async () => {
    if (!hotelId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Busca tutoriais e compartilhamentos pendentes ao mesmo tempo
      const [tutorialsRes, sharesRes] = await Promise.all([
          supabase
            .from('tutorials')
            .select('*')
            .eq('hotel_id', hotelId)
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('tutorial_shares')
            .select(`
                id, 
                status,
                source_hotel:source_hotel_id(name),
                tutorial:tutorial_id_to_share(title)
            `)
            .eq('target_hotel_id', hotelId)
            .eq('status', 'pending')
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
  };

  const shareTutorial = async (tutorialId: string, targetHotelIds: string[]) => {
    if (!hotelId) return;
    const { error } = await supabase.rpc('share_tutorial', {
        p_tutorial_id: tutorialId,
        p_source_hotel_id: hotelId,
        p_target_hotel_ids: targetHotelIds
    });
    if (error) {
        console.error("Erro ao compartilhar tutorial:", error);
        throw error;
    }
  };

  const acceptShare = async (shareId: string) => {
    if (!hotelId) return;
    const { error } = await supabase.rpc('accept_tutorial_share', {
        p_share_id: shareId,
        p_target_hotel_id: hotelId
    });
    if (error) {
        console.error("Erro ao aceitar compartilhamento:", error);
        throw error;
    }
    // Atualiza a lista de tutoriais e compartilhamentos
    await fetchTutorials();
  };

  const rejectShare = async (shareId: string) => {
    const { error } = await supabase
        .from('tutorial_shares')
        .update({ status: 'rejected', processed_at: new Date().toISOString() })
        .eq('id', shareId);

    if (error) {
        console.error("Erro ao rejeitar compartilhamento:", error);
        throw error;
    }
    await fetchTutorials();
  };
  
  // O resto do hook continua o mesmo...

  const fetchTutorialWithSteps = async (tutorialId: string): Promise<Tutorial | null> => {
    try {
      const { data: tutorial, error: tutorialError } = await supabase
        .from('tutorials')
        .select('*')
        .eq('id', tutorialId)
        .single();

      if (tutorialError) throw tutorialError;

      const { data: steps, error: stepsError } = await supabase
        .from('tutorial_steps')
        .select('*')
        .eq('tutorial_id', tutorialId)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;

      const stepsWithOptions = await Promise.all(
        (steps || []).map(async (step) => {
          const { data: options, error: optionsError } = await supabase
            .from('tutorial_step_options')
            .select('*')
            .eq('step_id', step.id)
            .order('order_index', { ascending: true });

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

  const createTutorial = async (data: CreateTutorialData, createdBy: string): Promise<string | null> => { /* ... sem alterações ... */ };
  const updateTutorial = async (tutorialId: string, data: CreateTutorialData): Promise<boolean> => { /* ... sem alterações ... */ };
  const deleteTutorial = async (tutorialId: string): Promise<boolean> => { /* ... sem alterações ... */ };

  useEffect(() => {
    fetchTutorials();
  }, [hotelId]);

  return {
    tutorials,
    pendingShares, // NOVO
    isLoading,
    error,
    fetchTutorials,
    fetchTutorialWithSteps,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    shareTutorial,    // NOVO
    acceptShare,      // NOVO
    rejectShare       // NOVO
  };
}