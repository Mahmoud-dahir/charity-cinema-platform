"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Film, CheckCircle, XCircle } from "lucide-react";

interface EventCardProps {
  event: any;
  onPublish: (id: string) => Promise<void>;
  onCancel: (id: string, reason: string) => Promise<void>;
}

export function EventCard({ event, onPublish, onCancel }: EventCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  const handlePublish = async () => {
    setIsProcessing(true);
    await onPublish(event.id);
    setIsProcessing(false);
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      alert("Veuillez fournir une raison d'annulation.");
      return;
    }
    setIsProcessing(true);
    await onCancel(event.id, cancelReason);
    setIsProcessing(false);
    setShowCancelPrompt(false);
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case "draft":
        return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200">Brouillon</span>;
      case "published":
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">Publié</span>;
      case "cancelled":
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200">Annulé</span>;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm border border-gray-100 flex flex-col h-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold mb-1">{event.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Film className="w-4 h-4" />
              {event.movie_title}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(event.starts_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>Capacité: {event.capacity ? event.capacity : "Illimitée"}</span>
        </div>
        
        <p className="text-sm text-gray-700 mt-4 line-clamp-3">
          {event.description}
        </p>

        {event.status === "cancelled" && event.cancel_reason && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-100">
            <strong>Raison de l'annulation:</strong> {event.cancel_reason}
          </div>
        )}

        {showCancelPrompt && event.status !== "cancelled" && (
          <div className="mt-4 space-y-2 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm font-semibold text-gray-700">Confirmer l'annulation</p>
            <textarea
              className="w-full text-sm p-2 border rounded-md"
              placeholder="Raison de l'annulation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowCancelPrompt(false)} disabled={isProcessing}>
                Retour
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCancel} disabled={isProcessing}>
                Confirmer
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {!showCancelPrompt && event.status !== "cancelled" && (
        <CardFooter className="flex justify-end gap-3 pt-4 border-t bg-gray-50 rounded-b-xl">
          <Button 
            variant="outline" 
            onClick={() => setShowCancelPrompt(true)} 
            disabled={isProcessing}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          
          {event.status === "draft" && (
            <Button 
              onClick={handlePublish} 
              disabled={isProcessing}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Publier
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
