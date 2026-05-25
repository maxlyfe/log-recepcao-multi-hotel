import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, HelpCircle, ArrowRight, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useLogStore } from '../store';
import { useTutorials } from '../hooks/useTutorials';
import ImageUploadField from './ImageUploadField';
import type { Tutorial, CreateStepData, CreateOptionData } from '../types/tutorial';

interface CreateTutorialModalProps {
  tutorial?: Tutorial | null;
  onClose: () => void;
}

// Cada passo carrega um clientId estável usado SÓ como React key.
// Nunca é enviado para o banco — é removido em handleSave.
type StepWithKey = CreateStepData & { _clientId: string };

const makeId = () => `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const emptyStep = (): StepWithKey => ({
  _clientId: makeId(),
  title: '', content: '', image_url: '', question: '', options: []
});

export default function CreateTutorialModal({ tutorial, onClose }: CreateTutorialModalProps) {
  const { selectedHotel } = useLogStore();
  const { createTutorial, updateTutorial, fetchTutorialWithSteps } = useTutorials(selectedHotel?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<StepWithKey[]>([emptyStep()]);
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
              setSteps(fullTutorial.steps.map(step => ({
                _clientId: makeId(),
                title: step.title,
                content: step.content,
                image_url: step.image_url || '',
                question: step.question || '',
                options: step.options?.map(option => ({
                  option_text: option.option_text,
                  next_step_number: option.next_step_id
                    ? fullTutorial.steps?.findIndex(s => s.id === option.next_step_id) + 1
                    : undefined
                })) || []
              })));
            } else {
              setSteps([emptyStep()]);
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
      setTitle('');
      setDescription('');
      setSteps([emptyStep()]);
    }
  }, [tutorial?.id]);

  const addStep = () => {
    setSteps(prev => [...prev, emptyStep()]);
  };

  const insertStepAt = (afterIndex: number) => {
    setSteps(prev => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, emptyStep());
      return next;
    });
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(prev => prev.filter((_, i) => i !== index));
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    setSteps(prev => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const updateStep = (index: number, field: keyof CreateStepData, value: any) => {
    setSteps(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addOption = (stepIndex: number) => {
    setSteps(prev => {
      const next = [...prev];
      next[stepIndex] = {
        ...next[stepIndex],
        options: [...(next[stepIndex].options || []), { option_text: '', next_step_number: undefined }]
      };
      return next;
    });
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    setSteps(prev => {
      const next = [...prev];
      next[stepIndex] = {
        ...next[stepIndex],
        options: (next[stepIndex].options || []).filter((_, i) => i !== optionIndex)
      };
      return next;
    });
  };

  const updateOption = (stepIndex: number, optionIndex: number, field: keyof CreateOptionData, value: any) => {
    setSteps(prev => {
      const next = [...prev];
      const options = [...(next[stepIndex].options || [])];
      options[optionIndex] = { ...options[optionIndex], [field]: value };
      next[stepIndex] = { ...next[stepIndex], options };
      return next;
    });
  };

  const handleSave = async () => {
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
      const tutorialData = {
        title: title.trim(),
        description: description.trim() || undefined,
        steps: steps.map(({ _clientId, ...step }) => ({
          ...step,
          title: step.title.trim(),
          content: step.content.trim(),
          image_url: step.image_url?.trim() || undefined,
          question: step.question?.trim() || undefined,
          options: step.options?.filter(opt => opt.option_text.trim()) || []
        }))
      };

      let success = false;
      if (tutorial) {
        success = await updateTutorial(tutorial.id, tutorialData);
      } else {
        const tutorialId = await createTutorial(tutorialData, 'Admin');
        success = !!tutorialId;
      }

      if (success) {
        onClose();
      } else {
        alert('Erro ao salvar tutorial. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar tutorial:', error);
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
          <p className="mt-4 text-center text-gray-700 dark:text-gray-300">Carregando tutorial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header fixo */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tutorial ? 'Editar Tutorial' : 'Criar Novo Tutorial'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {steps.length} {steps.length === 1 ? 'passo' : 'passos'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Título do Tutorial <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Como fazer check-in"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Descrição <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Descrição geral do tutorial..."
              />
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Título da seção de passos */}
          <h4 className="text-base font-semibold text-gray-900 dark:text-white -mb-2">
            Passos do Tutorial
          </h4>

          {/* Lista de passos com botões de inserir entre eles */}
          <div className="space-y-0">
            {steps.map((step, stepIndex) => (
              <React.Fragment key={step._clientId}>
                {/* Card do passo */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 overflow-hidden">

                  {/* Cabeçalho do passo */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold">
                        {stepIndex + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {step.title || <span className="text-gray-400 italic">Passo sem título</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveStep(stepIndex, 'up')}
                        disabled={stepIndex === 0}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Mover para cima"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveStep(stepIndex, 'down')}
                        disabled={stepIndex === steps.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Mover para baixo"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {steps.length > 1 && (
                        <button
                          onClick={() => removeStep(stepIndex)}
                          className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
                          title="Remover passo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Corpo do passo */}
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                          Título do Passo <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(stepIndex, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          placeholder="Ex: Verificar documentos"
                        />
                      </div>
                      <div>
                        <ImageUploadField
                          value={step.image_url}
                          onChange={(value) => updateStep(stepIndex, 'image_url', value)}
                          label="Imagem (opcional)"
                          placeholder="URL da imagem ou faça upload"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        Conteúdo / Descrição <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(stepIndex, 'content', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                        placeholder="Descreva detalhadamente este passo..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                        <HelpCircle className="h-3.5 w-3.5 inline mr-1" />
                        Pergunta Interativa <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={step.question}
                        onChange={(e) => updateStep(stepIndex, 'question', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Ex: O hóspede possui reserva?"
                      />
                    </div>

                    {/* Opções de Ramificação */}
                    {step.question && (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Opções de Resposta
                          </label>
                          <button
                            onClick={() => addOption(stepIndex)}
                            className="flex items-center px-2.5 py-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors font-medium"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar opção
                          </button>
                        </div>

                        {step.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <input
                              type="text"
                              value={option.option_text}
                              onChange={(e) => updateOption(stepIndex, optionIndex, 'option_text', e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Ex: Sim, possui reserva"
                            />
                            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <select
                              value={option.next_step_number || ''}
                              onChange={(e) => updateOption(stepIndex, optionIndex, 'next_step_number', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">Próximo</option>
                              {steps.map((_, i) => (
                                <option key={i} value={i + 1}>Passo {i + 1}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeOption(stepIndex, optionIndex)}
                              className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}

                        {(!step.options || step.options.length === 0) && (
                          <p className="text-xs text-gray-400 italic">Nenhuma opção adicionada ainda.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão "Inserir passo aqui" entre os passos */}
                {stepIndex < steps.length - 1 && (
                  <div className="flex items-center gap-2 py-1.5">
                    <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => insertStepAt(stepIndex)}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-full transition-all whitespace-nowrap"
                    >
                      <Plus className="h-3 w-3" />
                      Inserir passo aqui
                    </button>
                    <div className="flex-1 border-t border-dashed border-gray-200 dark:border-gray-700" />
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Botão Adicionar Passo — sempre no final */}
            <div className="pt-2">
              <button
                onClick={addStep}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              >
                <Plus className="h-4 w-4" />
                Adicionar Passo
              </button>
            </div>
          </div>
        </div>

        {/* Footer fixo */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {steps.length} {steps.length === 1 ? 'passo configurado' : 'passos configurados'}
            </span>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 rounded-lg shadow-sm hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Salvando...' : tutorial ? 'Salvar Alterações' : 'Criar Tutorial'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
