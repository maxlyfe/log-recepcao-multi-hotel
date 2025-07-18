import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useTutorials } from '../hooks/useTutorials';
import { useLogStore } from '../store';
import type { Tutorial, TutorialStep } from '../types/tutorial';

interface TutorialViewerProps {
  tutorialId: string;
  onClose: () => void;
}

export default function TutorialViewer({ tutorialId, onClose }: TutorialViewerProps) {
  const { selectedHotel } = useLogStore();
  const { fetchTutorialWithSteps } = useTutorials(selectedHotel?.id || '');
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadTutorial();
  }, [tutorialId]);

  const loadTutorial = async () => {
    setIsLoading(true);
    const tutorialData = await fetchTutorialWithSteps(tutorialId);
    setTutorial(tutorialData);
    setIsLoading(false);
  };

  const currentStep = tutorial?.steps?.[currentStepIndex];
  const hasNextStep = currentStepIndex < (tutorial?.steps?.length || 0) - 1;
  const hasPrevStep = currentStepIndex > 0;

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < (tutorial?.steps?.length || 0)) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const goToNextStep = () => {
    if (hasNextStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPrevStep = () => {
    if (hasPrevStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const markStepCompleted = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
  };

  const handleOptionClick = (nextStepId?: string) => {
    if (nextStepId && tutorial?.steps) {
      const nextStepIndex = tutorial.steps.findIndex(step => step.id === nextStepId);
      if (nextStepIndex !== -1) {
        markStepCompleted();
        goToStep(nextStepIndex);
      }
    } else {
      markStepCompleted();
      goToNextStep();
    }
  };

  const resetTutorial = () => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4">Carregando tutorial...</p>
      </div>
    );
  }

  if (!tutorial || !tutorial.steps || tutorial.steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-4">Tutorial não encontrado</h2>
          <button
            onClick={onClose}
            className="luxury-button px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-medium text-gray-900 dark:text-white">
                  {tutorial.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Passo {currentStepIndex + 1} de {tutorial.steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={resetTutorial}
              className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-2">
          {tutorial.steps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                index === currentStepIndex
                  ? 'bg-blue-500'
                  : completedSteps.has(index)
                  ? 'bg-green-500'
                  : index < currentStepIndex
                  ? 'bg-blue-300'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="glass-effect rounded-2xl p-8 shadow-xl animate-fade-in">
          {currentStep && (
            <>
              {/* Step Title */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
                  {currentStep.title}
                </h2>
                {completedSteps.has(currentStepIndex) && (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Concluído</span>
                  </div>
                )}
              </div>

              {/* Step Image */}
              {currentStep.image_url && (
                <div className="mb-6">
                  <img
                    src={currentStep.image_url}
                    alt={currentStep.title}
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Step Content */}
              <div className="prose prose-lg max-w-none mb-8 text-gray-700 dark:text-gray-300">
                <div className="whitespace-pre-wrap">{currentStep.content}</div>
              </div>

              {/* Interactive Question */}
              {currentStep.question && currentStep.options && currentStep.options.length > 0 ? (
                <div className="space-y-4">
                  <div className="glass-effect p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
                      {currentStep.question}
                    </h3>
                    <div className="space-y-3">
                      {currentStep.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option.next_step_id)}
                          className="w-full text-left p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-100">
                              {option.option_text}
                            </span>
                            <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Navigation Buttons */
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevStep}
                    disabled={!hasPrevStep}
                    className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Passo Anterior
                  </button>

                  <div className="flex items-center space-x-4">
                    {!completedSteps.has(currentStepIndex) && (
                      <button
                        onClick={markStepCompleted}
                        className="flex items-center px-6 py-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Marcar como Concluído
                      </button>
                    )}

                    <button
                      onClick={goToNextStep}
                      disabled={!hasNextStep}
                      className="luxury-button flex items-center px-6 py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasNextStep ? 'Próximo Passo' : 'Tutorial Concluído'}
                      {hasNextStep && <ArrowRight className="h-5 w-5 ml-2" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Step Navigation */}
        <div className="mt-6 glass-effect rounded-lg p-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {tutorial.steps.map((step, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  index === currentStepIndex
                    ? 'bg-blue-500 text-white'
                    : completedSteps.has(index)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}