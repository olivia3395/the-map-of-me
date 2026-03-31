import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, SkipForward, SkipBack, X, Film, 
  Clapperboard, MapPin, Globe, Clock, Compass, 
  RotateCcw, List, Settings2, ArrowRight
} from "lucide-react";
import { Place } from "../types";

interface LifeCinemaProps {
  places: Place[];
  onClose: () => void;
  onSceneChange: (place: Place) => void;
}

type CinemaState = "lobby" | "opening" | "scene" | "transition" | "credits";
type CutType = "chronological" | "geographical" | "mood" | "chapters";

export default function LifeCinema({ places, onClose, onSceneChange }: LifeCinemaProps) {
  const [state, setState] = useState<CinemaState>("lobby");
  const [cutType, setCutType] = useState<CutType>("chronological");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showSceneList, setShowSceneList] = useState(false);
  const [transitionData, setTransitionData] = useState<{ from: Place; to: Place } | null>(null);

  const sortedPlaces = useMemo(() => {
    const base = [...places];
    switch (cutType) {
      case "chronological":
        return base.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
          return yearA - yearB || a.orderIndex - b.orderIndex;
        });
      case "geographical":
        return base.sort((a, b) => a.lng - b.lng);
      case "mood":
        return base.sort((a, b) => (a.tag || "").localeCompare(b.tag || ""));
      default:
        return base.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  }, [places, cutType]);

  const currentPlace = sortedPlaces[currentIndex];
  const nextPlace = sortedPlaces[currentIndex + 1];

  useEffect(() => {
    if (state === "scene" && currentPlace) {
      onSceneChange(currentPlace);
    }
  }, [currentIndex, state, currentPlace, onSceneChange]);

  useEffect(() => {
    if (!isPlaying || !isAutoPlay || state === "lobby" || state === "credits") return;

    const duration = state === "opening" ? 4000 : state === "transition" ? 5000 : 8000;
    
    const timer = setTimeout(() => {
      if (state === "opening") {
        setState("scene");
      } else if (state === "scene") {
        if (currentIndex < sortedPlaces.length - 1) {
          setTransitionData({ from: currentPlace, to: nextPlace });
          setState("transition");
        } else {
          setState("credits");
        }
      } else if (state === "transition") {
        setCurrentIndex(prev => prev + 1);
        setState("scene");
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [state, currentIndex, isPlaying, isAutoPlay, sortedPlaces.length, currentPlace, nextPlace]);

  const calculateDistance = (p1: Place, p2: Place) => {
    const R = 6371;
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  const getTimezoneDiff = (p1: Place, p2: Place) => {
    const tz1 = Math.round(p1.lng / 15);
    const tz2 = Math.round(p2.lng / 15);
    const diff = tz2 - tz1;
    return diff === 0 ? "Same Timezone" : `${diff > 0 ? '+' : ''}${diff} Hours`;
  };

  if (places.length === 0) return null;

  const Lobby = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 text-center z-50"
    >
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent" />
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="relative z-10 max-w-2xl"
      >
        <Clapperboard className="w-12 h-12 text-yellow-500 mx-auto mb-8 opacity-50" />
        <h4 className="text-yellow-500/60 text-xs tracking-[0.5em] uppercase mb-4 font-bold">Now Screening</h4>
        <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 tracking-tight">The Atlas of {new Date().getFullYear()}</h1>
        <p className="text-slate-400 text-lg font-light tracking-widest uppercase mb-12">A Cinematic Journey Through Your Geography</p>
        
        <div className="grid grid-cols-3 gap-8 mb-16 border-y border-white/10 py-8">
          <div>
            <div className="text-2xl font-serif text-white mb-1">{sortedPlaces.length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Scenes</div>
          </div>
          <div>
            <div className="text-2xl font-serif text-white mb-1">{new Set(places.map(p => p.country)).size}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Regions</div>
          </div>
          <div>
            <div className="text-2xl font-serif text-white mb-1">{calculateDistance(sortedPlaces[0], sortedPlaces[sortedPlaces.length-1])}km</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Total Span</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => setState("opening")}
            className="group relative px-12 py-5 bg-white text-slate-950 rounded-full font-bold tracking-[0.2em] uppercase text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Start Screening
          </button>
          
          <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest">
            <span>Select Cut:</span>
            {(["chronological", "geographical", "mood", "chapters"] as CutType[]).map(type => (
              <button 
                key={type}
                onClick={() => setCutType(type)}
                className={`transition-colors hover:text-white ${cutType === type ? 'text-yellow-500' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <button onClick={onClose} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors">
        <X className="w-6 h-6" />
      </button>
    </motion.div>
  );

  const OpeningCredits = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 text-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <h2 className="text-white font-serif text-4xl md:text-6xl tracking-[0.2em] mb-4">A LIFE IN MOTION</h2>
        <div className="w-24 h-px bg-yellow-500/50 mx-auto mb-8" />
        <p className="text-slate-400 font-light tracking-[0.4em] uppercase text-xs">Presented by Your Memories</p>
      </motion.div>
    </motion.div>
  );

  const MainScene = () => (
    <div className="absolute inset-0 flex flex-col justify-between">
      <div className="absolute inset-0 overflow-hidden">
        <motion.img 
          key={currentPlace.id}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2 }}
          src={currentPlace.curatedImage}
          className="w-full h-full object-cover filter brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      <div className="relative z-10 p-8 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 font-serif text-sm">
            {currentIndex + 1}
          </div>
          <div>
            <h4 className="text-yellow-500/80 text-[10px] tracking-[0.4em] uppercase font-bold">Scene {currentIndex + 1}</h4>
            <h2 className="text-white font-serif text-2xl tracking-wide">{currentPlace.cityName}</h2>
          </div>
        </div>
        
        <div className="w-32 h-20 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-30 bg-slate-800" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_#eab308] animate-pulse" />
          </div>
          <div className="absolute bottom-1 left-2 text-[8px] text-white/50 uppercase tracking-tighter">
            {currentPlace.lat.toFixed(2)}, {currentPlace.lng.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPlace.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            <h3 className="text-white/40 font-serif italic text-xl mb-6">
              {currentPlace.tag || "A Moment in Time"}
            </h3>
            <h1 className="text-5xl md:text-8xl font-serif text-white mb-8 drop-shadow-2xl">
              {currentPlace.cityName}
            </h1>
            <p className="text-xl md:text-3xl text-slate-200 font-light leading-relaxed italic max-w-2xl mx-auto">
              "{currentPlace.curatedDescription?.split('.')[0]}."
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {currentPlace.highlights?.map((h, i) => (
                <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-400 uppercase tracking-widest">
                  {h}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 p-8 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="text-white/40 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button onClick={() => setCurrentIndex(Math.min(sortedPlaces.length - 1, currentIndex + 1))} className="text-white/40 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSceneList(!showSceneList)}
              className={`p-3 rounded-full border transition-all ${showSceneList ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-white/10 text-white/40 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] uppercase tracking-widest font-bold transition-all ${isAutoPlay ? 'bg-white/10 border-white/20 text-yellow-500' : 'border-white/5 text-white/20'}`}
            >
              <Settings2 className="w-4 h-4" />
              {isAutoPlay ? "Autoplay On" : "Manual Mode"}
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {sortedPlaces.map((p, i) => (
            <button 
              key={p.id}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-yellow-500 scale-105 z-10' : 'border-transparent opacity-40 hover:opacity-100'}`}
            >
              <img src={p.curatedImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                <span className="text-[8px] text-white uppercase tracking-tighter truncate">{p.cityName}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const TransitionScreen = () => {
    if (!transitionData) return null;
    const distance = calculateDistance(transitionData.from, transitionData.to);
    const tzDiff = getTimezoneDiff(transitionData.from, transitionData.to);
    
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 z-50"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl"
        >
          <div className="flex items-center justify-center gap-12 mb-12">
            <div className="text-right">
              <h4 className="text-slate-500 text-[10px] uppercase tracking-widest mb-2">Departure</h4>
              <h2 className="text-white font-serif text-3xl">{transitionData.from.cityName}</h2>
            </div>
            <motion.div 
              animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              className="text-yellow-500"
            >
              <ArrowRight className="w-8 h-8" />
            </motion.div>
            <div className="text-left">
              <h4 className="text-slate-500 text-[10px] uppercase tracking-widest mb-2">Arrival</h4>
              <h2 className="text-white font-serif text-3xl">{transitionData.to.cityName}</h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-12 mb-16">
            <div className="flex flex-col items-center gap-2">
              <Compass className="w-5 h-5 text-slate-600" />
              <span className="text-white font-serif text-xl">{distance}km</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest">Distance</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <span className="text-white font-serif text-xl">{tzDiff}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest">Time Shift</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Globe className="w-5 h-5 text-slate-600" />
              <span className="text-white font-serif text-xl">Trans-Global</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest">Route Type</span>
            </div>
          </div>

          <p className="text-slate-400 font-serif italic text-xl">
            "Leaving the echoes of {transitionData.from.cityName} behind, we follow the horizon toward {transitionData.to.cityName}."
          </p>
        </motion.div>
      </motion.div>
    );
  };

  const EndCredits = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 text-center z-50 overflow-y-auto"
    >
      <motion.div 
        initial={{ y: 100 }} animate={{ y: -100 }} transition={{ duration: 15, base: "linear" }}
        className="max-w-xl py-20"
      >
        <h2 className="text-white font-serif text-5xl mb-16">FIN</h2>
        
        <div className="space-y-12 mb-20">
          <div>
            <h4 className="text-yellow-500 text-[10px] uppercase tracking-[0.4em] mb-4">Featured Locations</h4>
            {sortedPlaces.map(p => (
              <div key={p.id} className="text-white font-serif text-xl mb-2">{p.cityName}, {p.country}</div>
            ))}
          </div>
          
          <div>
            <h4 className="text-yellow-500 text-[10px] uppercase tracking-[0.4em] mb-4">Thematic Elements</h4>
            <div className="text-white font-serif text-xl">
              {Array.from(new Set(places.map(p => p.tag).filter(Boolean))).join(" • ")}
            </div>
          </div>

          <div>
            <h4 className="text-yellow-500 text-[10px] uppercase tracking-[0.4em] mb-4">Closing Thought</h4>
            <p className="text-slate-400 font-serif italic text-2xl">
              "Every coordinate is a heartbeat, every map a story yet to be fully told."
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pt-20">
          <button 
            onClick={() => { setCurrentIndex(0); setState("opening"); }}
            className="flex items-center gap-3 text-white/50 hover:text-white transition-colors uppercase tracking-[0.3em] text-xs"
          >
            <RotateCcw className="w-4 h-4" />
            Rewatch Film
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-3 border border-white/20 rounded-full text-white/80 hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em] text-[10px] font-bold"
          >
            Return to Atlas
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "lobby" && <Lobby key="lobby" />}
        {state === "opening" && <OpeningCredits key="opening" />}
        {state === "scene" && <MainScene key="scene" />}
        {state === "transition" && <TransitionScreen key="transition" />}
        {state === "credits" && <EndCredits key="credits" />}
      </AnimatePresence>

      <AnimatePresence>
        {showSceneList && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSceneList(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-[110] pointer-events-auto"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-white/10 z-[120] p-8 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-serif">Chapters</h2>
                <button onClick={() => setShowSceneList(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {sortedPlaces.map((p, i) => (
                  <button 
                    key={p.id}
                    onClick={() => { setCurrentIndex(i); setState("scene"); setShowSceneList(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${i === currentIndex ? 'bg-yellow-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                  >
                    <span className="text-xs font-serif opacity-50">{String(i + 1).padStart(2, '0')}</span>
                    <div className="text-left">
                      <div className="font-bold text-sm">{p.cityName}</div>
                      <div className={`text-[10px] uppercase tracking-widest ${i === currentIndex ? 'text-black/60' : 'text-slate-500'}`}>{p.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
