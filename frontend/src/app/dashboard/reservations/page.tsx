"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, XCircle, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { EventDetailModal } from '@/components/events/EventDetailModal';

export default function ReservationsPage() {
  const [user, setUser] = useState<any>(null);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data);
        return fetch('/api/events?signedup=true');
      })
      .then(res => res.json())
      .then(data => {
        setInscriptions(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        router.replace('/');
      });
  }, [router]);

  const handleCancelInscription = async (eventId: number) => {
    if (!confirm("Voulez-vous vraiment annuler votre inscription ?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}/signup/`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setInscriptions(prev => prev.filter(evt => evt.id !== eventId));
        // Close drawer if the cancelled event is currently open
        if (selectedEvent?.id === eventId) setIsDrawerOpen(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Une erreur est survenue");
      }
    } catch {
      alert("Une erreur est survenue");
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
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-8">
        <Sidebar user={user} />

        <main className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Mes inscriptions</h1>
            <div className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-sm font-bold border border-yellow-200">
              {inscriptions.length} séance{inscriptions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {inscriptions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune inscription active</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">Vous n'êtes inscrit à aucune séance solidaire pour le moment.</p>
              <Link href="/" className="inline-block bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
                Découvrir l'agenda
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {inscriptions.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-yellow-200 transition-colors">
                  <div className="flex items-start gap-6">
                    <div
                      className="w-24 h-32 bg-slate-200 rounded-xl bg-cover bg-center shrink-0 shadow-sm"
                      style={{ backgroundImage: `url(${event.cover_image || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop"})` }}
                    />
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-1">{event.movie_title || event.title}</h3>
                        <p className="text-[#facc15] text-xs font-bold uppercase tracking-wider">Par {event.association_name}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-[#facc15]" />
                          <span>{new Date(event.starts_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {new Date(event.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-[#facc15]" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => { setSelectedEvent(event); setIsDrawerOpen(true); }}
                      className="flex-1 sm:w-40 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition-colors border border-gray-200"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => handleCancelInscription(event.id)}
                      className="flex-1 sm:w-40 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-sm transition-colors border border-red-100"
                    >
                      <XCircle className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <EventDetailModal
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onCancelSignup={(eventId) => handleCancelInscription(eventId)}
        />
    </div>
  );
}