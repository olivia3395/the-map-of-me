import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Place } from "../types";
import { t } from "../i18n";

interface CityProfileCardProps {
  place: Place;
  onClose: () => void;
  language: 'en' | 'zh';
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

const getNotableFigures = (city: string, language: 'en' | 'zh') => {
  const figures: Record<string, { en: string, zh: string }> = {
    'new york': { en: 'Walt Whitman, Jay-Z, Eleanor Roosevelt', zh: '沃尔特·惠特曼, Jay-Z, 埃莉诺·罗斯福' },
    'paris': { en: 'Victor Hugo, Coco Chanel, Marie Curie', zh: '维克多·雨果, 可可·香奈儿, 玛丽·居里' },
    'london': { en: 'Charles Dickens, Alan Turing, Adele', zh: '查尔斯·狄更斯, 艾伦·图灵, 阿黛尔' },
    'tokyo': { en: 'Hayao Miyazaki, Akira Kurosawa', zh: '宫崎骏, 黑泽明' },
    'beijing': { en: 'Lao She, Lu Xun', zh: '老舍, 鲁迅' },
    'shanghai': { en: 'Eileen Chang, Yao Ming', zh: '张爱玲, 姚明' },
    'san francisco': { en: 'Jack London, Bruce Lee', zh: '杰克·伦敦, 李小龙' },
    'los angeles': { en: 'Marilyn Monroe, Kobe Bryant', zh: '玛丽莲·梦露, 科比·布莱恩特' },
    'rome': { en: 'Julius Caesar, Federico Fellini', zh: '尤利乌斯·凯撒, 费德里科·费里尼' },
  };
  const entry = figures[city.toLowerCase()];
  if (entry) return entry[language];
  return language === 'en' ? 'Local historical & cultural icons' : '当地历史文化偶像';
};

export default function CityProfileCard({ place, onClose, language }: CityProfileCardProps) {
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
                {t[language].placeView}
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
              <span className="text-[9px] uppercase tracking-widest text-slate-500">{t[language].category}</span>
              <span className="text-xs font-mono text-slate-200">{place.tag || (language === 'en' ? 'Exploration' : '探索')}</span>
            </div>
            
            <div className="flex justify-between items-end border-b border-slate-700/50 pb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">{t[language].coordinates}</span>
              <span className="text-xs font-mono text-slate-200">{formatCoords(place.lat, place.lng)}</span>
            </div>

            <div className="flex justify-between items-end border-b border-slate-700/50 pb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">{t[language].timeZone}</span>
              <span className="text-xs font-mono text-slate-200">{formatTimeZone(place.lng)}</span>
            </div>

            <div className="pt-1">
              <span className="block text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">{t[language].notableFigures}</span>
              <span className="block text-xs text-slate-300 font-serif italic leading-relaxed">
                {getNotableFigures(place.cityName, language)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
