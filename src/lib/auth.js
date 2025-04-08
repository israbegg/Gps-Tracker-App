// src/lib/auth.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from './firebase';

// Créer un nouvel utilisateur
export const registerUser = async (email, password, displayName) => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Ajouter les informations supplémentaires dans la base de données
    await set(ref(database, `users/${user.uid}`), {
      email,
      displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: {
        notifications: true,
        language: 'fr'
      }
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Connecter un utilisateur
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour la date de dernière connexion
    await set(ref(database, `users/${user.uid}/lastLogin`), new Date().toISOString());
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Déconnecter un utilisateur
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Réinitialiser le mot de passe
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Observer l'état d'authentification
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
