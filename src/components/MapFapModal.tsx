import React, { useState } from 'react';
import { X, Save, Plus, Loader2 } from 'lucide-react';
import { useMapFap } from '../hooks/useMapFap';
import type { MapFapReservation } from '../types/mapfap';

interface MapFapModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function MapFapModal({ onClose, onSuccess }: MapFapModalProps) {
  const { createReservation, isLoading } = useMapFap();
  
  const [formData, setFormData] = useState({
    pension_type: 'MAP',
    reservation_number: '',
    start_date: '',
    end_date: '',
    guest_count: 1,
    add_ons: '',
    repeat_add_ons: false,
    comment: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSave = async () => {
    if (!formData.pension_type || !formData.reservation_number || !formData.start_date || !formData.end_date) {
      alert('Os campos com * são obrigatórios.');
      return;
    }

    const success = await createReservation(formData as Omit<MapFapReservation, 'id' | 'hotel_id' | 'created_at'>);
    
    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-medium">Nova Reserva MAP/FAP</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Pensão *</label>
              <select name="pension_type" value={formData.pension_type} onChange={handleChange} className="w-full luxury-input">
                <option value="MAP">MAP (Meia Pensão)</option>
                <option value="FAP">FAP (Pensão Completa)</option>
                <option value="MAP/FAP">MAP/FAP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nº da Reserva *</label>
              <input type="text" name="reservation_number" value={formData.reservation_number} onChange={handleChange} className="w-full luxury-input"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Início da Reserva *</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full luxury-input"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Final da Reserva *</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full luxury-input"/>
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">Quantidade de Hóspedes *</label>
              <input type="number" name="guest_count" value={formData.guest_count} onChange={handleChange} min="1" className="w-full luxury-input"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Adicionais</label>
              <input type="text" name="add_ons" value={formData.add_ons} onChange={handleChange} className="w-full luxury-input" placeholder="Ex: Vinho, Chocolate, etc."/>
              <div className="flex items-center mt-2">
                <input type="checkbox" id="repeat_add_ons" name="repeat_add_ons" checked={formData.repeat_add_ons} onChange={handleChange} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"/>
                <label htmlFor="repeat_add_ons" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Repetir adicional para todos os dias?</label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Comentário</label>
              <textarea name="comment" value={formData.comment} onChange={handleChange} rows={3} className="w-full luxury-input"></textarea>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2">Cancelar</button>
          <button onClick={handleSave} disabled={isLoading} className="luxury-button px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            {isLoading ? <Loader2 className="animate-spin"/> : <Save />}
            Salvar Reserva
          </button>
        </div>
      </div>
    </div>
  );
}