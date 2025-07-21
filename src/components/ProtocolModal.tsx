import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Loader2 } from 'lucide-react';
import { useProtocols } from '../hooks/useProtocols';
import { useCompanies } from '../hooks/useCompanies';
import type { Protocol, CreateProtocolData } from '../types/protocol';

interface ProtocolModalProps {
  protocol?: Protocol | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProtocolModal({ protocol, onClose, onSuccess }: ProtocolModalProps) {
  const { createProtocol, updateProtocol, isLoading } = useProtocols();
  const { companies } = useCompanies();
  
  const [formData, setFormData] = useState<CreateProtocolData>({
    company_name: '',
    protocol_date: new Date().toISOString().split('T')[0],
    protocol_number: '',
    attendant_name: '',
    complaint_type: '',
    complaint_timestamp: new Date().toISOString().slice(0, 16),
    resolution_timestamp: null,
    comment: ''
  });
  const [showNewCompanyInput, setShowNewCompanyInput] = useState(false);

  useEffect(() => {
    if (protocol) {
      setFormData({
        company_name: protocol.company.name,
        protocol_date: new Date(protocol.protocol_date).toISOString().split('T')[0],
        protocol_number: protocol.protocol_number,
        attendant_name: protocol.attendant_name || '',
        complaint_type: protocol.complaint_type || '',
        complaint_timestamp: new Date(protocol.complaint_timestamp).toISOString().slice(0, 16),
        resolution_timestamp: protocol.resolution_timestamp ? new Date(protocol.resolution_timestamp).toISOString().slice(0, 16) : null,
        comment: protocol.comment || ''
      });
      setShowNewCompanyInput(true);
    }
  }, [protocol]);

  const handleChange = (field: keyof CreateProtocolData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectCompany = (name: string) => {
    handleChange('company_name', name);
    setShowNewCompanyInput(true);
  };
  
  const handleSave = async () => {
    if (!formData.protocol_number.trim() || !formData.company_name.trim()) {
      alert('Número do protocolo e nome da empresa são obrigatórios.');
      return;
    }
    
    let success = false;
    if (protocol) {
      success = await updateProtocol(protocol.id, formData);
    } else {
      success = await createProtocol(formData);
    }
    
    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-medium">{protocol ? 'Editar Protocolo' : 'Novo Protocolo'}</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {!protocol && !showNewCompanyInput && (
            <div>
              <label className="block text-sm font-medium mb-2">Selecione uma Empresa</label>
              <div className="flex flex-wrap gap-2">
                {companies.map(c => (
                  <button key={c.id} onClick={() => handleSelectCompany(c.name)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-sm hover:bg-gray-200">
                    {c.name}
                  </button>
                ))}
                <button onClick={() => setShowNewCompanyInput(true)} className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200">
                  <Plus className="h-4 w-4 mr-1" /> Criar Nova
                </button>
              </div>
            </div>
          )}

          {showNewCompanyInput && (
             <div>
                <label className="block text-sm font-medium mb-2">Empresa *</label>
                <input type="text" value={formData.company_name} onChange={e => handleChange('company_name', e.target.value)} disabled={!!protocol} className="w-full luxury-input disabled:bg-gray-100 dark:disabled:bg-gray-700"/>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
            {/* TEXTO ALTERADO AQUI */}
            <div><label>Data Início do Problema *</label><input type="date" value={formData.protocol_date} onChange={e => handleChange('protocol_date', e.target.value)} className="w-full luxury-input"/></div>
            <div><label>Número do Protocolo *</label><input type="text" value={formData.protocol_number} onChange={e => handleChange('protocol_number', e.target.value)} className="w-full luxury-input"/></div>
            <div><label>Nome do Atendente</label><input type="text" value={formData.attendant_name} onChange={e => handleChange('attendant_name', e.target.value)} className="w-full luxury-input"/></div>
            <div><label>Tipo de Reclamação</label><input type="text" value={formData.complaint_type} onChange={e => handleChange('complaint_type', e.target.value)} className="w-full luxury-input"/></div>
            <div><label>Data/Hora da Reclamação *</label><input type="datetime-local" value={formData.complaint_timestamp} onChange={e => handleChange('complaint_timestamp', e.target.value)} className="w-full luxury-input"/></div>
            <div><label>Data/Hora da Solução</label><input type="datetime-local" value={formData.resolution_timestamp || ''} onChange={e => handleChange('resolution_timestamp', e.target.value)} className="w-full luxury-input"/></div>
            <div className="md:col-span-2"><label>Comentário</label><textarea value={formData.comment} onChange={e => handleChange('comment', e.target.value)} rows={3} className="w-full luxury-input"></textarea></div>
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2">Cancelar</button>
          <button onClick={handleSave} disabled={isLoading} className="luxury-button px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin"/> : <Save />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}