// src/components/auth/LoginForm.jsx
'use client';

import { useState } from 'react';
import { loginUser, resetPassword } from '../../lib/auth';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Veuillez entrer votre adresse email pour réinitialiser votre mot de passe.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setResetSent(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la réinitialisation du mot de passe.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="mt-2 text-gray-600">Accédez à votre compte de suivi</p>
      </div>

      {resetSent ? (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          Un email de réinitialisation a été envoyé à {email}.
        </div>
      ) : null}

      {error ? (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleLogin} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <button
              type="button"
              onClick={handleResetPassword}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
