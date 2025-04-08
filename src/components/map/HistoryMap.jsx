// src/components/map/HistoryMap.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getDevicePositions } from '../../lib/positions';

export default function HistoryMap({ deviceId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hier
    end: new Date().toISOString().split('T')[0] // Aujourd'hui
  });

  // Charger l'historique des positions
  useEffect(() => {
    const fetchPositions = async () => {
      if (!deviceId) return;
      
      setLoading(true);
      try {
        const result = await getDevicePositions(deviceId, 1000);
        if (result.success) {
          // Filtrer les positions par date si nécessaire
          const filteredPositions = result.positions.filter(pos => {
            const posDate = new Date(pos.timestamp).toISOString().split('T')[0];
            return posDate >= dateRange.start && posDate <= dateRange.end;
          });
          
          setPositions(filteredPositions);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Erreur lors du chargement des positions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [deviceId, dateRange]);

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

  // Afficher les positions sur la carte
  useEffect(() => {
    if (!positions.length || !mapInstanceRef.current) return;

    // Importer Leaflet dynamiquement
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      
      // Nettoyer les couches existantes
      map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
      
      // Créer un tableau de points pour la polyline
      const points = positions.map(pos => [pos.lat, pos.lng]);
      
      // Créer la polyline
      const polyline = L.polyline(points, { color: 'blue', weight: 3 }).addTo(map);
      
      // Ajouter des marqueurs pour chaque position
      positions.forEach((pos, index) => {
        const isFirst = index === 0;
        const isLast = index === positions.length - 1;
        
        // Utiliser des icônes différentes pour le premier et le dernier point
        let markerIcon;
        if (isFirst) {
          markerIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        } else if (isLast) {
          markerIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        }
        
        // Créer le marqueur
        const marker = L.marker([pos.lat, pos.lng], { icon: markerIcon }).addTo(map);
        
        // Ajouter un popup avec les informations
        marker.bindPopup(`
          <b>${isFirst ? 'Départ' : isLast ? 'Arrivée' : 'Point intermédiaire'}</b><br>
          Latitude: ${pos.lat.toFixed(6)}<br>
          Longitude: ${pos.lng.toFixed(6)}<br>
          Date: ${new Date(pos.timestamp).toLocaleString()}
        `);
      });
      
      // Ajuster la vue pour voir tous les points
      if (points.length > 0) {
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    });
  }, [positions, mapInstanceRef.current]);

  // Gérer le changement de date
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !mapInstanceRef.current) {
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
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Historique des positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              id="start"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              id="end"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {positions.length} positions trouvées dans la période sélectionnée
        </div>
      </div>
      <div ref={mapRef} className="h-[500px] w-full"></div>
    </div>
  );
}
