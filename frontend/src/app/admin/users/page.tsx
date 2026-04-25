"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Mail, Building, ShieldCheck } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
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
        // 2. Fetch all users
        return fetch("/api/admin/users");
      })
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUsers(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-2 flex items-center gap-3">
        <Users className="w-8 h-8 text-[#facc15]" />
        Gestion des Utilisateurs
      </h1>
      <p className="text-gray-500 mb-8">Consultez la liste de tous les utilisateurs inscrits et leurs associations.</p>

      <Card className="shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th scope="col" className="px-6 py-4">Utilisateur</th>
                <th scope="col" className="px-6 py-4">Contact</th>
                <th scope="col" className="px-6 py-4">Rôle</th>
                <th scope="col" className="px-6 py-4">Association</th>
                <th scope="col" className="px-6 py-4 text-right">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#facc15] flex items-center justify-center font-bold text-xs">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div>
                        <div className="font-bold">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_staff || user.user_type === 'admin' ? (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-purple-200">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200">
                        Membre
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.has_association ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">
                        <Building className="w-3 h-3" /> {user.association_name || "Association"}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Aucune</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-gray-400">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
