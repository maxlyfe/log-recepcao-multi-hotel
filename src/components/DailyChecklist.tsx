import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, Users, Utensils } from 'lucide-react';
import type { MapFapReservation, MapFapChecklist } from '../types/mapfap';
import { useMapFap } from '../hooks/useMapFap';
import { format } from 'date-fns'; // Adicionado para formatação de data

// --- Subcomponente para o Card do Checklist ---
interface ChecklistCardProps {
  reservation: MapFapReservation;
  checklistEntry: MapFapChecklist | undefined;
}

const ChecklistCard = ({ reservation, checklistEntry }: ChecklistCardProps) => {
  const { upsertChecklistStatus } = useMapFap();
  // MUDANÇA AQUI: Usa a data local para definir "hoje"
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCheckinDay = reservation.start_date === today;
  const isCheckoutDay = reservation.end_date === today;

  const hasLunch = reservation.pension_type === 'FAP' && !isCheckinDay;
  const hasDinner = (reservation.pension_type === 'FAP' && !isCheckoutDay) || reservation.pension_type === 'MAP';

  const guestNames = reservation.guest_names || [];
  const guestCount = guestNames.length;

  const [checks, setChecks] = useState<{ lunch: boolean[], dinner: boolean[] }>({
    lunch: Array(guestCount).fill(false),
    dinner: Array(guestCount).fill(false),
  });

  useEffect(() => {
    setChecks({
      lunch: checklistEntry?.lunch_checks || Array(guestCount).fill(false),
      dinner: checklistEntry?.dinner_checks || Array(guestCount).fill(false),
    });
  }, [checklistEntry, guestCount]);

  const handleGuestCheckChange = (mealType: 'lunch' | 'dinner', index: number) => {
    const currentChecks = mealType === 'lunch' ? checks.lunch : checks.dinner;
    const newChecks = [...currentChecks];
    newChecks[index] = !newChecks[index];
    
    // Atualiza o estado local para uma resposta visual imediata
    setChecks(prev => ({ ...prev, [mealType]: newChecks }));
    
    // Envia a lista completa de checks para o banco
    upsertChecklistStatus(reservation.id, mealType, newChecks);
  };

  const renderGuestList = (mealType: 'lunch' | 'dinner') => {
    const checkState = mealType === 'lunch' ? checks.lunch : checks.dinner;
    return guestNames.map((guestName, index) => (
      <label key={index} className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer text-sm">
        <span className="flex items-center gap-2"><User size={14}/> {guestName}</span>
        <input 
          type="checkbox"
          checked={checkState[index] || false}
          onChange={() => handleGuestCheckChange(mealType, index)}
          className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
        />
      </label>
    ));
  };

  return (
    <div className="embla__slide flex-shrink-0 w-80 md:w-96 glass-effect rounded-2xl p-4 flex flex-col">
      <div>
        <div className="flex justify-between items-start">
            <p className="font-bold text-lg">{reservation.reservation_number}</p>
            {reservation.uh_number && <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">UH {reservation.uh_number}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <Users size={14}/> {guestCount} hóspedes • <Utensils size={14}/> {reservation.pension_type}
        </p>
      </div>

      <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 overflow-y-auto flex-grow">
        <div className={`grid ${hasLunch && hasDinner ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {hasLunch && (
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Sun className="h-4 w-4 text-yellow-500"/> Almoço</h4>
              <div className="space-y-1">{renderGuestList('lunch')}</div>
            </div>
          )}

          {hasDinner && (
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2"><Moon className="h-4 w-4 text-blue-400"/> Jantar</h4>
              <div className="space-y-1">{renderGuestList('dinner')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DailyChecklistProps {
  reservations: MapFapReservation[];
  checklist: MapFapChecklist[];
}

export default function DailyChecklist({ reservations, checklist }: DailyChecklistProps) {
  if (reservations.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma reserva com MAP/FAP para hoje.</p>;
  }
  
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