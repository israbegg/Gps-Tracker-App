// src/lib/devices.js
import { ref, set, get, push, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';

// Récupérer tous les appareils d'un utilisateur
export const getUserDevices = async (userId) => {
  try {
    const devicesRef = ref(database, 'devices');
    const userDevicesQuery = query(devicesRef, orderByChild('ownerId'), equalTo(userId));
    const snapshot = await get(userDevicesQuery);
    
    if (snapshot.exists()) {
      const devices = [];
      snapshot.forEach((childSnapshot) => {
        devices.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return { success: true, devices };
    } else {
      return { success: true, devices: [] };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Ajouter un nouvel appareil
export const addDevice = async (deviceData) => {
  try {
    const devicesRef = ref(database, 'devices');
    const newDeviceRef = push(devicesRef);
    const deviceId = newDeviceRef.key;
    
    await set(newDeviceRef, {
      ...deviceData,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: false
    });
    
    return { success: true, deviceId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Mettre à jour un appareil
export const updateDevice = async (deviceId, deviceData) => {
  try {
    const deviceRef = ref(database, `devices/${deviceId}`);
    await update(deviceRef, deviceData);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Supprimer un appareil
export const deleteDevice = async (deviceId) => {
  try {
    // Supprimer l'appareil
    const deviceRef = ref(database, `devices/${deviceId}`);
    await remove(deviceRef);
    
    // Supprimer les positions associées
    const positionsRef = ref(database, `positions/${deviceId}`);
    await remove(positionsRef);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Ajouter une zone de geofencing
export const addGeofence = async (deviceId, geofenceData) => {
  try {
    const geofencesRef = ref(database, `devices/${deviceId}/geofences`);
    const newGeofenceRef = push(geofencesRef);
    
    await set(newGeofenceRef, {
      ...geofenceData,
      active: true,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, geofenceId: newGeofenceRef.key };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Supprimer une zone de geofencing
export const deleteGeofence = async (deviceId, geofenceId) => {
  try {
    const geofenceRef = ref(database, `devices/${deviceId}/geofences/${geofenceId}`);
    await remove(geofenceRef);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
