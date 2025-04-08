'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '../../lib/auth';
import HistoryMap from '../../components/map/HistoryMap';
import { getUserDevices } from '../../lib/devices';

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
      
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      if (!authUser) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Charger les appareils de l'utilisateur
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        const result = await getUserDevices(user.uid);
        if (result.success) {
          setDevices(result.devices);
          if (result.devices.length > 0 && !selectedDevice) {
            setSelectedDevice(result.devices[0].id);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des appareils:', error);
      }
    };

    fetchDevices();
  }, [user, selectedDevice]);

  const handleDeviceChange = (e) => {
    setSelectedDevice(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher
  if (!user) {
    return null; // Le useEffect va rediriger vers la page de connexion
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Historique des positions</h1>
        <p className="text-gray-600">Consultez l'historique des déplacements de vos appareils</p>
      </div>

      {devices.length > 0 ? (
        <div className="mb-6">
          <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 mb-1">
            Sélectionner un appareil
          </label>
          <select
            id="device-select"
            value={selectedDevice || ''}
            onChange={handleDeviceChange}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.type})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Vous n'avez pas encore d'appareils. Ajoutez-en un pour consulter l'historique.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedDevice && (
        <div className="mb-8">
          <HistoryMap deviceId={selectedDevice} />
        </div>
      )}
    </div>
  );
}
