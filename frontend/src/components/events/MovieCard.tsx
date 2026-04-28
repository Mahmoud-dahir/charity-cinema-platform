"use client";

import React from 'react';
import { Heart, Calendar, MapPin, Play, Ticket, MessageCircle, Users, CheckCircle2 } from 'lucide-react';

interface MovieCardProps {
  event: any;
  hasDetails?: boolean;
  favoritesCount?: number;
  commentsCount?: number;
  isFavorited?: boolean;
  isSignedUp?: boolean;
  onFavoriteClick?: () => void;
  onDetailsClick?: () => void;
  onSignupClick?: () => void;
}

export const MovieCard = ({ 
  event,
  hasDetails = true,
  favoritesCount,
  commentsCount,
  isFavorited,
  isSignedUp,
  onFavoriteClick,
  onDetailsClick,
  onSignupClick,
}: MovieCardProps) => {
  return (
    <div 
      className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-2xl hover:border-yellow-500/30 hover:-translate-y-2 transition-all duration-300 group relative"
    >
      <div 
        className="w-full h-64 sm:h-72 bg-slate-800 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${event.cover_image || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop"})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-300"></div>
        {event.association_name && (
          <div className="absolute top-4 left-4 bg-yellow-500 px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 z-10">
            <Heart className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-900 tracking-wider uppercase">{`Par ${event.association_name}`}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="bg-yellow-500/90 p-4 rounded-full text-slate-900 transform scale-75 group-hover:scale-100 transition-transform duration-300 backdrop-blur-sm shadow-[0_0_30px_rgba(234,179,8,0.5)]">
            <Play className="w-6 h-6 fill-slate-900" />
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow justify-between relative bg-slate-900 z-10 -mt-6 rounded-t-2xl">
        {hasDetails ? (
          <>
            <div className="mb-4">
              <h3 className="font-extrabold text-white text-xl leading-snug mb-3 group-hover:text-yellow-400 transition-colors drop-shadow-sm line-clamp-2">{event.movie_title || event.title}</h3>
              <div className="space-y-2.5">
                <div className="flex items-center text-slate-300">
                  <Calendar className="w-4 h-4 mr-2.5 text-yellow-500" />
                  <p className="text-sm font-medium">{"Le " + new Date(event.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="flex items-start text-slate-400">
                  <MapPin className="w-4 h-4 mr-2.5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm line-clamp-2">{event.location}</p>
                </div>
                {event.capacity && (
                  <div className="flex items-center text-slate-400">
                    <Users className="w-4 h-4 mr-2.5 text-yellow-500" />
                    <p className="text-sm">{event.signups_count || 0} / {event.capacity} places</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mb-3 text-slate-500 text-xs">
              <span className="flex items-center gap-1">
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-400 text-red-400' : ''}`} />
                {favoritesCount ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {commentsCount ?? 0}
              </span>
            </div>
            
            <div className="flex gap-2 items-center mt-auto pt-4 border-t border-slate-800/80">
              <button 
                onClick={onFavoriteClick}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-colors border shrink-0 ${
                  isFavorited
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-slate-800 border-slate-700/50 text-slate-400 hover:text-red-400 hover:border-red-500/30'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-400' : 'group-hover/heart:fill-red-500'} transition-all`} />
              </button>
              <button 
                onClick={onDetailsClick}
                className="bg-transparent border border-slate-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:border-slate-500 hover:text-white transition-colors flex-1 text-center"
              >
                Détails
              </button>
              <button 
                onClick={onSignupClick}
                className={`${isSignedUp ? 'bg-green-500 hover:bg-green-400' : 'bg-yellow-500 hover:bg-yellow-400'} px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 transition-all flex-1 text-center flex items-center justify-center`}
              >
                {isSignedUp ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Ticket className="w-4 h-4 mr-1.5" />}
                {isSignedUp ? 'Inscrit' : "S'inscrire"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center py-8">
            <p className="text-slate-500 text-sm font-medium italic">Programmations à venir...</p>
          </div>
        )}
      </div>
    </div>
  );
};
