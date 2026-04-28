"use client";

import React, { useEffect } from "react";
import { X, Calendar, MapPin, Users, Tag, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrouillonModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function BrouillonModal({ event, isOpen, onClose }: BrouillonModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!event || !isOpen) return null;

  const startDate = new Date(event.starts_at);
  const formattedDate = startDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 flex items-center justify-center p-4 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 p-6 relative flex-shrink-0 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Aperçu Brouillon</span>
          </div>
          <h2 className="text-white text-2xl font-extrabold leading-tight">
            {event.movie_title || event.title}
          </h2>
          {event.association_name && (
            <div className="flex items-center gap-1.5 mt-2">
              <Building className="w-4 h-4 text-[#facc15]" />
              <span className="text-yellow-300 text-sm font-semibold">{event.association_name}</span>
            </div>
          )}
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
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Capacité prévue</p>
                    <p className="text-sm font-bold text-gray-800">{event.capacity} places</p>
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            {event.categories && event.categories.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {event.categories.map((cat: any) => (
                    <Badge key={cat.id} className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 px-3 py-1 text-xs transition-colors">
                      <Tag className="w-3 h-3 mr-1" />
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* All Images */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Affiches et photos</h3>
              <div className="flex flex-col gap-4">
                {event.cover_image && (
                  <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-2">
                    <img 
                      src={event.cover_image} 
                      alt="Affiche principale" 
                      className="max-w-full h-auto object-contain rounded-lg shadow-sm" 
                      style={{ maxHeight: "70vh" }}
                    />
                  </div>
                )}
                {event.images && event.images.map((img: any) => (
                  <div key={img.id} className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-2">
                    <img 
                      src={img.image} 
                      alt={img.alt_text || "Image additionnelle"} 
                      className="max-w-full h-auto object-contain rounded-lg shadow-sm" 
                      style={{ maxHeight: "70vh" }}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
