import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Film, Book, ChevronRight, Filter, Map as MapIcon, Info, Sparkles } from 'lucide-react';
import { Work, Place } from '../types';
import { Language, t as translations } from '../i18n';

interface TrippinPickProps {
  language: Language;
  onPick: (city: string) => void;
  onCityChange?: (city: string) => void;
  onSelectWork: (work: Work) => void;
  works: Work[];
  isSearching?: boolean;
  isFallback?: boolean;
  cityData?: Partial<Place> | null;
}

const TrippinPick: React.FC<TrippinPickProps> = ({ 
  language, 
  onPick, 
  onCityChange,
  onSelectWork, 
  works, 
  isSearching, 
  isFallback,
  cityData 
}) => {
  const t = translations[language];
  const [city, setCity] = useState('');
  const [activeModule, setActiveModule] = useState<'screen' | 'page' | 'walk'>('screen');

  const handleCityChange = (val: string) => {
    setCity(val);
    onCityChange?.(val);
  };

  const TabPill = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${
        active ? 'bg-trippin-ink text-white' : 'text-trippin-ink/40 hover:text-trippin-ink'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-trippin-warm-bg text-trippin-warm-ink space-y-32 p-12">
      {/* Search Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20 items-start">
        <div className="space-y-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-trippin-accent mb-4">
              <div className="w-12 h-px bg-trippin-accent" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">{t.initializeDiscovery}</span>
            </div>
            <div className="relative group">
              <input 
                type="text"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onPick(city)}
                placeholder={language === 'zh' ? "输入目的地..." : "Enter destination..."}
                className="w-full bg-transparent text-6xl md:text-8xl font-serif italic outline-none placeholder:opacity-5 border-b border-trippin-line pb-4 focus:border-trippin-accent transition-colors"
              />
              <div className="mt-6 flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-30">
                  <MapPin size={12} />
                  <span>{t.targetCoordinatesRequired}</span>
                </div>
                <div className="h-px flex-1 bg-trippin-line" />
                <div className="text-[10px] font-mono opacity-20">001 / 002</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-trippin-line p-10 space-y-8 bg-white/50 backdrop-blur-sm relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-trippin-accent/5 -translate-y-1/2 translate-x-1/2 rounded-full" />
          
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <Filter size={12} />
            <span>{t.searchParameters}</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm opacity-60 leading-relaxed font-light">
              {language === 'zh' ? "基于地理坐标与文化映射算法，为您检索城市深处的影剧与文学灵感。" : "Retrieving cinematic and literary inspiration from the depths of the city based on geographic coordinates and cultural mapping algorithms."}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-[9px] font-mono opacity-30 uppercase">{t.database}</p>
                <p className="text-xs font-mono">GLOBAL_ARCHIVE_V4</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-mono opacity-30 uppercase">{t.algorithm}</p>
                <p className="text-xs font-mono">CULTURAL_MAPPING</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onPick(city)}
            className="w-full py-5 bg-trippin-ink text-trippin-bg font-bold uppercase tracking-[0.3em] text-xs hover:bg-trippin-accent hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl rounded-xl"
          >
            <Search size={16} />
            {t.initializeSearch}
          </button>
        </div>
      </section>

      {/* City Spotlight / City Shelf Section */}
      <AnimatePresence mode="wait">
        {cityData && !isSearching && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-16"
          >
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center gap-6">
                <h2 className="text-7xl md:text-9xl font-serif italic text-trippin-accent leading-none">
                  {language === 'zh' && cityData.cityNameZh ? cityData.cityNameZh : cityData.cityName}
                </h2>
                <div className="h-px flex-1 bg-trippin-accent/20" />
                <div className="px-6 py-2 border-2 border-trippin-accent text-xs font-mono uppercase tracking-[0.4em] text-trippin-accent font-black rounded-full">
                  {t.cityShelf}
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-serif leading-tight opacity-90 max-w-3xl">
                {language === 'zh' ? cityData.culturalSummaryZh : cityData.culturalSummary}
              </p>
            </div>

            {/* The City Shelf - Visual Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              {/* 1 Classic Movie (On Screen) */}
              <div className="lg:col-span-4 group">
                <div className="h-full border border-trippin-line p-8 space-y-8 bg-white/40 backdrop-blur-sm hover:bg-trippin-ink hover:text-white transition-all duration-500 cursor-default rounded-3xl">
                  <div className="flex justify-between items-start">
                    <Film size={24} className="opacity-40" />
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">{t.onScreen}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-trippin-accent font-bold">
                        {language === 'zh' ? cityData.onScreen?.[0]?.genreZh : cityData.onScreen?.[0]?.genre}
                      </span>
                      <h3 className="text-4xl font-serif italic leading-tight">
                        {language === 'zh' ? cityData.onScreen?.[0]?.titleZh : cityData.onScreen?.[0]?.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-60">
                      <MapPin size={12} />
                      <span>{language === 'zh' ? cityData.onScreen?.[0]?.locationZh : cityData.onScreen?.[0]?.location}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-60 group-hover:opacity-90 line-clamp-4">
                    {language === 'zh' ? cityData.onScreen?.[0]?.summaryZh : cityData.onScreen?.[0]?.summary}
                  </p>
                </div>
              </div>

              {/* 2 Novels (On the Page) */}
              <div className="lg:col-span-5 grid grid-rows-2 gap-6">
                {cityData.onThePage?.slice(0, 2).map((book, idx) => (
                  <div key={idx} className="border border-trippin-line p-8 flex gap-8 bg-white/40 backdrop-blur-sm hover:border-trippin-accent transition-all group rounded-3xl">
                    <div className="w-16 h-24 bg-trippin-ink/5 border border-trippin-line flex items-center justify-center group-hover:bg-trippin-accent/10 transition-colors shrink-0 rounded-lg">
                      <Book size={24} className="opacity-20" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">{t.onThePage} 0{idx + 1}</span>
                        <span className="h-1 w-1 rounded-full bg-trippin-line" />
                        <span className="text-[9px] font-mono uppercase tracking-widest text-trippin-accent font-bold">
                          {language === 'zh' ? book.genreZh : book.genre}
                        </span>
                      </div>
                      <h4 className="text-2xl font-serif italic leading-tight">
                        {language === 'zh' ? book.titleZh : book.title}
                      </h4>
                      <p className="text-xs leading-relaxed opacity-50 group-hover:opacity-80 line-clamp-2">
                        {language === 'zh' ? book.summaryZh : book.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 1 Walkable Route (Walk the City) */}
              <div className="lg:col-span-3">
                <div className="h-full border-2 border-dashed border-trippin-line p-8 flex flex-col justify-between bg-trippin-ink/5 hover:border-trippin-accent transition-all group rounded-3xl">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <MapIcon size={20} className="text-trippin-accent" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{t.walkTheCity}</span>
                    </div>
                    <div className="space-y-4">
                      {cityData.walkTheCity?.slice(0, 4).map((step, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-trippin-accent font-bold">0{i+1}</span>
                          <span className="text-xs font-mono uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                            {language === 'zh' ? step.titleZh : step.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="w-full py-4 mt-8 bg-trippin-ink text-white text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-trippin-accent transition-colors rounded-xl">
                    {language === 'zh' ? "开启漫步" : "Start Walk"}
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Tabs Toggle */}
            <div className="flex justify-center pt-8">
              <div className="flex border border-trippin-line p-1 bg-white/20 backdrop-blur-sm rounded-full">
                <TabPill active={activeModule === 'screen'} onClick={() => setActiveModule('screen')} label={t.onScreen} />
                <TabPill active={activeModule === 'page'} onClick={() => setActiveModule('page')} label={t.onThePage} />
                <TabPill active={activeModule === 'walk'} onClick={() => setActiveModule('walk')} label={t.walkTheCity} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-8"
              >
                {activeModule === 'screen' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cityData.onScreen?.map((item, idx) => (
                      <div key={idx} className="p-8 border border-trippin-line bg-white/10 hover:bg-white/30 transition-all rounded-2xl group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-trippin-accent font-bold">
                            {language === 'zh' ? item.genreZh : item.genre}
                          </span>
                          <Film size={14} className="opacity-20" />
                        </div>
                        <h4 className="text-xl font-serif mb-2">{language === 'zh' ? item.titleZh : item.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase opacity-40 mb-4">
                          <MapPin size={10} />
                          <span>{language === 'zh' ? item.locationZh : item.location}</span>
                        </div>
                        <p className="text-xs opacity-50 group-hover:opacity-80 line-clamp-3">
                          {language === 'zh' ? item.summaryZh : item.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {activeModule === 'page' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cityData.onThePage?.map((item, idx) => (
                      <div key={idx} className="p-8 border border-trippin-line bg-white/10 hover:bg-white/30 transition-all rounded-2xl group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-trippin-accent font-bold">
                            {language === 'zh' ? item.genreZh : item.genre}
                          </span>
                          <Book size={14} className="opacity-20" />
                        </div>
                        <h4 className="text-xl font-serif mb-4">{language === 'zh' ? item.titleZh : item.title}</h4>
                        <p className="text-xs opacity-50 group-hover:opacity-80 line-clamp-3">
                          {language === 'zh' ? item.summaryZh : item.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {activeModule === 'walk' && (
                  <div className="flex flex-wrap gap-4 justify-center">
                    {cityData.walkTheCity?.map((item, idx) => (
                      <div key={idx} className="px-6 py-3 bg-white border border-trippin-line rounded-full flex items-center gap-3 hover:border-trippin-accent transition-colors cursor-default">
                        <span className="text-[10px] font-mono font-bold text-trippin-accent">{idx + 1}</span>
                        <span className="text-xs font-mono uppercase tracking-widest">{language === 'zh' ? item.titleZh : item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <section className="space-y-16 min-h-[400px]">
        <div className="flex items-center gap-6">
          <h2 className="text-4xl font-serif italic">
            {isFallback 
              ? (language === 'zh' ? '全球灵感推荐' : 'Global Recommendations') 
              : t.curatedWorks}
          </h2>
          <div className="flex-1 h-px bg-trippin-line" />
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
              {t.matches}: {isSearching ? '...' : works.length}
            </span>
            <div className={`w-2 h-2 bg-trippin-accent rounded-full ${isSearching ? 'animate-ping' : 'animate-pulse'}`} />
          </div>
        </div>

        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-trippin-line border border-trippin-line overflow-hidden opacity-50 rounded-3xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-trippin-bg p-10 flex gap-10 animate-pulse">
                <div className="w-40 h-60 bg-trippin-line flex-shrink-0 rounded-lg" />
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-trippin-line w-1/2" />
                  <div className="h-8 bg-trippin-line w-3/4" />
                  <div className="h-20 bg-trippin-line w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-trippin-line border border-trippin-line overflow-hidden rounded-3xl shadow-sm">
            {works.map((work, idx) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelectWork(work)}
                className="group relative bg-trippin-bg p-10 flex gap-10 cursor-pointer hover:bg-white transition-all"
              >
                <div className="w-40 h-60 flex-shrink-0 border border-trippin-line overflow-hidden relative shadow-2xl group-hover:scale-105 transition-transform duration-500 rounded-lg">
                  <img 
                    src={work.posterUrl} 
                    alt={work.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur flex items-center justify-center rounded-sm shadow-sm">
                    {work.type === 'movie' ? <Film size={14} /> : <Book size={14} />}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-mono opacity-30 uppercase tracking-widest">
                        {work.type === 'movie' ? t.movie : t.book} / {work.year}
                      </div>
                      <div className="w-1 h-1 bg-trippin-line rounded-full" />
                      <div className="text-[10px] font-mono text-trippin-accent font-bold uppercase tracking-widest">
                        {work.matchRate}% {t.matchRate}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-serif mb-2 group-hover:text-trippin-accent transition-colors leading-tight">
                        {language === 'zh' ? work.titleZh : work.title}
                      </h3>
                      <p className="text-xs opacity-50 italic font-serif">
                        {work.type === 'movie' ? `${t.directedBy} ${work.director}` : `${t.writtenBy} ${work.author}`}
                      </p>
                    </div>

                    <p className="text-xs opacity-40 line-clamp-3 leading-relaxed font-light">
                      {language === 'zh' ? work.introductionZh : work.introduction}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-trippin-line/50">
                    <div className="flex gap-2">
                      {work.locations.map(loc => (
                        <span key={loc} className="text-[9px] font-mono opacity-30 uppercase border border-trippin-line px-2 py-1 rounded">
                          {loc}
                        </span>
                      ))}
                    </div>
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-trippin-accent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-trippin-line bg-white/20 rounded-3xl">
            <Search size={48} className="opacity-10 mb-6" />
            <p className="text-xl font-serif italic opacity-40">
              {t.noResultsFound}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-20 mt-2">
              {t.trySuggestions}
            </p>
          </div>
        )}
      </section>

      {/* Decorative Footer Detail */}
      <div className="flex justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-24 bg-gradient-to-b from-trippin-line to-transparent" />
          <p className="text-[9px] font-mono opacity-20 uppercase tracking-[0.5em]">{t.endOfArchive}</p>
        </div>
      </div>
    </div>
  );
};

export default TrippinPick;
