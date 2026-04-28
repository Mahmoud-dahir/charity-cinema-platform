"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(res => res.ok ? res.json() : null),
      fetch("/api/events/categories/").then(res => res.ok ? res.json() : [])
    ])
      .then(([userData, categoriesData]) => {
        if (!userData) {
          router.replace("/");
          return;
        }
        setUser(userData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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
      const formDataToSend = new FormData();
      
      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Append categories (slugs)
      selectedCategories.forEach(slug => {
        formDataToSend.append("categories", slug);
      });

      // Append cover image
      if (coverImage) {
        formDataToSend.append("cover_image", coverImage);
      }

      // Append additional images
      additionalImages.forEach(img => {
        formDataToSend.append("images", img);
      });

      const res = await fetch("/api/events/", {
        method: "POST",
        body: formDataToSend,
        // Don't set Content-Type header when using FormData with fetch
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

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans">
      {/* Header */}
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <Sidebar user={user} />

        {/* Main Content Area */}
        <div className="flex-1">
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

                {/* Category Selection */}
                <div className="space-y-3">
                  <Label>Catégories</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          selectedCategories.includes(cat.slug)
                            ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cover_image">Image de couverture *</Label>
                    <div 
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-yellow-400 transition-colors cursor-pointer relative group h-32 flex flex-col items-center justify-center"
                      onClick={() => document.getElementById("cover_image_input")?.click()}
                    >
                      {coverImage ? (
                        <div className="absolute inset-0 p-2">
                          <img 
                            src={URL.createObjectURL(coverImage)} 
                            className="w-full h-full object-cover rounded-lg" 
                            alt="Cover preview" 
                          />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCoverImage(null); }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <ImagePlus className="w-6 h-6 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Cliquez pour ajouter l'affiche</span>
                        </>
                      )}
                      <input 
                        id="cover_image_input"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Images additionnelles</Label>
                    <div 
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-yellow-400 transition-colors cursor-pointer h-32 flex flex-col items-center justify-center"
                      onClick={() => document.getElementById("additional_images_input")?.click()}
                    >
                      <ImagePlus className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">
                        {additionalImages.length > 0 
                          ? `${additionalImages.length} image(s) sélectionnée(s)` 
                          : "Ajouter d'autres photos"}
                      </span>
                      <input 
                        id="additional_images_input"
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={(e) => setAdditionalImages(Array.from(e.target.files || []))}
                      />
                    </div>
                    {additionalImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {additionalImages.map((img, idx) => (
                          <div key={idx} className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border relative group">
                             <img src={URL.createObjectURL(img)} className="w-full h-full object-cover rounded" alt="Preview" />
                             <button 
                                type="button"
                                onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2 h-2" />
                              </button>
                          </div>
                        ))}
                      </div>
                    )}
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
    </div>
  );
}
