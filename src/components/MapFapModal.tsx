import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Loader2, Trash2, User } from 'lucide-react';
import { useMapFap } from '../hooks/useMapFap';
import type { MapFapReservation } from '../types/mapfap';

interface MapFapModalProps {
  reservation?: MapFapReservation | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MapFapModal({ reservation, onClose, onSuccess }: MapFapModalProps) {
  const { createReservation, updateReservation, isLoading } = useMapFap();
  
  const [formData, setFormData] = useState({
    pension_type: 'MAP' as 'MAP' | 'FAP',
    reservation_number: '',
    start_date: '',
    end_date: '',
    uh_number: '',
    guest_names: [''],
    add_ons: '',
    repeat_add_ons: false,
    comment: ''
  });

  useEffect(() => {
    if (reservation) {
        setFormData({
            pension_type: reservation.pension_type,
            reservation_number: reservation.reservation_number,
            start_date: reservation.start_date,
            end_date: reservation.end_date,
            uh_number: reservation.uh_number || '',
            guest_names: reservation.guest_names && reservation.guest_names.length > 0 ? reservation.guest_names : [''],
            add_ons: reservation.add_ons || '',
            repeat_add_ons: reservation.repeat_add_ons,
            comment: reservation.comment || '',
        });
    }
  }, [reservation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleGuestNameChange = (index: number, value: string) => {
    const newGuestNames = [...formData.guest_names];
    newGuestNames[index] = value;
    setFormData(prev => ({ ...prev, guest_names: newGuestNames }));
  };

  const addGuestField = () => {
    setFormData(prev => ({ ...prev, guest_names: [...prev.guest_names, ''] }));
  };

  const removeGuestField = (index: number) => {
    if (formData.guest_names.length > 1) {
      setFormData(prev => ({ ...prev, guest_names: prev.guest_names.filter((_, i) => i !== index) }));
    }
  };
  
  const handleSave = async () => {
    if (!formData.reservation_number || !formData.start_date || !formData.end_date) {
      alert('Os campos com * são obrigatórios.');
      return;
    }

    const finalGuestNames = formData.guest_names.map((name, index) => 
        name.trim() === '' ? `Hóspede ${index + 1}` : name.trim()
    ).filter(name => name);

    if (finalGuestNames.length === 0) {
        alert('Adicione pelo menos um hóspede.');
        return;
    }
    
    const dataToSave = { ...formData, guest_names: finalGuestNames };

    let success = false;
    if (reservation) {
        success = await updateReservation(reservation.id, dataToSave as any);
    } else {
        success = await createReservation(dataToSave as any);
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
          <h3 className="text-xl font-medium">{reservation ? 'Editar Reserva' : 'Nova Reserva MAP/FAP'}</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Pensão *</label>
              <select name="pension_type" value={formData.pension_type} onChange={handleChange} className="w-full luxury-input">
                <option value="MAP">MAP (Meia Pensão)</option>
                <option value="FAP">FAP (Pensão Completa)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nº da Reserva *</label>
              <input type="text" name="reservation_number" value={formData.reservation_number} onChange={handleChange} className="w-full luxury-input"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nº do UH</label>
              <input type="text" name="uh_number" value={formData.uh_number} onChange={handleChange} className="w-full luxury-input"/>
            </div>
             <div></div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Início da Reserva *</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full luxury-input"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Final da Reserva *</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full luxury-input"/>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Hóspedes</label>
              <div className="space-y-2">
                {formData.guest_names.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400"/>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => handleGuestNameChange(index, e.target.value)}
                            className="w-full luxury-input"
                            placeholder={`Nome do Hóspede ${index + 1} (opcional)`}
                        />
                        {formData.guest_names.length > 1 && (
                            <button onClick={() => removeGuestField(index)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                        )}
                    </div>
                ))}
                <button onClick={addGuestField} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Plus size={14}/> Adicionar Hóspede</button>
              </div>
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
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}