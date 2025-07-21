import { create } from 'zustand';
import { supabase } from './lib/supabase';
import type { Log, LogEntry, ShiftValues, Hotel, EditHistoryItem } from './types';

export type LogStore = {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  logs: Log[];
  currentLog: Log | null;
  previousLog: Log | null;
  openEntries: LogEntry[];
  editHistory: EditHistoryItem[];
  isLoading: boolean;
  hasInitError: boolean;
  hasOpenProtocols: boolean;
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
};

export const useLogStore = create<LogStore>((set, get) => ({
  hotels: [],
  selectedHotel: null,
  logs: [],
  currentLog: null,
  previousLog: null,
  openEntries: [],
  editHistory: [],
  isLoading: false,
  hasInitError: false,
  hasOpenProtocols: false,

  fetchHotels: async () => {
    const { data, error } = await supabase.from('hotels').select('*');
    if (error) console.error('Error fetching hotels:', error);
    else set({ hotels: data || [] });
  },

  selectHotel: async (hotel) => {
    set({ selectedHotel: hotel, hasInitError: false });
    try {
      await get().initializeLogState();
    } catch (error) {
      console.error('Error initializing log state:', error);
      set({ isLoading: false, hasInitError: true });
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
      const { fetchCurrentLog, fetchPreviousLog, fetchOpenEntries, checkOpenProtocols } = get();
      // Executa todas as buscas iniciais em paralelo
      await Promise.all([
        fetchCurrentLog(),
        fetchPreviousLog(),
        fetchOpenEntries(),
        checkOpenProtocols() // Adiciona a verificação de protocolos aqui
      ]);
      set({ hasInitError: false });
    } catch (error) {
      console.error('Error during initialization:', error);
      set({ hasInitError: true });
    } finally {
      set({ isLoading: false });
    }
  },

  checkOpenProtocols: async () => {
    const { selectedHotel } = get();
    if (!selectedHotel) {
      set({ hasOpenProtocols: false });
      return;
    }

    const { count, error } = await supabase
      .from('protocols')
      .select('*', { count: 'exact', head: true })
      .eq('hotel_id', selectedHotel.id)
      .is('resolution_timestamp', null);

    if (error) {
      console.error("Error checking open protocols:", error);
      set({ hasOpenProtocols: false });
      return;
    }
    
    set({ hasOpenProtocols: (count || 0) > 0 });
  },
  
  addLog: async (log) => {
    // ... (incluir a implementação completa da sua função addLog)
  },
  fetchLogs: async () => {
    // ... (incluir a implementação completa da sua função fetchLogs)
  },
  retryInitialization: async () => {
    // ... (incluir a implementação completa da sua função retryInitialization)
  },
  fetchCurrentLog: async () => {
    // ... (incluir a implementação completa da sua função fetchCurrentLog)
  },
  fetchPreviousLog: async () => {
    // ... (incluir a implementação completa da sua função fetchPreviousLog)
  },
  fetchOpenEntries: async () => {
    // ... (incluir a implementação completa da sua função fetchOpenEntries)
  },
  updateCurrentLog: async (text, replyTo) => {
    // ... (incluir a implementação completa da sua função updateCurrentLog)
  },
  finishCurrentLog: async (endValues) => {
    // ... (incluir a implementação completa da sua função finishCurrentLog)
  },
  addComment: async (logId, entryId, text) => {
    // ... (incluir a implementação completa da sua função addComment)
  },
  updateEntryStatus: async (logId, entryId, status) => {
    // ... (incluir a implementação completa da sua função updateEntryStatus)
  },
  editLogEntry: async (logId, entryId, newText, editor) => {
    // ... (incluir a implementação completa da sua função editLogEntry)
  },
  editShiftValues: async (logId, newValues, editor) => {
    // ... (incluir a implementação completa da sua função editShiftValues)
  },
  fetchEditHistory: async (entityType, entityId) => {
    // ... (incluir a implementação completa da sua função fetchEditHistory)
  },
}));