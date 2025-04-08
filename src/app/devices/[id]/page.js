'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthChange } from '../../../lib/auth';
import GeofenceManager from '../../../components/map/GeofenceManager';
import { getUserDevices, deleteDevice } from '../../../lib/devices';
import { exportPositionsAsCSV, exportPositionsAsJSON } from '../../../lib/positions';

export default function DeviceDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id;

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

  // Charger les détails de l'appareil
  useEffect(() => {
    const fetchDevice = async () => {
      if (!user || !deviceId) return;
      
      try {
        const result = await getUserDevices(user.uid);
        if (result.success) {
          const foundDevice = result.devices.find(d => d.id === deviceId);
          if (foundDevice) {
            setDevice(foundDevice);
          } else {
            // Appareil non trouvé ou n'appartenant pas à l'utilisateur
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'appareil:', error);
      }
    };

    fetchDevice();
  }, [user, deviceId, router]);

  const handleDeleteDevice = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet appareil ? Cette action est irréversible.')) {
      return;
    }

    try {
      const result = await deleteDevice(deviceId);
      if (result.success) {
        router.push('/dashboard');
      } else {
        alert('Erreur lors de la suppression de l\'appareil: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'appareil:', error);
      alert('Une erreur est survenue lors de la suppression de l\'appareil.');
    }
  };

  const handleExportData = async (format) => {
    setExportLoading(true);
    try {
      let result;
      if (format === 'csv') {
        result = await exportPositionsAsCSV(deviceId);
      } else {
        result = await exportPositionsAsJSON(deviceId);
      }

      if (result.success) {
        // Créer un blob et un lien de téléchargement
        const blob = new Blob([result.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `positions_${deviceId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Erreur lors de l\'export des données: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      alert('Une erreur est survenue lors de l\'export des données.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading || !device) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{device.name}</h1>
        <p className="text-gray-600">Gérez les paramètres et visualisez les données de votre appareil</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{device.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Statut:</span>
                <span className={`ml-2 font-medium ${device.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {device.isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Dernière activité:</span>
                <span className="ml-2 font-medium">
                  {new Date(device.lastActive).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Créé le:</span>
                <span className="ml-2 font-medium">
                  {new Date(device.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/map?device=${deviceId}`)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Voir sur la carte
              </button>
              <button
                onClick={() => router.push(`/history?device=${deviceId}`)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Voir l'historique
              </button>
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Exporter les données</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExportData('csv')}
                    disabled={exportLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportData('json')}
                    disabled={exportLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    JSON
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={handleDeleteDevice}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Supprimer l'appareil
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <GeofenceManager deviceId={deviceId} />
        </div>
      </div>
    </div>
  );
}
