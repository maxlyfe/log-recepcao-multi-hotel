import { create } from 'zustand';
import { supabase } from './lib/supabase';

export type ShiftValues = {
  cash_brl: number;
  envelope_brl: number;
  cash_usd: number;
  pens_count: number;
  calculator: number;
  phone: number;
  car_key: number;
  adapter: number;
  umbrella: number;
  highlighter: number;
  cards_towels: number;
};

export type LogEntry = {
  id: string;
  log_id: string;
  text: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  timestamp: string;
  created_by: string;
  last_edited_at?: string;
  edited_by?: string;
  hotel_id: string;
  comments?: LogEntry[];
};

export type Log = {
  id: string;
  receptionist: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed';
  created_at: string;
  entries: LogEntry[];
  startValues?: ShiftValues;
  endValues?: ShiftValues;
  hotel_id: string;
  values_last_edited_at?: string;
  values_edited_by?: string;
};

export type EditHistoryItem = {
  id: string;
  entity_type: 'log_entry' | 'shift_values';
  entity_id: string;
  previous_value: any;
  edited_at: string;
  edited_by: string;
  hotel_id: string;
};

export type LogStore = {
  hotels: { id: string; name: string; code: string }[];
  selectedHotel: { id: string; name: string; code: string } | null;
  logs: Log[];
  currentLog: Log | null;
  previousLog: Log | null;
  openEntries: LogEntry[];
  editHistory: EditHistoryItem[];
  isLoading: boolean;
  hasInitError: boolean;
  fetchHotels: () => Promise<void>;
  selectHotel: (hotel: { id: string; name: string; code: string }) => Promise<void>;
  verifyHotelPin: (hotel: { id: string; name: string; code: string }, pin: string) => Promise<boolean>;
  clearHotelSelection: () => void;
  addLog: (log: { receptionist: string; startValues: ShiftValues }) => Promise<void>;
  fetchLogs: () => Promise<void>;
  checkActiveLog: () => Promise<void>;
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
  fetchEditHistory: (entityType: 'log_entry' | 'shift_values', entityId: string) => Promise<EditHistoryItem[]>;
};

