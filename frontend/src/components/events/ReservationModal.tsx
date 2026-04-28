"use client"

import React from 'react';
import { X, Calendar, MapPin, Ticket, CheckCircle2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function ReservationModal({ 
  isOpen, 
  onClose, 
  event, 
  onConfirm,
  isLoading 
}: ReservationModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500/10 p-3 rounded-2xl">
              <Ticket className="w-6 h-6 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Confirmation</h2>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5 mb-8 border border-slate-700/50">
            <h3 className="font-bold text-white text-lg mb-3">{event.movie_title || event.title}</h3>
            
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-3 text-yellow-500" />
                <span>{new Date(event.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 mr-3 text-yellow-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{event.location}</span>
              </div>
              {event.capacity && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-3 text-yellow-500" />
                  <span>{event.signups_count} / {event.capacity} places réservées</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8">
            <p className="text-blue-200 text-xs leading-relaxed flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note importante :</strong> Comme il s'agit d'une association solidaire, 
                une seule réservation est autorisée par personne. Chaque place compte !
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmer ma réservation
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="w-full bg-transparent hover:bg-slate-800 text-slate-400 py-3 rounded-2xl transition-all text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
