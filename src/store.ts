import { create } from 'zustand';
import { supabase } from './lib/supabase';
import type { Log, LogEntry, ShiftValues, Hotel, EditHistoryItem } from './types';

// Função auxiliar para mapear os dados do log do Supabase para o nosso objeto Log
const mapSupabaseLogToLogObject = (logData: any): Log => {
  const {
    id, receptionist, start_time, end_time, status, hotel_id,
    cash_brl_start, envelope_brl_start, cash_usd_start, pens_count_start, calculator_start, phone_start, car_key_start, adapter_start, umbrella_start, highlighter_start, cards_towels_start,
    cash_brl_end, envelope_brl_end, cash_usd_end, pens_count_end, calculator_end, phone_end, car_key_end, adapter_end, umbrella_end, highlighter_end, cards_towels_end,
    values_last_edited_at, values_edited_by, entries
  } = logData;

  const log: Log = {
    id,
    receptionist,
    start_time,
    end_time,
    status,
    hotel_id,
    entries: entries || [],
    startValues: {
      cash_brl: cash_brl_start,
      envelope_brl: envelope_brl_start,
      cash_usd: cash_usd_start,
      pens_count: pens_count_start,
      calculator: calculator_start,
      phone: phone_start,
      car_key: car_key_start,
      adapter: adapter_start,
      umbrella: umbrella_start,
      highlighter: highlighter_start,
      cards_towels: cards_towels_start,
    },
    endValues: end_time ? {
      cash_brl: cash_brl_end,
      envelope_brl: envelope_brl_end,
      cash_usd: cash_usd_end,
      pens_count: pens_count_end,
      calculator: calculator_end,
      phone: phone_end,
      car_key: car_key_end,
      adapter: adapter_end,
      umbrella: umbrella_end,
      highlighter: highlighter_end,
      cards_towels: cards_towels_end,
    } : undefined,
    values_last_edited_at,
    values_edited_by,
  };
  return log;
};

export type LogStore = {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  logs: Log[];
  currentLog: Log | null;
  previousLog: Log | null;
  openEntries: (LogEntry & { fromPreviousLog?: boolean; log_receptionist?: string; log_start_time?: string })[];
  editHistory: EditHistoryItem[];
  isLoading: boolean;
  hasInitError: boolean;
  hasOpenProtocols: boolean;
  hasPendingMapFap: boolean;
  fetchHotels: () => Promise<void>;
  selectHotel: (hotel: Hotel) => Promise<void>;
  verifyHotelPin: (hotel: Hotel, pin: string) => Promise<boolean>;
  clearHotelSelection: () => void;
  addLog: (log: { receptionist: string; startValues: ShiftValues }) => Promise<void>;
  fetchLogs: () => Promise<void>;
  initializeLogState: () => Promise<void>;
  retryInitialization: () => Promise<void>;
  fetchCurrentLog: () => Promise<void>;
  fetchPreviousLog: () => Promise<void>;
  fetchOpenEntries: () => Promise<void>;
  updateCurrentLog: (text: string, replyTo?: string | null) => Promise<void>;
  finishCurrentLog: (endValues: ShiftValues) => Promise<void>;
  addComment: (logId: string, entryId: string, text: string) => Promise<void>;
  updateEntryStatus: (logId: string, entryId: string, status: 'open' | 'in_progress' | 'closed') => Promise<void>;
  editLogEntry: (logId: string, entryId: string, newText: string, editor: string) => Promise<void>;
  editShiftValues: (logId: string, newValues: ShiftValues, editor: string) => Promise<void>;
  fetchEditHistory: (entityType: 'log_entry' | 'shift_values', entityId: string) => Promise<void>;
  checkOpenProtocols: () => Promise<void>;
  checkPendingMapFap: () => Promise<void>;
};

