// src/app/api/positions/route.js
import { NextResponse } from 'next/server';
import { ref, set, get, push, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../../../lib/firebase';

// Récupérer les positions d'un appareil
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const lastOnly = searchParams.get('lastOnly') === 'true';
    
    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'ID appareil requis' }, { status: 400 });
    }
    
    const positionsRef = ref(database, `positions/${deviceId}`);
    
    if (lastOnly) {
      // Récupérer uniquement la dernière position
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
        return NextResponse.json({ success: true, position: lastPosition });
      } else {
        return NextResponse.json({ success: true, position: null });
      }
    } else {
      // Récupérer l'historique des positions
      const positionsQuery = query(
        positionsRef,
        orderByChild('timestamp'),
        limitToLast(limit)
      );
      
      const snapshot = await get(positionsQuery);
      
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
        return NextResponse.json({ success: true, positions });
      } else {
        return NextResponse.json({ success: true, positions: [] });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des positions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Ajouter une nouvelle position (pour l'ESP32)
export async function POST(request) {
  try {
    const { deviceId, lat, lng, accuracy, altitude, speed, batteryLevel } = await request.json();
    
    if (!deviceId || lat === undefined || lng === undefined) {
      return NextResponse.json({ success: false, error: 'Données de position incomplètes' }, { status: 400 });
    }
    
    // Vérifier si l'appareil existe
    const deviceRef = ref(database, `devices/${deviceId}`);
    const deviceSnapshot = await get(deviceRef);
    
    if (!deviceSnapshot.exists()) {
      return NextResponse.json({ success: false, error: 'Appareil non trouvé' }, { status: 404 });
    }
    
    // Ajouter la nouvelle position
    const positionsRef = ref(database, `positions/${deviceId}`);
    const newPositionRef = push(positionsRef);
    
    const positionData = {
      timestamp: new Date().toISOString(),
      lat,
      lng
    };
    
    // Ajouter les données optionnelles si elles sont présentes
    if (accuracy !== undefined) positionData.accuracy = accuracy;
    if (altitude !== undefined) positionData.altitude = altitude;
    if (speed !== undefined) positionData.speed = speed;
    if (batteryLevel !== undefined) positionData.batteryLevel = batteryLevel;
    
    await set(newPositionRef, positionData);
    
    // Mettre à jour le statut de l'appareil
    await set(ref(database, `devices/${deviceId}/lastActive`), new Date().toISOString());
    await set(ref(database, `devices/${deviceId}/isOnline`), true);
    
    // Vérifier les zones de geofencing (à implémenter)
    // TODO: Implémenter la vérification des zones de geofencing
    
    return NextResponse.json({ success: true, positionId: newPositionRef.key });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la position:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Exporter les positions au format CSV ou JSON
export async function PUT(request) {
  try {
    const { deviceId, format, limit } = await request.json();
    const maxLimit = limit || 1000;
    
    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'ID appareil requis' }, { status: 400 });
    }
    
    // Récupérer les positions
    const positionsRef = ref(database, `positions/${deviceId}`);
    const positionsQuery = query(
      positionsRef,
      orderByChild('timestamp'),
      limitToLast(maxLimit)
    );
    
    const snapshot = await get(positionsQuery);
    
    if (!snapshot.exists()) {
      return NextResponse.json({ success: true, data: format === 'csv' ? 'No data available' : '[]' });
    }
    
    const positions = [];
    snapshot.forEach((childSnapshot) => {
      positions.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Trier par ordre chronologique
    positions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (format === 'csv') {
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
      
      return NextResponse.json({ success: true, data: csv, format: 'csv' });
    } else {
      // Format JSON par défaut
      return NextResponse.json({ success: true, data: positions, format: 'json' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'export des positions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
