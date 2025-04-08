// src/components/devices/AddDeviceForm.jsx
'use client';

import { useState } from 'react';
import { addDevice } from '../../lib/devices';

export default function AddDeviceForm({ userId, onSuccess }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('objet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const deviceData = {
        name,
        type,
        ownerId: userId,
      };

      const result = await addDevice(deviceData);
      
      if (result.success) {
        setName('');
        setType('objet');
        if (onSuccess) {
          onSuccess(result.deviceId);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'ajout de l\'appareil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Ajouter un nouvel appareil</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'appareil
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: Montre de Paul"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type d'appareil
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="enfant">Enfant</option>
            <option value="personne âgée">Personne âgée</option>
            <option value="objet">Objet</option>
          </select>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Ajout en cours...' : 'Ajouter l\'appareil'}
          </button>
        </div>
      </form>
    </div>
  );
}
