'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthChange } from '../../lib/auth';
import MapComponent from '../../components/map/MapComponent';

export default function MapPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceId = searchParams.get('device');

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
      
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      if (!authUser) {
        router.push('/login');
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

  // Si l'utilisateur n'est pas connecté, ne rien afficher
  if (!user) {
    return null; // Le useEffect va rediriger vers la page de connexion
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Carte de suivi en temps réel</h1>
        <p className="text-gray-600">Visualisez la position de vos appareils en temps réel</p>
      </div>

      <div className="mb-8">
        <MapComponent deviceId={deviceId} userId={user.uid} />
      </div>
    </div>
  );
}
