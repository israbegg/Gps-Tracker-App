// src/app/api/geofence/route.js
import { NextResponse } from 'next/server';
import { ref, set, get, push, remove, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../../lib/firebase';

// Récupérer les zones de geofencing d'un appareil
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    
    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'ID appareil requis' }, { status: 400 });
    }
    
    const geofencesRef = ref(database, `devices/${deviceId}/geofences`);
    const snapshot = await get(geofencesRef);
    
    if (snapshot.exists()) {
      const geofences = [];
      snapshot.forEach((childSnapshot) => {
        geofences.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return NextResponse.json({ success: true, geofences });
    } else {
      return NextResponse.json({ success: true, geofences: [] });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des zones de geofencing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Ajouter une nouvelle zone de geofencing
export async function POST(request) {
  try {
    const { deviceId, geofenceData } = await request.json();
    
    if (!deviceId || !geofenceData || !geofenceData.name || !geofenceData.lat || !geofenceData.lng || !geofenceData.radius) {
      return NextResponse.json({ success: false, error: 'Données de geofencing incomplètes' }, { status: 400 });
    }
    
    // Vérifier si l'appareil existe
    const deviceRef = ref(database, `devices/${deviceId}`);
    const deviceSnapshot = await get(deviceRef);
    
    if (!deviceSnapshot.exists()) {
      return NextResponse.json({ success: false, error: 'Appareil non trouvé' }, { status: 404 });
    }
    
    // Ajouter la nouvelle zone de geofencing
    const geofencesRef = ref(database, `devices/${deviceId}/geofences`);
    const newGeofenceRef = push(geofencesRef);
    
    await set(newGeofenceRef, {
      ...geofenceData,
      active: true,
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, geofenceId: newGeofenceRef.key });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la zone de geofencing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Mettre à jour une zone de geofencing
export async function PUT(request) {
  try {
    const { deviceId, geofenceId, geofenceData } = await request.json();
    
    if (!deviceId || !geofenceId || !geofenceData) {
      return NextResponse.json({ success: false, error: 'Données de mise à jour incomplètes' }, { status: 400 });
    }
    
    // Vérifier si la zone existe
    const geofenceRef = ref(database, `devices/${deviceId}/geofences/${geofenceId}`);
    const geofenceSnapshot = await get(geofenceRef);
    
    if (!geofenceSnapshot.exists()) {
      return NextResponse.json({ success: false, error: 'Zone de geofencing non trouvée' }, { status: 404 });
    }
    
    // Mettre à jour la zone
    await set(geofenceRef, {
      ...geofenceSnapshot.val(),
      ...geofenceData,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la zone de geofencing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Supprimer une zone de geofencing
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const geofenceId = searchParams.get('geofenceId');
    
    if (!deviceId || !geofenceId) {
      return NextResponse.json({ success: false, error: 'ID appareil et ID zone requis' }, { status: 400 });
    }
    
    // Supprimer la zone
    const geofenceRef = ref(database, `devices/${deviceId}/geofences/${geofenceId}`);
    await remove(geofenceRef);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la zone de geofencing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
