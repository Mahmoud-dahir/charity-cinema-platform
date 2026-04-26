"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Search, User, LogOut, Film, Building, MapPin } from "lucide-react";

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<{ events: any[]; associations: any[] }>({
    events: [],
    associations: [],
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setResults({ events: [], associations: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const [eventsRes, associationsRes] = await Promise.all([
          fetch(`/api/events/?q=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/associations/?q=${encodeURIComponent(searchQuery)}`),
        ]);

        const events = eventsRes.ok ? await eventsRes.json() : [];
        const associations = associationsRes.ok ? await associationsRes.json() : [];

        setResults({
          events: Array.isArray(events) ? events : [],
          associations: Array.isArray(associations) ? associations : [],
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const handleResultClick = (type: string, item: any) => {
    console.log(`Clicked on ${type}:`, item);
    setShowDropdown(false);
    setSearchQuery("");
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur-md text-white py-4 px-4 md:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-y-4 gap-x-6 sticky top-0 z-50 border-b border-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity flex items-center">
        <Play className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
        Cinem<span className="text-yellow-500">Action</span>
      </Link>
      
      <div className="relative w-full md:flex-1 max-w-xl order-last md:order-none hidden sm:block" ref={dropdownRef}>
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
            setIsSearching(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Rechercher un film, un lieu, une asso..."
          className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-full py-2 pl-11 pr-6 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder-slate-500 text-sm"
        />

        {/* Search Dropdown */}
        {showDropdown && searchQuery.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Recherche en cours...
              </div>
            ) : results.events.length === 0 && results.associations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Aucun résultat trouvé pour "{searchQuery}"
              </div>
            ) : (
              <div className="py-2">
                {results.events.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                      Événements & Lieux
                    </div>
                    {results.events.map((event: any) => (
                      <button
                        key={event.id}
                        onClick={() => handleResultClick("event", event)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex flex-col border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="font-semibold text-gray-900 line-clamp-1">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 pl-6">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 line-clamp-1">{event.location}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.associations.length > 0 && (
                  <div>
                    <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-gray-100">
                      Associations
                    </div>
                    {results.associations.map((asso: any) => (
                      <button
                        key={asso.id}
                        onClick={() => handleResultClick("association", asso)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center flex-shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{asso.name}</div>
                          {asso.description && (
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{asso.description}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
