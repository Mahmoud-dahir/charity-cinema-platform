"use client";

import React from "react";
import Link from "next/link";
import { Play, Search, User, LogOut } from "lucide-react";

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur-md text-white py-4 px-4 md:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-y-4 gap-x-6 sticky top-0 z-50 border-b border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity flex items-center">
        <Play className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
        Cinem<span className="text-yellow-500">Action</span>
      </Link>
      
      <div className="relative w-full md:flex-1 max-w-xl order-last md:order-none hidden sm:block">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un film, un lieu, une asso..."
          className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-full py-2 pl-11 pr-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder-slate-500 text-sm"
        />
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500 text-slate-900 p-2 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                <User className="w-4 h-4 md:w-4 md:h-4" />
              </div>
              <span className="text-sm font-semibold hidden md:block text-slate-300">
                {user.first_name} {user.last_name}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors bg-slate-900 p-2 rounded-full border border-slate-800 hover:border-slate-700"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </>
        ) : (
          <div className="w-32 h-9 bg-slate-800 animate-pulse rounded-full"></div>
        )}
      </div>
    </header>
  );
}
