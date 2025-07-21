import React, { useRef, useEffect, useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { Printer, ChevronDown, Clock, UserCircle, Search, Calendar, Loader2 } from 'lucide-react';
import { useLogStore } from '../store';
import type { Log, ShiftValues } from '../types';

export default function AdminPanel() {
  const { logs, fetchLogs, isLoading } = useLogStore();
  const printRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    let results = logs;

    if (searchTerm) {
      results = results.filter(log =>
        log.receptionist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      try {
        const filterDate = parse(dateFilter, 'yyyy-MM-dd', new Date());
        if (isValid(filterDate)) {
            results = results.filter(log => {
                const logDate = new Date(log.start_time);
                return (
                    logDate.getDate() === filterDate.getDate() &&
                    logDate.getMonth() === filterDate.getMonth() &&
                    logDate.getFullYear() === filterDate.getFullYear()
                );
            });
        }
      } catch (e) {
        console.error("Data de filtro inválida:", dateFilter);
      }
    }
    setFilteredLogs(results);
  }, [logs, searchTerm, dateFilter]);

  const handlePrint = useReactToPrint({ content: () => printRef.current });
  
  const formatDate = (date: string) => {
    if (!date || !isValid(new Date(date))) return 'Data inválida';
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (date: string) => {
    if (!date || !isValid(new Date(date))) return 'Hora inválida';
    return format(new Date(date), 'HH:mm');
  };

  const formatCurrency = (value?: number | null, currency: 'BRL' | 'USD' = 'BRL') => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency }).format(value || 0);
  };
  
  const fieldLabels: Record<keyof ShiftValues, string> = {
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center">
          <Clock className="h-8 w-8 text-blue-600 mr-3" />
          Histórico de Registros
        </h2>
      </div>

      <div className="glass-effect p-6 rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"><Search className="h-4 w-4 inline mr-2" />Buscar por Funcionário</label>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Digite o nome..." className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"><Calendar className="h-4 w-4 inline mr-2" />Filtrar por Data</label>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl shadow-xl">
        {isLoading && logs.length === 0 ? (
            <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>
        ) : filteredLogs.map((log) => (
          <details key={log.id} className="group border-b last:border-b-0 border-gray-200 dark:border-gray-700">
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">{log.receptionist}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(log.start_time)} • {formatTime(log.start_time)} - {log.end_time ? formatTime(log.end_time) : 'Ativo'}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${log.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{log.status === 'completed' ? 'Finalizado' : 'Ativo'}</span>
                <ChevronDown className="h-5 w-5 text-blue-600 transition-transform duration-300 group-open:rotate-180" />
              </div>
            </summary>
            <div className="p-6 bg-white/30 dark:bg-gray-900/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {log.startValues && (
                        <div className="glass-effect p-4 rounded-lg">
                            <h4 className="text-lg font-medium mb-3">Valores Iniciais</h4>
                            <div className="space-y-2 text-sm">
                                {Object.entries(log.startValues).map(([key, value]) => (
                                    <div key={key} className="flex justify-between"><span>{fieldLabels[key] || key}:</span><span className="font-medium">{formatCurrency(value, key.includes('usd') ? 'USD' : 'BRL')}</span></div>
                                ))}
                            </div>
                        </div>
                    )}
                    {log.endValues && (
                        <div className="glass-effect p-4 rounded-lg">
                            <h4 className="text-lg font-medium mb-3">Valores Finais</h4>
                            <div className="space-y-2 text-sm">
                                {Object.entries(log.endValues).map(([key, value]) => (
                                    <div key={key} className="flex justify-between"><span>{fieldLabels[key] || key}:</span><span className="font-medium">{formatCurrency(value, key.includes('usd') ? 'USD' : 'BRL')}</span></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-lg font-medium mb-4">Ocorrências</h4>
                    <div className="space-y-4">
                        {log.entries && log.entries.length > 0 ? (
                            log.entries.map(entry => (
                                <div key={entry.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatTime(entry.timestamp)}</p>
                                    <p className="whitespace-pre-wrap">{entry.text}</p>
                                    {entry.comments && entry.comments.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                            {entry.comments.map(comment => (
                                                <div key={comment.id} className="pl-4 text-sm">
                                                    <p className="text-xs text-gray-400">{comment.created_by} - {formatTime(comment.timestamp)}</p>
                                                    <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Nenhuma ocorrência registrada neste turno.</p>
                        )}
                    </div>
                </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}