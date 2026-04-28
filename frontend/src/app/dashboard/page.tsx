"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings, Calendar, Heart, User, Building, Film, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { EventDetailModal } from '@/components/events/EventDetailModal';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data);
        return Promise.all([
          fetch('/api/events?signedup=true').then(res => res.json()),
          fetch('/api/events?favorited=true').then(res => res.json())
        ]);
      })
      .then(([inscriptionsData, favoritesData]) => {
        if (Array.isArray(inscriptionsData)) setInscriptions(inscriptionsData);
        if (Array.isArray(favoritesData)) setFavoritesCount(favoritesData.length);
        setIsLoading(false);
      })
      .catch(() => {
        router.replace('/');
      });
  }, [router]);

  const handleCancelSignup = async (eventId: any) => {
    try {
      const res = await fetch(`/api/events/${eventId}/signup/`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setInscriptions(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (err) {
      console.error("Error cancelling signup:", err);
    }
  };

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
              <h3 className="text-gray-500 font-medium text-sm">Inscriptions actives</h3>
              <p className="text-3xl font-bold text-[#1a1a1a] mt-1">{inscriptions.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#facc15]" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">Événements favoris</h3>
              <p className="text-3xl font-bold text-[#1a1a1a] mt-1">{favoritesCount}</p>
            </div>
          </div>
          
          {inscriptions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Mes prochaines séances</h2>
              <div className="grid gap-4">
                {inscriptions.map((event) => (
                  <div key={event.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
                    <div 
                      className="w-20 h-28 bg-gray-200 rounded-xl bg-cover bg-center shrink-0 shadow-sm"
                      style={{ backgroundImage: `url(${event.cover_image || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop"})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 truncate mb-1">{event.movie_title || event.title}</h4>
                      <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-yellow-500" />
                          <span>{new Date(event.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-yellow-500" />
                          <span className="truncate max-w-[200px]">{event.location}</span>
                        </div>
                      </div>
                    </div>
                     <button 
                      onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                      className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm border border-gray-200"
                    >
                      Détails
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune inscription récente</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">Vous n'avez pas encore participé à des séances solidaires. Explorez les films à l'affiche pour vous engager.</p>
              <Link href="/" className="inline-block bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
                Découvrir les films
              </Link>
            </div>
          )}
        </main>
      </div>
      <EventDetailModal 
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onCancelSignup={handleCancelSignup}
      />
    </div>
  );
}
