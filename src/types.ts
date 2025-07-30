// types.ts

export interface LogEntry {
  id: string;
  log_id: string; // Adicionado para referência
  text: string;
  timestamp: string;
  reply_to?: string;
  comments?: LogEntry[];
  comment_count?: number;
  status: 'open' | 'in_progress' | 'closed';
  last_edited_at?: string;
  edited_by?: string;
  // Adicionado para ocorrências de turnos anteriores
  fromPreviousLog?: boolean;
  log_receptionist?: string;
  log_start_time?: string;
}

// Este tipo agora será usado apenas para o histórico de ocorrências
export interface EditHistoryItem {
  id: string;
  entity_type: 'log_entry' | 'shift_values';
  entity_id: string;
  previous_value: any; // Mantido como 'any' para o histórico antigo
  edited_at: string;
  edited_by: string;
}

// NOVO TIPO para o histórico de valores
export interface ShiftValuesHistoryItem {
    id: string;
    log_id: string;
    edited_at: string;
    edited_by: string;
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

export interface Log {
  id: string;
  receptionist: string;
  start_time: string;
  end_time: string | null;
  status: 'active' | 'completed';
  hotel_id: string;
  entries: LogEntry[];
  startValues?: ShiftValues;
  endValues?: ShiftValues;
  values_last_edited_at?: string;
  values_edited_by?: string;
}


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
  cash_brl: number; // Fundo de Caixa
  envelope_brl: number; // Caixa do Dia
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

export interface Company {
    id: string;
    hotel_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    company_info: CompanyInfo[];
    company_contacts: CompanyContact[];
}
  
export interface CompanyInfo {
    id: string;
    company_id: string;
    info_label: string;
    info_value: string;
    order_index: number;
}

export interface CompanyContact {
    id: string;
    company_id: string;
    contact_name: string;
    contact_method: string;
    contact_value: string;
    order_index: number;
}

export interface CreateInfoData {
    info_label: string;
    info_value: string;
}
  
export interface CreateContactData {
    contact_name: string;
    contact_method: string;
    contact_value: string;
}
  
export interface CreateCompanyData {
    name: string;
    info: CreateInfoData[];
    contacts: CreateContactData[];
}

export interface UpdateCompanyData extends CreateCompanyData {}

export interface Tutorial {
  id: string;
  title: string;
  description?: string;
  hotel_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  steps?: TutorialStep[];
}

export interface TutorialStep {
  id: string;
  tutorial_id: string;
  step_number: number;
  title: string;
  content: string;
  image_url?: string;
  question?: string;
  created_at: string;
  options?: TutorialStepOption[];
}

export interface TutorialStepOption {
  id: string;
  step_id: string;
  option_text: string;
  next_step_id?: string;
  order_index: number;
}

export interface CreateTutorialData {
  title: string;
  description?: string;
  steps: CreateStepData[];
}

export interface CreateStepData {
  title: string;
  content: string;
  image_url?: string;
  question?: string;
  options?: CreateOptionData[];
}

export interface CreateOptionData {
  option_text: string;
  next_step_number?: number;
}
export interface TutorialShare {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  source_hotel: { name: string };
  tutorial: { title: string };
}