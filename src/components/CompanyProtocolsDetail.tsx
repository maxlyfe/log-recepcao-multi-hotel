import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Printer, Calendar, Loader2, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useProtocols } from '../hooks/useProtocols';
import type { Protocol } from '../types/protocol';
import { useReactToPrint } from 'react-to-print';
import ProtocolReport from './ProtocolReport'; // CORREÇÃO APLICADA AQUI (sem chaves)
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompanyProtocolsDetailProps {
  company: { id: string; name: string; };
  onBack: () => void;
  onEdit: (protocol: Protocol) => void;
  onDelete: (protocolId: string) => void;
  onResolve: (protocol: Protocol) => void;
}

export default function CompanyProtocolsDetail({ company, onBack, onEdit, onDelete, onResolve }: CompanyProtocolsDetailProps) {
  const { fetchProtocolsForCompany } = useProtocols();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchProtocolsForCompany(company.id);
      setProtocols(data);
      setIsLoading(false);
    };
    loadData();
  }, [company.id, fetchProtocolsForCompany]);

  const filteredProtocols = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return protocols;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    return protocols.filter(p => {
      const pDate = new Date(p.protocol_date);
      return pDate >= start && pDate <= end;
    });
  }, [protocols, dateRange]);

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const getPeriodText = () => {
    if (dateRange.start && dateRange.end) {
      return `de ${format(new Date(dateRange.start), 'dd/MM/yyyy')} a ${format(new Date(dateRange.end), 'dd/MM/yyyy')}`;
    }
    return 'Todo o histórico';
  };

  const formatDate = (dateString: string | null, formatStr = "dd/MM/yy HH:mm") => {
    if (!dateString) return '-';
    return format(new Date(dateString), formatStr, { locale: ptBR });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
        <ArrowLeft size={18} /> Voltar para todas as empresas
      </button>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif">Histórico de Protocolos: {company.name}</h2>
        <button onClick={handlePrint} className="luxury-button px-6 py-3 bg-gray-700 text-white rounded-xl flex items-center gap-2">
          <Printer size={18}/> Imprimir Relatório
        </button>
      </div>

      <div className="glass-effect p-4 rounded-xl flex items-center gap-4">
        <Calendar className="text-gray-500"/>
        <label>De:</label>
        <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="luxury-input p-2"/>
        <label>Até:</label>
        <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="luxury-input p-2"/>
      </div>
      
      <div className="glass-effect rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4">Status</th>
                  <th className="p-4">Protocolo</th>
                  <th className="p-4">Início do Problema</th>
                  <th className="p-4">Registro do Reclamo</th>
                  <th className="p-4">Solução do Problema</th>
                  <th className="p-4 max-w-xs">Comentário</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></td></tr>
              ) : filteredProtocols.map(p => (
                <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-white/50 dark:hover:bg-gray-800/50">
                  <td className="p-4">
                    {p.resolution_timestamp ? 
                      <CheckCircle className="text-green-500" title="Solucionado"/> : 
                      <AlertTriangle className="text-yellow-500" title="Pendente"/>
                    }
                  </td>
                  <td className="p-4 font-medium">{p.protocol_number}</td>
                  <td className="p-4 text-sm">{formatDate(p.protocol_date, 'dd/MM/yyyy')}</td>
                  <td className="p-4 text-sm">{formatDate(p.complaint_timestamp)}</td>
                  <td className="p-4 text-sm">{formatDate(p.resolution_timestamp)}</td>
                  <td className="p-4 text-sm truncate max-w-xs" title={p.comment || ''}>{p.comment}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {!p.resolution_timestamp && <button onClick={() => onResolve(p)} className="p-2 hover:text-green-500" title="Marcar como Solucionado"><CheckCircle/></button>}
                    <button onClick={() => onEdit(p)} className="p-2 hover:text-blue-500" title="Editar"><Edit /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 hover:text-red-500" title="Excluir"><Trash2 /></button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <ProtocolReport ref={printRef} protocols={filteredProtocols} companyName={company.name} period={getPeriodText()} />
      </div>
    </div>
  );
}