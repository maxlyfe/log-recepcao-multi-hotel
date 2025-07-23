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

  const createReservation = async (formData: Omit<MapFapReservation, 'id' | 'hotel_id' | 'created_at' | 'guest_count'>) => {
    if (!selectedHotel) return false;
    setIsLoading(true);
    
    const { error } = await supabase
      .from('map_fap_reservations')
      .insert({ ...formData, hotel_id: selectedHotel.id });
    
    setIsLoading(false);
    if (error) {
        alert('Erro ao criar reserva: ' + error.message);
        return false;
    }
    await refreshAllData();
    return true;
  };

  const updateReservation = async (reservationId: string, formData: Omit<MapFapReservation, 'id' | 'hotel_id' | 'created_at' | 'guest_count'>) => {
    setIsLoading(true);
    const { error } = await supabase.rpc('update_map_fap_reservation', {
        p_reservation_id: reservationId,
        p_pension_type: formData.pension_type,
        p_reservation_number: formData.reservation_number,
        p_start_date: formData.start_date,
        p_end_date: formData.end_date,
        p_uh_number: formData.uh_number,
        p_guest_names: formData.guest_names,
        p_add_ons: formData.add_ons,
        p_repeat_add_ons: formData.repeat_add_ons,
        p_comment: formData.comment,
    });
    setIsLoading(false);
    if (error) {
        alert('Erro ao atualizar reserva: ' + error.message);
        return false;
    }
    await refreshAllData();
    return true;
  };

  const deleteReservation = async (reservationId: string) => {
    setIsLoading(true);
    const { error } = await supabase.from('map_fap_reservations').delete().eq('id', reservationId);
    setIsLoading(false);
    if(error) {
        alert('Erro ao deletar reserva: ' + error.message);
        return false;
    }
    await refreshAllData();
    return true;
  };

  const upsertChecklistStatus = async (reservationId: string, mealType: 'lunch' | 'dinner', checks: boolean[]) => {
    if (!selectedHotel) return false;
    const today = new Date().toISOString().split('T')[0];
    const updateData = { [`${mealType}_checks`]: checks };

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
    setChecklist(prev => {
        const existingIndex = prev.findIndex(c => c.reservation_id === reservationId);
        if (existingIndex > -1) {
            const updatedList = [...prev];
            updatedList[existingIndex] = { ...updatedList[existingIndex], ...updateData };
            return updatedList;
        }
        return [...prev, { reservation_id: reservationId, date: today, ...updateData } as MapFapChecklist];
    });
    await checkPendingMapFap();
    return true;
  };

  // MUDANÇA AQUI: Adicionado "selectedHotel" ao retorno
  return { 
      reservationsForToday, 
      activeAndFutureReservations, 
      pastReservations, 
      checklist, 
      isLoading, 
      fetchReservations: fetchData, 
      createReservation, 
      updateReservation, 
      deleteReservation, 
      upsertChecklistStatus,
      selectedHotel 
  };
}