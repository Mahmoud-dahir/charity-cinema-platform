"use client"

import React from 'react';
import { X, Calendar, MapPin, AlertCircle, Trash2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function CancelReservationModal({ 
  isOpen, 
  onClose, 
  event, 
  onConfirm,
  isLoading 
}: CancelReservationModalProps) {
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
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500/10 p-3 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Annulation</h2>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5 mb-8 border border-slate-700/50">
            <p className="text-slate-400 text-sm mb-2 font-medium uppercase tracking-wider">Vous allez annuler votre place pour :</p>
            <h3 className="font-bold text-white text-lg mb-3">{event.movie_title || event.title}</h3>
            
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-3 text-red-400" />
                <span>{new Date(event.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 mr-3 text-red-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{event.location}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8">
            <p className="text-red-200 text-xs leading-relaxed flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Attention :</strong> Cette action libérera votre place. Si la séance est complète plus tard, vous ne pourrez peut-être plus vous réinscrire.
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Confirmer l'annulation
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="w-full bg-transparent hover:bg-slate-800 text-slate-400 py-3 rounded-2xl transition-all text-sm font-medium"
            >
              Garder ma place
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
