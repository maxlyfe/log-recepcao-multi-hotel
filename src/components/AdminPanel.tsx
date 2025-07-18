import React, { useRef, useEffect, useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { Printer, ChevronDown, Clock, UserCircle, CheckCircle, AlertCircle, Calendar, DollarSign, Pen, MessageSquare, Calculator, Phone, Key, Plug, Umbrella, Edit3, CreditCard, ChevronUp, Copy, CircleDot, Search } from 'lucide-react';
import { useLogStore } from '../store';

export default function AdminPanel() {
  const { logs, fetchLogs, updateEntryStatus } = useLogStore();
  const printRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredLogs, setFilteredLogs] = useState(logs);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.receptionist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      const parsedDate = parse(dateFilter, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        filtered = filtered.filter(log => {
          const logDate = new Date(log.start_time);
          return (
            logDate.getFullYear() === parsedDate.getFullYear() &&
            logDate.getMonth() === parsedDate.getMonth() &&
            logDate.getDate() === parsedDate.getDate()
          );
        });
      }
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, dateFilter]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    if (!isValid(d)) {
      console.error('Invalid date value received by formatDate:', date);
      return 'Data Inválida';
    }
    return format(d, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    if (!isValid(d)) {
      console.error("Invalid date value received by formatTime:", date);
      return "Hora Inválida";
    }
    return format(d, 'HH:mm');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 mr-2" />;
      case 'in_progress':
        return <CircleDot className="h-4 w-4 mr-2" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in_progress':
        return 'Em Andamento';
      case 'closed':
        return 'Fechado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 flex items-center">
          <Clock className="h-8 w-8 text-blue-600 mr-3" />
          Histórico de Registros
        </h2>
      </div>

      <div className="glass-effect p-6 rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <Search className="h-4 w-4 inline mr-2" />
              Buscar por Funcionário
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome do funcionário..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <Calendar className="h-4 w-4 inline mr-2" />
              Filtrar por Data
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl shadow-xl" ref={printRef}>
        {filteredLogs.map((log, index) => (
          <details
            key={log.id}
            className="group border-b last:border-b-0 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/50 transition-colors duration-300">
              <div className="flex items-center space-x-4">
                <UserCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-medium text-gray-900">
                    {log.receptionist}
                  </h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-700">
                      {formatDate(log.start_time)}
                    </p>
                  </div>
                  <div className="flex flex-col mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>Início: {formatTime(log.start_time)}</span>
                    </div>
                    {log.status === 'completed' && log.end_time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-red-600" />
                        <span>Fim: {formatTime(log.end_time)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-4 py-2 text-sm font-medium rounded-full flex items-center ${
                    log.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {log.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  {log.status === 'completed' ? 'Finalizado' : 'Em andamento'}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrint();
                  }}
                  className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <ChevronDown className="h-5 w-5 text-blue-600 transition-transform duration-300 group-open:rotate-180" />
              </div>
            </summary>
            <div className="p-6 bg-white/30">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="glass-effect p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Valores Iniciais</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Caixa em R$
                      </span>
                      <span className="font-medium">{formatCurrency(log.startValues?.cash_brl || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Envelope em R$
                      </span>
                      <span className="font-medium">{formatCurrency(log.startValues?.envelope_brl || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Caixa em US$
                      </span>
                      <span className="font-medium">{formatUSD(log.startValues?.cash_usd || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Pen className="h-4 w-4 mr-1" />
                        Canetas
                      </span>
                      <span className="font-medium">{log.startValues?.pens_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Calculator className="h-4 w-4 mr-1" />
                        Calculadora
                      </span>
                      <span className="font-medium">{log.startValues?.calculator || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Celular
                      </span>
                      <span className="font-medium">{log.startValues?.phone || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Key className="h-4 w-4 mr-1" />
                        Chave do Carro
                      </span>
                      <span className="font-medium">{log.startValues?.car_key || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Plug className="h-4 w-4 mr-1" />
                        Adaptador
                      </span>
                      <span className="font-medium">{log.startValues?.adapter || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Umbrella className="h-4 w-4 mr-1" />
                        Guarda Chuva
                      </span>
                      <span className="font-medium">{log.startValues?.umbrella || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Edit3 className="h-4 w-4 mr-1" />
                        Marca Texto
                      </span>
                      <span className="font-medium">{log.startValues?.highlighter || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Cartões/Toalhas
                      </span>
                      <span className="font-medium">{log.startValues?.cards_towels || 0}</span>
                    </div>
                  </div>
                </div>
                
                {log.status === 'completed' && log.endValues && (
                  <div className="glass-effect p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Valores Finais</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Caixa em R$
                        </span>
                        <span className="font-medium">{formatCurrency(log.endValues.cash_brl)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Envelope em R$
                        </span>
                        <span className="font-medium">{formatCurrency(log.endValues.envelope_brl)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Caixa em US$
                        </span>
                        <span className="font-medium">{formatUSD(log.endValues.cash_usd)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Pen className="h-4 w-4 mr-1" />
                          Canetas
                        </span>
                        <span className="font-medium">{log.endValues.pens_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Calculator className="h-4 w-4 mr-1" />
                          Calculadora
                        </span>
                        <span className="font-medium">{log.endValues.calculator}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Celular
                        </span>
                        <span className="font-medium">{log.endValues.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Key className="h-4 w-4 mr-1" />
                          Chave do Carro
                        </span>
                        <span className="font-medium">{log.endValues.car_key}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Plug className="h-4 w-4 mr-1" />
                          Adaptador
                        </span>
                        <span className="font-medium">{log.endValues.adapter}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Umbrella className="h-4 w-4 mr-1" />
                          Guarda Chuva
                        </span>
                        <span className="font-medium">{log.endValues.umbrella}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Marca Texto
                        </span>
                        <span className="font-medium">{log.endValues.highlighter}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          Cartões/Toalhas
                        </span>
                        <span className="font-medium">{log.endValues.cards_towels}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {log.entries.map((entry, entryIndex) => (
                  <div
                    key={entry.id}
                    className={`glass-effect p-6 rounded-xl shadow-md animate-slide-in ${
                      entry.reply_to ? 'ml-8 border-l-4 border-blue-400' : ''
                    }`}
                    style={{ animationDelay: `${entryIndex * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <select
                            value={entry.status}
                            onChange={(e) => updateEntryStatus(log.id, entry.id, e.target.value as any)}
                            className={`${getStatusColor(entry.status)} px-4 py-2 rounded-full text-sm font-medium appearance-none cursor-pointer pr-8`}
                          >
                            <option value="open">Aberto</option>
                            <option value="in_progress">Em Andamento</option>
                            <option value="closed">Fechado</option>
                          </select>
                          <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">{entry.text}</p>
                    
                    {entry.comments && entry.comments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Comentários ({entry.comments.length}):
                        </div>
                        {entry.comments.map((comment) => (
                          <div key={comment.id} className="glass-effect p-4 rounded-lg">
                            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                              {formatTime(comment.timestamp)} - {comment.created_by || 'Desconhecido'}
                            </div>
                            <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}