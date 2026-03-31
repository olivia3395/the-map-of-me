import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, SkipForward, SkipBack, X } from "lucide-react";
import { Place } from "../types";

interface LifeCinemaProps {
  places: Place[];
  onClose: () => void;
  onSceneChange: (place: Place) => void;
}

const getPoeticVoiceover = (place: Place) => {
  if (place.memory) return place.memory;
  if (place.curatedDescription) {
    const match = place.curatedDescription.match(/[^.!?]+[.!?]+/);
    return match ? match[0].trim() : place.curatedDescription;
  }
  const templates = [
    `The air in ${place.cityName} felt different, carrying whispers of forgotten tales.`,
    `In the heart of ${place.country}, time seemed to slow down just for a moment.`,
    `Every street corner in ${place.cityName} held a promise of a new discovery.`,
    `A fleeting memory etched against the backdrop of ${place.cityName}'s endless skies.`,
    `Finding myself amidst the rhythm of ${place.cityName}, a chapter silently unfolded.`
  ];
  return templates[place.cityName.length % templates.length];
};

const getSceneTitle = (index: number, total: number, cityName: string) => {
  if (index === 0) return "Act I : The Awakening";
  if (index === total - 1) return "Epilogue : The Journey Continues";
  const acts = ["Act II", "Act III", "Act IV", "Act V", "Interlude", "Reverie"];
  const act = acts[(index - 1) % acts.length];
  return `${act} : Echoes of ${cityName}`;
};

export default function LifeCinema({ places, onClose, onSceneChange }: LifeCinemaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Sort places by year or orderIndex to create a chronological timeline
  const sortedPlaces = [...places].sort((a, b) => {
    if (a.year && b.year && a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
    return a.orderIndex - b.orderIndex;
  });

  useEffect(() => {
    if (sortedPlaces.length > 0) {
      onSceneChange(sortedPlaces[currentIndex]);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentIndex < sortedPlaces.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsPlaying(false); // End of cinema
      }
    }, 8000); // 8 seconds per scene for a slow, cinematic feel
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, sortedPlaces.length]);

  if (sortedPlaces.length === 0) return null;

  const currentPlace = sortedPlaces[currentIndex];
  const title = getSceneTitle(currentIndex, sortedPlaces.length, currentPlace.cityName);
  const voiceover = getPoeticVoiceover(currentPlace);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between"
    >
      {/* Dark Cinematic Overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Top Letterbox */}
      <motion.div 
        initial={{ height: 0 }} 
        animate={{ height: '12vh' }} 
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="bg-black w-full pointer-events-auto flex items-center justify-between px-8 z-10"
      >
        <div className="text-white/50 font-serif tracking-widest text-xs uppercase">
          Life Cinema
        </div>
        <button 
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-xs tracking-widest uppercase"
        >
          <X className="w-4 h-4" />
          Exit Cinema
        </button>
      </motion.div>
      
      {/* Center Content (Subtitles & Atmosphere) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 z-10">
         <AnimatePresence mode="wait">
           <motion.div 
             key={currentIndex} 
             initial={{ opacity: 0, y: 10, scale: 0.98 }} 
             animate={{ opacity: 1, y: 0, scale: 1 }} 
             exit={{ opacity: 0, y: -10, scale: 1.02 }} 
             transition={{ duration: 2, ease: "easeInOut" }}
             className="max-w-3xl mx-auto"
           >
             <h4 className="text-yellow-500/80 text-xs md:text-sm tracking-[0.4em] uppercase mb-6 font-semibold">
               {title}
             </h4>
             <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 drop-shadow-2xl tracking-wide">
               {currentPlace.cityName}
             </h2>
             <p className="text-lg md:text-2xl text-slate-200 font-light leading-relaxed drop-shadow-lg italic">
               "{voiceover}"
             </p>
             <div className="mt-12 flex items-center justify-center gap-4 text-xs tracking-[0.3em] text-slate-400 uppercase font-semibold">
               <span>{currentPlace.country}</span>
               <span className="w-1 h-1 rounded-full bg-yellow-500/50"></span>
               <span>{currentPlace.year}</span>
             </div>
           </motion.div>
         </AnimatePresence>
      </div>

      {/* Bottom Letterbox & Controls */}
      <motion.div 
        initial={{ height: 0 }} 
        animate={{ height: '12vh' }} 
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="bg-black w-full pointer-events-auto flex items-center justify-center px-8 z-10"
      >
         <div className="flex items-center gap-8">
           <button 
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="text-white/50 hover:text-white disabled:opacity-20 transition-colors"
           >
             <SkipBack className="w-5 h-5" />
           </button>
           
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
           >
             {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
           </button>

           <button 
             onClick={() => setCurrentIndex(Math.min(sortedPlaces.length - 1, currentIndex + 1))}
             disabled={currentIndex === sortedPlaces.length - 1}
             className="text-white/50 hover:text-white disabled:opacity-20 transition-colors"
           >
             <SkipForward className="w-5 h-5" />
           </button>
         </div>

         {/* Progress Bar */}
         <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
           <motion.div 
             className="h-full bg-yellow-500/50"
             initial={{ width: 0 }}
             animate={{ width: `${((currentIndex + 1) / sortedPlaces.length) * 100}%` }}
             transition={{ duration: 0.5 }}
           />
         </div>
      </motion.div>
    </motion.div>
  );
}
