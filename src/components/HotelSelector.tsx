import React, { useState, useEffect } from 'react';
import { useLogStore } from '../store';
import { Building2, Hotel, Lock } from 'lucide-react';

export default function HotelSelector() {
  const { hotels, selectedHotel, fetchHotels, selectHotel, verifyHotelPin, clearHotelSelection } = useLogStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedHotelTemp, setSelectedHotelTemp] = useState<{ id: string; name: string; code: string } | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
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
    <>
      {selectedHotel && (
        <div className="relative group">
          <button
            onClick={() => clearHotelSelection()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Hotel className="h-5 w-5" />
            <span>{selectedHotel.code}</span>
          </button>
          <div className="absolute hidden group-hover:block right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <button
              onClick={() => clearHotelSelection()}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Trocar de Hotel
            </button>
          </div>
        </div>
      )}

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
                  <Lock className="h-4 w-4 inline mr-2" />
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

      {!selectedHotel && !showPinModal && (
        <div className="flex items-center space-x-2">
          {hotels.map((hotel) => (
            <button
              key={hotel.id}
              onClick={() => handleHotelSelect(hotel)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Hotel className="h-4 w-4 text-blue-400" />
              <span className="text-white font-medium">{hotel.code}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}