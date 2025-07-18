import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLogStore } from '../store';
import type { Company, CreateCompanyData, UpdateCompanyData } from '../types/company';

export function useCompanies() {
  const { selectedHotel } = useLogStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    if (!selectedHotel) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          company_info (*),
          company_contacts (*)
        `)
        .eq('hotel_id', selectedHotel.id)
        .order('name', { ascending: true });

      if (companiesError) throw companiesError;
      setCompanies(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar empresas';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHotel]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  
  const createCompany = async (data: CreateCompanyData) => {
    if (!selectedHotel) return null;
    const { data: newCompany, error } = await supabase.rpc('create_company_with_details', {
      p_hotel_id: selectedHotel.id,
      p_name: data.name,
      p_info: data.info,
      p_contacts: data.contacts
    });
    if (error) throw error;
    await fetchCompanies();
    return newCompany;
  };

  const updateCompany = async (companyId: string, data: UpdateCompanyData) => {
    if (!selectedHotel) return null;
    const { error } = await supabase.rpc('update_company_with_details', {
        p_company_id: companyId,
        p_name: data.name,
        p_info: data.info,
        p_contacts: data.contacts
    });
    if (error) throw error;
    // CORREÇÃO: Faltava chamar o fetchCompanies aqui
    await fetchCompanies();
    return true;
  };

  const deleteCompany = async (companyId: string) => {
    const { error } = await supabase.from('companies').delete().eq('id', companyId);
    if (error) throw error;
    await fetchCompanies();
    return true;
  };

  return { companies, isLoading, error, fetchCompanies, createCompany, updateCompany, deleteCompany };
}