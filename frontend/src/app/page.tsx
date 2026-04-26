"use client";

import React, { useState, useEffect } from 'react';
import { Search, User, SlidersHorizontal, Heart, LayoutDashboard, Calendar, MapPin, Play, Ticket, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import LoginModal from './login/page';
import RegisterModal from './register/page';
// import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
    <motion.div 
      variants={fadeInUp}
      className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-2xl hover:border-yellow-500/30 hover:-translate-y-2 transition-all duration-300 group relative"
    >
      <div 
        className="w-full h-64 sm:h-72 bg-slate-800 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-300"></div>
        {tag && (
          <div className="absolute top-4 left-4 bg-yellow-500 px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 z-10">
            <Heart className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-900 tracking-wider uppercase">{tag}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="bg-yellow-500/90 p-4 rounded-full text-slate-900 transform scale-75 group-hover:scale-100 transition-transform duration-300 backdrop-blur-sm shadow-[0_0_30px_rgba(234,179,8,0.5)]">
            <Play className="w-6 h-6 fill-slate-900" />
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow justify-between relative bg-slate-900 z-10 -mt-6 rounded-t-2xl">
        {hasDetails ? (
          <>
            <div className="mb-5">
              <h3 className="font-extrabold text-white text-xl leading-snug mb-3 group-hover:text-yellow-400 transition-colors drop-shadow-sm line-clamp-2">{title}</h3>
              <div className="space-y-2.5">
                <div className="flex items-center text-slate-300">
                  <Calendar className="w-4 h-4 mr-2.5 text-yellow-500" />
                  <p className="text-sm font-medium">{date}</p>
                </div>
                <div className="flex items-start text-slate-400">
                  <MapPin className="w-4 h-4 mr-2.5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm line-clamp-2">{location}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 items-center mt-auto pt-4 border-t border-slate-800/80">
              <button className="bg-slate-800 p-2.5 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors text-slate-400 hover:text-red-500 group/heart border border-slate-700/50 shrink-0">
                <Heart className="w-5 h-5 group-hover/heart:fill-red-500 transition-all" />
              </button>
              <button className="bg-transparent border border-slate-700 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:border-slate-500 hover:text-white transition-colors flex-1 text-center">
                Détails
              </button>
              <button className="bg-yellow-500 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all flex-1 text-center flex items-center justify-center">
                <Ticket className="w-4 h-4 mr-1.5" />
                Réserver
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center py-8">
            <p className="text-slate-500 text-sm font-medium italic">Programmations à venir...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not auth');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setIsAuthLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsAuthLoading(false);
      });

    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      })
      .finally(() => {
        setIsEventsLoading(false);
      });
  }, []);


  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-yellow-500 selection:text-slate-900 text-slate-200">
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

        <div className="flex items-center space-x-3 md:space-x-4">
          {isAuthLoading ? (
            <div className="w-24 md:w-32 h-9 bg-slate-800 animate-pulse rounded-full"></div>
          ) : user ? (
            <Link href="/dashboard" className="flex items-center space-x-2 md:space-x-3 cursor-pointer group">
              <div className="bg-yellow-500 text-slate-900 p-2 rounded-full group-hover:bg-yellow-400 transition-colors shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                <LayoutDashboard className="w-4 h-4 md:w-4 md:h-4" />
              </div>
              <span className="text-xs md:text-sm font-semibold hover:text-white hidden sm:block transition-colors text-slate-300">Mon Espace</span>
            </Link>
          ) : (
            <div 
              className="flex items-center space-x-2 md:space-x-3 cursor-pointer group bg-slate-900 rounded-full pr-4 p-1 border border-slate-800 hover:border-slate-700 transition-colors"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <div className="bg-yellow-500 text-slate-900 p-1.5 md:p-2 rounded-full group-hover:bg-yellow-400 transition-transform hover:scale-105 active:scale-95 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-slate-300 group-hover:text-white hidden sm:block transition-colors">S'identifier</span>
            </div>
          )}
          
          <div className="flex items-center cursor-pointer group">
            <div className="bg-slate-900 text-slate-400 hover:text-white p-2.5 rounded-full group-hover:bg-slate-800 transition-all border border-slate-800 hover:border-slate-700">
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-[400px] md:h-[550px] bg-cover bg-center flex items-center overflow-hidden"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col md:items-start items-center text-center md:text-left mt-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-widest uppercase mb-6">
              Vivez l'émotion, soutenez l'action
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-white text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] drop-shadow-2xl tracking-tight">
              Le Cinéma qui a du <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-sm">Cœur</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-slate-300 text-lg md:text-xl font-medium max-w-xl drop-shadow-md mb-8 leading-relaxed">
              Vos places de cinéma se transforment en dons pour soutenir directement des milliers d'associations de votre région. Un billet, un impact.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button className="bg-yellow-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-sm md:text-base hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center">
                <Ticket className="w-5 h-5 mr-2" />
                Découvrir les séances
              </button>
              <button className="bg-slate-900/60 backdrop-blur-md text-white border border-slate-700 px-8 py-4 rounded-xl font-bold text-sm md:text-base hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center justify-center">
                <Play className="w-5 h-5 mr-2 fill-white" />
                Voir la bande-annonce
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mt-4 relative z-10 hidden sm:flex">
        <ul className="flex space-x-8 border-b border-slate-800 w-full mb-8">
          <li className="pb-4 border-b-2 border-yellow-500 text-white font-bold tracking-wide uppercase text-sm">À l'affiche étudiante</li>
          <li className="pb-4 text-slate-500 hover:text-slate-300 font-medium cursor-pointer transition-colors tracking-wide uppercase text-sm">Prochainement</li>
          <li className="pb-4 text-slate-500 hover:text-slate-300 font-medium cursor-pointer transition-colors tracking-wide uppercase text-sm">Avant-premières solidaires</li>
        </ul>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 relative z-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-4 sm:hidden">
          <div>
            <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Séances en salle</h2>
            <p className="text-slate-400 font-medium text-sm">Faites une bonne action avec chaque visionnage.</p>
          </div>
          <Link href="/events" className="text-yellow-500 font-bold text-sm hover:text-yellow-400 transition-colors pb-1 w-fit group flex items-center">
            Voir tout l'agenda <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
        >
          {isEventsLoading ? (
            <div className="col-span-full py-12 flex justify-center">
              <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <p>Aucun événement prévu pour le moment.</p>
            </div>
          ) : (
            events.map((event) => {
              const dateObj = new Date(event.starts_at);
              const formattedDate = "Le " + dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
              
              return (
                <MovieCard 
                  key={event.id}
                  title={event.movie_title || event.title}
                  date={formattedDate}
                  location={event.location}
                  imageUrl={event.cover_image || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop"}
                  tag={event.association_name ? `Par ${event.association_name}` : undefined}
                  hasDetails={true}
                />
              );
            })
          )}
        </motion.div>
      </main>

      {/* Newsletter / CTA Section */}
      <section className="border-t border-slate-900 bg-slate-900/50 mt-12 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-slate-800 rounded-2xl mb-6 shadow-inner">
            <Mail className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Ne ratez aucune séance !</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-lg">Inscrivez-vous à notre newsletter pour être informé des prochaines diffusions, des événements spéciaux et de l'impact de nos actions solidaires.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Votre adresse e-mail" 
              className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl py-3.5 px-5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-slate-500"
            />
            <button className="bg-yellow-500 text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:bg-yellow-400 hover:shadow-lg transition-all whitespace-nowrap">
              S'inscrire
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 border-b border-slate-800 pb-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="space-y-6 lg:pr-8">
              <Link href="/" className="text-3xl font-bold tracking-tight text-white inline-block flex items-center">
                <Play className="w-6 h-6 mr-2 text-yellow-500 fill-yellow-500" />
                Cinem<span className="text-yellow-500">Action</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                La plateforme solidaire dédiée au 7ème art. Réunir les cinéphiles pour financer des associations caritatives et locales en un clic.
              </p>
              <div className="flex space-x-3 pt-2">
                <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-yellow-500 hover:bg-slate-800 transition-all">Facebook</a>
                <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-yellow-500 hover:bg-slate-800 transition-all">Twitter</a>
                <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-yellow-500 hover:bg-slate-800 transition-all">Instagram</a>
                <a href="#" className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-yellow-500 hover:bg-slate-800 transition-all">Youtube</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2.5"></div>
                Explorer
              </h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-yellow-500 transition-colors text-sm flex items-center group"><ChevronRight className="w-3.5 h-3.5 mr-2 opacity-0 group-hover:opacity-100 transition-transform -translate-x-2 group-hover:translate-x-0" /> À l'affiche</a></li>
                <li><a href="#" className="text-slate-400 hover:text-yellow-500 transition-colors text-sm flex items-center group"><ChevronRight className="w-3.5 h-3.5 mr-2 opacity-0 group-hover:opacity-100 transition-transform -translate-x-2 group-hover:translate-x-0" /> Associations partenaires</a></li>
                <li><a href="#" className="text-slate-400 hover:text-yellow-500 transition-colors text-sm flex items-center group"><ChevronRight className="w-3.5 h-3.5 mr-2 opacity-0 group-hover:opacity-100 transition-transform -translate-x-2 group-hover:translate-x-0" /> Salles participantes</a></li>
                <li><a href="#" className="text-slate-400 hover:text-yellow-500 transition-colors text-sm flex items-center group"><ChevronRight className="w-3.5 h-3.5 mr-2 opacity-0 group-hover:opacity-100 transition-transform -translate-x-2 group-hover:translate-x-0" /> Impact social</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2.5"></div>
                Légal
              </h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Conditions générales d'utilisation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Confidentialité & Données</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Mentions légales</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Aide et Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2.5"></div>
                L'Application
              </h4>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">Emportez vos séances solidaires de poche. Bientôt disponible.</p>
              <div className="flex flex-col space-y-3">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center cursor-not-allowed opacity-70">
                  <div className="bg-slate-800 p-2 rounded-lg mr-3">
                     <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z"/>
                     </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Bientôt sur</p>
                    <p className="text-sm text-white font-bold">App Store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} CinemAction. Tous droits réservés.</p>
          <p className="mt-3 md:mt-0 flex items-center bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            Fait avec <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-1.5 animate-pulse" /> pour un monde solidaire
          </p>
        </div>
      </footer>
    </div>
  );
}
