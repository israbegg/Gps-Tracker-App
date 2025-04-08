'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '../../../lib/auth';
import AddDeviceForm from '../../../components/devices/AddDeviceForm';

export default function AddDevicePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleSuccess = () => {
    // Rediriger vers la page des appareils après l'ajout réussi
    router.push('/dashboard');
  };

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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Ajouter un nouvel appareil</h1>
        <p className="text-gray-600">Connectez un nouveau tracker à votre compte</p>
      </div>

      <AddDeviceForm userId={user.uid} onSuccess={handleSuccess} />
    </div>
  );
}
