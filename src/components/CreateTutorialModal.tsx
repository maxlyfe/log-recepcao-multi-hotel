import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, HelpCircle, ArrowRight } from 'lucide-react';
import { useLogStore } from '../store';
import { useTutorials } from '../hooks/useTutorials';
import ImageUploadField from './ImageUploadField';
import type { Tutorial, CreateStepData, CreateOptionData } from '../types/tutorial';

interface CreateTutorialModalProps {
  tutorial?: Tutorial | null;
  onClose: () => void;
}

export default function CreateTutorialModal({ tutorial, onClose }: CreateTutorialModalProps) {
  const { selectedHotel } = useLogStore();
  const { createTutorial, updateTutorial, fetchTutorialWithSteps } = useTutorials(selectedHotel?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<CreateStepData[]>([
    { title: '', content: '', image_url: '', question: '', options: [] }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTutorial, setLoadingTutorial] = useState(false);

  useEffect(() => {
    if (tutorial?.id) {
      setLoadingTutorial(true);
      
      const loadTutorial = async () => {
        try {
          const fullTutorial = await fetchTutorialWithSteps(tutorial.id);
          if (fullTutorial) {
            setTitle(fullTutorial.title);
            setDescription(fullTutorial.description || '');
            
            if (fullTutorial.steps && fullTutorial.steps.length > 0) {
              const convertedSteps = fullTutorial.steps.map(step => ({
                title: step.title,
                content: step.content,
                image_url: step.image_url || '',
                question: step.question || '',
                options: step.options?.map(option => ({
                  option_text: option.option_text,
                  next_step_number: option.next_step_id ? 
                    fullTutorial.steps?.findIndex(s => s.id === option.next_step_id) + 1 : undefined
                })) || []
              }));
              setSteps(convertedSteps);
            } else {
              setSteps([{ title: '', content: '', image_url: '', question: '', options: [] }]);
            }
          }
        } catch (error) {
          console.error('Error loading tutorial for edit:', error);
        } finally {
          setLoadingTutorial(false);
        }
      };
      
      loadTutorial();
    } else {
      // Reset form for new tutorial
      setTitle('');
      setDescription('');
      setSteps([{ title: '', content: '', image_url: '', question: '', options: [] }]);
    }
  }, [tutorial?.id]);

  const addStep = () => {
    setSteps([...steps, { title: '', content: '', image_url: '', question: '', options: [] }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof CreateStepData, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const addOption = (stepIndex: number) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].options) {
      newSteps[stepIndex].options = [];
    }
    newSteps[stepIndex].options!.push({ option_text: '', next_step_number: undefined });
    setSteps(newSteps);
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options = newSteps[stepIndex].options?.filter((_, i) => i !== optionIndex) || [];
    setSteps(newSteps);
  };

  const updateOption = (stepIndex: number, optionIndex: number, field: keyof CreateOptionData, value: any) => {
    const newSteps = [...steps];
    if (!newSteps[stepIndex].options) return;
    newSteps[stepIndex].options![optionIndex] = { 
      ...newSteps[stepIndex].options![optionIndex], 
      [field]: value 
    };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    console.log('Starting save process...', { tutorial: tutorial?.id, title, steps });
    
    if (!title.trim()) {
      alert('Por favor, insira um título para o tutorial');
      return;
    }

    if (steps.some(step => !step.title.trim() || !step.content.trim())) {
      alert('Por favor, preencha o título e conteúdo de todos os passos');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Preparing tutorial data...');
      const tutorialData = {
        title: title.trim(),
        description: description.trim() || undefined,
        steps: steps.map(step => ({
          ...step,
          title: step.title.trim(),
          content: step.content.trim(),
          image_url: step.image_url?.trim() || undefined,
          question: step.question?.trim() || undefined,
          options: step.options?.filter(opt => opt.option_text.trim()) || []
        }))
      };

      console.log('Tutorial data prepared:', tutorialData);

      let success = false;
      if (tutorial) {
        console.log('Updating existing tutorial:', tutorial.id);
        success = await updateTutorial(tutorial.id, tutorialData);
        console.log('Update result:', success);
      } else {
        console.log('Creating new tutorial...');
        const tutorialId = await createTutorial(tutorialData, 'Admin'); // TODO: usar usuário atual
        success = !!tutorialId;
        console.log('Create result:', { tutorialId, success });
      }

      if (success) {
        console.log('Save successful, closing modal...');
        onClose();
      } else {
        console.log('Save failed');
        alert('Erro ao salvar tutorial. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar tutorial:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert('Erro ao salvar tutorial. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingTutorial) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center">Carregando tutorial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium">
              {tutorial ? 'Editar Tutorial' : 'Criar Novo Tutorial'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Título do Tutorial *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Como fazer check-in"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Descrição geral do tutorial..."
              />
            </div>
          </div>

          {/* Passos do Tutorial */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">Passos do Tutorial</h4>
              <button
                onClick={addStep}
                className="flex items-center px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Passo
              </button>
            </div>

            {steps.map((step, stepIndex) => (
              <div key={stepIndex} className="glass-effect p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">Passo {stepIndex + 1}</h5>
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(stepIndex)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Título do Passo *
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(stepIndex, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Verificar documentos"
                    />
                  </div>
                  <div>
                    <ImageUploadField
                      value={step.image_url}
                      onChange={(value) => updateStep(stepIndex, 'image_url', value)}
                      label="Imagem do Passo (opcional)"
                      placeholder="URL da imagem ou faça upload"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Conteúdo/Descrição *
                  </label>
                  <textarea
                    value={step.content}
                    onChange={(e) => updateStep(stepIndex, 'content', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Descreva detalhadamente este passo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <HelpCircle className="h-4 w-4 inline mr-1" />
                    Pergunta Interativa (opcional)
                  </label>
                  <input
                    type="text"
                    value={step.question}
                    onChange={(e) => updateStep(stepIndex, 'question', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ex: O hóspede possui reserva?"
                  />
                </div>

                {/* Opções de Ramificação */}
                {step.question && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Opções de Resposta</label>
                      <button
                        onClick={() => addOption(stepIndex)}
                        className="flex items-center px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Opção
                      </button>
                    </div>

                    {step.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) => updateOption(stepIndex, optionIndex, 'option_text', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Ex: Sim, possui reserva"
                        />
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <select
                          value={option.next_step_number || ''}
                          onChange={(e) => updateOption(stepIndex, optionIndex, 'next_step_number', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">Próximo passo</option>
                          {steps.map((_, i) => (
                            <option key={i} value={i + 1}>
                              Passo {i + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeOption(stepIndex, optionIndex)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="luxury-button px-6 py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-500 shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Tutorial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}