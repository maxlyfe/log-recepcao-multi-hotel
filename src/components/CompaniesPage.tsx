import React, { useState, useMemo } from 'react';
import { Briefcase, Plus, Loader2, Trash2, Edit, ChevronDown, Phone, Mail, MessageSquare, Search } from 'lucide-react';
import { useCompanies } from '../hooks/useCompanies';
import CreateCompanyModal from './CreateCompanyModal';
import EditCompanyModal from './EditCompanyModal';
import type { Company } from '../types/company';

export default function CompaniesPage() {
  // CORREÇÃO: Pegar a função fetchCompanies do hook
  const { companies, isLoading, deleteCompany, fetchCompanies } = useCompanies();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = useMemo(() => {
    if (!searchTerm) {
      return companies;
    }
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const handleDelete = async (companyId: string, companyName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a empresa "${companyName}"? Todos os seus dados serão perdidos.`)) {
      await deleteCompany(companyId);
      // A atualização já é chamada dentro do hook
    }
  };

  const getContactIcon = (method: string) => {
    switch(method.toLowerCase()) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'telefone': return <Phone className="h-4 w-4 text-blue-500" />;
      case 'e-mail': return <Mail className="h-4 w-4 text-red-500" />;
      default: return <Phone className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center gap-3"><Briefcase className="h-8 w-8 text-blue-600" />Empresas e Contatos</h2>
        <button onClick={() => setShowCreateModal(true)} className="luxury-button px-6 py-3 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg flex items-center gap-2"><Plus className="h-5 w-5" />Nova Empresa</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar empresa pelo nome..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
        />
      </div>

      {isLoading && companies.length === 0 ? (
        <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center p-8 glass-effect rounded-xl">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium">{searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}</h3>
          <p className="text-gray-500 mt-2">{searchTerm ? 'Tente um termo de busca diferente.' : 'Clique em "Nova Empresa" para começar.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map(company => (
            <details key={company.id} className="group glass-effect rounded-2xl shadow-lg transition-all duration-300 open:ring-2 open:ring-blue-500">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="text-xl font-medium">{company.name}</h3>
                <div className="flex items-center gap-4">
                  <button onClick={(e) => { e.preventDefault(); setEditingCompany(company); }} className="text-gray-400 hover:text-blue-500 transition-colors"><Edit className="h-5 w-5"/></button>
                  <button onClick={(e) => { e.preventDefault(); handleDelete(company.id, company.name) }} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-5 w-5"/></button>
                  <ChevronDown className="h-6 w-6 text-blue-500 transition-transform duration-300 group-open:rotate-180" />
                </div>
              </summary>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                {company.company_info.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-3 text-lg">Informações</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {company.company_info.map(info => (
                            <div key={info.id} className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{info.info_label}:</span>
                                <span className="font-medium text-right">{info.info_value}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
                {company.company_contacts.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-3 text-lg">Contatos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {company.company_contacts.map(contact => (
                            <div key={contact.id} className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                {getContactIcon(contact.contact_method)}
                                <span>{contact.contact_name}:</span>
                                </div>
                                <span className="font-medium">{contact.contact_value}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      {/* CORREÇÃO: Passando a função fetchCompanies para os modais */}
      {showCreateModal && <CreateCompanyModal onClose={() => setShowCreateModal(false)} onSuccess={fetchCompanies} />}
      {editingCompany && <EditCompanyModal company={editingCompany} onClose={() => setEditingCompany(null)} onSuccess={fetchCompanies} />}
    </div>
  );
}