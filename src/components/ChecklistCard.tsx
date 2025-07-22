import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, Check, X } from 'lucide-react';
import type { MapFapReservation, MapFapChecklist } from '../types/mapfap';
import { useMapFap } from '../hooks/useMapFap';

interface ChecklistCardProps {
  reservation: MapFapReservation;
  checklistEntry: MapFapChecklist | undefined;
}

export default function ChecklistCard({ reservation, checklistEntry }: ChecklistCardProps) {
  const { upsertChecklistStatus } = useMapFap();
  const today = new Date().toISOString().split('T')[0];
  const isCheckinDay = reservation.start_date === today;
  const isCheckoutDay = reservation.end_date === today;

  // Define quais refeições estão disponíveis
  const hasLunch = reservation.pension_type === 'FAP' && !isCheckinDay;
  const hasDinner = (reservation.pension_type === 'FAP' && !isCheckoutDay) || reservation.pension_type === 'MAP' || reservation.pension_type === 'MAP/FAP';

  // Inicializa o estado dos checkboxes
  const initialStatuses = Array(reservation.guest_count).fill(false);
  if (checklistEntry?.status === 'Lançado') {
    for (let i = 0; i < checklistEntry.launched_count; i++) {
      initialStatuses[i] = true;
    }
  }
  const [guestCheckboxes, setGuestCheckboxes] = useState<boolean[]>(initialStatuses);

  const handleCheckboxChange = (index: number) => {
    const newCheckboxes = [...guestCheckboxes];
    newCheckboxes[index] = !newCheckboxes[index];
    setGuestCheckboxes(newCheckboxes);
  };
  
  const handleSave = () => {
    const launchedCount = guestCheckboxes.filter(Boolean).length;
    const status = launchedCount > 0 ? 'Lançado' : 'Não Consumido';
    upsertChecklistStatus(reservation.id, launchedCount, status);
  };

  return (
    <div className="embla__slide flex-shrink-0 w-80 md:w-96 glass-effect rounded-2xl p-4 flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg">{reservation.reservation_number}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{reservation.guest_count} hóspedes • {reservation.pension_type}</p>
        </div>
        <button onClick={handleSave} className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200">Salvar Status</button>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <span className="font-medium">Refeições do dia:</span>
        {hasLunch && <span className="flex items-center gap-1"><Sun className="h-4 w-4 text-yellow-500"/> Almoço</span>}
        {hasDinner && <span className="flex items-center gap-1"><Moon className="h-4 w-4 text-blue-400"/> Jantar</span>}
      </div>

      <div className="mt-4 space-y-2 overflow-y-auto flex-grow">
        {guestCheckboxes.map((isChecked, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/30 rounded-md">
            <span className="flex items-center gap-2 text-sm"><User size={14} /> Hóspede {index + 1}</span>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckboxChange(index)}
              className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}