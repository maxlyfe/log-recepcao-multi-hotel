import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import type { TutorialShare } from '../types/tutorial';

interface PendingSharesNotificationProps {
  shares: TutorialShare[];
  onAccept: (shareId: string) => void;
  onReject: (shareId: string) => void;
}

export default function PendingSharesNotification({ shares, onAccept, onReject }: PendingSharesNotificationProps) {
  if (!shares || shares.length === 0) return null;

  return (
    <div className="glass-effect p-6 rounded-xl mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center mb-4">
        <Bell className="h-6 w-6 text-blue-500 mr-3" />
        <h3 className="text-xl font-medium text-blue-900 dark:text-blue-200">Tutoriais Compartilhados com Você</h3>
      </div>
      <div className="space-y-3">
        {shares.map(share => (
          <div key={share.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-medium">"{share.tutorial.title}"</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enviado por: {share.source_hotel.name}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onAccept(share.id)} className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200"><Check /></button>
              <button onClick={() => onReject(share.id)} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200"><X /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}