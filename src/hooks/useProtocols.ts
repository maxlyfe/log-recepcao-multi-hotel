import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLogStore } from '../store';
import type { Protocol, CreateProtocolData, ProtocolsByCompany } from '../types/protocol';

export function useProtocols() {
  const { selectedHotel, checkOpenProtocols } = useLogStore();
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
      
      setProtocolsByCompany(Object.values(grouped).sort((a, b) => a.company.name.localeCompare(b.company.name)));
    }
    setIsLoading(false);
  }, [selectedHotel]);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  const fetchProtocolsForCompany = useCallback(async (companyId: string) => {
    if (!selectedHotel) return [];
    const { data, error } = await supabase
      .from('protocols')
      .select('*, company:company_id(id, name)')
      .eq('hotel_id', selectedHotel.id)
      .eq('company_id', companyId)
      .order('protocol_date', { ascending: false });
    
    if (error) {
        console.error("Error fetching company protocols:", error);
        return [];
    }
    return data || [];
  }, [selectedHotel]);

  const refreshAllData = async () => {
    await fetchProtocols();
    await checkOpenProtocols();
  };

  const createProtocol = async (formData: CreateProtocolData) => {
    if (!selectedHotel) return false;
    setIsLoading(true);
    const { error } = await supabase.rpc('create_protocol_with_company', {
        p_hotel_id: selectedHotel.id,
        p_company_name: formData.company_name,
        p_protocol_date: formData.protocol_date,
        p_protocol_number: formData.protocol_number,
        p_attendant_name: formData.attendant_name || null,
        p_complaint_type: formData.complaint_type || null,
        p_complaint_timestamp: formData.complaint_timestamp,
        p_comment: formData.comment || null,
        p_resolution_timestamp: formData.resolution_timestamp || null
    });
    setIsLoading(false);
    if (error) {
        alert('Erro ao criar protocolo: ' + error.message);
        return false;
    }
    await refreshAllData();
    return true;
  };

  const updateProtocol = async (id: string, formData: CreateProtocolData) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('protocols')
      .update({
        protocol_date: formData.protocol_date,
        protocol_number: formData.protocol_number,
        attendant_name: formData.attendant_name,
        complaint_type: formData.complaint_type,
        complaint_timestamp: formData.complaint_timestamp,
        resolution_timestamp: formData.resolution_timestamp || null,
        comment: formData.comment
      })
      .eq('id', id);
    setIsLoading(false);
    if (error) {
        alert('Erro ao atualizar protocolo: ' + error.message);
        return false;
    }
    await refreshAllData();
    return true;
  };
  
  const resolveProtocol = async (id: string, resolution_timestamp: string) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('protocols')
      .update({ resolution_timestamp })
      .eq('id', id);
    setIsLoading(false);
    if (error) {
        alert('Erro ao marcar protocolo como solucionado: ' + error.message);
        return false;
    }
    await refreshAllData();
    return true;
  };

  const deleteProtocol = async (id: string) => {
    setIsLoading(true);
    const { error } = await supabase.from('protocols').delete().eq('id', id);
    setIsLoading(false);
    if (error) {
      alert('Erro ao deletar protocolo: ' + error.message);
    } else {
      await refreshAllData();
    }
  };

  return { protocolsByCompany, isLoading, fetchProtocols, fetchProtocolsForCompany, createProtocol, updateProtocol, resolveProtocol, deleteProtocol };
}