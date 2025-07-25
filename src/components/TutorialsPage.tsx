import React, { useState } from 'react';
import { Search, Plus, BookOpen, Edit, Trash2, Eye, Share2 } from 'lucide-react';
import { useLogStore } from '../store';
import { useTutorials } from '../hooks/useTutorials';
import CreateTutorialModal from './CreateTutorialModal';
import TutorialViewer from './TutorialViewer';
import ShareTutorialModal from './ShareTutorialModal';
import PendingSharesNotification from './PendingSharesNotification';
import type { Tutorial } from '../types/tutorial';

export default function TutorialsPage() {
  const { selectedHotel } = useLogStore();
  const { tutorials, pendingShares, isLoading, deleteTutorial, acceptShare, rejectShare } = useTutorials(selectedHotel?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [viewingTutorial, setViewingTutorial] = useState<string | null>(null);
  const [sharingTutorial, setSharingTutorial] = useState<Tutorial | null>(null);

  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tutorial.description && tutorial.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (tutorial: Tutorial) => {
    if (window.confirm(`Tem certeza que deseja excluir o tutorial "${tutorial.title}"?`)) {
      await deleteTutorial(tutorial.id);
    }
  };

  const handleEditTutorial = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTutorial(null);
  };

  if (viewingTutorial) {
    return <TutorialViewer tutorialId={viewingTutorial} onClose={() => setViewingTutorial(null)} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          Tutoriais - {selectedHotel?.name}
        </h2>
        <button onClick={() => { setEditingTutorial(null); setShowCreateModal(true); }} className="luxury-button px-6 py-3 rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Novo Tutorial
        </button>
      </div>
      
      <PendingSharesNotification shares={pendingShares} onAccept={acceptShare} onReject={rejectShare} />

      <div className="glass-effect p-6 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar tutoriais..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"/>
        </div>
      </div>

      <div className="glass-effect rounded-2xl shadow-xl">
        {isLoading ? ( <div className="p-8 text-center">Carregando...</div> ) : filteredTutorials.length === 0 ? ( <div className="p-8 text-center">Nenhum tutorial encontrado.</div> ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTutorials.map((tutorial) => (
              <div key={tutorial.id} className="p-6 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{tutorial.title}</h3>
                    {tutorial.description && (<p className="text-gray-600 dark:text-gray-400 mb-3">{tutorial.description}</p>)}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>Criado por {tutorial.created_by}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(tutorial.created_at).toLocaleDateString('pt-BR')}</span>
                        {tutorial.shared_from_id && <span className="ml-2 text-xs">(Copiado)</span>}
                    </div>
                  </div>
                  {/* --- CORREÇÃO APLICADA AQUI --- */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => setViewingTutorial(tutorial.id)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Visualizar">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleEditTutorial(tutorial)} className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300 transition-colors" title="Editar">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => setSharingTutorial(tutorial)} className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors" title="Compartilhar">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(tutorial)} className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Excluir">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showCreateModal || editingTutorial) && <CreateTutorialModal tutorial={editingTutorial} onClose={handleCloseModal} />}
      {sharingTutorial && <ShareTutorialModal tutorial={sharingTutorial} onClose={() => setSharingTutorial(null)} />}
    </div>
  );
}