import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Film, Book, ChevronRight, Filter } from 'lucide-react';
import { Work } from '../types';
import { Language, t as translations } from '../i18n';

interface TrippinPickProps {
  language: Language;
  onPick: (city: string, genres: string[]) => void;
  onSelectWork: (work: Work) => void;
  recommendedWorks: Work[];
}

const TrippinPick: React.FC<TrippinPickProps> = ({ language, onPick, onSelectWork, recommendedWorks }) => {
  const t = translations[language];
  const [city, setCity] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const genres = [
    { id: 'romance', label: 'romance' },
    { id: 'mystery', label: 'mystery' },
    { id: 'sci-fi', label: 'sci-fi' },
    { id: 'drama', label: 'drama' },
    { id: 'adventure', label: 'adventure' },
  ];

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) ? prev.filter(g => g !== genreId) : [...prev, genreId]
    );
  };

  return (
    <div className="space-y-24">
      {/* Search Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div className="space-y-8">
          <div className="relative group">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-trippin-accent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input 
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={language === 'zh' ? "输入目的地..." : "Enter destination..."}
              className="w-full bg-transparent text-5xl md:text-7xl font-serif italic outline-none placeholder:opacity-10"
            />
            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] opacity-30">
              <MapPin size={12} />
              <span>Target Coordinates Required</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`px-6 py-2 rounded-full border text-xs font-mono uppercase tracking-widest transition-all ${
                  selectedGenres.includes(genre.id) 
                    ? 'bg-trippin-accent border-trippin-accent text-white' 
                    : 'border-trippin-border text-trippin-muted hover:border-trippin-ink hover:text-trippin-ink'
                }`}
              >
                {t[genre.label as keyof typeof t] || genre.label}
              </button>
            ))}
          </div>
        </div>

        <div className="brutalist-border p-8 space-y-6 bg-trippin-surface/30">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <Filter size={12} />
            <span>Search Parameters</span>
          </div>
          <p className="text-sm opacity-60 leading-relaxed">
            {language === 'zh' 
              ? "通过电影和文学作品探索城市。我们的算法将根据你的目的地和偏好匹配最相关的文化地标。" 
              : "Explore cities through the lens of cinema and literature. Our algorithm matches cultural landmarks based on your destination and preferences."}
          </p>
          <button 
            onClick={() => onPick(city, selectedGenres)}
            className="w-full py-4 bg-trippin-ink text-trippin-bg font-bold uppercase tracking-[0.2em] text-xs hover:bg-trippin-accent hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Search size={16} />
            {language === 'zh' ? "开始检索" : "Initialize Search"}
          </button>
        </div>
      </section>

      {/* Results Section */}
      <section>
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-serif italic">{language === 'zh' ? "推荐作品" : "Curated Works"}</h2>
          <div className="flex-1 h-px bg-trippin-border" />
          <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">Matches: {recommendedWorks.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-trippin-border brutalist-border overflow-hidden">
          {recommendedWorks.map((work, idx) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelectWork(work)}
              className="group relative bg-trippin-bg p-8 flex gap-8 cursor-pointer hover:bg-trippin-surface transition-colors"
            >
              <div className="w-32 h-48 flex-shrink-0 brutalist-border overflow-hidden relative">
                <img 
                  src={work.posterUrl} 
                  alt={work.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 w-6 h-6 bg-trippin-bg/80 backdrop-blur flex items-center justify-center rounded-sm">
                  {work.type === 'movie' ? <Film size={12} /> : <Book size={12} />}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="text-[10px] font-mono opacity-30 uppercase tracking-widest mb-2">
                    {work.type} / {work.year}
                  </div>
                  <h3 className="text-2xl font-serif mb-1 group-hover:text-trippin-accent transition-colors">
                    {language === 'zh' ? work.titleZh : work.title}
                  </h3>
                  <p className="text-xs opacity-50 italic">
                    {work.type === 'movie' ? work.director : work.author}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono opacity-30 uppercase">Match:</span>
                    <span className="text-xs font-mono text-trippin-accent">{work.matchRate}%</span>
                  </div>
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TrippinPick;
