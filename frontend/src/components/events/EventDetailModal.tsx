"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Calendar, MapPin, Users, Heart, MessageCircle, Send, Ticket, Building, CheckCircle2 } from "lucide-react";

interface Comment {
  id: string;
  username: string;
  first_name: string;
  body: string;
  created_at: string;
}

interface Event {
  id: string | number;
  title: string;
  movie_title: string;
  description: string;
  starts_at: string;
  ends_at?: string;
  location: string;
  capacity?: number;
  cover_image?: string;
  association_name?: string;
  favorites_count: number;
  comments_count: number;
  signups_count: number;
  is_favorited: boolean;
  is_signed_up: boolean;
}

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onCancelSignup?: (eventId: any) => void;
}

export function EventDetailModal({ event, isOpen, onClose, user, onCancelSignup }: EventDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [localFavCount, setLocalFavCount] = useState(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!event || !isOpen) return;
    setLocalFavCount(event.favorites_count);
    setIsFavorited(event.is_favorited);
    setIsSignedUp(event.is_signed_up);
    setComments([]);

    fetch(`/api/events/${event.id}/comments/`)
      .then(res => res.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [event, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleFavorite = async () => {
    if (isTogglingFav || !event) return;
    setIsTogglingFav(true);
    const method = isFavorited ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/events/${event.id}/favorite/`, { method });
      if (res.ok || res.status === 204) {
        setIsFavorited(prev => !prev);
        setLocalFavCount(prev => isFavorited ? prev - 1 : prev + 1);
      }
    } catch {} finally {
      setIsTogglingFav(false);
    }
  };

  const handleSignup = async () => {
    if (isSigningUp || !event) return;
    if (isSignedUp) {
      if (onCancelSignup) {
        onClose();
        onCancelSignup(event.id);
      }
      return;
    }
    setIsSigningUp(true);
    try {
      const res = await fetch(`/api/events/${event.id}/signup/`, { method: "POST" });
      if (res.ok) setIsSignedUp(true);
    } catch {} finally {
      setIsSigningUp(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment || !event) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/events/${event.id}/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setNewComment("");
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch {} finally {
      setIsSubmittingComment(false);
    }
  };

  if (!event) return null;

  const startDate = new Date(event.starts_at);
  const formattedDate = startDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 flex items-center justify-center p-4 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Cover image header */}
          <div
            className="h-48 w-full bg-gray-200 bg-cover bg-center relative flex-shrink-0"
            style={{ backgroundImage: event.cover_image ? `url(${event.cover_image})` : "url(https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-t-3xl" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 text-gray-700 p-2 rounded-full hover:bg-white transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-6 right-16">
              <h2 className="text-white text-2xl font-extrabold leading-tight drop-shadow-md">
                {event.movie_title || event.title}
              </h2>
              {event.association_name && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Building className="w-3.5 h-3.5 text-[#facc15]" />
                  <span className="text-yellow-300 text-sm font-semibold">{event.association_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                  <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#facc15]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
                    <p className="text-sm font-bold text-gray-800 capitalize">{formattedDate}</p>
                    <p className="text-xs text-gray-500">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                  <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#facc15]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Lieu</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-2">{event.location}</p>
                  </div>
                </div>

                {event.capacity && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3.5 border border-gray-100 sm:col-span-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-[#facc15]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Capacité</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#facc15] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((event.signups_count || 0) / event.capacity) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{event.signups_count || 0} / {event.capacity} inscrits</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Heart className="w-4 h-4" />
                  <span>{localFavCount} favori{localFavCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length} commentaire{comments.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleFavorite}
                  disabled={isTogglingFav}
                  className={`p-3 rounded-2xl border-2 transition-all flex-shrink-0 ${
                    isFavorited
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-gray-50 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500" : ""}`} />
                </button>
                <button
                  onClick={handleSignup}
                  disabled={isSigningUp}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                    isSignedUp
                      ? "bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      : "bg-[#facc15] border-[#facc15] text-gray-900 hover:bg-yellow-400 hover:border-yellow-400 shadow-sm"
                  }`}
                >
                  {isSignedUp
                    ? <><CheckCircle2 className="w-4 h-4" /> Inscrit — Annuler l'inscription</>
                    : <><Ticket className="w-4 h-4" /> {isSigningUp ? "Chargement..." : "S'inscrire à la séance"}</>
                  }
                </button>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#facc15]" />
                  Commentaires
                </h3>

                {comments.length === 0 ? (
                  <p className="text-gray-400 text-sm italic text-center py-4">Aucun commentaire. Soyez le premier !</p>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#facc15] flex items-center justify-center text-gray-900 text-xs font-extrabold flex-shrink-0">
                            {(comment.first_name || comment.username || "?")[0].toUpperCase()}
                          </div>
                          <span className="text-gray-900 text-sm font-bold">{comment.first_name || comment.username}</span>
                          <span className="text-gray-400 text-xs ml-auto">
                            {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{comment.body}</p>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                )}

                {user && (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-3">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Votre commentaire..."
                      rows={2}
                      className="flex-1 bg-gray-50 border-2 border-gray-200 text-gray-800 text-sm rounded-2xl px-4 py-3 resize-none focus:outline-none focus:border-[#facc15] placeholder-gray-400 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="bg-[#facc15] text-gray-900 p-3 rounded-2xl hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-end shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}