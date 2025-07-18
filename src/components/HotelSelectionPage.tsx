import React from 'react';
import { useLogStore } from '../store';
import { Building2, Hotel } from 'lucide-react';

export default function HotelSelectionPage() {
  const { hotels, fetchHotels, selectHotel, verifyHotelPin } = useLogStore();
  const [selectedHotelTemp, setSelectedHotelTemp] = React.useState<{ id: string; name: string; code: string } | null>(null);
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPinModal, setShowPinModal] = React.useState(false);

  React.useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleHotelSelect = (hotel: { id: string; name: string; code: string }) => {
    setSelectedHotelTemp(hotel);
    setShowPinModal(true);
    setPin('');
    setError('');
  };

  const handlePinSubmit = async () => {
    if (!selectedHotelTemp) return;
    
    const isValid = await verifyHotelPin(selectedHotelTemp, pin);
    if (isValid) {
      selectHotel(selectedHotelTemp);
      setShowPinModal(false);
      setSelectedHotelTemp(null);
      setPin('');
    } else {
      setError('PIN inválido');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Selecione um Hotel</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Para continuar, escolha um dos hotéis abaixo
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full">
        {hotels.map((hotel) => (
          <button
            key={hotel.id}
            onClick={() => handleHotelSelect(hotel)}
            className="flex flex-col items-center justify-center p-8 rounded-xl bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Hotel className="h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-medium">{hotel.name}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">{hotel.code}</span>
          </button>
        ))}
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-medium">
                {selectedHotelTemp?.name}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Digite o PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPin(value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="****"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setSelectedHotelTemp(null);
                    setPin('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={pin.length !== 4}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}