import React, { useState, useEffect } from 'react';
import { useLogStore } from '../store';
import { PlusCircle, Save, UserCircle, Clock, DollarSign, Pen, MessageSquare, Calculator, Phone, Key, Plug, Umbrella, Edit3, CreditCard, ChevronDown, ChevronUp, Copy, CircleDot, AlertCircle, CheckCircle, History, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import type { ShiftValues, LogEntry } from '../types';
import EditHistoryModal from './EditHistoryModal';
import { useTheme } from '../hooks/useTheme';

// *** ALTERAÇÃO APLICADA AQUI ***
const defaultShiftValues: ShiftValues = {
  cash_brl: 0,
  envelope_brl: 0,
  cash_dollar_usd_part: 0,
  cash_dollar_brl_part: 0,
  pens_count: 0,
  calculator: 0,
  phone: 0,
  car_key: 0,
  adapter: 0,
  umbrella: 0,
  highlighter: 0,
  cards_towels: 0,
};

// *** ALTERAÇÃO APLICADA AQUI ***
const fieldLabels: Record<keyof ShiftValues, string> = {
  cash_brl: "Fundo de Caixa",
  envelope_brl: "Caixa do Dia",
  cash_dollar_usd_part: "Caixa Dólar (USD)",
  cash_dollar_brl_part: "Caixa Dólar (BRL)",
  pens_count: "Canetas",
  calculator: "Calculadora",
  phone: "Celular",
  car_key: "Chave do Carro",
  adapter: "Adaptador",
  umbrella: "Guarda Chuva",
  highlighter: "Marca Texto",
  cards_towels: "Cartões/Toalhas"
};

const formatCurrency = (value: number, currency: 'BRL' | 'USD') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

function NewLog() {
  const { isDark } = useTheme();
  const [receptionist, setReceptionist] = useState('');
  const [entry, setEntry] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [startValues, setStartValues] = useState<ShiftValues>(defaultShiftValues);
  const [endValues, setEndValues] = useState<ShiftValues>(defaultShiftValues);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState<{type: 'entry' | 'values', id: string} | null>(null);
  const [editingValues, setEditingValues] = useState(false);
  const [isStartingLog, setIsStartingLog] = useState(false);
  
  // *** ALTERAÇÃO APLICADA AQUI ***
  const monetaryKeys: (keyof ShiftValues)[] = ['cash_brl', 'envelope_brl', 'cash_dollar_usd_part', 'cash_dollar_brl_part'];

  const { 
    currentLog, 
    previousLog,
    openEntries, 
    isLoading,
    hasInitError,
    addLog, 
    updateCurrentLog, 
    finishCurrentLog, 
    initializeLogState,
    retryInitialization,
    addComment, 
    updateEntryStatus,
    editLogEntry,
    editShiftValues,
    fetchEditHistory,
    editHistory
  } = useLogStore();

  useEffect(() => {
    initializeLogState();
  }, [initializeLogState]);

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'open': return 'bg-yellow-900/50 text-yellow-300';
        case 'in_progress': return 'bg-blue-900/50 text-blue-300';
        case 'closed': return 'bg-green-900/50 text-green-300';
        default: return 'bg-gray-700 text-gray-300';
      }
    }
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDifference = (start: number, end: number, isCurrency: boolean, currencyType: 'BRL' | 'USD' = 'BRL') => {
    const diff = end - start;
    if (isNaN(diff)) return <span className="text-gray-500">-</span>;
    let className = 'font-semibold text-base';
    let formattedDiff;
    if (diff > 0.001) {
        className += ' text-green-600 dark:text-green-400';
        formattedDiff = `+${isCurrency ? formatCurrency(diff, currencyType) : diff}`;
    } else if (diff < -0.001) {
        className += ' text-red-500 dark:text-red-400';
        formattedDiff = isCurrency ? formatCurrency(diff, currencyType) : diff;
    } else {
        className += ' text-gray-500 dark:text-gray-400';
        formattedDiff = isCurrency ? formatCurrency(0, currencyType) : '0';
    }
    return <span className={className}>{formattedDiff}</span>;
  };

  const renderShiftValuesComparison = (
      start: ShiftValues, 
      end: ShiftValues, 
      onChange: (field: keyof ShiftValues, value: number) => void
  ) => {
      const itemKeys: (keyof ShiftValues)[] = [ 'pens_count', 'calculator', 'phone', 'car_key', 'adapter', 'umbrella', 'highlighter', 'cards_towels' ];
      const renderItemCard = (key: keyof ShiftValues) => {
          const isCurrency = monetaryKeys.includes(key);
          const currencyType = key === 'cash_dollar_usd_part' ? 'USD' : 'BRL';
          const startValue = start[key] || 0;
          const endValue = end[key];
          return (
              <div key={key} className="bg-white/50 dark:bg-gray-800/30 p-4 rounded-xl shadow-sm">
                  <h4 className="text-base font-semibold mb-3 text-gray-800 dark:text-white truncate">{fieldLabels[key]}</h4>
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Inicial:</span>
                          <span className="font-mono font-medium text-gray-900 dark:text-gray-100 p-1 bg-gray-100 dark:bg-gray-700 rounded">
                              {isCurrency ? formatCurrency(startValue, currencyType) : startValue}
                          </span>
                      </div>
                      <div className="flex justify-between items-center">
                          <label htmlFor={`final-val-${key}`} className="text-gray-600 dark:text-gray-400">Final:</label>
                          <input
                              id={`final-val-${key}`}
                              type="number"
                              step={isCurrency ? "0.01" : "1"}
                              value={endValue}
                              onChange={(e) => onChange(key, isCurrency ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
                              className="luxury-input w-28 text-right py-1"
                          />
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                          <span className="text-gray-800 dark:text-gray-200 font-bold">Diferença:</span>
                          {renderDifference(startValue, endValue, isCurrency, currencyType)}
                      </div>
                  </div>
              </div>
          );
      };
      return (
          <div className="space-y-6">
              <div>
                  <h3 className="text-xl font-serif text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b border-blue-200 dark:border-blue-800">Valores Monetários</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{monetaryKeys.map(renderItemCard)}</div>
              </div>
              <div>
                  <h3 className="text-xl font-serif text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b border-blue-200 dark:border-blue-800">Itens da Recepção</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{itemKeys.map(renderItemCard)}</div>
              </div>
          </div>
      );
  };
  
  const handleStartLog = async () => { if (!receptionist || isStartingLog) return; setIsStartingLog(true); try { await addLog({ receptionist, startValues }); } catch (error) { console.error('Error starting log:', error); alert(error instanceof Error ? error.message : 'Erro ao iniciar turno. Tente novamente.'); await initializeLogState(); } finally { setIsStartingLog(false); } };
  const handleAddEntry = () => { if (!entry) return; updateCurrentLog(entry, replyTo); setEntry(''); setReplyTo(null); };
  const handleFinishLog = () => { const hasOpenEntries = currentLog?.entries.some(e => e.status !== 'closed') || openEntries.some(e => e.status !== 'closed'); if (hasOpenEntries) { setShowEndConfirmModal(true); } else { finishCurrentLog(endValues); setShowEndModal(false); } };
  const confirmFinishWithOpenEntries = () => { finishCurrentLog(endValues); setShowEndConfirmModal(false); setShowEndModal(false); };
  const handleAddComment = (entryId: string, logId: string) => { if (!newComment[entryId]) return; addComment(logId, entryId, newComment[entryId]); setNewComment(prev => ({ ...prev, [entryId]: '' })); };
  const handleEditEntry = (entryId: string) => { const entryData = currentLog?.entries.find(e => e.id === entryId) || openEntries.find(e => e.id === entryId); if (entryData) { setEditingEntry(entryId); setEditText(entryData.text); } };
  const handleSaveEdit = async (logId: string, entryId: string) => { if(!currentLog) return; await editLogEntry(logId, entryId, editText, currentLog.receptionist); setEditingEntry(null); setEditText(''); };
  const handleEditValues = () => { if (currentLog?.startValues) { setStartValues(currentLog.startValues); setEditingValues(true); } };
  const handleSaveValues = async () => { if (currentLog) { await editShiftValues(currentLog.id, startValues, currentLog.receptionist); setEditingValues(false); } };
  
  const handleShowHistory = async (type: 'entry' | 'values', id: string) => {
    console.log(`Buscando histórico para tipo: ${type}, ID: ${id}`);
    
    let entityTypeForFetch: 'log_entry' | 'shift_values';
    if (type === 'values') {
      entityTypeForFetch = 'shift_values';
    } else {
      entityTypeForFetch = 'log_entry';
    }
    
    await fetchEditHistory(entityTypeForFetch, id);
    setShowHistoryModal({ type, id });
  };
  
  const copyPreviousValues = () => { if (previousLog?.endValues) { setStartValues(previousLog.endValues); } };
  const toggleComments = (entryId: string) => { setExpandedComments(prev => prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]); };
  
  // *** ALTERAÇÃO APLICADA AQUI ***
  const renderMoneyDisplay = (values: ShiftValues) => ( 
    <div className="money-display">
      <div className="space-y-2">
        <div className="flex items-center justify-between"><span className="text-sm">Fundo de Caixa:</span><span className="font-medium">{formatCurrency(values.cash_brl, 'BRL')}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm">Caixa do Dia:</span><span className="font-medium">{formatCurrency(values.envelope_brl, 'BRL')}</span></div>
        <div className="border-t border-gray-300 dark:border-gray-600 my-1"></div>
        <div className="flex items-center justify-between"><span className="text-sm">Dólar (USD):</span><span className="font-medium">{formatCurrency(values.cash_dollar_usd_part, 'USD')}</span></div>
        <div className="flex items-center justify-between"><span className="text-sm">Dólar (BRL):</span><span className="font-medium">{formatCurrency(values.cash_dollar_brl_part, 'BRL')}</span></div>
      </div>
    </div> 
  );
  
  const renderShiftValues = (values: ShiftValues, onChange: (field: keyof ShiftValues, value: number) => void) => ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.keys(fieldLabels).map((key) => ( <div key={key}><label className="block text-sm font-medium mb-2">{fieldLabels[key as keyof ShiftValues]}</label><input type="number" value={values[key as keyof ShiftValues]} onChange={(e) => onChange(key as keyof ShiftValues, parseFloat(e.target.value) || 0)} className="luxury-input w-full px-4 py-2 text-lg"/></div>))}</div> );
  const renderComments = (entry: LogEntry, logId: string) => ( <div className="comment-thread">{entry.comments?.map((comment) => ( <div key={comment.id} className="glass-effect p-4 rounded-lg mt-2"><div className="text-sm text-blue-600 dark:text-blue-400 mb-1">{new Date(comment.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {comment.created_by || 'Desconhecido'}</div><p className="text-gray-800 dark:text-gray-200">{comment.text}</p></div>))}<div className="mt-2 flex gap-2"><input type="text" value={newComment[entry.id] || ''} onChange={(e) => setNewComment(prev => ({ ...prev, [entry.id]: e.target.value }))} className="luxury-input flex-1 px-3 py-2 text-sm rounded-lg" placeholder="Adicionar comentário..."/><button onClick={() => handleAddComment(entry.id, logId)} disabled={!newComment[entry.id]} className="luxury-button px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50">Comentar</button></div></div> );
  const renderEntries = () => { if (!currentLog) return null; const previousLogEntries = openEntries.filter(entry => entry.log_id !== currentLog.id).map(entry => ({ ...entry, fromPreviousLog: true, logInfo: { id: entry.log_id, receptionist: entry.log_receptionist || entry.created_by || 'Desconhecido', date: new Date(entry.log_start_time || entry.timestamp).toLocaleDateString('pt-BR') } })); const currentLogEntries = currentLog.entries.map(entry => ({ ...entry, fromPreviousLog: false, logInfo: { id: currentLog.id, receptionist: currentLog.receptionist, date: new Date(currentLog.start_time).toLocaleDateString('pt-BR') } })); const allEntries = [...previousLogEntries, ...currentLogEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).filter(entry => !entry.reply_to); return allEntries.map((entry) => ( <div key={entry.id} className={`glass-effect p-6 rounded-xl shadow-md animate-slide-in relative ${entry.fromPreviousLog ? 'border-l-4 border-yellow-400' : ''}`}><div className="flex justify-between items-start mb-4"><div><div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>{entry.fromPreviousLog && ( <div className="text-sm text-yellow-600 mt-1">Ocorrência do turno anterior - {entry.logInfo.receptionist} ({entry.logInfo.date})</div>)}{!entry.fromPreviousLog && ( <div className="text-sm text-gray-500 mt-1">Turno atual - {entry.logInfo.receptionist} ({entry.logInfo.date})</div>)}</div><div className="flex items-center space-x-4"><div className="relative"><select value={entry.status} onChange={(e) => updateEntryStatus(entry.log_id, entry.id, e.target.value as any)} className={`${getStatusColor(entry.status)} px-4 py-2 rounded-full text-sm font-medium appearance-none cursor-pointer pr-8`}> <option value="open">Aberto</option> <option value="in_progress">Em Andamento</option> <option value="closed">Fechado</option></select><ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"/></div>{entry.last_edited_at && ( <button onClick={() => handleShowHistory('entry', entry.id)} className="text-blue-600 hover:text-blue-800"><History className="h-5 w-5"/></button>)}{!entry.fromPreviousLog && ( <button onClick={() => handleEditEntry(entry.id)} className="text-blue-600 hover:text-blue-800"><Edit3 className="h-5 w-5"/></button>)}<button onClick={() => toggleComments(entry.id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors relative">{(entry.comments && entry.comments.length > 0) && ( <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{entry.comments.length}</span>)} {expandedComments.includes(entry.id) ? ( <ChevronUp className="h-5 w-5"/>) : ( <MessageSquare className="h-5 w-5"/>)}</button></div></div>{editingEntry === entry.id ? ( <div className="space-y-2"><textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="luxury-input w-full px-4 py-2 text-lg rounded-lg" rows={3}/> <div className="flex justify-end space-x-2"><button onClick={() => setEditingEntry(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button><button onClick={() => handleSaveEdit(currentLog.id, entry.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button></div></div>) : ( <p className="text-gray-800 dark:text-gray-200">{entry.text}</p>)} {expandedComments.includes(entry.id) && renderComments(entry, entry.log_id)}</div>)); };
  if (isLoading) { return ( <div className="max-w-4xl mx-auto animate-fade-in"><div className="glass-effect rounded-2xl p-8 shadow-xl"><div className="flex items-center justify-center space-x-3"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/><span className="text-lg">Verificando turnos ativos...</span></div></div></div> ); }
  if (hasInitError) { return ( <div className="max-w-4xl mx-auto animate-fade-in"><div className="glass-effect rounded-2xl p-8 shadow-xl"><div className="text-center"><AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4"/><h2 className="text-xl font-semibold text-red-600 mb-4">Erro ao Carregar Dados</h2><p className="text-gray-600 dark:text-gray-400 mb-6">Ocorreu um erro ao verificar o estado dos turnos.</p><button onClick={retryInitialization} className="luxury-button px-6 py-3 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg flex items-center mx-auto"><RefreshCw className="h-5 w-5 mr-2"/>Tentar Novamente</button></div></div></div> ); }
  if (!currentLog) { return ( <div className="max-w-4xl mx-auto animate-fade-in"><div className="glass-effect rounded-2xl p-8 shadow-xl"><h2 className="text-2xl font-serif mb-6 flex items-center"><UserCircle className="h-8 w-8 text-blue-600 mr-3"/>Iniciar Novo Registro</h2><div className="space-y-6"><div><label className="block text-sm font-medium mb-2">Nome do Recepcionista</label><input type="text" value={receptionist} onChange={(e) => setReceptionist(e.target.value)} className="luxury-input w-full px-4 py-3 text-lg focus:outline-none" placeholder="Digite seu nome" disabled={isStartingLog}/></div> {previousLog && ( <div className="glass-effect p-4 rounded-lg"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-medium">Valores do Turno Anterior</h3><button onClick={copyPreviousValues} disabled={isStartingLog} className="flex items-center px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"><Copy className="h-4 w-4 mr-2"/>Copiar Valores</button></div><div className="space-y-2"><p className="text-sm">Recepcionista: <span className="font-medium">{previousLog.receptionist}</span></p><p className="text-sm">Horário de Fechamento: <span className="font-medium">{previousLog.end_time ? new Date(previousLog.end_time).toLocaleTimeString() : 'Em andamento'}</span></p> {previousLog.endValues && ( <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><div><h4 className="text-sm font-medium mb-2">Valores Monetários:</h4><div className="space-y-1 text-sm"><div>Fundo de Caixa: <span className="font-medium">{formatCurrency(previousLog.endValues.cash_brl, 'BRL')}</span></div><div>Caixa do Dia: <span className="font-medium">{formatCurrency(previousLog.endValues.envelope_brl, 'BRL')}</span></div><div>Dólar (USD): <span className="font-medium">{formatCurrency(previousLog.endValues.cash_dollar_usd_part, 'USD')}</span></div><div>Dólar (BRL): <span className="font-medium">{formatCurrency(previousLog.endValues.cash_dollar_brl_part, 'BRL')}</span></div></div></div><div><h4 className="text-sm font-medium mb-2">Itens:</h4><div className="grid grid-cols-2 gap-2 text-sm">{Object.entries(previousLog.endValues).filter(([key]) => !monetaryKeys.includes(key as keyof ShiftValues)).map(([key, value]) => ( <div key={key}>{fieldLabels[key as keyof ShiftValues]}: <span className="font-medium">{String(value)}</span></div>))}</div></div></div>)}</div></div>)} <div className="space-y-4"><h3 className="text-lg font-medium">Valores Iniciais do Turno</h3>{renderShiftValues(startValues, (field, value) => setStartValues(prev => ({ ...prev, [field]: value })))}</div><button onClick={handleStartLog} disabled={!receptionist || isStartingLog} className="luxury-button w-full flex items-center justify-center px-6 py-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">{isStartingLog ? ( <><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Iniciando Turno...</>) : ( <><PlusCircle className="mr-2 h-5 w-5"/>Iniciar Turno</>)}</button></div></div></div> ); }
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif flex items-center"><Clock className="h-8 w-8 text-blue-600 mr-3"/>Registro em Andamento - {currentLog.receptionist}</h2>
          <div className="flex items-center space-x-4">
            {renderMoneyDisplay(currentLog.startValues || defaultShiftValues)}
            <button onClick={() => { setEndValues(currentLog.startValues || defaultShiftValues); setShowEndModal(true); }} className="luxury-button px-6 py-3 rounded-xl text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg flex items-center">
              <Save className="h-5 w-5 mr-2"/>Finalizar Turno
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div><label className="block text-sm font-medium mb-2">Nova Ocorrência</label><textarea value={entry} onChange={(e) => setEntry(e.target.value)} rows={3} className="luxury-input w-full px-4 py-3 text-lg focus:outline-none rounded-lg" placeholder={replyTo ? "Adicionar resposta..." : "Descreva a ocorrência..."}/></div>
          <button onClick={handleAddEntry} disabled={!entry} className="luxury-button w-full flex items-center justify-center px-6 py-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"><PlusCircle className="mr-2 h-5 w-5"/>{replyTo ? "Adicionar Resposta" : "Adicionar Ocorrência"}</button>
        </div>
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif">Ocorrências do Turno</h3>
            <div className="flex items-center space-x-4">
              {currentLog.values_last_edited_at && (
                <button onClick={() => handleShowHistory('values', currentLog.id)} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <History className="h-4 w-4 mr-1"/>Ver histórico de valores
                </button>
              )}
              <button onClick={handleEditValues} className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                <Edit3 className="h-4 w-4 mr-2"/>Editar Valores
              </button>
            </div>
          </div>
          <div className="space-y-4">{renderEntries()}</div>
        </div>
        
        {showEndModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-serif mb-6">Confirmar Finalização do Turno</h3>
              {renderShiftValuesComparison(currentLog.startValues || defaultShiftValues, endValues, (field, value) => setEndValues(prev => ({ ...prev, [field]: value })))}
              <div className="mt-8 flex justify-end space-x-4">
                <button onClick={() => setShowEndModal(false)} className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                <button onClick={handleFinishLog} className="luxury-button px-8 py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-500 shadow-md">Confirmar e Finalizar</button>
              </div>
            </div>
          </div>
        )}
        
        {showHistoryModal && (
            <EditHistoryModal
                history={editHistory}
                onClose={() => setShowHistoryModal(null)}
                type={showHistoryModal.type}
            />
        )}

        {editingValues && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-medium mb-6">Editar Valores Iniciais</h3>
              {renderShiftValues(startValues, (field, value) => setStartValues(prev => ({ ...prev, [field]: value })))}
              <div className="mt-6 flex justify-end space-x-4">
                <button onClick={() => setEditingValues(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancelar</button>
                <button onClick={handleSaveValues} className="luxury-button px-6 py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-500 shadow-md">Salvar Alterações</button>
              </div>
            </div>
          </div>
        )}

        {showEndConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center text-yellow-500 mb-4"><AlertTriangle className="h-6 w-6 mr-2"/><h3 className="text-xl font-medium">Atenção</h3></div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Existem ocorrências em aberto ou em andamento. Tem certeza que deseja finalizar o turno?</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowEndConfirmModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">Cancelar</button>
                <button onClick={confirmFinishWithOpenEntries} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Finalizar Mesmo Assim</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewLog;
