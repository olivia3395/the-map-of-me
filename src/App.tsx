import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Download, Map, Sparkles, Play, Pause } from "lucide-react";
import { Toaster, toast } from "sonner";
import MapView from "./components/MapView";
import Constellation from "./components/Constellation";
import CityProfileCard from "./components/CityProfileCard";
import AddPlaceModal from "./components/AddPlaceModal";
import Timeline from "./components/Timeline";
import { ManagePlacesModal, ProfileModal, SettingsModal } from "./components/Modals";
import { Place } from "./types";

export default function App() {
  const [mode, setMode] = useState<"overview" | "explore">("overview");
  const [position, setPosition] = useState({ coordinates: [0, 30] as [number, number], zoom: 1, pitch: 0, bearing: 0 });
  const [places, setPlaces] = useState<Place[]>([]);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [mapTheme, setMapTheme] = useState("voyager");
  const [showRoute, setShowRoute] = useState(true);
  const [showBuildings, setShowBuildings] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && places.length > 0) {
      timeout = setTimeout(() => {
        const currentIndex = selectedPlace ? places.findIndex(p => p.id === selectedPlace.id) : -1;
        const nextIndex = currentIndex + 1;

        if (nextIndex < places.length) {
          handlePlaceClick(places[nextIndex]);
        } else {
          setIsPlaying(false);
          toast.success("Journey tour completed!");
        }
      }, selectedPlace ? 6000 : 500);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, selectedPlace, places]);

  const handleAddPlace = (newPlaceData: Omit<Place, "id" | "orderIndex">) => {
    const newPlace: Place = {
      ...newPlaceData,
      id: crypto.randomUUID(),
      orderIndex: places.length,
    };
    setPlaces([...(places || []), newPlace]);
    setMode("explore");
    setPosition({ coordinates: [newPlace.lng, newPlace.lat], zoom: 13, pitch: 45, bearing: 15 });
    setSelectedPlace(newPlace);
  };

  const handlePlaceClick = (place: Place) => {
    setMode("explore");
    setPosition({ coordinates: [place.lng, place.lat], zoom: 13, pitch: 45, bearing: 15 });
    setSelectedPlace(place);
  };

  const handleExport = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const themes = ['voyager', 'positron', 'dark-matter'];
  const handleThemeToggle = () => {
    const nextIndex = (themes.indexOf(mapTheme) + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setMapTheme(nextTheme);
    const themeNames: Record<string, string> = {
      'voyager': 'Vibrant',
      'positron': 'Light & Clean',
      'dark-matter': 'Midnight Dark'
    };
    toast.success(`Map theme changed to ${themeNames[nextTheme]}`);
  };

  const handleRegionClick = (region: string) => {
    const regions: Record<string, { coordinates: [number, number], zoom: number }> = {
      'Asia': { coordinates: [100, 35], zoom: 3 },
      'Europe': { coordinates: [15, 50], zoom: 4 },
      'Americas': { coordinates: [-95, 40], zoom: 3 },
    };
    if (regions[region]) {
      setPosition({ ...regions[region], pitch: 0, bearing: 0 });
      setSelectedPlace(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-midnight)] text-[var(--color-starlight)] font-sans overflow-hidden relative">
      <MapView
        places={places}
        activePlaceId={selectedPlace?.id || null}
        onPlaceClick={handlePlaceClick}
        position={position}
        onMoveEnd={setPosition}
        mode={mode}
        mapTheme={mapTheme}
        showRoute={showRoute}
        showBuildings={showBuildings}
      />

      <AnimatePresence>
        {mode === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-midnight)]/60 via-transparent to-[var(--color-midnight)]/80" />

            <div className="relative z-30 text-center pointer-events-auto px-6">
              <Sparkles className="w-8 h-8 text-[var(--color-gold)] mx-auto mb-8 opacity-80" />
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-gold)] to-yellow-600 tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
                The Map of Me
              </h1>
              <p className="text-lg md:text-xl text-slate-300 font-light tracking-[0.3em] uppercase mb-12 text-glow-subtle">
                A Life in Places
              </p>
              <button
                onClick={() => {
                  setMode("explore");
                  setPosition({ coordinates: [0, 30], zoom: 2, pitch: 30, bearing: 0 });
                }}
                className="group relative inline-flex items-center justify-center px-10 py-4 text-sm uppercase tracking-[0.2em] text-white bg-white/5 border border-[var(--color-gold)]/40 rounded-full overflow-hidden transition-all duration-500 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 backdrop-blur-md shadow-[0_0_30px_rgba(253,224,71,0.1)]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Map className="w-4 h-4" />
                  Enter Atlas
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mode === "explore" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute top-8 left-8 pointer-events-auto cursor-pointer group bg-white/60 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-lg border border-white/50" 
              onClick={() => { 
                setMode("overview"); 
                setPosition({ coordinates: [0, 30], zoom: 1, pitch: 0, bearing: 0 }); 
                setSelectedPlace(null); 
              }}
            >
              <h1 className="font-serif text-2xl tracking-wide text-slate-900 font-bold drop-shadow-sm group-hover:text-yellow-700 transition-colors duration-300">
                The Map of Me
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-700 mt-1 font-bold group-hover:text-slate-900 transition-colors">
                ← Return to Overview
              </p>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute top-32 left-8 flex flex-col gap-2 pointer-events-auto z-50"
            >
              {['Americas', 'Europe', 'Asia'].map((region) => (
                <button
                  key={region}
                  onClick={() => handleRegionClick(region)}
                  className="px-4 py-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-full text-xs font-bold tracking-widest uppercase text-slate-700 hover:bg-white hover:text-slate-900 transition-all shadow-sm"
                >
                  {region}
                </button>
              ))}
            </motion.div>

            <Constellation 
              places={places} 
              onPlaceClick={handlePlaceClick} 
              activePlaceId={selectedPlace?.id || null} 
            />

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-8 right-8 flex items-center gap-4 pointer-events-auto print:hidden z-50"
            >
              <button
                onClick={() => setIsAddingPlace(true)}
                className="group relative flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full text-sm font-semibold tracking-widest hover:bg-white transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] text-slate-800"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Add Place</span>
              </button>

              {places.length > 0 && (
                <button
                  onClick={handleExport}
                  className="group relative flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full text-sm font-semibold tracking-widest hover:bg-white transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] text-slate-800"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Export</span>
                </button>
              )}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute bottom-24 right-8 flex flex-row items-center gap-2 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-full px-4 py-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] pointer-events-auto z-50"
            >
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`p-2 transition-colors rounded-full ${isPlaying ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
                title={isPlaying ? "Pause Tour" : "Play Tour"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <button onClick={() => setIsManageOpen(true)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-full" title="Manage Places">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button onClick={handleShare} className="p-2 text-slate-400 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-full" title="Share Map">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
              <button onClick={handleThemeToggle} className="p-2 text-slate-400 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-full" title="Toggle Map Theme">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-full" title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button onClick={() => setIsProfileOpen(true)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors hover:bg-slate-100 rounded-full" title="Profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </button>
            </motion.div>

            <Timeline 
              places={places} 
              activePlaceId={selectedPlace?.id || null} 
              onSelectPlace={handlePlaceClick} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlace && mode === 'explore' && (
          <CityProfileCard 
            place={selectedPlace} 
            onClose={() => setSelectedPlace(null)} 
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 pointer-events-auto">
        <AddPlaceModal
          isOpen={isAddingPlace}
          onClose={() => setIsAddingPlace(false)}
          onAdd={handleAddPlace}
        />
        <ManagePlacesModal
          isOpen={isManageOpen}
          onClose={() => setIsManageOpen(false)}
          places={places}
          setPlaces={setPlaces}
          onSelectPlace={handlePlaceClick}
        />
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          places={places}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          showRoute={showRoute}
          setShowRoute={setShowRoute}
          showBuildings={showBuildings}
          setShowBuildings={setShowBuildings}
        />
        <Toaster position="top-center" />
      </div>

      <style>{`
        @media print {
          body { background-color: #030712 !important; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
