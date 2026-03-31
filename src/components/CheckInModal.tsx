import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, MapPin, Heart, Sparkles, Zap, Compass } from 'lucide-react';
import { Language, t as translations } from '../i18n';
import { Work, CheckInPoint, CheckInRecord } from '../types';

interface CheckInModalProps {
  language: Language;
  work: Work;
  point: CheckInPoint;
  onClose: () => void;
  onFinish: (record: CheckInRecord) => void;
}

const moods = [
  { id: 'moved', label: 'moved', icon: Heart },
  { id: 'healing', label: 'healing', icon: Sparkles },
  { id: 'shocked', label: 'shocked', icon: Zap },
  { id: 'pilgrimage', label: 'pilgrimage', icon: Compass },
];

export default function CheckInModal({ language, work, point, onClose, onFinish }: CheckInModalProps) {
  const t = translations[language];
  const [reflection, setReflection] = useState('');
  const [selectedMood, setSelectedMood] = useState<CheckInRecord['mood']>('moved');

  const handleFinish = () => {
    const record: CheckInRecord = {
      id: Math.random().toString(36).substr(2, 9),
      workId: work.id,
      pointId: point.id,
      reflection,
      mood: selectedMood,
      timestamp: Date.now(),
    };
    onFinish(record);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-trippin-warm-ink/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-trippin-warm-bg w-full max-w-2xl border border-trippin-warm-border shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 flex items-center justify-between border-b border-trippin-warm-border bg-white/50">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-trippin-accent/10 rounded-full flex items-center justify-center text-trippin-accent">
              <MapPin size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-trippin-accent">{t.checkInProtocol}</span>
                <div className="w-1 h-1 bg-trippin-accent rounded-full" />
                <span className="text-[9px] font-mono opacity-30 uppercase tracking-widest">v2.1</span>
              </div>
              <h3 className="text-3xl font-serif italic text-trippin-warm-ink">
                {language === 'zh' ? point.nameZh : point.name}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-trippin-warm-ink/5 rounded-full transition-all">
            <X size={24} className="opacity-40" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-12 overflow-y-auto max-h-[70vh] scrollbar-hide">
          {/* Work Context */}
          <div className="flex items-center gap-4 p-4 bg-white/30 border border-trippin-warm-border border-dashed">
            <div className="w-12 h-16 bg-trippin-warm-ink/5 flex-shrink-0 overflow-hidden">
              <img src={work.posterUrl} alt={work.title} className="w-full h-full object-cover grayscale opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-mono opacity-30 uppercase">{t.sourceMaterial}</p>
              <p className="text-sm font-serif italic">{language === 'zh' ? work.titleZh : work.title}</p>
            </div>
          </div>

          {/* Photo Upload Placeholder */}
          <div className="aspect-video bg-white/40 border border-trippin-warm-border border-dashed flex flex-col items-center justify-center gap-6 group hover:border-trippin-accent transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-trippin-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 bg-trippin-warm-bg border border-trippin-warm-border flex items-center justify-center group-hover:bg-trippin-accent group-hover:text-white transition-all shadow-sm z-10">
              <Camera size={32} />
            </div>
            <div className="text-center space-y-2 z-10">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100">{t.captureVisualRecord}</span>
              <span className="block text-[8px] font-mono opacity-20 uppercase">{t.dragDropUpload}</span>
            </div>
          </div>

          {/* Mood Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-30">{t.mood}</label>
              <div className="flex-1 h-px bg-trippin-warm-border opacity-20" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {moods.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id as any)}
                  className={`flex flex-col items-center gap-4 p-8 transition-all border ${
                    selectedMood === mood.id
                      ? 'bg-trippin-accent border-trippin-accent text-white shadow-lg shadow-trippin-accent/20'
                      : 'bg-white/40 border-trippin-warm-border text-trippin-warm-ink/40 hover:border-trippin-warm-ink hover:text-trippin-warm-ink'
                  }`}
                >
                  <mood.icon size={28} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                    {t[mood.label as keyof typeof t]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] opacity-30">{t.reflections}</label>
              <div className="flex-1 h-px bg-trippin-warm-border opacity-20" />
            </div>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={language === 'zh' ? '记录下此刻的感悟...' : 'Write down your reflections...'}
              className="w-full h-48 bg-white/40 border border-trippin-warm-border p-8 outline-none focus:border-trippin-accent transition-all text-trippin-warm-ink resize-none font-serif italic text-2xl placeholder:opacity-20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-trippin-warm-border flex gap-6 bg-white/50">
          <button 
            onClick={onClose}
            className="flex-1 py-5 border border-trippin-warm-border text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white transition-all shadow-sm"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleFinish}
            className="flex-[2] py-5 bg-trippin-warm-ink text-trippin-warm-bg text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent hover:text-white transition-all shadow-2xl"
          >
            {t.finishCheckIn}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
