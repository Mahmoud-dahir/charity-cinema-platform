"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Play, Ticket, Mail, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import LoginModal from './login/page';
import RegisterModal from './register/page';
import { Header } from '@/components/dashboard/Header';
import { EventsList } from '@/components/events/EventsList';
import { EventDrawer } from '@/components/events/EventDrawer';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
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

      {/* Hero Section */}
      <section className="relative h-[550px] md:h-[750px] flex items-center overflow-hidden">
        {/* Animated Background Image */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop")' }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
        />
        
        {/* Refined Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-0"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] z-0 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] z-0 mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto flex flex-col md:items-start items-center text-center md:text-left mt-16 md:mt-24">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 backdrop-blur-md border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
              <Sparkles className="w-4 h-4" />
              Vivez l'émotion, soutenez l'action
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-white text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tighter">
              Le Cinéma qui a du <br className="hidden md:block"/>
              <span className="relative inline-block mt-2 md:mt-0">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">Cœur</span>
                <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-400 to-amber-600 opacity-40 -z-10"></span>
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-slate-300 text-lg md:text-2xl font-light max-w-2xl mb-10 leading-relaxed">
              Vos places se transforment en dons. <br className="hidden sm:block"/>
              <span className="font-medium text-slate-100">Un billet acheté = un impact réel</span> pour les associations de votre région.
            </motion.p>
            
          </motion.div>
        </div>
      </section>


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
          setSignedUpIds(prev => new Set(prev));
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

      {/* Newsletter Section */}
      <section className="relative mt-20 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl mb-8 shadow-inner relative group">
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Mail className="w-10 h-10 text-yellow-400 relative z-10" />
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">Restez dans la boucle</h2>
            <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
              Inscrivez-vous à notre newsletter pour être informé des prochaines diffusions, des événements spéciaux et de l'impact concret de vos actions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto relative">
              <div className="relative flex-1 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                <input 
                  type="email" 
                  placeholder="Votre adresse e-mail..." 
                  className="relative w-full bg-slate-950/80 border border-slate-700 text-white rounded-2xl py-4 px-6 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-slate-500 text-base md:text-lg shadow-inner"
                />
              </div>
              <button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-bold px-8 py-4 rounded-2xl hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all whitespace-nowrap text-base md:text-lg flex items-center justify-center">
                S'inscrire <ChevronRight className="w-5 h-5 ml-2 -mr-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-950 pt-20 pb-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 border-b border-slate-800/60 pb-16 mb-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="lg:col-span-4 space-y-8 pr-0 lg:pr-12">
              <Link href="/" className="text-3xl font-black tracking-tighter text-white inline-flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Play className="w-5 h-5 text-slate-950 fill-slate-950 translate-x-0.5" />
                </div>
                Cinem<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Action</span>
              </Link>
              <p className="text-slate-400 text-base leading-relaxed font-light">
                La plateforme solidaire dédiée au 7ème art. Réunir les passionnés pour financer des associations caritatives et locales en un clic.
              </p>
              <div className="flex space-x-4 pt-2">
                {['Fb', 'Tw', 'In', 'Yt'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-yellow-500 hover:bg-slate-800 hover:shadow-[0_0_10px_rgba(234,179,8,0.2)] transition-all">
                    <span className="text-xs font-medium">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                Explorer
              </h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-yellow-400 mr-3 transition-colors"></span> À l'affiche</a></li>
                <li><a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-yellow-400 mr-3 transition-colors"></span> Associations partenaires</a></li>
                <li><a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-yellow-400 mr-3 transition-colors"></span> Salles participantes</a></li>
                <li><a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-yellow-400 mr-3 transition-colors"></span> Impact social</a></li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-white font-bold text-lg mb-6 flex items-center">
                Légal & Aide
              </h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-white mr-3 transition-colors"></span> CGU</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-white mr-3 transition-colors"></span> Confidentialité & Données</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-white mr-3 transition-colors"></span> Mentions légales</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-white mr-3 transition-colors"></span> Nous contacter</a></li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-white font-bold text-lg mb-6">
                L'Application
              </h4>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed font-light">Emportez vos séances solidaires dans votre poche. Bientôt disponible.</p>
              <div className="flex flex-col space-y-3">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center cursor-not-allowed opacity-60">
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl mr-4 shadow-inner">
                     <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z"/>
                     </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Bientôt sur</p>
                    <p className="text-base text-slate-200 font-bold tracking-tight">App Store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm font-medium relative z-10">
          <p>&copy; {new Date().getFullYear()} CinemAction. Tous droits réservés.</p>
          <p className="mt-4 md:mt-0 flex items-center bg-slate-900/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-800/80">
            Fait avec <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-2 animate-pulse" /> pour un monde meilleur
          </p>
        </div>
      </footer>
    </div>
  );
}
