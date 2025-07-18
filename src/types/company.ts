// src/types/company.ts

export interface Company {
  id: string;
  hotel_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  info: CompanyInfo[];
  contacts: CompanyContact[];
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

// Tipos para o formulário de criação/edição
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