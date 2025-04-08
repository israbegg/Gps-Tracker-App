// src/app/api/notifications/route.js
import { NextResponse } from 'next/server';
import { ref, set, get, push, remove, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../../lib/firebase';

// Récupérer les notifications d'un utilisateur
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'ID utilisateur requis' }, { status: 400 });
    }
    
    const notificationsRef = ref(database, `notifications/${userId}`);
    const snapshot = await get(notificationsRef);
    
    if (snapshot.exists()) {
      const notifications = [];
      snapshot.forEach((childSnapshot) => {
        notifications.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Trier par date (du plus récent au plus ancien)
      notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Limiter le nombre de notifications
      return NextResponse.json({ success: true, notifications: notifications.slice(0, limit) });
    } else {
      return NextResponse.json({ success: true, notifications: [] });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Créer une nouvelle notification
export async function POST(request) {
  try {
    const { userId, notificationData } = await request.json();
    
    if (!userId || !notificationData || !notificationData.type || !notificationData.deviceId || !notificationData.message) {
      return NextResponse.json({ success: false, error: 'Données de notification incomplètes' }, { status: 400 });
    }
    
    // Ajouter la nouvelle notification
    const notificationsRef = ref(database, `notifications/${userId}`);
    const newNotificationRef = push(notificationsRef);
    
    await set(newNotificationRef, {
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    return NextResponse.json({ success: true, notificationId: newNotificationRef.key });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Marquer une notification comme lue
export async function PUT(request) {
  try {
    const { userId, notificationId, markAll } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'ID utilisateur requis' }, { status: 400 });
    }
    
    if (markAll) {
      // Marquer toutes les notifications comme lues
      const notificationsRef = ref(database, `notifications/${userId}`);
      const snapshot = await get(notificationsRef);
      
      if (snapshot.exists()) {
        const updates = {};
        snapshot.forEach((childSnapshot) => {
          if (!childSnapshot.val().read) {
            updates[`notifications/${userId}/${childSnapshot.key}/read`] = true;
          }
        });
        
        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates);
        }
      }
    } else if (notificationId) {
      // Marquer une notification spécifique comme lue
      await set(ref(database, `notifications/${userId}/${notificationId}/read`), true);
    } else {
      return NextResponse.json({ success: false, error: 'ID notification requis ou markAll doit être true' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Supprimer une notification
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');
    
    if (!userId || !notificationId) {
      return NextResponse.json({ success: false, error: 'ID utilisateur et ID notification requis' }, { status: 400 });
    }
    
    // Supprimer la notification
    const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
    await remove(notificationRef);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
