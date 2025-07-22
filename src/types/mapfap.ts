export interface MapFapReservation {
  id: string;
  hotel_id: string;
  reservation_number: string;
  start_date: string;
  end_date: string;
  pension_type: 'MAP' | 'FAP' | 'MAP/FAP';
  guest_count: number;
  add_ons: string | null;
  repeat_add_ons: boolean;
  comment: string | null;
  created_at: string;
}

export interface MapFapChecklist {
    id: string;
    reservation_id: string;
    date: string;
    lunch_status: 'Lançado' | 'Não Consumido' | null;
    lunch_launched_count: number;
    dinner_status: 'Lançado' | 'Não Consumido' | null;
    dinner_launched_count: number;
}