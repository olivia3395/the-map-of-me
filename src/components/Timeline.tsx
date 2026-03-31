import { motion } from "motion/react";
import { Place } from "../types";

interface TimelineProps {
  places: Place[];
  activePlaceId: string | null;
  onSelectPlace: (place: Place) => void;
}

export default function Timeline({ places, activePlaceId, onSelectPlace }: TimelineProps) {
  if (places.length === 0) return null;

  const sortedPlaces = [...(places || [])].sort((a, b) => a.orderIndex - b.orderIndex);
  const activeIndex = sortedPlaces.findIndex(p => p.id === activePlaceId);
  const progressPercentage = sortedPlaces.length > 1 && activeIndex >= 0
    ? (activeIndex / (sortedPlaces.length - 1)) * 100
    : 0;

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-8 z-40 print:hidden pointer-events-auto"
    >
      <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
        <div className="relative flex items-center justify-between">
          {/* Background Line */}
          <div className="absolute left-0 right-0 h-[2px] bg-slate-200 top-1/2 -translate-y-1/2 z-0 rounded-full" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute left-0 h-[2px] bg-gradient-to-r from-[var(--color-gold)]/50 to-[var(--color-gold)] top-1/2 -translate-y-1/2 z-0 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(253,224,71,0.5)]" 
            style={{ width: `${progressPercentage}%` }} 
          />

          {sortedPlaces.map((place, index) => {
            const isActive = place.id === activePlaceId;
            const isPast = index <= activeIndex;

            return (
              <button
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className="relative z-10 flex flex-col items-center group outline-none"
              >
                {/* Node */}
                <div 
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                    isActive 
                      ? 'bg-[var(--color-gold)] border-white shadow-[0_0_20px_var(--color-gold)] scale-125' 
                      : isPast
                        ? 'bg-white border-[var(--color-gold)] shadow-[0_0_10px_rgba(253,224,71,0.3)] group-hover:bg-[var(--color-gold)]/20'
                        : 'bg-white border-slate-300 group-hover:border-slate-400'
                  }`} 
                />
                
                {/* City Name */}
                <div 
                  className={`absolute top-8 whitespace-nowrap text-xs uppercase tracking-[0.15em] transition-colors duration-500 font-bold ${
                    isActive 
                      ? 'text-slate-800' 
                      : isPast
                        ? 'text-[var(--color-gold)] group-hover:text-[var(--color-gold)]/80'
                        : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {place.cityName}
                </div>
                
                {/* Year */}
                <div className="absolute top-12 whitespace-nowrap text-[10px] text-slate-400 tracking-wider font-semibold">
                  {place.year || `Stop ${index + 1}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
