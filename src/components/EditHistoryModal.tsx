import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, History, ArrowRight } from 'lucide-react';
import type { EditHistoryItem, ShiftValues } from '../types';

const fieldLabels: Record<string, string> = {
  cash_brl: "Fundo de Caixa",
  envelope_brl: "Caixa do Dia",
  cash_usd: "Caixa em US$",
  pens_count: "Canetas",
  calculator: "Calculadora",
  phone: "Celular",
  car_key: "Chave do Carro",
  adapter: "Adaptador",
  umbrella: "Guarda Chuva",
  highlighter: "Marca Texto",
  cards_towels: "Cartões/Toalhas"
};

const formatCurrency = (value?: number | null, currency: 'BRL' | 'USD' = 'BRL') => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency }).format(value);
};

// Helper para renderizar um único valor com formatação
const renderValue = (key: string, value: any) => {
    if (value === undefined || value === null) return <span className="text-gray-400 dark:text-gray-500">N/A</span>;
    const isUsd = key.includes('usd');
    const isCurrency = typeof value === 'number' && (key.includes('cash') || key.includes('envelope'));
    
    if (isCurrency) {
        return formatCurrency(value, isUsd ? 'USD' : 'BRL');
    }
    return String(value);
};


interface EditHistoryModalProps {
  history: EditHistoryItem[];
  onClose: () => void;
  type: 'entry' | 'values';
}

export default function EditHistoryModal({ history, onClose, type }: EditHistoryModalProps) {

  // Renderiza a mudança de uma ocorrência (texto)
  const renderEntryChange = (change: any) => {
    // Para compatibilidade com dados antigos, verifica se 'old' e 'new' existem.
    const oldValue = change.old?.text ?? change.text ?? 'N/A';
    const newValue = change.new?.text;

    // Se não houver 'newValue', usa o layout antigo (apenas valor anterior)
    if (!newValue) {
        return (
             <div className="mt-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conteúdo anterior:
              </div>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                {oldValue}
              </p>
            </div>
        )
    }

    // Layout novo para comparação De -> Para
    return (
        <div className="mt-2 space-y-3">
            <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">De:</div>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800/50">
                    {oldValue}
                </p>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Para:</div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800/50">
                    {newValue}
                </p>
            </div>
        </div>
    )
  };

  // Renderiza a mudança de valores do caixa
  const renderValuesChange = (change: any) => {
    const oldValues = change.old ?? change;
    const newValues = change.new;

    // Se não houver 'newValues', usa o layout antigo para dados históricos
    if (!newValues || typeof oldValues !== 'object') {
        const valuesToDisplay = extractValues(oldValues);
        return (
             <div className="mt-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valores anteriores:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                    {valuesToDisplay.map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{fieldLabels[key as keyof ShiftValues] || key}:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{renderValue(key, value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Identifica apenas as chaves que tiveram valores alterados
    const allKeys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]));
    const changedKeys = allKeys.filter(key => oldValues[key] !== newValues[key] && fieldLabels[key]);

    if (changedKeys.length === 0) {
        return <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">Nenhuma alteração de valor registrada nesta edição.</p>
    }

    return (
        <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alterações de valores:
            </div>
            <div className="space-y-2 text-sm">
                {changedKeys.map(key => (
                    <div key={key} className="grid grid-cols-12 items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold truncate col-span-5">
                            {fieldLabels[key] || key}
                        </span>
                        <span className="font-mono text-red-600 dark:text-red-400 text-right col-span-3">
                            {renderValue(key, oldValues[key])}
                        </span>
                        <div className="col-span-1 flex justify-center text-gray-400 dark:text-gray-500">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                         <span className="font-mono text-green-600 dark:text-green-400 text-right col-span-3">
                            {renderValue(key, newValues[key])}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  // Função de compatibilidade para extrair valores de formatos antigos
  const extractValues = (valueObject: any): [string, any][] => {
    if (!valueObject || typeof valueObject !== 'object') return [];
    const values: Record<string, any> = {};
    const keysToExtract = Object.keys(fieldLabels);
    for (const key of keysToExtract) {
      if (key in valueObject) values[key] = valueObject[key];
      else if (`${key}_start` in valueObject) values[key] = valueObject[`${key}_start`];
    }
    return Object.entries(values);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif flex items-center text-gray-800 dark:text-gray-100">
              <History className="h-6 w-6 mr-3 text-blue-500" />
              Histórico de Edições
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {history.length > 0 ? history.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Editado por: <span className="font-bold">{item.edited_by}</span></span>
                <span className="font-mono">{format(new Date(item.edited_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              
              {type === 'entry' && renderEntryChange(item.previous_value)}
              {type === 'values' && renderValuesChange(item.previous_value)}

            </div>
          )) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Nenhum histórico de edição encontrado para este item.</p>
          )}
        </div>
      </div>
    </div>
  );
}
