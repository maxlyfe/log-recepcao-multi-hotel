import React, { useState } from 'react';
import { X, Share2, Loader2 } from 'lucide-react';
import { useLogStore } from '../store';
import { useTutorials } from '../hooks/useTutorials';
import type { Tutorial } from '../types/tutorial';

interface ShareTutorialModalProps {
  tutorial: Tutorial;
  onClose: () => void;
}

export default function ShareTutorialModal({ tutorial, onClose }: ShareTutorialModalProps) {
  const { hotels, selectedHotel } = useLogStore();
  const { shareTutorial, isLoading } = useTutorials(selectedHotel?.id || '');
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);

  const availableHotels = hotels.filter(h => h.id !== selectedHotel?.id);

  const handleToggleHotel = (hotelId: string) => {
    setSelectedHotelIds(prev =>
      prev.includes(hotelId)
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const handleShare = async () => {
    if (selectedHotelIds.length === 0) {
      alert("Selecione pelo menos um hotel para compartilhar.");
      return;
    }
    await shareTutorial(tutorial.id, selectedHotelIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-medium">Compartilhar Tutorial</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-6 space-y-4">
          <p>Compartilhando: <span className="font-bold">{tutorial.title}</span></p>
          <p className="text-sm">Selecione os hotéis que receberão o convite:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableHotels.map(hotel => (
              <label key={hotel.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedHotelIds.includes(hotel.id)}
                  onChange={() => handleToggleHotel(hotel.id)}
                  className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{hotel.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300">Cancelar</button>
          <button
            onClick={handleShare}
            disabled={isLoading || selectedHotelIds.length === 0}
            className="luxury-button px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Share2 />}
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}