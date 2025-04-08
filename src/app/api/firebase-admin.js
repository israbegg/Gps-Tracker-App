// src/app/api/firebase-admin.js
import admin from 'firebase-admin';

// Vérifier si Firebase Admin est déjà initialisé
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "espgps-baa76",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://espgps-baa76-default-rtdb.europe-west1.firebasedatabase.app"
    });
    console.log('Firebase Admin initialisé');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Admin:', error.stack);
  }
}

export default admin;
