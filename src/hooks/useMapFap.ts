import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLogStore } from '../store';
import type { MapFapReservation, MapFapChecklist } from '../types/mapfap';

export function useMapFap() {
  const { selectedHotel, checkPendingMapFap } = useLogStore();
  const [reservationsForToday, setReservationsForToday] = useState<MapFapReservation[]>([]);
  const [activeAndFutureReservations, setActiveAndFutureReservations] = useState<MapFapReservation[]>([]);
  const [pastReservations, setPastReservations] = useState<MapFapReservation[]>([]);
  const [checklist, setChecklist] = useState<MapFapChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedHotel) return;
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data: allReservations, error } = await supabase
      .from('map_fap_reservations')
      .select('*')
      .eq('hotel_id', selectedHotel.id)
      .order('start_date', { ascending: true });

    if (error) {
      console.error("Error fetching MAP/FAP reservations:", error);
    } else {
      const todayRes: MapFapReservation[] = [];
      const futureRes: MapFapReservation[] = [];
      const pastRes: MapFapReservation[] = [];

      (allReservations || []).forEach(res => {
        const reservation = { ...res, guest_names: res.guest_names || [] };
        if (reservation.end_date < today) {
          pastRes.push(reservation);
        } else {
          if (reservation.start_date <= today) todayRes.push(reservation);
          futureRes.push(reservation);
        }
      });
      
      setReservationsForToday(todayRes.sort((a, b) => a.reservation_number.localeCompare(b.reservation_number)));
      setActiveAndFutureReservations(futureRes);
      setPastReservations(pastRes);
    }

    const { data: checklistData, error: checklistError } = await supabase
        .from('map_fap_checklist')
        .select('*')
        .eq('hotel_id', selectedHotel.id)
        .eq('date', today);

    if (checklistError) console.error("Error fetching checklist:", checklistError);
    else setChecklist(checklistData || []);
    
    setIsLoading(false);
  }, [selectedHotel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const refreshAllData = async () => {
    await fetchData();
    await checkPendingMapFap();
  };

  const createReservation = async (formData: Omit<MapFapReservation, 'id' | 'hotel_id' | 'created_at'>) => {
    // ... (sem alterações)
  };
  
  const updateReservation = async (reservationId: string, formData: Omit<MapFapReservation, 'id' | 'hotel_id' | 'created_at'>) => {
    // ... (sem alterações)
  };

  const deleteReservation = async (reservationId: string) => {
    // ... (sem alterações)
  };

  const upsertChecklistStatus = async (reservationId: string, mealType: 'lunch' | 'dinner', checks: boolean[]) => {
    if (!selectedHotel) return false;
    const today = new Date().toISOString().split('T')[0];

    const updateData = {
        [`${mealType}_checks`]: checks,
    };

    const { error } = await supabase
      .from('map_fap_checklist')
      .upsert({
        reservation_id: reservationId,
        hotel_id: selectedHotel.id,
        date: today,
        ...updateData
      }, { onConflict: 'reservation_id,date' });
    
    if (error) {
      alert('Erro ao salvar checklist: ' + error.message);
      return false;
    }
    
    // Atualiza o estado local para uma resposta visual imediata
    setChecklist(prev => {
        const existingIndex = prev.findIndex(c => c.reservation_id === reservationId);
        if (existingIndex > -1) {
            const updatedList = [...prev];
            updatedList[existingIndex] = { ...updatedList[existingIndex], ...updateData };
            return updatedList;
        }
        return [...prev, { reservation_id: reservationId, date: today, ...updateData } as MapFapChecklist];
    });
    return true;
  };

  return { reservationsForToday, activeAndFutureReservations, pastReservations, checklist, isLoading, fetchReservations: fetchData, createReservation, updateReservation, deleteReservation, upsertChecklistStatus };
}