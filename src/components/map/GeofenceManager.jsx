// src/components/map/GeofenceManager.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { addGeofence, deleteGeofence } from '../../lib/devices';

export default function GeofenceManager({ deviceId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const [geofences, setGeofences] = useState([]);
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    lat: 0,
    lng: 0,
    radius: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('view'); // 'view' ou 'add'

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

        // Ajouter un gestionnaire de clic pour définir la position du geofence
        map.on('click', (e) => {
          if (mode === 'add') {
            const { lat, lng } = e.latlng;
            setNewGeofence(prev => ({ ...prev, lat, lng }));
            
            // Mettre à jour ou créer le cercle
            if (circleRef.current) {
              circleRef.current.setLatLng([lat, lng]);
            } else {
              circleRef.current = L.circle([lat, lng], {
                radius: newGeofence.radius,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3
              }).addTo(map);
            }
          }
        });

        // Stocker l'instance de la carte
        mapInstanceRef.current = map;
        setLoading(false);
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

  // Mettre à jour le cercle lorsque le rayon change
  useEffect(() => {
    if (circleRef.current && mode === 'add') {
      circleRef.current.setRadius(newGeofence.radius);
    }
  }, [newGeofence.radius, mode]);

  // Charger les geofences existants
  useEffect(() => {
    const fetchGeofences = async () => {
      if (!deviceId || !mapInstanceRef.current) return;
      
      try {
        // Importer Leaflet dynamiquement
        const L = await import('leaflet');
        
        // Récupérer les geofences depuis Firebase
        // Note: Cette fonction devrait être implémentée dans devices.js
        // Pour l'instant, nous utilisons un tableau vide
        const fetchedGeofences = []; // À remplacer par l'appel API réel
        
        setGeofences(fetchedGeofences);
        
        // Afficher les geofences sur la carte
        fetchedGeofences.forEach(geofence => {
          L.circle([geofence.lat, geofence.lng], {
            radius: geofence.radius,
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.3
          }).addTo(mapInstanceRef.current).bindPopup(`
            <b>${geofence.name}</b><br>
            Rayon: ${geofence.radius} m
          `);
        });
      } catch (err) {
        setError('Erreur lors du chargement des zones de geofencing');
        console.error(err);
      }
    };

    fetchGeofences();
  }, [deviceId, mapInstanceRef.current]);

  // Gérer le changement de mode
  const handleModeChange = (newMode) => {
    setMode(newMode);
    
    // Nettoyer le cercle temporaire si on quitte le mode ajout
    if (newMode !== 'add' && circleRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(circleRef.current);
      circleRef.current = null;
    }
  };

  // Gérer le changement de rayon
  const handleRadiusChange = (e) => {
    const radius = parseInt(e.target.value, 10);
    setNewGeofence(prev => ({ ...prev, radius }));
  };

  // Gérer le changement de nom
  const handleNameChange = (e) => {
    setNewGeofence(prev => ({ ...prev, name: e.target.value }));
  };

  // Ajouter un nouveau geofence
  const handleAddGeofence = async () => {
    if (!newGeofence.name || newGeofence.lat === 0 || newGeofence.lng === 0) {
      setError('Veuillez donner un nom à la zone et sélectionner un emplacement sur la carte');
      return;
    }
    
    setLoading(true);
    try {
      const result = await addGeofence(deviceId, newGeofence);
      
      if (result.success) {
        // Ajouter le nouveau geofence à la liste
        setGeofences(prev => [...prev, { ...newGeofence, id: result.geofenceId }]);
        
        // Réinitialiser le formulaire
        setNewGeofence({
          name: '',
          lat: 0,
          lng: 0,
          radius: 100
        });
        
        // Revenir au mode visualisation
        handleModeChange('view');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout de la zone de geofencing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !mapInstanceRef.current) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Gestion des zones de geofencing</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => handleModeChange('view')}
            className={`px-4 py-2 rounded-md ${mode === 'view' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Visualiser
          </button>
          <button
            onClick={() => handleModeChange('add')}
            className={`px-4 py-2 rounded-md ${mode === 'add' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Ajouter une zone
          </button>
        </div>
        
        {mode === 'add' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="mb-3">
              <label htmlFor="geofence-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la zone
              </label>
              <input
                type="text"
                id="geofence-name"
                value={newGeofence.name}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Maison, École, etc."
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="geofence-radius" className="block text-sm font-medium text-gray-700 mb-1">
                Rayon: {newGeofence.radius} mètres
              </label>
              <input
                type="range"
                id="geofence-radius"
                min="50"
                max="1000"
                step="50"
                value={newGeofence.radius}
                onChange={handleRadiusChange}
                className="w-full"
              />
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                Position: {newGeofence.lat !== 0 ? `${newGeofence.lat.toFixed(6)}, ${newGeofence.lng.toFixed(6)}` : 'Non définie'}
              </p>
              <p className="text-sm text-gray-500 italic">
                Cliquez sur la carte pour définir la position de la zone
              </p>
            </div>
            
            <button
              onClick={handleAddGeofence}
              disabled={loading || newGeofence.lat === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter la zone'}
            </button>
          </div>
        )}
      </div>
      <div ref={mapRef} className="h-[500px] w-full"></div>
    </div>
  );
}
