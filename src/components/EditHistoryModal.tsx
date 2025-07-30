import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, History } from 'lucide-react';
import type { EditHistoryItem, ShiftValues } from '../types';

interface EditHistoryModalProps {
  history: EditHistoryItem[];
  onClose: () => void;
  type: 'entry' | 'values';
  fieldLabels: Record<keyof ShiftValues, string>; // Prop para receber os nomes amigáveis
}

const formatCurrency = (value?: number | null, currency: 'BRL' | 'USD' = 'BRL') => {
  return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency }).format(value || 0);
};

export default function EditHistoryModal({ history, onClose, type, fieldLabels }: EditHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
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
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {history.length > 0 ? history.map((item) => (
            <div
              key={item.id}
              className="glass-effect p-4 rounded-lg animate-fade-in"
            >
              <div className="flex justify-between items-start mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Editado por: <span className="font-medium">{item.edited_by}</span></span>
                <span>{format(new Date(item.edited_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>

              {type === 'entry' && typeof item.previous_value === 'object' && item.previous_value && 'text' in item.previous_value ? (
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conteúdo anterior:
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {String(item.previous_value.text)}
                  </p>
                </div>
              ) : type === 'values' && typeof item.previous_value === 'object' && item.previous_value ? (
                <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valores anteriores:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        {Object.entries(item.previous_value).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {fieldLabels[key as keyof ShiftValues] || key}:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {typeof value === 'number' && key.includes('usd')
                                    ? formatCurrency(value, 'USD')
                                    : typeof value === 'number'
                                    ? formatCurrency(value, 'BRL')
                                    : String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
              ) : null}
            </div>
          )) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhum histórico de edição encontrado para este item.</p>
          )}
        </div>
      </div>
    </div>
  );
}