export interface LogEntry {
  id: string;
  text: string;
  timestamp: string;
  reply_to?: string;
  comments?: LogEntry[];
  comment_count?: number;
  status: 'open' | 'in_progress' | 'closed';
  last_edited_at?: string;
  edited_by?: string;
}

export interface EditHistory {
  id: string;
  entity_type: 'log_entry' | 'shift_values';
  entity_id: string;
  previous_value: any;
  edited_at: string;
  edited_by: string;
}

export interface ShiftValues {
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
}

export interface LogSheet {
  id: string;
  receptionist: string;
  entries: LogEntry[];
  startTime: string;
  endTime: string | null;
  status: 'active' | 'completed';
  startValues?: ShiftValues;
  endValues?: ShiftValues;
  values_last_edited_at?: string;
  values_edited_by?: string;
  hotel_id: string;
}

export interface Hotel {
  id: string;
  name: string;
  code: string;
}

export interface HotelSelection {
  id: string;
  name: string;
  code: string;
  pin?: string;
}