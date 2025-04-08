// src/components/map/MapComponent.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { subscribeToPositions } from '../../lib/positions';
import { getUserDevices } from '../../lib/devices';

export default function MapComponent({ deviceId, userId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(deviceId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les appareils de l'utilisateur
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const result = await getUserDevices(userId);
        if (result.success) {
          setDevices(result.devices);
          if (!selectedDevice && result.devices.length > 0) {
            setSelectedDevice(result.devices[0].id);
          }
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Erreur lors du chargement des appareils');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDevices();
    }
  }, [userId, selectedDevice]);

  // Initialiser la carte Leaflet
  useEffect(() => {
    // Vérifier si le code s'exécute côté client
    if (typeof window !== 'undefined' && !mapInstanceRef.current && mapRef.current) {
      // Importer Leaflet dynamiquement (côté client uniquement)
      import('leaflet').then((L) => {
        // Corriger les icônes Leaflet
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });

        // Créer la carte
        const map = L.map(mapRef.current).setView([48.8566, 2.3522], 13); // Paris par défaut

        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Stocker l'instance de la carte
        mapInstanceRef.current = map;
      });
    }

    // Nettoyage
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // S'abonner aux mises à jour de position pour l'appareil sélectionné
  useEffect(() => {
    if (!selectedDevice || !mapInstanceRef.current) return;

    const unsubscribe = subscribeToPositions(selectedDevice, (position) => {
      if (!position || !mapInstanceRef.current) return;

      const { lat, lng } = position;
      const map = mapInstanceRef.current;

      // Créer ou mettre à jour le marqueur
      if (!markersRef.current[selectedDevice]) {
        // Importer Leaflet dynamiquement
        import('leaflet').then((L) => {
          // Créer un nouveau marqueur
          const marker = L.marker([lat, lng]).addTo(map);
          
          // Ajouter un popup avec les informations
          const device = devices.find(d => d.id === selectedDevice);
          const deviceName = device ? device.name : 'Appareil';
          marker.bindPopup(`
            <b>${deviceName}</b><br>
            Latitude: ${lat.toFixed(6)}<br>
            Longitude: ${lng.toFixed(6)}<br>
            Dernière mise à jour: ${new Date(position.timestamp).toLocaleString()}
          `);
          
          // Stocker le marqueur
          markersRef.current[selectedDevice] = marker;
          
          // Centrer la carte sur le marqueur
          map.setView([lat, lng], 15);
        });
      } else {
        // Mettre à jour la position du marqueur existant
        markersRef.current[selectedDevice].setLatLng([lat, lng]);
        
        // Mettre à jour le popup
        const device = devices.find(d => d.id === selectedDevice);
        const deviceName = device ? device.name : 'Appareil';
        markersRef.current[selectedDevice].bindPopup(`
          <b>${deviceName}</b><br>
          Latitude: ${lat.toFixed(6)}<br>
          Longitude: ${lng.toFixed(6)}<br>
          Dernière mise à jour: ${new Date(position.timestamp).toLocaleString()}
        `);
        
        // Centrer la carte sur le marqueur
        map.setView([lat, lng], map.getZoom());
      }
    });

    // Nettoyage
    return () => {
      unsubscribe();
      // Supprimer le marqueur
      if (markersRef.current[selectedDevice] && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markersRef.current[selectedDevice]);
        delete markersRef.current[selectedDevice];
      }
    };
  }, [selectedDevice, devices, mapInstanceRef.current]);

  // Gérer le changement d'appareil sélectionné
  const handleDeviceChange = (e) => {
    setSelectedDevice(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {devices.length > 0 ? (
        <>
          <div className="p-4 border-b">
            <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionner un appareil
            </label>
            <select
              id="device-select"
              value={selectedDevice || ''}
              onChange={handleDeviceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.type})
                </option>
              ))}
            </select>
          </div>
          <div ref={mapRef} className="h-[500px] w-full"></div>
        </>
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-600">Aucun appareil disponible pour afficher la carte.</p>
        </div>
      )}
    </div>
  );
}