export const useLogStore = create<LogStore>()((set, get) => ({
  hotels: [],
  selectedHotel: null,
  logs: [],
  currentLog: null,
  previousLog: null,
  openEntries: [],
  editHistory: [],
  isLoading: false,
  hasInitError: false,
  fetchHotels: async () => {
    console.log('Fetching hotels...');
    const { data, error } = await supabase
      .from('hotels')
      .select('id, name, code, pin');
    if (error) {
      console.error('Error fetching hotels:', error);
      throw error;
    }
    console.log('Fetched hotels:', data);
    set({ hotels: data || [] });
  },
  selectHotel: async (hotel) => {
    console.log('Selecting hotel:', hotel);
    set({ selectedHotel: hotel, hasInitError: false });
    
    try {
      await get().initializeLogState();
    } catch (error) {
      console.error('Error initializing log state:', error);
      set({ isLoading: false, hasInitError: true });
    }
  },
  verifyHotelPin: async (hotel: { id: string; name: string; code: string }, pin: string) => {
    console.log('Verifying PIN for hotel:', hotel);
    
    if (!hotel) {
      console.error('No hotel provided');
      return false;
    }
    
    try {
      console.log('Fetching hotel data for ID:', hotel.id);
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', hotel.id)
        .single();
        
      if (error) {
        console.error('Error fetching hotel data:', error);
        return false;
      }

      if (!data) {
        console.error('No hotel data found');
        return false;
      }

      console.log('Hotel data:', data);
      
      if (!data.pin) {
        console.error('No PIN found for hotel');
        return false;
      }

      // Convert both PINs to strings and trim any whitespace
      const dbPin = String(data.pin).trim();
      const inputPin = String(pin).trim();
      
      console.log('Database PIN:', dbPin);
      console.log('Input PIN:', inputPin);
      console.log('PIN lengths - DB:', dbPin.length, 'Input:', inputPin.length);
      console.log('PIN match:', dbPin === inputPin);
      
      return dbPin === inputPin;
    } catch (error) {
      console.error('Unexpected error during PIN verification:', error);
      return false;
    }
  },
  clearHotelSelection: () => {
    set({ 
      selectedHotel: null,
      currentLog: null,
      previousLog: null,
      openEntries: [],
      logs: [],
      isLoading: false,
      hasInitError: false
    });
  },
  addLog: async (log) => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    
    const { data, error } = await supabase
      .from('logs')
      .insert({
        receptionist: log.receptionist,
        start_time: new Date().toISOString(),
        status: 'active',
        hotel_id: selectedHotel.id,
        cash_brl_start: log.startValues.cash_brl,
        envelope_brl_start: log.startValues.envelope_brl,
        cash_usd_start: log.startValues.cash_usd,
        pens_count_start: log.startValues.pens_count,
        calculator_start: log.startValues.calculator,
        phone_start: log.startValues.phone,
        car_key_start: log.startValues.car_key,
        adapter_start: log.startValues.adapter,
        umbrella_start: log.startValues.umbrella,
        highlighter_start: log.startValues.highlighter,
        cards_towels_start: log.startValues.cards_towels
      })
      .select()
      .single();
    
    if (error) {
      // Check if this is a unique constraint violation for active log
      if (error.code === '23505' && error.message?.includes('idx_single_active_log')) {
        // Refresh the current log state to sync with database
        await get().initializeLogState();
        throw new Error('Um turno já está ativo. Por favor, finalize o turno atual antes de iniciar um novo.');
      }
      throw error;
    }
    
    set({ currentLog: { ...data, entries: [], startValues: log.startValues } });
    get().fetchOpenEntries();
  },
  fetchLogs: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('hotel_id', selectedHotel.id)
      .order('start_time', { ascending: false });
    if (error) throw error;
    const logsWithEntries = await Promise.all(logs.map(async (log) => {
      // Fetch main entries (not replies)
      const { data: mainEntries, error: entriesError } = await supabase
        .from('log_entries')
        .select('*')
        .eq('log_id', log.id)
        .is('reply_to', null)
        .order('created_at', { ascending: true });
      if (entriesError) throw entriesError;
      
      // Fetch comments for each main entry
      const entriesWithComments = await Promise.all((mainEntries || []).map(async (entry) => {
        const { data: comments, error: commentsError } = await supabase
          .from('log_entries')
          .select('*')
          .eq('reply_to', entry.id)
          .order('created_at', { ascending: true });
        
        if (commentsError) {
          console.error('Error fetching comments for entry:', entry.id, commentsError);
          return { ...entry, comments: [] };
        }
        
        return { ...entry, comments: comments || [] };
      }));
      
      return {
        ...log,
        entries: entriesWithComments,
        startValues: {
          cash_brl: log.cash_brl_start,
          envelope_brl: log.envelope_brl_start,
          cash_usd: log.cash_usd_start,
          pens_count: log.pens_count_start,
          calculator: log.calculator_start,
          phone: log.phone_start,
          car_key: log.car_key_start,
          adapter: log.adapter_start,
          umbrella: log.umbrella_start,
          highlighter: log.highlighter_start,
          cards_towels: log.cards_towels_start
        },
        endValues: log.end_time ? {
          cash_brl: log.cash_brl_end,
          envelope_brl: log.envelope_brl_end,
          cash_usd: log.cash_usd_end,
          pens_count: log.pens_count_end,
          calculator: log.calculator_end,
          phone: log.phone_end,
          car_key: log.car_key_end,
          adapter: log.adapter_end,
          umbrella: log.umbrella_end,
          highlighter: log.highlighter_end,
          cards_towels: log.cards_towels_end
        } : undefined
      };
    }));
    set({ logs: logsWithEntries });
  },
  checkActiveLog: async () => {
    const { fetchCurrentLog, fetchPreviousLog } = get();
    await fetchCurrentLog();
    await fetchPreviousLog();
  },
  initializeLogState: async () => {
    set({ isLoading: true, hasInitError: false });
    try {
      const { fetchCurrentLog, fetchPreviousLog, fetchOpenEntries } = get();
      await fetchCurrentLog();
      await fetchPreviousLog();
      await fetchOpenEntries();
      set({ hasInitError: false });
    } catch (error) {
      console.error('Error during initialization:', error);
      set({ hasInitError: true });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  retryInitialization: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    
    try {
      await get().initializeLogState();
    } catch (error) {
      console.error('Error during retry initialization:', error);
    }
  },
  fetchCurrentLog: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('status', 'active')
      .eq('hotel_id', selectedHotel.id)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!data) {
      set({ currentLog: null });
      return;
    }
    
    // Fetch entries that are not replies (main entries)
    const { data: mainEntries, error: entriesError } = await supabase
      .from('log_entries')
      .select('*')
      .eq('log_id', data.id)
      .is('reply_to', null)
      .order('created_at', { ascending: true });
    if (entriesError) throw entriesError;
    
    // Fetch comments for each main entry
    const entriesWithComments = await Promise.all((mainEntries || []).map(async (entry) => {
      const { data: comments, error: commentsError } = await supabase
        .from('log_entries')
        .select('*')
        .eq('reply_to', entry.id)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error('Error fetching comments for entry:', entry.id, commentsError);
        return { ...entry, comments: [] };
      }
      
      return { ...entry, comments: comments || [] };
    }));
    
    set({
      currentLog: {
        ...data,
        entries: entriesWithComments,
        startValues: {
          cash_brl: data.cash_brl_start,
          envelope_brl: data.envelope_brl_start,
          cash_usd: data.cash_usd_start,
          pens_count: data.pens_count_start,
          calculator: data.calculator_start,
          phone: data.phone_start,
          car_key: data.car_key_start,
          adapter: data.adapter_start,
          umbrella: data.umbrella_start,
          highlighter: data.highlighter_start,
          cards_towels: data.cards_towels_start
        },
        values_last_edited_at: data.values_last_edited_at,
        values_edited_by: data.values_edited_by
      }
    });
  },
  fetchPreviousLog: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('status', 'completed')
      .eq('hotel_id', selectedHotel.id)
      .order('end_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('Error fetching previous log:', error);
      set({ previousLog: null });
      return;
    }
    if (!data) {
      set({ previousLog: null });
      return;
    }
    const { data: entries, error: entriesError } = await supabase
      .from('log_entries')
      .select('*')
      .eq('log_id', data.id)
      .order('created_at', { ascending: true });
    if (entriesError) throw entriesError;
    set({
      previousLog: {
        ...data,
        entries: entries || [],
        startValues: {
          cash_brl: data.cash_brl_start,
          envelope_brl: data.envelope_brl_start,
          cash_usd: data.cash_usd_start,
          pens_count: data.pens_count_start,
          calculator: data.calculator_start,
          phone: data.phone_start,
          car_key: data.car_key_start,
          adapter: data.adapter_start,
          umbrella: data.umbrella_start,
          highlighter: data.highlighter_start,
          cards_towels: data.cards_towels_start
        },
        endValues: {
          cash_brl: data.cash_brl_end,
          envelope_brl: data.envelope_brl_end,
          cash_usd: data.cash_usd_end,
          pens_count: data.pens_count_end,
          calculator: data.calculator_end,
          phone: data.phone_end,
          car_key: data.car_key_end,
          adapter: data.adapter_end,
          umbrella: data.umbrella_end,
          highlighter: data.highlighter_end,
          cards_towels: data.cards_towels_end
        }
      }
    });
  },
  fetchOpenEntries: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) return;
    
    console.log('Fetching open entries for hotel:', selectedHotel.id);
    
    // Fetch open entries with log information and comments joined
    const { data, error } = await supabase
      .from('log_entries')
      .select(`
        *,
        logs!log_entries_log_id_fkey!inner(
          id,
          receptionist,
          start_time,
          status
        )
      `)
      .eq('hotel_id', selectedHotel.id)
      .in('status', ['open', 'in_progress'])
      .is('reply_to', null)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching open entries:', error);
      throw error;
    }
    
    console.log('Fetched open entries:', data);
    
    // Fetch comments for each entry
    const entriesWithComments = await Promise.all((data || []).map(async (entry) => {
      const { data: comments, error: commentsError } = await supabase
        .from('log_entries')
        .select('*')
        .eq('reply_to', entry.id)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }
      
      return {
        ...entry,
        log_receptionist: entry.logs?.receptionist || 'Desconhecido',
        log_start_time: entry.logs?.start_time || entry.timestamp,
        comments: comments || []
      };
    }));
    
    set({ openEntries: entriesWithComments });
  },
  updateCurrentLog: async (text: string, replyTo?: string | null) => {
    const state = get();
    if (!state.currentLog || !state.selectedHotel) return;
    const { data, error } = await supabase
      .from('log_entries')
      .insert({
        log_id: state.currentLog.id,
        text,
        status: 'open',
        created_by: state.currentLog.receptionist,
        timestamp: new Date().toISOString(),
        reply_to: replyTo || null,
        hotel_id: state.selectedHotel.id
      })
      .select()
      .single();
    if (error) throw error;
    const updatedLog = {
      ...state.currentLog,
      entries: [...state.currentLog.entries, data]
    };
    set({
      currentLog: updatedLog,
      openEntries: [...state.openEntries, data]
    });
  },
  finishCurrentLog: async (endValues: ShiftValues) => {
    const state = get();
    if (!state.currentLog || !state.selectedHotel) return;
    
    // Finalizar o log sem alterar o status das ocorrências
    const { data, error } = await supabase
      .from('logs')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        cash_brl_end: endValues.cash_brl,
        envelope_brl_end: endValues.envelope_brl,
        cash_usd_end: endValues.cash_usd,
        pens_count_end: endValues.pens_count,
        calculator_end: endValues.calculator,
        phone_end: endValues.phone,
        car_key_end: endValues.car_key,
        adapter_end: endValues.adapter,
        umbrella_end: endValues.umbrella,
        highlighter_end: endValues.highlighter,
        cards_towels_end: endValues.cards_towels
      })
      .eq('id', state.currentLog.id)
      .eq('hotel_id', state.selectedHotel.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Atualizar o estado local sem fechar as ocorrências
    set({
      currentLog: null,
      previousLog: {
        ...data,
        entries: state.currentLog.entries,
        startValues: state.currentLog.startValues,
        endValues
      }
    });
    
    // NÃO alterar o status das ocorrências - elas devem permanecer como estão
    // para serem continuadas no próximo turno
    
    // Atualizar a lista de ocorrências abertas para refletir que não há mais turno ativo
    await get().fetchOpenEntries();
  },
  addComment: async (logId: string, entryId: string, text: string) => {
    const state = get();
    if (!state.selectedHotel) return;
    const { data, error } = await supabase
      .from('log_entries')
      .insert({
        log_id: logId,
        text,
        created_by: state.currentLog?.receptionist || 'Unknown',
        timestamp: new Date().toISOString(),
        reply_to: entryId,
        hotel_id: state.selectedHotel.id
      })
      .select()
      .single();
    if (error) throw error;
    
    // Update the current log entries if this comment belongs to the current log
    if (state.currentLog && state.currentLog.id === logId) {
      const updatedEntries = state.currentLog.entries.map(entry => {
        if (entry.id === entryId) {
          return {
            ...entry,
            comments: [...(entry.comments || []), data]
          };
        }
        return entry;
      });
      
      const updatedLog = {
        ...state.currentLog,
        entries: updatedEntries
      };
      set({ currentLog: updatedLog });
    }
    
    // Update open entries if this comment belongs to an open entry
    const updatedOpenEntries = state.openEntries.map(entry => {
        if (entry.id === entryId) {
          return {
            ...entry,
            comments: [...(entry.comments || []), data]
          };
        }
        return entry;
      });
      
      set({ openEntries: updatedOpenEntries });
  },
  updateEntryStatus: async (logId: string, entryId: string, status: 'open' | 'in_progress' | 'closed') => {
    const state = get();
    if (!state.selectedHotel) return;
    const { data, error } = await supabase
      .from('log_entries')
      .update({
        status,
        last_edited_at: new Date().toISOString(),
        edited_by: state.currentLog?.receptionist || 'Unknown'
      })
      .eq('id', entryId)
      .select()
      .single();
    if (error) throw error;
    const updatedLogs = state.logs.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          entries: log.entries.map(entry =>
            entry.id === entryId ? { ...entry, ...data } : entry
          )
        };
      }
      return log;
    });
    const updatedCurrentLog = state.currentLog && state.currentLog.id === logId
      ? {
          ...state.currentLog,
          entries: state.currentLog.entries.map(entry =>
            entry.id === entryId ? { ...entry, ...data } : entry
          )
        }
      : state.currentLog;
    const updatedOpenEntries = status === 'closed'
      ? state.openEntries.filter(entry => entry.id !== entryId)
      : state.openEntries.map(entry =>
          entry.id === entryId ? { ...entry, ...data } : entry
        );
    set({
      logs: updatedLogs,
      currentLog: updatedCurrentLog,
      openEntries: updatedOpenEntries
    });
  },
  editLogEntry: async (logId: string, entryId: string, newText: string, editor: string) => {
    const state = get();
    if (!state.selectedHotel) return;
    const { data: currentEntry } = await supabase
      .from('log_entries')
      .select('*')
      .eq('id', entryId)
      .single();
    if (!currentEntry) return;
    const { data: updatedEntry, error } = await supabase
      .from('log_entries')
      .update({
        text: newText,
        last_edited_at: new Date().toISOString(),
        edited_by: editor
      })
      .eq('id', entryId)
      .select()
      .single();
    if (error) throw error;
    const updatedLogs = state.logs.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          entries: log.entries.map(entry =>
            entry.id === entryId ? { ...entry, ...updatedEntry } : entry
          )
        };
      }
      return log;
    });
    const updatedCurrentLog = state.currentLog && state.currentLog.id === logId
      ? {
          ...state.currentLog,
          entries: state.currentLog.entries.map(entry =>
            entry.id === entryId ? { ...entry, ...updatedEntry } : entry
          )
        }
      : state.currentLog;
    set({ logs: updatedLogs, currentLog: updatedCurrentLog });
  },
  editShiftValues: async (logId: string, newValues: ShiftValues, editor: string) => {
    const state = get();
    if (!state.selectedHotel) return;
    const { data: updatedLog, error } = await supabase
      .from('logs')
      .update({
        cash_brl_start: newValues.cash_brl,
        envelope_brl_start: newValues.envelope_brl,
        cash_usd_start: newValues.cash_usd,
        pens_count_start: newValues.pens_count,
        calculator_start: newValues.calculator,
        phone_start: newValues.phone,
        car_key_start: newValues.car_key,
        adapter_start: newValues.adapter,
        umbrella_start: newValues.umbrella,
        highlighter_start: newValues.highlighter,
        cards_towels_start: newValues.cards_towels,
        values_last_edited_at: new Date().toISOString(),
        values_edited_by: editor
      })
      .eq('id', logId)
      .eq('hotel_id', state.selectedHotel.id)
      .select()
      .single();
    if (error) throw error;
    const updatedLogs = state.logs.map(log =>
      log.id === logId ? { ...log, startValues: newValues } : log
    );
    const updatedCurrentLog = state.currentLog && state.currentLog.id === logId
      ? { ...state.currentLog, startValues: newValues }
      : state.currentLog;
    set({ logs: updatedLogs, currentLog: updatedCurrentLog });
  },
  fetchEditHistory: async (entityType: 'log_entry' | 'shift_values', entityId: string) => {
    const state = get();
    if (!state.selectedHotel) return [];
    // For now, return empty array since edit_history table might not exist
    set({ editHistory: [] });
    return [];
  }
}), {
  name: 'hotel-log-storage',
  partialize: (state) => ({ selectedHotel: state.selectedHotel }),
});