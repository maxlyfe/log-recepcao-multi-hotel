import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Printer, Calendar, Loader2 } from 'lucide-react';
import { useProtocols } from '../hooks/useProtocols';
import type { Protocol } from '../types/protocol';
import { useReactToPrint } from 'react-to-print';
import { ProtocolReport } from './ProtocolReport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompanyProtocolsDetailProps {
  company: { id: string; name: string; };
  onBack: () => void;
}

export default function CompanyProtocolsDetail({ company, onBack }: CompanyProtocolsDetailProps) {
  const { fetchProtocolsForCompany, isLoading } = useProtocols();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProtocolsForCompany(company.id);
      setProtocols(data);
    };
    loadData();
  }, [company.id, fetchProtocolsForCompany]);

  const filteredProtocols = useMemo(() => {
    if (!dateRange.start || !dateRange.end) {
      return protocols;
    }
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999); // Inclui o dia todo no filtro final

    return protocols.filter(p => {
      const pDate = new Date(p.protocol_date);
      return pDate >= start && pDate <= end;
    });
  }, [protocols, dateRange]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const getPeriodText = () => {
    if (dateRange.start && dateRange.end) {
      return `de ${format(new Date(dateRange.start), 'dd/MM/yyyy')} a ${format(new Date(dateRange.end), 'dd/MM/yyyy')}`;
    }
    return 'Todo o histórico';
  };

  return (
    <div className="space-y-6">
      {/* Botão de voltar */}
      <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft size={18} /> Voltar para todas as empresas
      </button>

      {/* Cabeçalho da página de detalhes */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif">Histórico de Protocolos: {company.name}</h2>
        <button onClick={handlePrint} className="luxury-button px-6 py-3 bg-gray-700 text-white rounded-xl flex items-center gap-2">
          <Printer size={18}/> Imprimir Relatório
        </button>
      </div>

      {/* Filtros */}
      <div className="glass-effect p-4 rounded-xl flex items-center gap-4">
        <Calendar className="text-gray-500"/>
        <label>De:</label>
        <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="luxury-input p-2"/>
        <label>Até:</label>
        <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="luxury-input p-2"/>
      </div>
      
      {/* Tabela de Protocolos */}
      <div className="glass-effect rounded-2xl shadow-xl overflow-hidden">
        {/* ... (código da tabela igual ao de ProtocolsPage.tsx) ... */}
      </div>

      {/* Componente de impressão (invisível) */}
      <div style={{ display: 'none' }}>
        <ProtocolReport ref={printRef} protocols={filteredProtocols} companyName={company.name} period={getPeriodText()} />
      </div>
    </div>
  );
}