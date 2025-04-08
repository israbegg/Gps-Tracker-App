// src/app/api/auth/route.js
import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from '../../../lib/firebase';

// Fonction pour créer un utilisateur
export async function POST(request) {
  try {
    const { email, password, displayName, action } = await request.json();
    
    // Vérifier l'action demandée
    switch (action) {
      case 'register':
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
        
        return NextResponse.json({ success: true, userId: user.uid });
        
      case 'login':
        // Connecter l'utilisateur
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        const loginUser = loginCredential.user;
        
        // Mettre à jour la date de dernière connexion
        await set(ref(database, `users/${loginUser.uid}/lastLogin`), new Date().toISOString());
        
        return NextResponse.json({ success: true, userId: loginUser.uid });
        
      case 'logout':
        // Déconnecter l'utilisateur
        await signOut(auth);
        return NextResponse.json({ success: true });
        
      case 'reset-password':
        // Réinitialiser le mot de passe
        await sendPasswordResetEmail(auth, email);
        return NextResponse.json({ success: true });
        
      default:
        return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
