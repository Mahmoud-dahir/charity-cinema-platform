"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Calendar, Heart, Building, Film, ShieldAlert } from "lucide-react";

interface SidebarProps {
  user: any;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              isActive("/dashboard") && !pathname.startsWith("/dashboard/")
                ? "bg-yellow-50 text-black font-bold border border-yellow-100" 
                : "text-gray-500 hover:bg-gray-50 hover:text-black font-medium"
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${isActive("/dashboard") && !pathname.startsWith("/dashboard/") ? "text-[#facc15]" : ""}`} />
            <span>Tableau de bord</span>
          </Link>
          
          <a href="#" className="flex items-center space-x-3 text-gray-500 hover:bg-gray-50 hover:text-black px-4 py-3 rounded-xl font-medium transition-colors">
            <Calendar className="w-5 h-5" />
            <span>Mes réservations</span>
          </a>
          
          <a href="#" className="flex items-center space-x-3 text-gray-500 hover:bg-gray-50 hover:text-black px-4 py-3 rounded-xl font-medium transition-colors">
            <Heart className="w-5 h-5" />
            <span>Favoris</span>
          </a>
          
          <a href="#" className="flex items-center space-x-3 text-gray-500 hover:bg-gray-50 hover:text-black px-4 py-3 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </a>
          
          {user?.has_association && (
            <Link 
              href="/dashboard/events" 
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive("/dashboard/events") 
                  ? "bg-yellow-50 text-black font-bold border border-yellow-100" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-black font-medium"
              }`}
            >
              <Film className={`w-5 h-5 ${isActive("/dashboard/events") ? "text-[#facc15]" : ""}`} />
              <span>Mes événements</span>
            </Link>
          )}
          
          <Link 
            href="/dashboard/association" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              isActive("/dashboard/association") 
                ? "bg-yellow-50 text-black font-bold border border-yellow-100" 
                : "text-gray-500 hover:bg-gray-50 hover:text-black font-medium"
            }`}
          >
            <Building className={`w-5 h-5 ${isActive("/dashboard/association") ? "text-[#facc15]" : ""}`} />
            <span>Mon association</span>
          </Link>
          
          {user?.is_staff && (
            <Link href="/admin" className="flex items-center space-x-3 text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 px-4 py-3 rounded-xl font-bold transition-colors mt-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Panel Admin</span>
            </Link>
          )}
        </nav>
      </div>
    </aside>
  );
}
