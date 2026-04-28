"use client";

import React, { useState } from 'react';
import { MovieCard } from './MovieCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ReservationModal from './ReservationModal';
import CancelReservationModal from './CancelReservationModal';

interface EventsListProps {
  events: any[];
  isLoading: boolean;
  user: any;
  favoritedIds: Set<any>;
  signedUpIds: Set<any>;
  onFavorite: (event: any) => void;
  onDetails: (event: any) => void;
  onSignup: (event: any) => void; // Keeps original login check logic from parent if needed
  onStatusChange: (eventId: any, isSignedUp: boolean) => void;
}

export const EventsList = ({
  events,
  isLoading,
  user,
  favoritedIds,
  signedUpIds,
  onFavorite,
  onDetails,
  onSignup,
  onStatusChange
}: EventsListProps) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleSignupClick = (event: any) => {
    if (!user) {
      onSignup(event); // Triggers login modal via parent
      return;
    }
    setSelectedEvent(event);
    if (signedUpIds.has(event.id)) {
      setIsCancelModalOpen(true);
    } else {
      setIsSignupModalOpen(true);
    }
  };

  const confirmSignup = async () => {
    if (!selectedEvent) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/signup/`, { method: "POST" });
      if (res.ok) {
        onStatusChange(selectedEvent.id, true);
        setIsSignupModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!selectedEvent) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/signup/`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        onStatusChange(selectedEvent.id, false);
        setIsCancelModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 relative z-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-4 sm:hidden">
        <div>
          <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Séances en salle</h2>
          <p className="text-slate-400 font-medium text-sm">Faites une bonne action avec chaque visionnage.</p>
        </div>
        <Link href="/events" className="text-yellow-500 font-bold text-sm hover:text-yellow-400 transition-colors pb-1 w-fit group flex items-center">
          Voir tout l'agenda <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <p>Aucun événement prévu pour le moment.</p>
          </div>
        ) : (
          events.map((event) => (
            <MovieCard 
              key={event.id}
              event={event}
              hasDetails={true}
              favoritesCount={event.favorites_count}
              commentsCount={event.comments_count}
              isFavorited={favoritedIds.has(event.id)}
              isSignedUp={signedUpIds.has(event.id)}
              onFavoriteClick={() => onFavorite(event)}
              onDetailsClick={() => onDetails(event)}
              onSignupClick={() => handleSignupClick(event)}
            />
          ))
        )}
      </div>

      <ReservationModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        event={selectedEvent}
        onConfirm={confirmSignup}
        isLoading={isActionLoading}
      />

      <CancelReservationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        event={selectedEvent}
        onConfirm={confirmCancel}
        isLoading={isActionLoading}
      />
    </main>
  );
};
