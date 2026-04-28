"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Calendar, MapPin, Play, Ticket, Mail, ChevronRight, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import LoginModal from './login/page';
import RegisterModal from './register/page';
import { Header } from '@/components/dashboard/Header';
import { EventsList } from '@/components/events/EventsList';
import { EventDrawer } from '@/components/events/EventDrawer';
import ReservationModal from '@/components/events/ReservationModal';
import { CheckCircle2 } from 'lucide-react';


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


export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<any>>(new Set());
  const [signedUpIds, setSignedUpIds] = useState<Set<any>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const evts = Array.isArray(data) ? data : [];
        setEvents(evts);
        // Use the per-event annotations — no extra round trips needed
        setFavoritedIds(new Set(evts.filter((e: any) => e.is_favorited).map((e: any) => e.id)));
        setSignedUpIds(new Set(evts.filter((e: any) => e.is_signed_up).map((e: any) => e.id)));
      })
      .catch(() => {
        setEvents([]);
      })
      .finally(() => {
        setIsEventsLoading(false);
      });
  }, []);


  const handleFavorite = async (event: any) => {
    if (!user) { setIsLoginModalOpen(true); return; }
    const isFav = favoritedIds.has(event.id);
    const method = isFav ? "DELETE" : "POST";
    const res = await fetch(`/api/events/${event.id}/favorite/`, { method });
    if (res.ok || res.status === 204) {
      setFavoritedIds(prev => {
        const next = new Set(prev);
        isFav ? next.delete(event.id) : next.add(event.id);
        return next;
      });
      setEvents(prev => prev.map(e => 
        e.id === event.id 
          ? { ...e, favorites_count: e.favorites_count + (isFav ? -1 : 1) }
          : e
      ));
    }
  };

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

      <Header 
        user={user} 
        isAuthLoading={isAuthLoading} 
        onLoginClick={() => setIsLoginModalOpen(true)} 
      />

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mt-4 relative z-10 hidden sm:flex">
        <ul className="flex space-x-8 border-b border-slate-800 w-full mb-8">
          <li className="pb-4 border-b-2 border-yellow-500 text-white font-bold tracking-wide uppercase text-sm">À l'affiche étudiante</li>
          <li className="pb-4 text-slate-500 hover:text-slate-300 font-medium cursor-pointer transition-colors tracking-wide uppercase text-sm">Prochainement</li>
          <li className="pb-4 text-slate-500 hover:text-slate-300 font-medium cursor-pointer transition-colors tracking-wide uppercase text-sm">Avant-premières solidaires</li>
        </ul>
      </div>

      <EventsList 
        events={events}
        isLoading={isEventsLoading}
        user={user}
        favoritedIds={favoritedIds}
        signedUpIds={signedUpIds}
        onFavorite={handleFavorite}
        onDetails={(event) => { setSelectedEvent(event); setIsDrawerOpen(true); }}
        onSignup={(event) => {
          if (!user) { setIsLoginModalOpen(true); return; }
          // The modal logic is now inside MovieCard, so we just need to handle the signup sync
          setSignedUpIds(prev => {
            const next = new Set(prev);
            // This is just to trigger any global state if needed, 
            // but MovieCard handles its own local state.
            return next;
          });
        }}
        onStatusChange={(eventId, isSignedUp) => {
          setSignedUpIds(prev => {
            const next = new Set(prev);
            isSignedUp ? next.add(eventId) : next.delete(eventId);
            return next;
          });
        }}
      />


      <EventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onLoginRequired={() => { setIsDrawerOpen(false); setIsLoginModalOpen(true); }}
      />

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
