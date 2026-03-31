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
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-trippin-warm-bg text-trippin-warm-ink">
      {/* Left: Visual Hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full md:w-1/2 h-[50vh] md:h-full border-r border-trippin-warm-border overflow-hidden"
      >
        <img 
          src={work.posterUrl} 
          alt={work.title} 
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-trippin-warm-bg via-transparent to-transparent opacity-80" />
        
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 z-10 flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md border border-trippin-warm-border text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent hover:text-white transition-all shadow-sm"
        >
          <ChevronLeft size={16} />
          {t.returnHome}
        </button>

        <div className="absolute bottom-12 left-12 right-12 space-y-6">
          <div className="flex items-center gap-3 text-trippin-accent">
            <div className="w-8 h-px bg-trippin-accent" />
            {work.type === 'movie' ? <Film size={18} /> : <Book size={18} />}
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]">{work.type === 'movie' ? t.movie : t.book} / {work.year}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif italic leading-none mb-4 drop-shadow-sm">
            {language === 'zh' ? work.titleZh : work.title}
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-xs font-mono opacity-40 uppercase tracking-widest">
              {work.type === 'movie' ? `${t.directedBy} ${work.director}` : `${t.writtenBy} ${work.author}`}
            </p>
            <div className="h-px flex-1 bg-trippin-warm-border" />
            <div className="text-[10px] font-mono text-trippin-accent font-bold">MATCH_98%</div>
          </div>
        </div>
      </motion.div>

      {/* Right: Content & Locations */}
      <div className="flex-1 overflow-y-auto p-8 md:p-20 space-y-20 scrollbar-hide">
        {/* Quote Section */}
        <section className="space-y-8 relative">
          <div className="absolute -left-10 top-0 w-px h-full bg-trippin-warm-border hidden md:block" />
          <div className="flex items-center gap-3 text-trippin-accent opacity-30">
            <Quote size={20} />
            <div className="flex-1 h-px bg-trippin-warm-border" />
          </div>
          <p className="text-4xl md:text-5xl font-serif italic leading-[1.1] text-trippin-warm-ink/90">
            "{language === 'zh' ? work.quoteZh : work.quote}"
          </p>
        </section>

        {/* Introduction */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-30">{t.introduction}</h3>
            <div className="flex-1 h-px bg-trippin-warm-border opacity-20" />
          </div>
          <p className="text-xl leading-relaxed opacity-70 font-light max-w-2xl">
            {language === 'zh' ? work.introductionZh : work.introduction}
          </p>
        </section>

        {/* Technical Specs - Added Detail */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-white/40 border border-trippin-warm-border">
          <div className="space-y-1">
            <p className="text-[9px] font-mono opacity-30 uppercase">{t.release}</p>
            <p className="text-xs font-mono font-bold">{work.year}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-mono opacity-30 uppercase">{t.genre}</p>
            <p className="text-xs font-mono font-bold">{t.drama} / {t.romance}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-mono opacity-30 uppercase">{t.rating}</p>
            <p className="text-xs font-mono font-bold">8.4 / 10</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-mono opacity-30 uppercase">{t.archiveId}</p>
            <p className="text-xs font-mono font-bold">TRP-00{work.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-mono opacity-30 uppercase">{t.status}</p>
            <p className="text-xs font-mono font-bold text-trippin-accent uppercase">{t.verified}</p>
          </div>
        </section>

        {/* Locations Grid */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-30">{t.filmingLocations}</h3>
              <div className="w-2 h-2 bg-trippin-accent rounded-full" />
            </div>
            <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest">Total: {work.checkInPoints.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-px bg-trippin-warm-border border border-trippin-warm-border overflow-hidden shadow-2xl">
            {work.checkInPoints.map((point, idx) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-trippin-warm-bg p-10 flex items-center justify-between hover:bg-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-8">
                  <div className="text-[10px] font-mono opacity-20">0{idx + 1}</div>
                  <div>
                    <h4 className="text-2xl font-serif mb-2 group-hover:text-trippin-accent transition-colors">
                      {language === 'zh' ? point.nameZh : point.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono opacity-40 uppercase tracking-wider">
                      <MapPin size={10} className="text-trippin-accent" />
                      {language === 'zh' ? point.locationZh : point.location}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onCheckIn(point)}
                  className="px-10 py-4 bg-trippin-warm-ink text-trippin-warm-bg text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent hover:text-white transition-all shadow-lg"
                >
                  {t.checkIn}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-6 pt-12">
          <button className="flex-1 min-w-[200px] py-5 border border-trippin-warm-border flex items-center justify-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white transition-all shadow-sm">
            <Bookmark size={16} />
            {t.collect}
          </button>
          <button className="flex-1 min-w-[200px] py-5 bg-trippin-accent text-white flex items-center justify-center gap-3 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent/90 transition-all shadow-2xl">
            <Share2 size={16} />
            {t.shareMap}
          </button>
        </section>

        <div className="flex justify-center pt-12 pb-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-trippin-warm-border" />
            <p className="text-[9px] font-mono opacity-20 uppercase tracking-[0.5em]">{t.endOfEntry}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
