import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Hotel, History, Moon, Sun, BookOpen, Briefcase, FileText, AlertTriangle, UtensilsCrossed } from 'lucide-react';
import NewLog from './components/NewLog';
import AdminPanel from './components/AdminPanel';
import TutorialsPage from './components/TutorialsPage';
import CompaniesPage from './components/CompaniesPage';
import ProtocolsPage from './components/ProtocolsPage';
import MapFapPage from './components/MapFapPage'; // IMPORTAR NOVA PÁGINA
import HotelSelector from './components/HotelSelector';
import HotelSelectionPage from './components/HotelSelectionPage';
import { useTheme } from './hooks/useTheme';
import { useLogStore } from './store';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const { selectedHotel, hasOpenProtocols, hasPendingMapFap, checkOpenProtocols, checkPendingMapFap } = useLogStore();

  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);

  useEffect(() => {
    if (selectedHotel) {
      checkOpenProtocols();
      checkPendingMapFap();
    }
  }, [selectedHotel, checkOpenProtocols, checkPendingMapFap]);

  const navButtonClass = "flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full shadow-sm hover:shadow-md";

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-gradient-to-br ${ isDark ? 'from-gray-900 via-gray-800 to-gray-900 text-white' : 'from-blue-50 via-white to-blue-50 text-gray-900'} transition-colors duration-300`}>
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
              <div className="flex items-center space-x-2">
                <button onClick={toggleTheme} className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'} transition-colors duration-300`}>
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                {selectedHotel && <HotelSelector />}

                {selectedHotel && (
                  <Link to="/historico" className={`${navButtonClass} ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-900 hover:text-blue-700'}`}>
                    <History className="h-5 w-5" /><span>Histórico</span>
                  </Link>
                )}
                {selectedHotel && (
                  <Link to="/empresas" className={`${navButtonClass} ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-900 hover:text-blue-700'}`}>
                    <Briefcase className="h-5 w-5" /><span>Empresas</span>
                  </Link>
                )}
                {selectedHotel && (
                  <Link to="/protocolos" className={`relative ${navButtonClass} ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-900 hover:text-blue-700'}`}>
                    <FileText className="h-5 w-5" />
                    <span>Protocolos</span>
                    {hasOpenProtocols && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 items-center justify-center">
                          <AlertTriangle className="h-3 w-3 text-white" />
                        </span>
                      </span>
                    )}
                  </Link>
                )}
                {/* NOVO BOTÃO MAP/FAP */}
                {selectedHotel && (
                  <Link to="/map-fap" className={`relative ${navButtonClass} ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-900 hover:text-blue-700'}`}>
                    <UtensilsCrossed className="h-5 w-5" /><span>MAP/FAP</span>
                    {hasPendingMapFap && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 items-center justify-center">
                          <AlertTriangle className="h-3 w-3 text-white" />
                        </span>
                      </span>
                    )}
                  </Link>
                )}
                {selectedHotel && (
                  <Link to="/tutoriais" className={`${navButtonClass} ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-900 hover:text-blue-700'}`}>
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
            <Route path="/protocolos" element={selectedHotel ? <ProtocolsPage /> : <Navigate to="/" replace />} />
            {/* NOVA ROTA MAP/FAP */}
            <Route path="/map-fap" element={selectedHotel ? <MapFapPage /> : <Navigate to="/" replace />} />
            <Route path="/tutoriais" element={selectedHotel ? <TutorialsPage /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;