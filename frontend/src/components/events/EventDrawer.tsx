"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, MapPin, Users, Heart, MessageCircle, Send, Ticket, Building, CheckCircle2 } from "lucide-react";
import ReservationModal from "./ReservationModal";
import CancelReservationModal from "./CancelReservationModal";

interface Comment {
  id: string;
  username: string;
  first_name: string;
  body: string;
  created_at: string;
}

interface Event {
  id: string;
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

interface EventDrawerProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLoginRequired: () => void;
}

export function EventDrawer({ event, isOpen, onClose, user, onLoginRequired }: EventDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
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
    if (!user) { onLoginRequired(); return; }
    if (isTogglingFav || !event) return;
    setIsTogglingFav(true);
    const method = isFavorited ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/events/${event.id}/favorite/`, { method });
      if (res.ok || res.status === 204) {
        setIsFavorited(!isFavorited);
        setLocalFavCount(prev => isFavorited ? prev - 1 : prev + 1);
      }
    } catch {} finally {
      setIsTogglingFav(false);
    }
  };

  const handleSignup = () => {
    if (!user) { onLoginRequired(); return; }
    if (isSignedUp) {
      setIsCancelModalOpen(true);
    } else {
      setIsSignupModalOpen(true);
    }
  };

  const confirmSignup = async () => {
    if (!event) return;
    setIsSigningUp(true);
    try {
      const res = await fetch(`/api/events/${event.id}/signup/`, { method: "POST" });
      if (res.ok) {
        setIsSignedUp(true);
        setIsSignupModalOpen(false);
      }
    } catch {} finally {
      setIsSigningUp(false);
    }
  };

  const confirmCancel = async () => {
    if (!event) return;
    setIsSigningUp(true);
    try {
      const res = await fetch(`/api/events/${event.id}/signup/`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setIsSignedUp(false);
        setIsCancelModalOpen(false);
      }
    } catch {} finally {
      setIsSigningUp(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onLoginRequired(); return; }
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[520px] bg-slate-950 border-l border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header image */}
        <div
          className="h-52 w-full bg-slate-800 bg-cover bg-center relative flex-shrink-0"
          style={{ backgroundImage: event.cover_image ? `url(${event.cover_image})` : "none" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full hover:bg-slate-800 transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-white text-2xl font-black leading-tight">{event.movie_title || event.title}</h2>
            {event.association_name && (
              <div className="flex items-center gap-1.5 mt-1">
                <Building className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-yellow-400 text-sm font-medium">{event.association_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Meta */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-sm capitalize">{formattedDate} à {formattedTime}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{event.location}</span>
              </div>
              {event.capacity && (
                <div className="flex items-center gap-3 text-slate-300">
                  <Users className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm">{event.signups_count} / {event.capacity} inscrits</span>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Heart className="w-4 h-4" /> {localFavCount} favori{localFavCount !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <MessageCircle className="w-4 h-4" /> {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-white font-bold mb-2">Description</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleFavorite}
                disabled={isTogglingFav}
                className={`p-3 rounded-xl border transition-all flex-shrink-0 ${
                  isFavorited
                    ? "bg-red-500/20 border-red-500/50 text-red-400"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-400" : ""}`} />
              </button>
              <button
                onClick={handleSignup}
                disabled={isSigningUp}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  isSignedUp
                    ? "bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    : "bg-yellow-500 text-slate-900 hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                }`}
              >
                {isSignedUp ? <CheckCircle2 className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                {isSigningUp ? "Chargement..." : isSignedUp ? "Inscrit — Annuler" : "S'inscrire à l'événement"}
              </button>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-yellow-500" />
                Commentaires
              </h3>

              {comments.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Aucun commentaire. Soyez le premier !</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 text-xs font-bold">
                          {(comment.first_name || comment.username || "?")[0].toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-semibold">{comment.first_name || comment.username}</span>
                        <span className="text-slate-600 text-xs ml-auto">
                          {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{comment.body}</p>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              )}

              {/* Comment form */}
              <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Votre commentaire..." : "Connectez-vous pour commenter"}
                  disabled={!user}
                  rows={2}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-yellow-500/50 placeholder-slate-600 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || !newComment.trim() || isSubmittingComment}
                  className="bg-yellow-500 text-slate-900 p-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-end"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ReservationModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        event={event}
        onConfirm={confirmSignup}
        isLoading={isSigningUp}
      />

      <CancelReservationModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        event={event}
        onConfirm={confirmCancel}
        isLoading={isSigningUp}
      />
    </>
  );
}
