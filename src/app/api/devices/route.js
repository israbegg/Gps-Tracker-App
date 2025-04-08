// src/app/api/devices/route.js
import { NextResponse } from 'next/server';
import { ref, set, get, push, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../../lib/firebase';

// Récupérer tous les appareils d'un utilisateur
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'ID utilisateur requis' }, { status: 400 });
    }
    
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
      return NextResponse.json({ success: true, devices });
    } else {
      return NextResponse.json({ success: true, devices: [] });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des appareils:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Ajouter ou mettre à jour un appareil
export async function POST(request) {
  try {
    const { deviceData, action, deviceId } = await request.json();
    
    switch (action) {
      case 'add':
        // Ajouter un nouvel appareil
        const devicesRef = ref(database, 'devices');
        const newDeviceRef = push(devicesRef);
        const newDeviceId = newDeviceRef.key;
        
        await set(newDeviceRef, {
          ...deviceData,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isOnline: false
        });
        
        return NextResponse.json({ success: true, deviceId: newDeviceId });
        
      case 'update':
        // Mettre à jour un appareil existant
        if (!deviceId) {
          return NextResponse.json({ success: false, error: 'ID appareil requis pour la mise à jour' }, { status: 400 });
        }
        
        const deviceRef = ref(database, `devices/${deviceId}`);
        await update(deviceRef, deviceData);
        
        return NextResponse.json({ success: true });
        
      default:
        return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout/mise à jour de l\'appareil:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Supprimer un appareil
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    
    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'ID appareil requis' }, { status: 400 });
    }
    
    // Supprimer l'appareil
    const deviceRef = ref(database, `devices/${deviceId}`);
    await remove(deviceRef);
    
    // Supprimer les positions associées
    const positionsRef = ref(database, `positions/${deviceId}`);
    await remove(positionsRef);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'appareil:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
