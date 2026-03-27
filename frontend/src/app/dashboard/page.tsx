"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings, Calendar, Heart, User } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setIsLoading(false);
      })
      .catch(() => {
        router.replace('/');
      });
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          Nom<span className="text-[#facc15]">Application</span>
        </Link>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#333333] text-[#facc15] p-2 rounded-full border border-gray-700">
              <User className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium hidden md:block">{user?.first_name} {user?.last_name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors bg-[#333333] p-2 rounded-full border border-gray-700 hover:bg-[#444]"
            title="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-3 bg-yellow-50 text-black px-4 py-3 rounded-xl font-bold border border-yellow-100">
                <LayoutDashboard className="w-5 h-5 text-[#facc15]" />
                <span>Tableau de bord</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-500 hover:bg-gray-50 hover:text-black px-4 py-3 rounded-xl font-medium transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Mes réservations</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-500 hover:bg-gray-50 hover:text-black px-4 py-3 rounded-xl font-medium transition-colors">
                <Heart className="w-5 h-5" />
                <span>Favoris</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-500 hover:bg-gray-50 hover:text-black px-4 py-3 rounded-xl font-medium transition-colors">
                <Settings className="w-5 h-5" />
                <span>Paramètres</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-8">Bonjour, {user?.first_name} 👋</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-[#facc15]" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Réservations actives</h3>
              <p className="text-3xl font-bold text-[#1a1a1a] mt-1">0</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#facc15]" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Assos favoris</h3>
              <p className="text-3xl font-bold text-[#1a1a1a] mt-1">0</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center py-16">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune réservation récente</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">Vous n'avez pas encore participé à des séances solidaires. Explorez les films à l'affiche pour vous engager.</p>
            <Link href="/" className="inline-block bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
              Découvrir les films
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
