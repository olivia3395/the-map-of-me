import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Film, Book, Map as MapIcon, Info, ChevronRight } from "lucide-react";
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
    'boston': { en: 'Sylvia Plath, Edgar Allan Poe, John F. Kennedy', zh: '西尔维娅·普拉斯, 埃德加·爱伦·坡, 约翰·肯尼迪' },
  };
  const entry = figures[city.toLowerCase()];
  if (entry) return entry[language];
  return language === 'en' ? 'Local historical & cultural icons' : '当地历史文化偶像';
};

export default function CityProfileCard({ place, onClose, language }: CityProfileCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'screen' | 'page' | 'walk'>('overview');
  const labels = t[language];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute bottom-36 left-8 w-[340px] z-40 pointer-events-auto"
    >
      <div className="bg-trippin-bg/95 backdrop-blur-2xl border border-trippin-line rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[600px]">
        {/* Top accent line */}
        <div className="h-1.5 w-full bg-trippin-accent" />
        
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
              <div className="text-[8px] uppercase tracking-[0.4em] text-trippin-accent mb-2 font-black">
                {labels.placeView}
              </div>
              <h3 className="text-3xl font-serif text-trippin-ink tracking-tight leading-tight mb-1 italic">
                {language === 'zh' && place.cityNameZh ? place.cityNameZh : place.cityName}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-trippin-ink/40 font-bold">
                {place.country}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-trippin-ink/40 hover:text-trippin-ink transition-colors bg-trippin-line/50 hover:bg-trippin-line rounded-full p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cultural Summary */}
          {(place.culturalSummary || place.culturalSummaryZh) && (
            <div className="mb-6 p-4 bg-trippin-accent/5 border-l-2 border-trippin-accent rounded-r-xl">
              <p className="text-[12px] text-trippin-ink/80 italic font-serif leading-relaxed">
                {language === 'zh' ? place.culturalSummaryZh : place.culturalSummary}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-trippin-line mb-5">
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
              label={labels.overview} 
              icon={<Info size={12} />}
            />
            <TabButton 
              active={activeTab === 'screen'} 
              onClick={() => setActiveTab('screen')} 
              label={labels.onScreen} 
              icon={<Film size={12} />}
            />
            <TabButton 
              active={activeTab === 'page'} 
              onClick={() => setActiveTab('page')} 
              label={labels.onThePage} 
              icon={<Book size={12} />}
            />
            <TabButton 
              active={activeTab === 'walk'} 
              onClick={() => setActiveTab('walk')} 
              label={labels.walkTheCity} 
              icon={<MapIcon size={12} />}
            />
          </div>

          {/* Tab Content */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-trippin-ink/40 block">{labels.coordinates}</span>
                      <span className="text-[11px] font-mono text-trippin-ink">{formatCoords(place.lat, place.lng)}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-trippin-ink/40 block">{labels.timeZone}</span>
                      <span className="text-[11px] font-mono text-trippin-ink">{formatTimeZone(place.lng)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-trippin-ink/40 block">{labels.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-trippin-ink">{place.tag || (language === 'en' ? 'Exploration' : '探索')}</span>
                      <span className="px-2 py-0.5 rounded-full bg-trippin-line text-[9px] font-mono text-trippin-ink/60">{place.year}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest text-trippin-ink/40 block">{labels.notableFigures}</span>
                    <span className="text-[11px] text-trippin-ink/70 font-serif italic leading-relaxed block">
                      {getNotableFigures(place.cityName, language)}
                    </span>
                  </div>

                  {place.memory && (
                    <div className="space-y-2 pt-2 border-t border-trippin-line">
                      <span className="text-[9px] uppercase tracking-widest text-trippin-ink/40 block">{language === 'en' ? 'Personal Memory' : '个人记忆'}</span>
                      <p className="text-[11px] text-trippin-ink/80 leading-relaxed">
                        {place.memory}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'screen' && (
                <motion.div
                  key="screen"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {place.onScreen ? (
                    <div className="space-y-4">
                      {place.onScreen.map((item, i) => (
                        <div key={i} className="group cursor-default border-b border-trippin-line pb-3 last:border-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-trippin-accent font-bold">
                              {language === 'zh' ? item.genreZh : item.genre}
                            </span>
                            <Film size={10} className="opacity-20" />
                          </div>
                          <p className="text-[12px] font-bold text-trippin-ink group-hover:text-trippin-accent transition-colors">
                            {language === 'zh' && item.titleZh ? item.titleZh : item.title}
                          </p>
                          <p className="text-[10px] text-trippin-ink/40 font-mono italic mb-2">
                            — {language === 'zh' && item.locationZh ? item.locationZh : item.location}
                          </p>
                          {item.summary && (
                            <p className="text-[10px] text-trippin-ink/60 leading-relaxed line-clamp-2">
                              {language === 'zh' ? item.summaryZh : item.summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-20">
                      <Film size={24} className="mb-2" />
                      <p className="text-[11px] italic">
                        {language === 'zh' ? '暂无影视取景数据' : 'No filming location data available'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'page' && (
                <motion.div
                  key="page"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {place.onThePage ? (
                    <div className="space-y-4">
                      {place.onThePage.map((item, i) => (
                        <div key={i} className="group cursor-default border-b border-trippin-line pb-3 last:border-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-trippin-accent font-bold">
                              {language === 'zh' ? item.genreZh : item.genre}
                            </span>
                            <Book size={10} className="opacity-20" />
                          </div>
                          <p className="text-[12px] font-bold text-trippin-ink group-hover:text-trippin-accent transition-colors mb-1">
                            {language === 'zh' && item.titleZh ? item.titleZh : item.title}
                          </p>
                          {item.summary && (
                            <p className="text-[10px] text-trippin-ink/60 leading-relaxed line-clamp-2">
                              {language === 'zh' ? item.summaryZh : item.summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-20">
                      <Book size={24} className="mb-2" />
                      <p className="text-[11px] italic">
                        {language === 'zh' ? '暂无文学足迹数据' : 'No literary data available'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'walk' && (
                <motion.div
                  key="walk"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {place.walkTheCity ? (
                    <div className="relative pl-6 space-y-6">
                      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-trippin-line" />
                      {place.walkTheCity.map((step, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[23.5px] top-1 w-4 h-4 rounded-full bg-trippin-bg border-2 border-trippin-accent flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-trippin-accent" />
                          </div>
                          <p className="text-[11px] font-mono text-trippin-ink/80 uppercase tracking-widest">
                            {language === 'zh' && step.titleZh ? step.titleZh : step.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-20">
                      <MapIcon size={24} className="mb-2" />
                      <p className="text-[11px] italic">
                        {language === 'zh' ? '暂无城市漫步数据' : 'No walking route data available'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 pb-3 transition-all relative ${
        active ? 'text-trippin-accent' : 'text-trippin-ink/30'
      }`}
    >
      {icon}
      <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-trippin-accent" 
        />
      )}
    </button>
  );
}
