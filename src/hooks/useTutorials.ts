import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useImageUpload } from './useImageUpload';
import type { Tutorial, TutorialStep, CreateTutorialData } from '../types/tutorial';

export function useTutorials(hotelId: string) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteImage } = useImageUpload();

  const fetchTutorials = async () => {
    if (!hotelId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching tutorials for hotel:', hotelId);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase client status:', {
        url: supabase.supabaseUrl,
        key: supabase.supabaseKey ? 'present' : 'missing'
      });
      
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Tutorials fetched successfully:', data);
      setTutorials(data || []);
    } catch (err) {
      console.error('Full error object:', err);
      
      let errorMessage = 'Erro ao carregar tutoriais';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão com a internet e as configurações do Supabase.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTutorialWithSteps = async (tutorialId: string): Promise<Tutorial | null> => {
    try {
      console.log('Fetching tutorial with steps:', tutorialId);
      
      // Buscar tutorial
      const { data: tutorial, error: tutorialError } = await supabase
        .from('tutorials')
        .select('*')
        .eq('id', tutorialId)
        .single();

      if (tutorialError) {
        console.error('Tutorial fetch error:', tutorialError);
        throw tutorialError;
      }

      // Buscar passos
      const { data: steps, error: stepsError } = await supabase
        .from('tutorial_steps')
        .select('*')
        .eq('tutorial_id', tutorialId)
        .order('step_number', { ascending: true });

      if (stepsError) {
        console.error('Steps fetch error:', stepsError);
        throw stepsError;
      }

      // Buscar opções para cada passo
      const stepsWithOptions = await Promise.all(
        (steps || []).map(async (step) => {
          const { data: options, error: optionsError } = await supabase
            .from('tutorial_step_options')
            .select('*')
            .eq('step_id', step.id)
            .order('order_index', { ascending: true });

          if (optionsError) {
            console.error('Options fetch error:', optionsError);
            throw optionsError;
          }

          return {
            ...step,
            options: options || []
          };
        })
      );

      return {
        ...tutorial,
        steps: stepsWithOptions
      };
    } catch (err) {
      console.error('Full fetchTutorialWithSteps error:', err);
      return null;
    }
  };

  const createTutorial = async (data: CreateTutorialData, createdBy: string): Promise<string | null> => {
    if (!hotelId) return null;

    try {
      console.log('Starting tutorial creation...', { data, createdBy, hotelId });
      
      // Criar tutorial
      const { data: tutorial, error: tutorialError } = await supabase
        .from('tutorials')
        .insert({
          title: data.title,
          description: data.description,
          hotel_id: hotelId,
          created_by: createdBy
        })
        .select()
        .single();

      if (tutorialError) {
        console.error('Tutorial creation error:', tutorialError);
        throw tutorialError;
      }
      
      console.log('Tutorial created successfully:', tutorial);

      // Criar passos
      console.log('Creating steps...');
      const stepsToInsert = data.steps.map((step, index) => ({
        tutorial_id: tutorial.id,
        step_number: index + 1,
        title: step.title,
        content: step.content,
        image_url: step.image_url,
        question: step.question
      }));

      console.log('Steps to insert:', stepsToInsert);
      const { data: createdSteps, error: stepsError } = await supabase
        .from('tutorial_steps')
        .insert(stepsToInsert)
        .select();

      if (stepsError) {
        console.error('Steps creation error:', stepsError);
        throw stepsError;
      }
      
      console.log('Steps created successfully:', createdSteps);

      // Criar opções para passos que têm ramificações
      console.log('Creating options...');
      for (let i = 0; i < data.steps.length; i++) {
        const stepData = data.steps[i];
        const createdStep = createdSteps[i];

        if (stepData.options && stepData.options.length > 0) {
          console.log(`Creating options for step ${i + 1}:`, stepData.options);
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

          console.log('Options to insert:', optionsToInsert);
          const { error: optionsError } = await supabase
            .from('tutorial_step_options')
            .insert(optionsToInsert);

          if (optionsError) {
            console.error('Options creation error:', optionsError);
            throw optionsError;
          }
          
          console.log(`Options created successfully for step ${i + 1}`);
        }
      }

      console.log('Refreshing tutorials list...');
      await fetchTutorials();
      console.log('Tutorial creation completed successfully');
      return tutorial.id;
    } catch (err) {
      console.error('Full createTutorial error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar tutorial';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
      return null;
    }
  };

  const updateTutorial = async (tutorialId: string, data: CreateTutorialData): Promise<boolean> => {
    try {
      console.log('Starting tutorial update...', { tutorialId, data });
      
      // Atualizar tutorial
      const { error: tutorialError } = await supabase
        .from('tutorials')
        .update({
          title: data.title,
          description: data.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', tutorialId);

      if (tutorialError) {
        console.error('Tutorial update error:', tutorialError);
        throw tutorialError;
      }
      
      console.log('Tutorial updated successfully');

      // Deletar passos e opções existentes
      console.log('Deleting existing options...');
      const { error: deleteOptionsError } = await supabase
        .from('tutorial_step_options')
        .delete()
        .in('step_id', (
          await supabase
            .from('tutorial_steps')
            .select('id')
            .eq('tutorial_id', tutorialId)
        ).data?.map(step => step.id) || []);

      if (deleteOptionsError) {
        console.error('Delete options error:', deleteOptionsError);
        throw deleteOptionsError;
      }
      
      console.log('Options deleted successfully');

      console.log('Deleting existing steps...');
      const { error: deleteStepsError } = await supabase
        .from('tutorial_steps')
        .delete()
        .eq('tutorial_id', tutorialId);

      if (deleteStepsError) {
        console.error('Delete steps error:', deleteStepsError);
        throw deleteStepsError;
      }
      
      console.log('Steps deleted successfully');

      // Recriar passos
      console.log('Creating new steps...');
      const stepsToInsert = data.steps.map((step, index) => ({
        tutorial_id: tutorialId,
        step_number: index + 1,
        title: step.title,
        content: step.content,
        image_url: step.image_url,
        question: step.question
      }));

      console.log('Steps to insert:', stepsToInsert);
      const { data: createdSteps, error: stepsError } = await supabase
        .from('tutorial_steps')
        .insert(stepsToInsert)
        .select();

      if (stepsError) {
        console.error('Steps creation error:', stepsError);
        throw stepsError;
      }
      
      console.log('Steps created successfully:', createdSteps);

      // Recriar opções
      console.log('Creating new options...');
      for (let i = 0; i < data.steps.length; i++) {
        const stepData = data.steps[i];
        const createdStep = createdSteps[i];

        if (stepData.options && stepData.options.length > 0) {
          console.log(`Creating options for step ${i + 1}:`, stepData.options);
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

          console.log('Options to insert:', optionsToInsert);
          const { error: optionsError } = await supabase
            .from('tutorial_step_options')
            .insert(optionsToInsert);

          if (optionsError) {
            console.error('Options creation error:', optionsError);
            throw optionsError;
          }
          
          console.log(`Options created successfully for step ${i + 1}`);
        }
      }

      console.log('Refreshing tutorials list...');
      await fetchTutorials();
      console.log('Tutorial update completed successfully');
      return true;
    } catch (err) {
      console.error('Full updateTutorial error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar tutorial';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const deleteTutorial = async (tutorialId: string): Promise<boolean> => {
    try {
      // Buscar tutorial com passos para deletar imagens
      const tutorialWithSteps = await fetchTutorialWithSteps(tutorialId);
      
      // Deletar imagens associadas
      if (tutorialWithSteps?.steps) {
        for (const step of tutorialWithSteps.steps) {
          if (step.image_url && step.image_url.includes('tutorial-images')) {
            await deleteImage(step.image_url);
          }
        }
      }
      
      const { error } = await supabase
        .from('tutorials')
        .update({ is_active: false })
        .eq('id', tutorialId);

      if (error) throw error;

      await fetchTutorials();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar tutorial');
      return false;
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, [hotelId]);

  return {
    tutorials,
    isLoading,
    error,
    fetchTutorials,
    fetchTutorialWithSteps,
    createTutorial,
    updateTutorial,
    deleteTutorial
  };
}