"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, Calendar, Heart, User, Building, Film } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { AssociationRequestForm } from "@/components/association/AssociationRequestForm";

export default function AssociationPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      }),
      fetch("/api/association-requests").then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
    ])
      .then(([userData, requestsData]) => {
        setUser(userData);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
        setIsLoading(false);
      })
      .catch(() => {
        router.replace("/");
      });
  }, [router]);

  const handleSubmitRequest = async (data: { name: string; description: string; website_url: string }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/association-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newReq = await res.json();
        setRequests([newReq, ...requests]);
      } else {
        alert("Erreur lors de la création de la demande.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentRequest = requests.length > 0 ? requests[0] : null;

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans">
      {/* Header */}
      <Header user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <Sidebar user={user} />

        {/* Content Area */}
        <main className="flex-1">
          <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-8">Mon Association</h1>
          
          {user?.has_association ? (
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-8 text-center py-16">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {user.association_name || "Association"}
              </h3>
              <p className="text-sm font-medium text-green-600 mb-6 bg-green-50 inline-block px-3 py-1 rounded-full border border-green-100">
                Vous êtes membre de cette association
              </p>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Vous pouvez désormais créer et publier des événements au nom de votre association.
              </p>
              <Link href="/dashboard/events" className="inline-block bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full transition-colors shadow-sm">
                Gérer les événements
              </Link>
            </div>
          ) : currentRequest ? (
             <div className={`bg-white rounded-2xl shadow-sm border p-8 text-center py-16 ${currentRequest.status === 'pending' ? 'border-yellow-200' : currentRequest.status === 'rejected' ? 'border-red-200' : 'border-green-200'}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${currentRequest.status === 'pending' ? 'bg-yellow-50' : currentRequest.status === 'rejected' ? 'bg-red-50' : 'bg-green-50'}`}>
                <Building className={`w-10 h-10 ${currentRequest.status === 'pending' ? 'text-yellow-500' : currentRequest.status === 'rejected' ? 'text-red-500' : 'text-green-500'}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentRequest.status === 'pending' && "Demande en cours d'examen"}
                {currentRequest.status === 'approved' && "Demande approuvée !"}
                {currentRequest.status === 'rejected' && "Demande refusée"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {currentRequest.status === 'pending' && "Votre demande pour créer l'association est actuellement en attente de validation par nos administrateurs."}
                {currentRequest.status === 'approved' && "Félicitations, vous pouvez maintenant publier vos évènements !"}
                {currentRequest.status === 'rejected' && (currentRequest.review_note || "Votre demande n'a malheureusement pas pu être acceptée.")}
              </p>
            </div>
          ) : (
            <AssociationRequestForm onSubmit={handleSubmitRequest} isLoading={isSubmitting} />
          )}
        </main>
      </div>
    </div>
  );
}
