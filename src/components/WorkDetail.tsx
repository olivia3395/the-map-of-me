import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Film, Book, ChevronLeft, Heart, Share2, Bookmark, Quote } from 'lucide-react';
import { Language, t as translations } from '../i18n';
import { Work, CheckInPoint } from '../types';

interface WorkDetailProps {
  language: Language;
  work: Work;
  onBack: () => void;
  onCheckIn: (point: CheckInPoint) => void;
}

export default function WorkDetail({ language, work, onBack, onCheckIn }: WorkDetailProps) {
  const t = translations[language];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-trippin-bg">
      {/* Left: Visual Hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full md:w-1/2 h-[50vh] md:h-full brutalist-border-r overflow-hidden"
      >
        <img 
          src={work.posterUrl} 
          alt={work.title} 
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-trippin-bg via-transparent to-transparent opacity-60" />
        
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 z-10 flex items-center gap-2 px-6 py-3 bg-trippin-bg/80 backdrop-blur-md brutalist-border text-xs font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent hover:text-white transition-all"
        >
          <ChevronLeft size={16} />
          {t.returnHome}
        </button>

        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex items-center gap-3 text-trippin-accent mb-4">
            {work.type === 'movie' ? <Film size={20} /> : <Book size={20} />}
            <span className="text-xs font-mono font-bold uppercase tracking-[0.3em]">{work.type} / {work.year}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif italic leading-tight mb-4">
            {language === 'zh' ? work.titleZh : work.title}
          </h1>
          <p className="text-sm font-mono opacity-50 uppercase tracking-widest">
            {work.type === 'movie' ? `Directed by ${work.director}` : `Written by ${work.author}`}
          </p>
        </div>
      </motion.div>

      {/* Right: Content & Locations */}
      <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-16">
        {/* Quote Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-trippin-accent opacity-50">
            <Quote size={24} />
            <div className="flex-1 h-px bg-trippin-border" />
          </div>
          <p className="text-3xl md:text-4xl font-serif italic leading-relaxed text-trippin-ink/90">
            "{language === 'zh' ? work.quoteZh : work.quote}"
          </p>
        </section>

        {/* Introduction */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-30">{t.introduction}</h3>
          <p className="text-lg leading-relaxed opacity-70 font-light">
            {language === 'zh' ? work.introductionZh : work.introduction}
          </p>
        </section>

        {/* Locations Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-30">{t.filmingLocations}</h3>
            <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest">Total: {work.checkInPoints.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-px bg-trippin-border brutalist-border overflow-hidden">
            {work.checkInPoints.map((point, idx) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-trippin-bg p-8 flex items-center justify-between hover:bg-trippin-surface transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="text-[10px] font-mono opacity-20">0{idx + 1}</div>
                  <div>
                    <h4 className="text-xl font-serif mb-1 group-hover:text-trippin-accent transition-colors">
                      {language === 'zh' ? point.nameZh : point.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono opacity-40 uppercase tracking-wider">
                      <MapPin size={10} />
                      {language === 'zh' ? point.locationZh : point.location}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onCheckIn(point)}
                  className="px-8 py-3 bg-trippin-ink text-trippin-bg text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent hover:text-white transition-all"
                >
                  {t.checkIn}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-4 pt-8">
          <button className="flex-1 min-w-[200px] py-4 brutalist-border flex items-center justify-center gap-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-trippin-surface transition-colors">
            <Bookmark size={16} />
            {t.collect}
          </button>
          <button className="flex-1 min-w-[200px] py-4 bg-trippin-accent text-white flex items-center justify-center gap-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent/90 transition-colors shadow-xl">
            <Share2 size={16} />
            {t.shareMap}
          </button>
        </section>
      </div>
    </div>
  );
}
