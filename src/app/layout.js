// src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Tracker App - Suivi de localisation en temps réel',
  description: 'Application de suivi de localisation pour enfants, personnes âgées et objets',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
