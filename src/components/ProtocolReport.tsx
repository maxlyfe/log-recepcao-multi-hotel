import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Protocol } from '../types/protocol';
import { useLogStore } from '../store';

interface ProtocolReportProps {
  protocols: Protocol[];
  companyName: string;
  period: string;
}

export const ProtocolReport = React.forwardRef<HTMLDivElement, ProtocolReportProps>(
  ({ protocols, companyName, period }, ref) => {
    const { selectedHotel } = useLogStore();

    const formatDate = (dateString: string | null, formatStr = "dd/MM/yyyy HH:mm") => {
        if (!dateString) return '-';
        return format(new Date(dateString), formatStr, { locale: ptBR });
    };

    return (
      <div ref={ref} className="p-8 font-sans text-black bg-white">
        <header className="mb-8 border-b-2 border-black pb-4 text-center">
          <h1 className="text-3xl font-bold">{selectedHotel?.name}</h1>
          <h2 className="text-xl text-gray-700">Relatório de Protocolos</h2>
        </header>

        <div className="mb-8 flex justify-between text-sm">
          <div><span className="font-bold">Empresa:</span> {companyName}</div>
          <div><span className="font-bold">Período:</span> {period}</div>
          <div><span className="font-bold">Data de Emissão:</span> {format(new Date(), 'dd/MM/yyyy')}</div>
        </div>

        <table className="w-full text-xs border-collapse border border-gray-400">
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className="border border-gray-400 p-2">Data</th>
              <th className="border border-gray-400 p-2">Protocolo</th>
              <th className="border border-gray-400 p-2">Reclamação</th>
              <th className="border border-gray-400 p-2">Atendente</th>
              <th className="border border-gray-400 p-2">Comentário</th>
              <th className="border border-gray-400 p-2">Status</th>
              <th className="border border-gray-400 p-2">Data Solução</th>
            </tr>
          </thead>
          <tbody>
            {protocols.map(p => (
              <tr key={p.id}>
                <td className="border border-gray-400 p-2">{formatDate(p.protocol_date, 'dd/MM/yyyy')}</td>
                <td className="border border-gray-400 p-2 font-mono">{p.protocol_number}</td>
                <td className="border border-gray-400 p-2">{p.complaint_type}</td>
                <td className="border border-gray-400 p-2">{p.attendant_name || '-'}</td>
                <td className="border border-gray-400 p-2">{p.comment || '-'}</td>
                <td className="border border-gray-400 p-2 font-semibold">
                  {p.resolution_timestamp ? 'Solucionado' : 'Pendente'}
                </td>
                <td className="border border-gray-400 p-2">{formatDate(p.resolution_timestamp)}</td>
              </tr>
            ))}
             {protocols.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center p-4 border border-gray-400">Nenhum protocolo encontrado para este período.</td>
                </tr>
            )}
          </tbody>
        </table>
        
        <footer className="mt-12 text-center text-xs text-gray-500">
          Relatório gerado pelo Sistema de Log da Recepção.
        </footer>
      </div>
    );
  }
);