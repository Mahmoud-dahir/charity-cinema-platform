"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    movie_title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    location: "",
    capacity: "",
  });
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        router.replace("/");
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = { ...formData };
      if (payload.capacity) {
        payload.capacity = parseInt(payload.capacity, 10);
      } else {
        delete payload.capacity;
      }
      
      if (!payload.ends_at) {
        delete payload.ends_at;
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/events");
      } else {
        const errorData = await res.json().catch(() => null);
        alert(`Erreur lors de la création de l'événement. ${errorData ? JSON.stringify(errorData) : ""}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans">
      {/* Header */}
      <Header user={user} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-6">
          <Link href="/dashboard/events" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour à mes événements
          </Link>
        </div>

        <Card className="shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Créer un nouvel événement</CardTitle>
            <CardDescription>
              L'événement sera d'abord enregistré comme <strong>Brouillon</strong>. 
              Vous pourrez le publier plus tard pour qu'il soit visible par tous.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Soirée IMAX Interstellar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="movie_title">Titre du film *</Label>
                  <Input
                    id="movie_title"
                    name="movie_title"
                    required
                    value={formData.movie_title}
                    onChange={handleChange}
                    placeholder="Ex: Interstellar"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Détails sur l'événement, les invités spéciaux, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Date et heure de début *</Label>
                  <Input
                    id="starts_at"
                    name="starts_at"
                    type="datetime-local"
                    required
                    value={formData.starts_at}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends_at">Date et heure de fin (optionnel)</Label>
                  <Input
                    id="ends_at"
                    name="ends_at"
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu *</Label>
                  <Input
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Cinéma Pathé Bellecour"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité max (optionnel)</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Ex: 150 (Laissez vide si illimité)"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-6 border-t bg-gray-50 rounded-b-xl">
              <Button type="button" variant="outline" className="mr-3" onClick={() => router.push("/dashboard/events")}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-[#1a1a1a] text-white hover:bg-gray-800">
                {isLoading ? "Enregistrement..." : "Créer le brouillon"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
