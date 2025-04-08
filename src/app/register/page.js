'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '../../lib/auth';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
      
      // Rediriger vers le dashboard si l'utilisateur est déjà connecté
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

  // Si l'utilisateur est connecté, ne pas afficher le formulaire d'inscription
  if (user) {
    return null; // Le useEffect va rediriger vers le dashboard
  }

  return (
    <div className="flex justify-center items-center py-12">
      <RegisterForm />
    </div>
  );
}
