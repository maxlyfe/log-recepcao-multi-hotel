import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Hotel, History, Moon, Sun, BookOpen, Briefcase, FileText } from 'lucide-react';
import NewLog from './components/NewLog';
import AdminPanel from './components/AdminPanel';
import TutorialsPage from './components/TutorialsPage';
import CompaniesPage from './components/CompaniesPage';
import ProtocolsPage from './components/ProtocolsPage'; // Importar nova página
import HotelSelector from './components/HotelSelector';
import HotelSelectionPage from './components/HotelSelectionPage';
import { useTheme } from './hooks/useTheme';
import { useLogStore } from './store';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const { selectedHotel } = useLogStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-gradient-to-br ${
        isDark 
          ? 'from-gray-900 via-gray-800 to-gray-900 text-white'
          : 'from-blue-50 via-white to-blue-50 text-gray-900'
      } transition-colors duration-300`}>
        <header className={`glass-effect ${isDark ? 'dark' : 'light'} shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-all duration-300 group">
                <Hotel className={`h-10 w-10 ${isDark ? 'text-blue-400' : 'text-blue-600'} transition-transform duration-300 group-hover:rotate-12`} />
                <div>
                  <h1 className="text-3xl font-serif">{selectedHotel?.name || 'Sistema de Log'}</h1>
                  <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'} font-light`}>Sistema de Registro - Recepção</p>
                </div>
              </Link>
              <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'} transition-colors duration-300`}>
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                {selectedHotel && <HotelSelector />}

                {selectedHotel && (
                  <Link to="/historico" className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300 glass-effect dark' : 'text-blue-900 hover:text-blue-700 glass-effect light'} transition-colors duration-300 rounded-full shadow-sm hover:shadow-md`}>
                    <History className="h-5 w-5" /><span>Histórico de Log</span>
                  </Link>
                )}
                {selectedHotel && (
                  <Link to="/empresas" className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300 glass-effect dark' : 'text-blue-900 hover:text-blue-700 glass-effect light'} transition-colors duration-300 rounded-full shadow-sm hover:shadow-md`}>
                    <Briefcase className="h-5 w-5" /><span>Empresas</span>
                  </Link>
                )}
                 {/* NOVO BOTÃO PROTOCOLOS */}
                {selectedHotel && (
                  <Link to="/protocolos" className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300 glass-effect dark' : 'text-blue-900 hover:text-blue-700 glass-effect light'} transition-colors duration-300 rounded-full shadow-sm hover:shadow-md`}>
                    <FileText className="h-5 w-5" /><span>Protocolos</span>
                  </Link>
                )}
                {selectedHotel && (
                  <Link to="/tutoriais" className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300 glass-effect dark' : 'text-blue-900 hover:text-blue-700 glass-effect light'} transition-colors duration-300 rounded-full shadow-sm hover:shadow-md`}>
                    <BookOpen className="h-5 w-5" /><span>Tutoriais</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Routes>
            <Route path="/" element={selectedHotel ? <NewLog /> : <HotelSelectionPage />} />
            <Route path="/historico" element={selectedHotel ? <AdminPanel /> : <Navigate to="/" replace />} />
            <Route path="/empresas" element={selectedHotel ? <CompaniesPage /> : <Navigate to="/" replace />} />
            {/* NOVA ROTA PROTOCOLOS */}
            <Route path="/protocolos" element={selectedHotel ? <ProtocolsPage /> : <Navigate to="/" replace />} />
            <Route path="/tutoriais" element={selectedHotel ? <TutorialsPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;