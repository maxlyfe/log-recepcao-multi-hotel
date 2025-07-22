export interface MapFapReservation {
  id: string;
  hotel_id: string;
  reservation_number: string;
  start_date: string;
  end_date: string;
  pension_type: 'MAP' | 'FAP';
  uh_number: string | null;
  guest_names: string[];
  add_ons: string | null;
  repeat_add_ons: boolean;
  comment: string | null;
  created_at: string;
}

export interface MapFapChecklist {
    id: string;
    reservation_id: string;
    date: string;
    lunch_checks: boolean[] | null; // Armazena o status de cada hóspede
    dinner_checks: boolean[] | null; // Armazena o status de cada hóspede
}