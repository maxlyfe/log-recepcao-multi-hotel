import React, { useState } from 'react';
import { X, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useProtocols } from '../hooks/useProtocols';
import type { Protocol } from '../types/protocol';

interface ResolveProtocolModalProps {
  protocol: Protocol;
  onClose: () => void;
  onSuccess: () => void; // NOVO: Prop para callback de sucesso
}

export default function ResolveProtocolModal({ protocol, onClose, onSuccess }: ResolveProtocolModalProps) {
  const { resolveProtocol, isLoading } = useProtocols();
  const [resolutionTime, setResolutionTime] = useState(new Date().toISOString().slice(0, 16));

  const handleSave = async () => {
    const success = await resolveProtocol(protocol.id, resolutionTime);
    if (success) {
      onSuccess(); // Chama a função para atualizar a lista
      onClose();   // Fecha o modal
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-medium flex items-center gap-2">
            <CheckCircle className="text-green-500" /> Marcar como Solucionado
          </h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-6 space-y-4">
          <p>Confirme a data e hora em que o problema do protocolo <span className="font-bold">{protocol.protocol_number}</span> foi solucionado.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Data e Hora da Solução</label>
            <input 
              type="datetime-local" 
              value={resolutionTime}
              onChange={e => setResolutionTime(e.target.value)}
              className="w-full luxury-input"
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2">Cancelar</button>
          <button onClick={handleSave} disabled={isLoading} className="luxury-button px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save />}
            Confirmar Solução
          </button>
        </div>
      </div>
    </div>
  );
}