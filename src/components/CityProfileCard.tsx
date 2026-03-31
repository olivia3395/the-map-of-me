import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Place } from "../types";

interface CityProfileCardProps {
  place: Place;
  onClose: () => void;
}

const formatCoords = (lat: number, lng: number) => {
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
};

const formatTimeZone = (lng: number) => {
  const offset = Math.round(lng / 15);
  return `UTC${offset >= 0 ? '+' : ''}${offset}:00`;
};

const getNotableFigures = (city: string) => {
  const figures: Record<string, string> = {
    'new york': 'Walt Whitman, Jay-Z, Eleanor Roosevelt',
    'paris': 'Victor Hugo, Coco Chanel, Marie Curie',
    'london': 'Charles Dickens, Alan Turing, Adele',
    'tokyo': 'Hayao Miyazaki, Akira Kurosawa',
    'beijing': 'Lao She, Lu Xun',
    'shanghai': 'Eileen Chang, Yao Ming',
    'san francisco': 'Jack London, Bruce Lee',
    'los angeles': 'Marilyn Monroe, Kobe Bryant',
    'rome': 'Julius Caesar, Federico Fellini',
  };
  return figures[city.toLowerCase()] || 'Local historical & cultural icons';
};

export default function CityProfileCard({ place, onClose }: CityProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute bottom-36 left-8 w-[280px] z-40 pointer-events-auto"
    >
      <div className="bg-[#0f172a]/85 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
        
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="text-[8px] uppercase tracking-[0.3em] text-yellow-500/80 mb-2 font-bold">
                Place View
              </div>
              <h3 className="text-xl font-serif text-yellow-400 tracking-wide leading-none mb-1.5">
                {place.cityName}
              </h3>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                {place.country}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 rounded-full p-1.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Data List */}
          <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-slate-700/50 pb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Category</span>
              <span className="text-xs font-mono text-slate-200">{place.tag || 'Exploration'}</span>
            </div>
            
            <div className="flex justify-between items-end border-b border-slate-700/50 pb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Coordinates</span>
              <span className="text-xs font-mono text-slate-200">{formatCoords(place.lat, place.lng)}</span>
            </div>

            <div className="flex justify-between items-end border-b border-slate-700/50 pb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Time Zone</span>
              <span className="text-xs font-mono text-slate-200">{formatTimeZone(place.lng)}</span>
            </div>

            <div className="pt-1">
              <span className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">Notable Figures</span>
              <span className="block text-xs text-slate-300 font-serif italic leading-relaxed">
                {getNotableFigures(place.cityName)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
