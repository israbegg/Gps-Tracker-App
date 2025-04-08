// src/lib/positions.js
import { ref, set, get, push, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { database } from './firebase';

// Récupérer les dernières positions d'un appareil
export const getDevicePositions = async (deviceId, limit = 100) => {
  try {
    const positionsRef = ref(database, `positions/${deviceId}`);
    const recentPositionsQuery = query(
      positionsRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    );
    
    const snapshot = await get(recentPositionsQuery);
    
    if (snapshot.exists()) {
      const positions = [];
      snapshot.forEach((childSnapshot) => {
        positions.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      // Trier par ordre chronologique (du plus ancien au plus récent)
      positions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      return { success: true, positions };
    } else {
      return { success: true, positions: [] };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Récupérer la dernière position d'un appareil
export const getLastPosition = async (deviceId) => {
  try {
    const positionsRef = ref(database, `positions/${deviceId}`);
    const lastPositionQuery = query(
      positionsRef,
      orderByChild('timestamp'),
      limitToLast(1)
    );
    
    const snapshot = await get(lastPositionQuery);
    
    if (snapshot.exists()) {
      let lastPosition = null;
      snapshot.forEach((childSnapshot) => {
        lastPosition = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
      });
      return { success: true, position: lastPosition };
    } else {
      return { success: true, position: null };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// S'abonner aux mises à jour de position en temps réel
export const subscribeToPositions = (deviceId, callback) => {
  const positionsRef = ref(database, `positions/${deviceId}`);
  const lastPositionQuery = query(
    positionsRef,
    orderByChild('timestamp'),
    limitToLast(1)
  );
  
  return onValue(lastPositionQuery, (snapshot) => {
    if (snapshot.exists()) {
      let position = null;
      snapshot.forEach((childSnapshot) => {
        position = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
      });
      callback(position);
    } else {
      callback(null);
    }
  });
};

// Exporter l'historique des positions au format JSON
export const exportPositionsAsJSON = async (deviceId, limit = 1000) => {
  try {
    const { success, positions, error } = await getDevicePositions(deviceId, limit);
    
    if (!success) {
      throw new Error(error);
    }
    
    return { 
      success: true, 
      data: JSON.stringify(positions, null, 2) 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Exporter l'historique des positions au format CSV
export const exportPositionsAsCSV = async (deviceId, limit = 1000) => {
  try {
    const { success, positions, error } = await getDevicePositions(deviceId, limit);
    
    if (!success) {
      throw new Error(error);
    }
    
    if (positions.length === 0) {
      return { success: true, data: 'No data available' };
    }
    
    // Créer l'en-tête CSV
    const headers = Object.keys(positions[0]).filter(key => key !== 'id');
    let csv = headers.join(',') + '\n';
    
    // Ajouter les données
    positions.forEach(position => {
      const row = headers.map(header => {
        const value = position[header];
        // Échapper les virgules et les guillemets
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += row.join(',') + '\n';
    });
    
    return { success: true, data: csv };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
