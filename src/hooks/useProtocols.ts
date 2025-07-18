import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLogStore } from '../store';
import type { Protocol, CreateProtocolData, ProtocolsByCompany } from '../types/protocol';

export function useProtocols() {
  const { selectedHotel } = useLogStore();
  const [protocolsByCompany, setProtocolsByCompany] = useState<ProtocolsByCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProtocols = useCallback(async () => {
    if (!selectedHotel) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('protocols')
      .select('*, company:company_id(id, name)')
      .eq('hotel_id', selectedHotel.id)
      .order('protocol_date', { ascending: false });
    
    if (error) {
      console.error("Error fetching protocols:", error);
      setProtocolsByCompany([]);
    } else {
      const grouped = (data || []).reduce((acc, protocol) => {
        const companyName = protocol.company.name;
        if (!acc[companyName]) {
          acc[companyName] = { company: protocol.company, protocols: [] };
        }
        acc[companyName].protocols.push(protocol);
        return acc;
      }, {} as { [key: string]: ProtocolsByCompany });
      
      setProtocolsByCompany(Object.values(grouped));
    }
    setIsLoading(false);
  }, [selectedHotel]);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  // NOVA FUNÇÃO para buscar o histórico completo de uma empresa
  const fetchProtocolsForCompany = async (companyId: string) => {
    if (!selectedHotel) return [];
    setIsLoading(true);
    const { data, error } = await supabase
      .from('protocols')
      .select('*, company:company_id(id, name)')
      .eq('hotel_id', selectedHotel.id)
      .eq('company_id', companyId)
      .order('protocol_date', { ascending: false });
    setIsLoading(false);
    if (error) {
        console.error("Error fetching company protocols:", error);
        return [];
    }
    return data || [];
  };

  const createProtocol = async (formData: CreateProtocolData) => { /* ... código existente ... */ };
  const updateProtocol = async (id: string, formData: CreateProtocolData) => { /* ... código existente ... */ };
  const resolveProtocol = async (id: string, resolution_timestamp: string) => { /* ... código existente ... */ };
  const deleteProtocol = async (id: string) => { /* ... código existente ... */ };

  return { protocolsByCompany, isLoading, fetchProtocols, fetchProtocolsForCompany, createProtocol, updateProtocol, resolveProtocol, deleteProtocol };
}