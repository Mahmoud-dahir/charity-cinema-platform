"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, Calendar, Heart, User, Building, Film, Plus } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { EventCard } from "@/components/events/EventCard";

export default function EventsDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((user) => {
        if (!user.has_association) {
          router.replace("/dashboard/association");
          return;
        }
        setUser(user);
        return fetch("/api/dashboard/events");
      })
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setEvents(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}/publish`, { method: "POST" });
      if (res.ok) {
        setEvents(events.map(e => e.id === id ? { ...e, status: "published" } : e));
      } else {
        alert("Erreur lors de la publication.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };

  const handleCancel = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/events/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_reason: reason }),
      });
      if (res.ok) {
        setEvents(events.map(e => e.id === id ? { ...e, status: "cancelled", cancel_reason: reason } : e));
      } else {
        alert("Erreur lors de l'annulation.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
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
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">Mes Événements</h1>
              <p className="text-gray-500">Gérez les projections et événements de votre association.</p>
            </div>
            <Link href="/dashboard/events/new" className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-full transition-colors shadow-sm">
              <Plus className="w-5 h-5" />
              Créer un événement
            </Link>
          </div>
          
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Film className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">Vous n'avez pas encore créé d'événements. Commencez dès maintenant !</p>
              <Link href="/dashboard/events/new" className="inline-block bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
                Créer mon premier événement
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((evt) => (
                <EventCard 
                  key={evt.id} 
                  event={evt} 
                  onPublish={handlePublish} 
                  onCancel={handleCancel} 
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
