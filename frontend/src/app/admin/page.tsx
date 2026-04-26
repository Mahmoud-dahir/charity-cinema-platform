"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequestCard } from "@/components/admin/RequestCard";

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Verify user is admin
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((user) => {
        if (!user.is_staff) {
          router.replace("/dashboard");
          return;
        }
        // 2. Fetch requests
        return fetch("/api/association-requests");
      })
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Failed to fetch requests");
        return res.json();
      })
      .then((data) => {
        if (data) {
          // Filter only PENDING requests for the admin view
          const pending = Array.isArray(data) 
            ? data.filter(r => r.status === 'pending')
            : [];
          setRequests(pending);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleApprove = async (id: string, note?: string) => {
    try {
      const res = await fetch(`/api/association-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_note: note }),
      });
      if (res.ok) {
        setRequests(requests.filter((r) => r.id !== id));
      } else {
        alert("Erreur lors de l'approbation.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };

  const handleReject = async (id: string, note?: string) => {
    try {
      const res = await fetch(`/api/association-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_note: note }),
      });
      if (res.ok) {
        setRequests(requests.filter((r) => r.id !== id));
      } else {
        alert("Erreur lors du refus.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">Demandes d'Associations</h1>
      <p className="text-gray-500 mb-8">Examinez et approuvez les demandes de création d'associations.</p>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune demande en attente</h3>
          <p className="text-gray-500">Toutes les demandes ont été traitées.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {requests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onApprove={handleApprove} 
              onReject={handleReject} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
