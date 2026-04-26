"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings, Calendar, Heart, User, Building, Film, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

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
      <Header user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <Sidebar user={user} />

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
