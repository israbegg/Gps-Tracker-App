// src/components/dashboard/DeviceCard.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeToPositions } from '../../lib/positions';

export default function DeviceCard({ device }) {
  const [lastPosition, setLastPosition] = useState(null);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    // S'abonner aux mises à jour de position en temps réel
    const unsubscribe = subscribeToPositions(device.id, (position) => {
      if (position) {
        setLastPosition(position);
      }
    });

    // Mettre à jour le temps écoulé
    const interval = setInterval(() => {
      if (lastPosition) {
        const lastUpdate = new Date(lastPosition.timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - lastUpdate) / 1000);

        if (diffInSeconds < 60) {
          setTimeAgo(`il y a ${diffInSeconds} secondes`);
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60);
          setTimeAgo(`il y a ${minutes} minute${minutes > 1 ? 's' : ''}`);
        } else if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600);
          setTimeAgo(`il y a ${hours} heure${hours > 1 ? 's' : ''}`);
        } else {
          const days = Math.floor(diffInSeconds / 86400);
          setTimeAgo(`il y a ${days} jour${days > 1 ? 's' : ''}`);
        }
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [device.id, lastPosition]);

  // Déterminer le statut en ligne/hors ligne
  const isOnline = device.isOnline || (lastPosition && new Date(lastPosition.timestamp) > new Date(Date.now() - 5 * 60 * 1000));

  // Déterminer l'icône en fonction du type d'appareil
  const getDeviceIcon = () => {
    switch (device.type) {
      case 'enfant':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'personne âgée':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getDeviceIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
              <p className="text-sm text-gray-500">{device.type}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {lastPosition ? (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dernière position:</span>
                <span className="text-sm font-medium">{timeAgo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Latitude:</span>
                <span className="text-sm font-medium">{lastPosition.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Longitude:</span>
                <span className="text-sm font-medium">{lastPosition.lng.toFixed(6)}</span>
              </div>
              {lastPosition.batteryLevel !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Batterie:</span>
                  <span className="text-sm font-medium">{lastPosition.batteryLevel}%</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Aucune position disponible</p>
          )}
        </div>

        <div className="mt-6 flex space-x-2">
          <Link
            href={`/devices/${device.id}`}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white text-center text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Détails
          </Link>
          <Link
            href={`/map?device=${device.id}`}
            className="flex-1 px-4 py-2 bg-green-600 text-white text-center text-sm font-medium rounded-md hover:bg-green-700"
          >
            Carte
          </Link>
        </div>
      </div>
    </div>
  );
}
