"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Globe, User } from "lucide-react";

interface RequestCardProps {
  request: any;
  onApprove: (id: string, note?: string) => Promise<void>;
  onReject: (id: string, note?: string) => Promise<void>;
}

export function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(request.id, note);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!note) {
      alert("Veuillez fournir une raison (note) pour le refus.");
      return;
    }
    setIsProcessing(true);
    await onReject(request.id, note);
    setIsProcessing(false);
  };

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {request.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <User className="w-4 h-4" />
              Demandé par : {request.requested_by?.first_name} {request.requested_by?.last_name} ({request.requested_by?.email})
            </CardDescription>
          </div>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200">
            En attente
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
          <p className="text-gray-900 text-sm whitespace-pre-wrap">{request.description || "Aucune description fournie."}</p>
        </div>
        
        {request.website_url && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Site Web</h4>
            <a href={request.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {request.website_url}
            </a>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Note / Raison (Optionnel pour acceptation)</h4>
          <textarea
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Un mot pour le demandeur..."
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 pt-4 border-t bg-gray-50 rounded-b-xl">
        <Button 
          variant="outline" 
          onClick={handleReject} 
          disabled={isProcessing}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Refuser
        </Button>
        <Button 
          onClick={handleApprove} 
          disabled={isProcessing}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approuver
        </Button>
      </CardFooter>
    </Card>
  );
}
