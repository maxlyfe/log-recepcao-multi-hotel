import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, Users, Utensils } from 'lucide-react';
import type { MapFapReservation, MapFapChecklist } from '../types/mapfap';
import { useMapFap } from '../hooks/useMapFap';

// --- Subcomponente para o Card do Checklist ---
interface ChecklistCardProps {
  reservation: MapFapReservation;
  checklistEntry: MapFapChecklist | undefined;
}

const ChecklistCard = ({ reservation, checklistEntry }: ChecklistCardProps) => {
  const { upsertChecklistStatus } = useMapFap();
  const today = new Date().toISOString().split('T')[0];
  const isCheckinDay = reservation.start_date === today;
  const isCheckoutDay = reservation.end_date === today;

  // Define quais refeições estão disponíveis
  const hasLunch = reservation.pension_type === 'FAP' && !isCheckinDay;
  const hasDinner = (reservation.pension_type === 'FAP' && !isCheckoutDay) || reservation.pension_type === 'MAP' || reservation.pension_type === 'MAP/FAP';

  // Estado local para os checkboxes de cada refeição
  const [lunchChecks, setLunchChecks] = useState<boolean[]>([]);
  const [dinnerChecks, setDinnerChecks] = useState<boolean[]>([]);

  // Efeito para inicializar/atualizar os checkboxes quando os dados mudam
  useEffect(() => {
    const lunchCount = checklistEntry?.lunch_launched_count || 0;
    setLunchChecks(Array(reservation.guest_count).fill(false).map((_, i) => i < lunchCount));
    
    const dinnerCount = checklistEntry?.dinner_launched_count || 0;
    setDinnerChecks(Array(reservation.guest_count).fill(false).map((_, i) => i < dinnerCount));
  }, [checklistEntry, reservation.guest_count]);

  const handleGuestCheckChange = (mealType: 'lunch' | 'dinner', index: number) => {
    const currentChecks = mealType === 'lunch' ? lunchChecks : dinnerChecks;
    const setChecks = mealType === 'lunch' ? setLunchChecks : setDinnerChecks;

    const newChecks = [...currentChecks];
    newChecks[index] = !newChecks[index];
    setChecks(newChecks);

    const launchedCount = newChecks.filter(Boolean).length;
    const status = launchedCount === 0 ? 'Não Consumido' : 'Lançado';
    upsertChecklistStatus(reservation.id, mealType, launchedCount, status);
  };

  const renderGuestList = (mealType: 'lunch' | 'dinner', checks: boolean[]) => {
    return Array.from({ length: reservation.guest_count }).map((_, index) => (
      <label key={index} className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer text-sm">
        <span className="flex items-center gap-2"><User size={14}/> Hóspede {index + 1}</span>
        <input 
          type="checkbox"
          checked={checks[index] || false}
          onChange={() => handleGuestCheckChange(mealType, index)}
          className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
        />
      </label>
    ));
  };

  return (
    <div className="embla__slide flex-shrink-0 w-80 md:w-96 glass-effect rounded-2xl p-4 flex flex-col">
      <div>
        <p className="font-bold text-lg">{reservation.reservation_number}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <Users size={14}/> {reservation.guest_count} hóspedes • <Utensils size={14}/> {reservation.pension_type}
        </p>
      </div>

      <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 overflow-y-auto flex-grow">
        <div className="grid grid-cols-2 gap-4">
          {/* Coluna do Almoço */}
          {hasLunch && (
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Sun className="h-4 w-4 text-yellow-500"/> Almoço</h4>
              <div className="space-y-1">{renderGuestList('lunch', lunchChecks)}</div>
            </div>
          )}

          {/* Coluna do Jantar */}
          {hasDinner && (
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Moon className="h-4 w-4 text-blue-400"/> Jantar</h4>
              <div className="space-y-1">{renderGuestList('dinner', dinnerChecks)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Componente Principal do Checklist ---
interface DailyChecklistProps {
  reservations: MapFapReservation[];
  checklist: MapFapChecklist[];
}

export default function DailyChecklist({ reservations, checklist }: DailyChecklistProps) {
  if (reservations.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma reserva com MAP/FAP para hoje.</p>;
  }

  // A lógica do carrossel será adicionada na MapFapPage
  return (
    <>
      {reservations.map(res => (
        <ChecklistCard 
          key={res.id} 
          reservation={res} 
          checklistEntry={checklist.find(c => c.reservation_id === res.id)} 
        />
      ))}
    </>
  );
}