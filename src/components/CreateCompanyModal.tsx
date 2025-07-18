import React, { useState } from 'react';
import { X, Plus, Trash2, Briefcase } from 'lucide-react';
import { useCompanies } from '../hooks/useCompanies';
import type { CreateInfoData, CreateContactData, CreateCompanyData } from '../types/company';

interface CreateCompanyModalProps {
  onClose: () => void;
  onSuccess: () => void; // NOVO: Prop para callback de sucesso
}

export default function CreateCompanyModal({ onClose, onSuccess }: CreateCompanyModalProps) {
  const { createCompany, isLoading } = useCompanies();
  const [name, setName] = useState('');
  const [infoFields, setInfoFields] = useState<CreateInfoData[]>([{ info_label: '', info_value: '' }]);
  const [contactFields, setContactFields] = useState<CreateContactData[]>([{ contact_name: '', contact_method: 'Whatsapp', contact_value: '' }]);

  const handleAddField = (type: 'info' | 'contact') => {
    if (type === 'info') {
      setInfoFields([...infoFields, { info_label: '', info_value: '' }]);
    } else {
      setContactFields([...contactFields, { contact_name: '', contact_method: 'Whatsapp', contact_value: '' }]);
    }
  };

  const handleRemoveField = (type: 'info' | 'contact', index: number) => {
    if (type === 'info' && infoFields.length > 1) {
      setInfoFields(infoFields.filter((_, i) => i !== index));
    } else if (type === 'contact' && contactFields.length > 1) {
      setContactFields(contactFields.filter((_, i) => i !== index));
    }
  };

  const handleFieldChange = (type: 'info' | 'contact', index: number, field: string, value: string) => {
    if (type === 'info') {
      const newFields = [...infoFields];
      newFields[index] = { ...newFields[index], [field]: value };
      setInfoFields(newFields);
    } else {
      const newFields = [...contactFields];
      newFields[index] = { ...newFields[index], [field]: value };
      setContactFields(newFields);
    }
  };
  
  const handleSave = async () => {
    if (!name.trim()) {
      alert('O nome da empresa é obrigatório.');
      return;
    }

    const companyData: CreateCompanyData = {
      name: name.trim(),
      info: infoFields.filter(f => f.info_label.trim() && f.info_value.trim()),
      contacts: contactFields.filter(f => f.contact_name.trim() && f.contact_value.trim()),
    };
    
    const newCompany = await createCompany(companyData);
    if (newCompany) {
      onSuccess(); // Chama a função para atualizar a lista na página
      onClose();   // Fecha o modal
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium flex items-center gap-2"><Briefcase/> Nova Empresa</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X className="h-6 w-6" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Nome da Empresa *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Ex: Enel" />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Informações</h4>
            {infoFields.map((field, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input type="text" value={field.info_label} onChange={(e) => handleFieldChange('info', index, 'info_label', e.target.value)} className="w-1/3 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Título. Ex: Nº Cliente"/>
                <input type="text" value={field.info_value} onChange={(e) => handleFieldChange('info', index, 'info_value', e.target.value)} className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Valor"/>
                {infoFields.length > 1 && <button onClick={() => handleRemoveField('info', index)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
            <button onClick={() => handleAddField('info')} className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"><Plus className="h-3 w-3 mr-1" /> Adicionar Informação</button>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Contatos</h4>
            {contactFields.map((field, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg items-center">
                <input type="text" value={field.contact_name} onChange={(e) => handleFieldChange('contact', index, 'contact_name', e.target.value)} className="col-span-4 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Nome. Ex: Deivid"/>
                <select value={field.contact_method} onChange={(e) => handleFieldChange('contact', index, 'contact_method', e.target.value)} className="col-span-3 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  <option>Whatsapp</option>
                  <option>Telefone</option>
                  <option>E-mail</option>
                </select>
                <input type="text" value={field.contact_value} onChange={(e) => handleFieldChange('contact', index, 'contact_value', e.target.value)} className="col-span-4 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Número ou e-mail"/>
                {contactFields.length > 1 && <button onClick={() => handleRemoveField('contact', index)} className="col-span-1 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
            <button onClick={() => handleAddField('contact')} className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"><Plus className="h-3 w-3 mr-1" /> Adicionar Contato</button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 text-gray-600 dark:text-gray-400">Cancelar</button>
            <button onClick={handleSave} disabled={isLoading} className="luxury-button px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
              {isLoading ? 'Salvando...' : 'Salvar Empresa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}