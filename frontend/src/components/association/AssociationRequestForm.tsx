"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AssociationRequestFormProps {
  onSubmit: (data: { name: string; description: string; website_url: string }) => Promise<void>;
  isLoading: boolean;
}

export function AssociationRequestForm({ onSubmit, isLoading }: AssociationRequestFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description, website_url: websiteUrl });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Créer votre association</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour demander la création de votre association sur la plateforme.
          Un administrateur examinera votre demande.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'association *</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: CinéClub Lyon"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les activités de votre association..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Site Web</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isLoading} className="bg-[#facc15] text-black hover:bg-yellow-500 font-bold">
            {isLoading ? "Soumission en cours..." : "Soumettre la demande"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
