// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '../lib/auth';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
      
      // Rediriger vers le dashboard si l'utilisateur est connecté
      if (authUser) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Bienvenue sur TrackerApp</h1>
        <p className="text-xl mb-8">
          La solution de suivi de localisation en temps réel pour vos proches et vos objets de valeur
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-4xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Pour les enfants</h2>
            <p className="text-gray-600">
              Gardez un œil sur vos enfants et assurez-vous qu'ils sont en sécurité à tout moment.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-4xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Pour les personnes âgées</h2>
            <p className="text-gray-600">
              Assurez la sécurité de vos proches âgés tout en respectant leur indépendance.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-4xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Pour les objets</h2>
            <p className="text-gray-600">
              Suivez vos objets de valeur et retrouvez-les facilement en cas de perte ou de vol.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          {!user ? (
            <>
              <Link href="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center">
                Se connecter
              </Link>
              <Link href="/register" className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 text-center">
                Créer un compte
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center">
              Accéder au dashboard
            </Link>
          )}
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 font-bold text-xl mb-3">1</div>
              <h3 className="font-medium mb-2">Créez un compte</h3>
              <p className="text-gray-600 text-center">Inscrivez-vous gratuitement et configurez votre profil.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 font-bold text-xl mb-3">2</div>
              <h3 className="font-medium mb-2">Ajoutez vos appareils</h3>
              <p className="text-gray-600 text-center">Connectez vos trackers GPS à votre compte.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center text-indigo-600 font-bold text-xl mb-3">3</div>
              <h3 className="font-medium mb-2">Suivez en temps réel</h3>
              <p className="text-gray-600 text-center">Visualisez les positions sur la carte et recevez des alertes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
