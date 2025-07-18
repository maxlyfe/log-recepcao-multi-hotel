import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, History } from 'lucide-react';
import type { EditHistory } from '../types';

interface EditHistoryModalProps {
  history: EditHistory[];
  onClose: () => void;
  type: 'entry' | 'values';
}

export default function EditHistoryModal({ history, onClose, type }: EditHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium flex items-center">
            <History className="h-5 w-5 mr-2" />
            Histórico de Edições
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-effect p-4 rounded-lg animate-fade-in"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Editado por: <span className="font-medium">{item.edited_by}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(item.edited_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              </div>

              {type === 'entry' ? (
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conteúdo anterior:
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.previous_value.text}
                  </p>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {Object.entries(item.previous_value).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {key.replace(/_start$/, '')}:
                      </span>
                      <span className="font-medium">
                        {typeof value === 'number' && key.includes('brl')
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(value as number)
                          : typeof value === 'number' && key.includes('usd')
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(value as number)
                          : value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}