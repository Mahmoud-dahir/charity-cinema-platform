"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Calendar, MapPin, Film } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function FavoritesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        return fetch("/api/events?favorited=true");
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch favorites");
        return res.json();
      })
      .then((data) => {
        setFavorites(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-8">
        <Sidebar user={user} />

        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
              Mes Favoris
            </h1>
            <p className="text-gray-500 mt-1">Les événements que vous avez sauvegardés.</p>
          </div>

          {favorites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Aucun favori pour l'instant</h2>
              <p className="text-gray-500 text-sm mb-6">
                Explorez les événements et cliquez sur ❤️ pour les retrouver ici.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                <Film className="w-4 h-4" />
                Découvrir les événements
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {favorites.map((event) => {
                const dateObj = new Date(event.starts_at);
                const formattedDate = dateObj.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all group"
                  >
                    <div
                      className="h-40 bg-slate-800 bg-cover bg-center relative"
                      style={{
                        backgroundImage: event.cover_image
                          ? `url(${event.cover_image})`
                          : "linear-gradient(135deg, #1e293b, #334155)",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <span className="text-white font-bold text-base line-clamp-1">
                          {event.movie_title || event.title}
                        </span>
                      </div>
                      <button className="absolute top-3 right-3 bg-red-500/20 border border-red-500/40 p-1.5 rounded-full">
                        <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-yellow-600 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                        {formattedDate}
                      </div>
                      <div className="flex items-start gap-2 text-gray-500 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      {event.association_name && (
                        <p className="text-xs text-yellow-600 font-semibold">
                          Par {event.association_name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
