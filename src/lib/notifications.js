// src/lib/notifications.js
import { ref, set, get, push, remove, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId, limit = 50) => {
  try {
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
      return { success: true, notifications: notifications.slice(0, limit) };
    } else {
      return { success: true, notifications: [] };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Créer une nouvelle notification
export const createNotification = async (userId, notificationData) => {
  try {
    const notificationsRef = ref(database, `notifications/${userId}`);
    const newNotificationRef = push(notificationsRef);
    
    await set(newNotificationRef, {
      ...notificationData,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    return { success: true, notificationId: newNotificationRef.key };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
    await set(ref(database, `notifications/${userId}/${notificationId}/read`), true);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { success, notifications, error } = await getUserNotifications(userId);
    
    if (!success) {
      throw new Error(error);
    }
    
    const updates = {};
    notifications.forEach(notification => {
      if (!notification.read) {
        updates[`notifications/${userId}/${notification.id}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Supprimer une notification
export const deleteNotification = async (userId, notificationId) => {
  try {
    const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
    await remove(notificationRef);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
