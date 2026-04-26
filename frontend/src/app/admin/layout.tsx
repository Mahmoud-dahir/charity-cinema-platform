import React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Building, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1a1a] text-white flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#facc15]" />
            AdminPanel
          </Link>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 bg-[#333] text-white px-4 py-3 rounded-xl font-medium">
            <Building className="w-5 h-5 text-[#facc15]" />
            <span>Demandes d'Asso</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 text-gray-400 hover:bg-[#333] hover:text-white px-4 py-3 rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5" />
            <span>Utilisateurs</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
