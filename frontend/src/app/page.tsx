"use client";

import React, { useState } from 'react';
import { Search, User, SlidersHorizontal, Heart } from 'lucide-react';
import LoginModal from './login/page';
import RegisterModal from './register/page';

const MovieCard = ({ 
  title, 
  date, 
  location, 
  imageUrl, 
  tag, 
  hasDetails 
}: { 
  title?: string, 
  date?: string, 
  location?: string, 
  imageUrl: string, 
  tag?: string,
  hasDetails?: boolean 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-row h-[220px] shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="w-5/12 sm:w-1/2 bg-gray-200 bg-cover bg-center h-full relative"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      
      <div className="w-7/12 sm:w-1/2 p-4 flex flex-col justify-between relative">
        {hasDetails && (
          <>
            <div>
              <h3 className="font-extrabold text-[#1a1a1a] text-lg leading-tight mb-1">{title}</h3>
              <p className="text-xs text-gray-600 font-medium">{date}</p>
              <p className="text-xs text-gray-500">{location}</p>
            </div>
            
            {tag && (
              <div className="absolute top-1/2 left-0 -translate-x-12 -translate-y-1/2 bg-[#facc15] px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-2 z-10 w-fit">
                <Heart className="w-3 h-3 text-[#1a1a1a] fill-[#1a1a1a]" />
                <span className="text-[10px] font-bold text-[#1a1a1a]">{tag}</span>
              </div>
            )}
            
            <div className="flex gap-2 items-center mt-4">
              <button className="bg-[#facc15] p-2 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors">
                <Heart className="w-4 h-4 text-[#1a1a1a] fill-[#1a1a1a]" />
              </button>
              <button className="bg-[#facc15] px-3 py-2 rounded-lg text-[10px] font-bold text-[#1a1a1a] hover:bg-yellow-500 transition-colors uppercase flex-1 text-center">
                Participer
              </button>
              <button className="bg-[#facc15] px-3 py-2 rounded-lg text-[10px] font-bold text-[#1a1a1a] hover:bg-yellow-500 transition-colors uppercase flex-1 text-center">
                Détails
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const cards = [
    {
      title: "Bohemian Rapsody",
      date: "Le 10 mars 2026",
      location: "Place Ambroise Courtois - Lyon 8e",
      imageUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=500&auto=format&fit=crop",
      tag: "Par les restos du cœur",
      hasDetails: true,
    },
    { imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=500&auto=format&fit=crop" },
    { imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500&auto=format&fit=crop" },
    { imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=500&auto=format&fit=crop" },
    { imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=500&auto=format&fit=crop" },
    { imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop" },
    { imageUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=500&auto=format&fit=crop" },
    { imageUrl: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=500&auto=format&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans">
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Header / Navbar */}
      <header className="bg-[#1a1a1a] text-white py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="text-2xl font-bold tracking-tight">
          Nom<span className="text-[#facc15]">Application</span>
        </div>
        
        <div className="relative w-full max-w-lg hidden md:block">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un film, une asso..."
            className="w-full bg-[#333333] border border-gray-600 text-white rounded-full py-2.5 pl-12 pr-6 focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-all"
          />
        </div>

        <div className="flex items-center space-x-8">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setIsLoginModalOpen(true)}
          >
            <div className="bg-[#facc15] text-[#1a1a1a] p-2 rounded-full group-hover:bg-yellow-400 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium hover:text-gray-300">Connexion/Inscription</span>
          </div>
          
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="bg-[#facc15] text-[#1a1a1a] p-2 rounded-full group-hover:bg-yellow-400 transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium hover:text-gray-300">Filtrer</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-[250px] md:h-[350px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop")' }}
      >
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold text-center px-4 drop-shadow-lg tracking-tight">
          Le <span className="text-[#facc15]">Slogan</span> de L&apos;application
        </h1>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-0">
        <h2 className="text-[#1a1a1a] text-3xl font-extrabold mb-8 tracking-tight">Prochaines Séances Solidaires</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {cards.map((card, index) => (
            <MovieCard 
              key={index}
              title={card.title}
              date={card.date}
              location={card.location}
              imageUrl={card.imageUrl}
              tag={card.tag}
              hasDetails={card.hasDetails}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
