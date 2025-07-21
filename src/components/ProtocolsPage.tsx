import React, { useState, useMemo } from 'react';
import { FileText, Plus, Loader2, Trash2, Edit, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { useProtocols } from '../hooks/useProtocols';
import ProtocolModal from './ProtocolModal';
import ResolveProtocolModal from './ResolveProtocolModal';
import CompanyProtocolsDetail from './CompanyProtocolsDetail';
import type { Protocol } from '../types/protocol';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProtocolsPage() {
  const { protocolsByCompany, isLoading, deleteProtocol, fetchProtocols } = useProtocols();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [resolvingProtocol, setResolvingProtocol] = useState<Protocol | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<{ id: string, name: string } | null>(null);

  const filteredData = useMemo(() => {
    if (!Array.isArray(protocolsByCompany)) return [];
    if (!searchTerm) return protocolsByCompany;
    return protocolsByCompany
      .map(group => ({
        ...group,
        protocols: group.protocols.filter(p =>
          p.protocol_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.complaint_type && p.complaint_type.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
      }))
      .filter(group => group.protocols.length > 0);
  }, [protocolsByCompany, searchTerm]);

  const handleEdit = (protocol: Protocol) => { setEditingProtocol(protocol); };
  const handleDelete = async (protocolId: string) => { if (window.confirm('Tem certeza?')) { await deleteProtocol(protocolId); }};
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yy HH:mm", { locale: ptBR });
  };

  if (selectedCompany) {
    const companyData = protocolsByCompany.find(p => p.company.id === selectedCompany.id);
    return (
      <CompanyProtocolsDetail 
        company={selectedCompany} 
        protocols={companyData?.protocols || []}
        isLoading={isLoading}
        onBack={() => setSelectedCompany(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResolve={setResolvingProtocol}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" /> Protocolos
        </h2>
        <button onClick={() => { setEditingProtocol(null); setShowCreateModal(true); }} className="luxury-button px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2">
          <Plus /> Novo Protocolo
        </button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nº de protocolo, empresa ou tipo..." className="w-full pl-10 pr-4 py-3 luxury-input"/>
      </div>

      {isLoading && protocolsByCompany.length === 0 ? (
        <div className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredData.map(({ company, protocols }) => (
            <div key={company.id} onClick={() => setSelectedCompany(company)} className="glass-effect rounded-2xl shadow-xl overflow-hidden flex flex-col text-left hover:ring-2 hover:ring-blue-500 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-medium p-4 bg-white/10 dark:bg-gray-800/50 w-full">{company.name}</h3>
              <div className="p-4 space-y-3 flex-grow">
                {protocols.slice(0, 3).map(p => (
                  <div key={p.id} className="p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold">{p.protocol_number}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{p.complaint_type}</p>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <p>Reclamado em: {formatDate(p.complaint_timestamp)}</p>
                            {p.resolution_timestamp && (<p className="text-green-600 dark:text-green-400">Solucionado em: {formatDate(p.resolution_timestamp)}</p>)}
                        </div>
                      </div>
                      {/* CORREÇÃO: Adicionado stopPropagation para os botões internos */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                        {p.resolution_timestamp ? 
                          (<CheckCircle className="h-5 w-5 text-green-500" title={`Solucionado em ${formatDate(p.resolution_timestamp)}`}/>) 
                          : 
                          (<button onClick={() => setResolvingProtocol(p)} className="p-2 text-yellow-500 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-500/20" title="Marcar como Solucionado"><AlertTriangle className="h-5 w-5"/></button>)
                        }
                        <button onClick={() => handleEdit(p)} className="p-2 hover:text-blue-500"><Edit className="h-5 w-5"/></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-500"><Trash2 className="h-5 w-5"/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full text-center p-2 bg-gray-50 dark:bg-gray-900/50 text-sm text-blue-600 dark:text-blue-400 font-medium mt-auto">
                Ver Histórico Completo ({protocols.length})
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && <ProtocolModal onClose={() => setShowCreateModal(false)} onSuccess={fetchProtocols} />}
      {editingProtocol && <ProtocolModal protocol={editingProtocol} onClose={() => setEditingProtocol(null)} onSuccess={fetchProtocols} />}
      {resolvingProtocol && <ResolveProtocolModal protocol={resolvingProtocol} onClose={() => setResolvingProtocol(null)} onSuccess={fetchProtocols} />}
    </div>
  );
}