export const useLogStore = create<LogStore>((set, get) => ({
  hotels: [],
  selectedHotel: null,
  logs: [],
  currentLog: null,
  previousLog: null,
  openEntries: [],
  editHistory: [],
  isLoading: true,
  hasInitError: false,
  hasOpenProtocols: false,
  hasPendingMapFap: false,

  fetchHotels: async () => {
    const { data, error } = await supabase.from('hotels').select('*');
    if (error) {
      console.error('Error fetching hotels:', error);
      set({ hotels: [] });
    } else {
      set({ hotels: data || [] });
    }
  },

  selectHotel: async (hotel) => {
    set({ selectedHotel: hotel, hasInitError: false, isLoading: true });
    try {
      await get().initializeLogState();
    } catch (error) {
      console.error('Error initializing log state:', error);
      set({ hasInitError: true });
    } finally {
      set({ isLoading: false });
    }
  },

  verifyHotelPin: async (hotel, pin) => {
    const { data, error } = await supabase.from('hotels').select('pin').eq('id', hotel.id).single();
    if (error || !data) {
      console.error('Error verifying PIN:', error);
      return false;
    }
    return data.pin === pin;
  },

  clearHotelSelection: () => set({ selectedHotel: null, currentLog: null, previousLog: null, openEntries: [], logs: [], isLoading: false, hasInitError: false }),

  initializeLogState: async () => {
    set({ isLoading: true, hasInitError: false });
    try {
      const { fetchCurrentLog, fetchPreviousLog, fetchOpenEntries, checkOpenProtocols, checkPendingMapFap } = get();
      await Promise.all([
        fetchCurrentLog(),
        fetchPreviousLog(),
        fetchOpenEntries(),
        checkOpenProtocols(),
        checkPendingMapFap(),
      ]);
    } catch (error) {
      console.error('Error during initialization:', error);
      set({ hasInitError: true });
    } finally {
      set({ isLoading: false });
    }
  },

  retryInitialization: async () => {
    await get().initializeLogState();
  },

  checkOpenProtocols: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return set({ hasOpenProtocols: false });
    const { count, error } = await supabase.from('protocols').select('*', { count: 'exact', head: true }).eq('hotel_id', selectedHotel.id).is('resolution_timestamp', null);
    if (error) console.error("Error checking open protocols:", error);
    set({ hasOpenProtocols: (count || 0) > 0 });
  },

  checkPendingMapFap: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return set({ hasPendingMapFap: false });

    const today = new Date().toISOString().split('T')[0];

    const { data: activeReservations, error: resError } = await supabase
      .from('map_fap_reservations')
      .select('id, pension_type, start_date, end_date, guest_names')
      .eq('hotel_id', selectedHotel.id)
      .lte('start_date', today)
      .gte('end_date', today);

    if (resError || !activeReservations || activeReservations.length === 0) {
      if(resError) console.error("Error checking pending MAP/FAP:", resError);
      return set({ hasPendingMapFap: false });
    }

    const reservationIds = activeReservations.map(r => r.id);
    const { data: checklistData, error: checklistError } = await supabase
      .from('map_fap_checklist')
      .select('reservation_id, lunch_checks, dinner_checks')
      .eq('hotel_id', selectedHotel.id)
      .eq('date', today)
      .in('reservation_id', reservationIds);

    if (checklistError) {
      console.error("Error fetching checklist for pending check:", checklistError);
      return set({ hasPendingMapFap: true }); // Assume pending if checklist fails
    }

    let hasPending = false;
    for (const res of activeReservations) {
      const checklist = checklistData?.find(c => c.reservation_id === res.id);
      const guestCount = (res.guest_names || []).length;
      const isCheckinDay = res.start_date === today;
      const isCheckoutDay = res.end_date === today;

      const hasLunch = res.pension_type === 'FAP' && !isCheckinDay;
      const hasDinner = (res.pension_type === 'FAP' && !isCheckoutDay) || res.pension_type === 'MAP';

      if (hasLunch) {
        const lunchChecks = checklist?.lunch_checks || [];
        if (lunchChecks.filter(Boolean).length < guestCount) {
          hasPending = true;
          break;
        }
      }
      if (hasDinner) {
        const dinnerChecks = checklist?.dinner_checks || [];
        if (dinnerChecks.filter(Boolean).length < guestCount) {
          hasPending = true;
          break;
        }
      }
    }

    set({ hasPendingMapFap: hasPending });
  },

  fetchCurrentLog: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    const { data, error } = await supabase.from('logs').select('*').eq('status', 'active').eq('hotel_id', selectedHotel.id).maybeSingle();
    if (error) throw error;
    if (data) {
      const { data: entries, error: entriesError } = await supabase.from('log_entries').select('*, comments:log_entries!reply_to(id, text, timestamp, created_by)').eq('log_id', data.id).is('reply_to', null).order('timestamp', { ascending: true });
      if (entriesError) throw entriesError;
      const fullLog = mapSupabaseLogToLogObject({ ...data, entries: entries || [] });
      set({ currentLog: fullLog });
    } else {
      set({ currentLog: null });
    }
  },

  fetchPreviousLog: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    const { data, error } = await supabase.from('logs').select('*').eq('status', 'completed').eq('hotel_id', selectedHotel.id).order('end_time', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    set({ previousLog: data ? mapSupabaseLogToLogObject(data) : null });
  },

  fetchOpenEntries: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    const { data, error } = await supabase
        .from('log_entries')
        .select(`*, log:logs!log_id(receptionist, start_time)`)
        .eq('hotel_id', selectedHotel.id)
        .in('status', ['open', 'in_progress']);
    if (error) throw error;
    const entriesWithFlag = (data || []).map(e => ({...e, fromPreviousLog: true, log_receptionist: e.log.receptionist, log_start_time: e.log.start_time}));
    set({ openEntries: entriesWithFlag });
  },

  fetchLogs: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    set({ isLoading: true });
    const { data: logsData, error } = await supabase.from('logs').select('*').eq('hotel_id', selectedHotel.id).order('start_time', { ascending: false });
    if (error) {
      console.error("Error fetching logs:", error);
      set({ logs: [], isLoading: false });
      return;
    }
    const logsWithDetails = await Promise.all(
      (logsData || []).map(async (log) => {
        const { data: entries, error: entriesError } = await supabase.from('log_entries').select('*, comments:log_entries!reply_to(id, text, timestamp, created_by)').eq('log_id', log.id).is('reply_to', null).order('timestamp', { ascending: true });
        if (entriesError) {
          console.error("Error fetching entries for log:", log.id, entriesError);
          return mapSupabaseLogToLogObject({ ...log, entries: [] });
        }
        return mapSupabaseLogToLogObject({ ...log, entries: entries || [] });
      })
    );
    set({ logs: logsWithDetails, isLoading: false });
  },

  addLog: async ({ receptionist, startValues }) => {
    const { selectedHotel, initializeLogState } = get();
    if (!selectedHotel) return;
    const valuesToInsert = {
        cash_brl_start: startValues.cash_brl, envelope_brl_start: startValues.envelope_brl, cash_usd_start: startValues.cash_usd, pens_count_start: startValues.pens_count, calculator_start: startValues.calculator, phone_start: startValues.phone, car_key_start: startValues.car_key, adapter_start: startValues.adapter, umbrella_start: startValues.umbrella, highlighter_start: startValues.highlighter, cards_towels_start: startValues.cards_towels,
    };
    const { data, error } = await supabase.from('logs').insert([{ receptionist, start_time: new Date(), status: 'active', hotel_id: selectedHotel.id, ...valuesToInsert }]).select().single();
    if (error) throw error;
    await initializeLogState();
  },

  updateCurrentLog: async (text, replyTo = null) => {
    const { currentLog, initializeLogState } = get();
    if (!currentLog) return;
    const { error } = await supabase.from('log_entries').insert([{ log_id: currentLog.id, text, timestamp: new Date(), reply_to: replyTo, hotel_id: currentLog.hotel_id, created_by: currentLog.receptionist }]);
    if (error) throw error;
    await initializeLogState();
  },

  finishCurrentLog: async (endValues) => {
    const { currentLog, initializeLogState } = get();
    if (!currentLog) return;
    const valuesToUpdate = {
        cash_brl_end: endValues.cash_brl, envelope_brl_end: endValues.envelope_brl, cash_usd_end: endValues.cash_usd, pens_count_end: endValues.pens_count, calculator_end: endValues.calculator, phone_end: endValues.phone, car_key_end: endValues.car_key, adapter_end: endValues.adapter, umbrella_end: endValues.umbrella, highlighter_end: endValues.highlighter, cards_towels_end: endValues.cards_towels,
    };
    const { error } = await supabase.from('logs').update({ end_time: new Date(), status: 'completed', ...valuesToUpdate }).eq('id', currentLog.id);
    if (error) throw error;
    await initializeLogState();
  },

  addComment: async (logId, entryId, text) => {
    const { currentLog, initializeLogState } = get();
    if (!currentLog) return;
    const { error } = await supabase.from('log_entries').insert([{ log_id: logId, text, timestamp: new Date(), reply_to: entryId, hotel_id: currentLog.hotel_id, created_by: currentLog.receptionist }]);
    if (error) throw error;
    await initializeLogState();
  },

  updateEntryStatus: async (logId, entryId, status) => {
    const { error } = await supabase.from('log_entries').update({ status }).eq('id', entryId);
    if (error) throw error;
    await get().initializeLogState();
  },

  editLogEntry: async (logId, entryId, newText, editor) => {
    const { data: oldEntry, error: fetchError } = await supabase.from('log_entries').select('text').eq('id', entryId).single();
    if (fetchError || !oldEntry) throw fetchError || new Error("Entry not found");
    await supabase.from('edit_history').insert([{ entity_type: 'log_entry', entity_id: entryId, previous_value: { text: oldEntry.text }, edited_by: editor }]);
    const { error: updateError } = await supabase.from('log_entries').update({ text: newText, last_edited_at: new Date(), edited_by: editor }).eq('id', entryId);
    if (updateError) throw updateError;
    await get().initializeLogState();
  },

  editShiftValues: async (logId, newValues, editor) => {
    const { data: oldLog, error: fetchError } = await supabase.from('logs').select('*').eq('id', logId).single();
    if (fetchError || !oldLog) throw fetchError || new Error("Log not found");
    await supabase.from('edit_history').insert([{ entity_type: 'shift_values', entity_id: logId, previous_value: oldLog, edited_by: editor }]);
    const { error: updateError } = await supabase.from('logs').update({ ...newValues, values_last_edited_at: new Date(), values_edited_by: editor }).eq('id', logId);
    if (updateError) throw updateError;
    await get().initializeLogState();
  },

  fetchEditHistory: async (entityType, entityId) => {
    const { data, error } = await supabase.from('edit_history').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('edited_at', { ascending: false });
    if (error) throw error;
    set({ editHistory: data || [] });
  },
}));