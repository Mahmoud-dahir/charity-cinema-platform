"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building, ShieldAlert, Tag } from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Demandes d'Asso", icon: Building, exact: true },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/categories", label: "Catégories", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
        <nav className="mt-6 px-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive ? "bg-[#facc15] text-gray-900" : "text-gray-400 hover:bg-[#333] hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
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
