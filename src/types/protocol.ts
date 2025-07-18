// src/types/protocol.ts
export interface Protocol {
  id: string;
  hotel_id: string;
  company_id: string;
  protocol_date: string;
  protocol_number: string;
  attendant_name: string | null;
  complaint_type: string | null;
  complaint_timestamp: string;
  resolution_timestamp: string | null;
  comment: string | null;
  created_at: string;
  company: { id: string; name: string };
}

export interface CreateProtocolData {
  company_name: string;
  protocol_date: string;
  protocol_number: string;
  attendant_name: string;
  complaint_type: string;
  complaint_timestamp: string;
  resolution_timestamp: string | null;
  comment: string;
}

export interface ProtocolsByCompany {
  company: { id: string; name: string };
  protocols: Protocol[];
}