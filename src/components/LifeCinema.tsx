import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, SkipForward, SkipBack, X, Film, 
  Clapperboard, MapPin, Globe, Clock, Compass, 
  RotateCcw, List, Settings2, ArrowRight, Sparkles
} from "lucide-react";
import { Place } from "../types";
import { t as translations, Language } from "../i18n";

interface LifeCinemaProps {
  places: Place[];
  language: Language;
  onClose: () => void;
  onSceneChange: (place: Place) => void;
}

type CinemaState = "lobby" | "opening" | "scene" | "transition" | "credits";
type CutType = "chronological" | "geographical" | "mood" | "chapters";

export default function LifeCinema({ places, language, onClose, onSceneChange }: LifeCinemaProps) {
  const t = translations[language];
  const [state, setState] = useState<CinemaState>("lobby");
  const [cutType, setCutType] = useState<CutType>("chronological");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showSceneList, setShowSceneList] = useState(false);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<Record<string, number>>({});
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
  const currentImageIndex = selectedImageIndexes[currentPlace?.id] || 0;
  const currentImage = currentPlace?.curatedImages?.[currentImageIndex] || { url: currentPlace?.curatedImage, attribution: "", source: "Default" };
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
    if (diff === 0) return language === 'en' ? "Same Timezone" : "相同时区";
    return `${diff > 0 ? '+' : ''}${diff} ${language === 'en' ? 'Hours' : '小时'}`;
  };

  if (places.length === 0) return null;

  const Lobby = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-orange-50 flex flex-col items-center justify-center p-8 text-center z-50"
    >
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent" />
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="relative z-10 max-w-2xl"
      >
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-100">
          <Sparkles className="w-10 h-10 text-orange-400" />
        </div>
        <h4 className="text-orange-600/60 text-xs tracking-[0.3em] uppercase mb-4 font-bold">
          {language === 'en' ? "Let's Relive the Joy" : "重温快乐时光"}
        </h4>
        <h1 className="text-5xl md:text-7xl font-serif text-slate-800 mb-6 tracking-tight">
          {language === 'en' ? "My Happy Memories" : "我的快乐图鉴"}
        </h1>
        <p className="text-slate-500 text-lg font-light tracking-wide mb-12">
          {language === 'en' ? "A collection of smiles and beautiful moments." : "收集笑容与美好的瞬间。"}
        </p>
        
        <div className="grid grid-cols-3 gap-8 mb-16 border-y border-orange-200 py-8">
          <div>
            <div className="text-2xl font-serif text-slate-800 mb-1">{sortedPlaces.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{language === 'en' ? "Memories" : "回忆"}</div>
          </div>
          <div>
            <div className="text-2xl font-serif text-slate-800 mb-1">{new Set(places.map(p => p.country)).size}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{language === 'en' ? "Countries" : "国家"}</div>
          </div>
          <div>
            <div className="text-2xl font-serif text-slate-800 mb-1">{calculateDistance(sortedPlaces[0], sortedPlaces[sortedPlaces.length-1])}km</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{language === 'en' ? "Traveled" : "足迹"}</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => setState("scene")}
            className="group relative px-12 py-5 bg-orange-500 text-white rounded-full font-bold tracking-[0.1em] uppercase text-sm hover:scale-105 transition-all shadow-lg shadow-orange-200"
          >
            {language === 'en' ? "Let's Go!" : "出发吧！"}
          </button>
          
          <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase tracking-widest">
            <span>{language === 'en' ? "Choose a Vibe" : "选择氛围"}</span>
            {(["chronological", "geographical", "mood", "chapters"] as CutType[]).map(type => (
              <button 
                key={type}
                onClick={() => setCutType(type)}
                className={`transition-colors hover:text-slate-800 ${cutType === type ? 'text-orange-600 font-bold underline underline-offset-4' : ''}`}
              >
                {t[type as keyof typeof t]}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800 transition-colors">
        <X className="w-6 h-6" />
      </button>
    </motion.div>
  );

  const MainScene = () => (
    <div className="absolute inset-0 flex flex-col justify-between bg-white">
      <div className="absolute inset-0 overflow-hidden">
        <motion.img 
          key={`${currentPlace.id}-${currentImageIndex}`}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={currentImage.url}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        
        {currentImage.attribution && (
          <div className="absolute bottom-32 left-8 z-20 text-[8px] text-slate-400 uppercase tracking-widest max-w-xs bg-white/60 backdrop-blur-sm px-2 py-1 rounded">
            {currentImage.attribution}
          </div>
        )}
      </div>

      <div className="relative z-10 p-8 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-serif text-sm shadow-md">
            {currentIndex + 1}
          </div>
          <div>
            <h4 className="text-orange-600/80 text-[10px] tracking-widest uppercase font-bold">{language === 'en' ? "Memory" : "回忆"} {currentIndex + 1}</h4>
            <h2 className="text-slate-800 font-serif text-2xl tracking-wide">{currentPlace.cityName}</h2>
          </div>
        </div>
        
        <button onClick={onClose} className="p-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-100 text-slate-400 hover:text-slate-800 transition-all shadow-sm">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${currentPlace.id}-${currentImageIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-white/80 backdrop-blur-lg p-10 rounded-[3rem] border border-white shadow-xl relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              
              <h3 className="text-orange-500 font-serif italic text-xl mb-4 tracking-wide">
                {currentPlace.tag || (language === 'en' ? "A Happy Moment" : "快乐瞬间")}
              </h3>
              
              <h1 className="text-5xl md:text-7xl font-serif text-slate-800 mb-8 tracking-tight">
                {currentPlace.cityName}
              </h1>
              
              <p className="text-xl md:text-3xl text-slate-700 font-light leading-relaxed max-w-3xl mx-auto mb-10">
                {language === 'en' ? currentPlace.curatedDescription : (currentPlace.curatedDescriptionZh || currentPlace.curatedDescription)}
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                {(language === 'en' ? currentPlace.highlights : (currentPlace.highlightsZh || currentPlace.highlights))?.map((h, i) => (
                  <span key={i} className="px-6 py-2.5 bg-orange-100/50 text-orange-600 rounded-full text-xs uppercase tracking-widest font-bold border border-orange-200">
                    {h}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 p-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="text-slate-400 hover:text-slate-800 transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-200 flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button onClick={() => setCurrentIndex(Math.min(sortedPlaces.length - 1, currentIndex + 1))} className="text-slate-400 hover:text-slate-800 transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {currentPlace.curatedImages && currentPlace.curatedImages.length > 1 && (
              <button 
                onClick={() => {
                  const nextIdx = (currentImageIndex + 1) % currentPlace.curatedImages!.length;
                  setSelectedImageIndexes(prev => ({ ...prev, [currentPlace.id]: nextIdx }));
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-orange-200 bg-white text-[10px] text-orange-600 hover:bg-orange-50 uppercase tracking-widest font-bold transition-all shadow-sm"
                title={t.moreCityStills}
              >
                <Film className="w-4 h-4" />
                {t.changePoster}
              </button>
            )}
            <button 
              onClick={() => setShowSceneList(!showSceneList)}
              className={`p-3 rounded-full border transition-all shadow-sm ${showSceneList ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {sortedPlaces.map((p, i) => (
            <button 
              key={p.id}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all relative shadow-sm ${i === currentIndex ? 'border-orange-500 scale-105 z-10' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={p.curatedImages?.[selectedImageIndexes[p.id] || 0]?.url || p.curatedImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                <span className="text-[8px] text-white font-bold uppercase tracking-tighter truncate">{p.cityName}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const TransitionScreen = () => {
    if (!transitionData) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-50"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-10">
            <motion.div 
              animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-orange-500"
            >
              <ArrowRight className="w-10 h-10" />
            </motion.div>
          </div>
          
          <h4 className="text-orange-400 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            {language === 'en' ? "Next Happy Stop" : "下一站快乐"}
          </h4>
          <h2 className="text-slate-800 font-serif text-5xl md:text-7xl mb-8 tracking-tight">
            {transitionData.to.cityName}
          </h2>
          
          <p className="text-slate-400 font-serif italic text-2xl">
            {language === 'en' ? "More smiles ahead..." : "前方更多欢笑..."}
          </p>
        </motion.div>
      </motion.div>
    );
  };

  const EndCredits = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center z-50 overflow-y-auto"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}
        className="max-w-xl py-20"
      >
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-10">
          <Sparkles className="w-12 h-12 text-orange-500" />
        </div>
        
        <h2 className="text-slate-800 font-serif text-5xl mb-16 tracking-tight">
          {language === 'en' ? "To Be Continued..." : "未完待续..."}
        </h2>
        
        <div className="space-y-12 mb-20">
          <div>
            <h4 className="text-orange-500 text-xs uppercase tracking-widest mb-6 font-bold">
              {language === 'en' ? "Happy Places Visited" : "走过的快乐足迹"}
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {sortedPlaces.map(p => (
                <span key={p.id} className="text-slate-700 font-serif text-lg bg-orange-50 px-6 py-2 rounded-full border border-orange-100">
                  {p.cityName}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-orange-500 text-xs uppercase tracking-widest mb-4 font-bold">
              {language === 'en' ? "A Little Note" : "快乐寄语"}
            </h4>
            <p className="text-slate-500 font-serif italic text-2xl leading-relaxed">
              {language === 'en' 
                ? "Every place is a new reason to smile. Keep exploring, keep shining!" 
                : "每一个地方都是一个微笑的新理由。继续探索，继续闪耀！"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pt-10">
          <button 
            onClick={() => { setCurrentIndex(0); setState("scene"); }}
            className="px-12 py-5 bg-orange-500 text-white rounded-full font-bold tracking-[0.1em] uppercase text-sm hover:scale-105 transition-all shadow-lg shadow-orange-200"
          >
            {language === 'en' ? "Relive the Joy" : "再次重温"}
          </button>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest text-[10px] font-bold"
          >
            {language === 'en' ? "Back to Map" : "返回地图"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "lobby" && <Lobby key="lobby" />}
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
                <h2 className="text-2xl font-serif">{t.chaptersTitle}</h2>
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
