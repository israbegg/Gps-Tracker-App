// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Configuration Firebase avec les informations fournies par l'utilisateur
const firebaseConfig = {
  apiKey: "AIzaSyDOFTJZ9kSOPYRGPDT0F4gigkNVRWUz0DE",
  authDomain: "espgps-baa76.firebaseapp.com",
  databaseURL: "https://espgps-baa76-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "espgps-baa76",
  storageBucket: "espgps-baa76.firebasestorage.app",
  messagingSenderId: "1008989000806",
  appId: "1:1008989000806:web:df667c1d571ee193fcc9a7"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services Firebase
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
