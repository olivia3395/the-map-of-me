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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-trippin-bg w-full max-w-xl brutalist-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between brutalist-border-b">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-trippin-accent/10 rounded-sm flex items-center justify-center text-trippin-accent">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-xl font-serif italic">
                {language === 'zh' ? point.nameZh : point.name}
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-40">
                {language === 'zh' ? work.titleZh : work.title} • {t.checkIn}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-trippin-surface transition-colors">
            <X size={20} className="opacity-40" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10 overflow-y-auto max-h-[70vh]">
          {/* Photo Upload Placeholder */}
          <div className="aspect-video bg-trippin-surface/30 brutalist-border border-dashed flex flex-col items-center justify-center gap-4 group hover:border-trippin-accent transition-all cursor-pointer">
            <div className="w-16 h-16 bg-trippin-bg brutalist-border flex items-center justify-center group-hover:bg-trippin-accent group-hover:text-white transition-all">
              <Camera size={24} />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100">Upload Visual Record</span>
          </div>

          {/* Mood Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-30">{t.mood}</label>
            <div className="grid grid-cols-4 gap-px bg-trippin-border brutalist-border">
              {moods.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id as any)}
                  className={`flex flex-col items-center gap-3 p-6 transition-all ${
                    selectedMood === mood.id
                      ? 'bg-trippin-accent text-white'
                      : 'bg-trippin-bg text-trippin-muted hover:bg-trippin-surface'
                  }`}
                >
                  <mood.icon size={24} />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                    {t[mood.label as keyof typeof t]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="space-y-4">
            <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-30">{t.reflections}</label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={language === 'zh' ? '记录下此刻的感悟...' : 'Write down your reflections...'}
              className="w-full h-40 bg-trippin-surface/20 brutalist-border p-6 outline-none focus:border-trippin-accent transition-all text-trippin-ink resize-none font-serif italic text-xl"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 brutalist-border-t flex gap-4 bg-trippin-surface/10">
          <button 
            onClick={onClose}
            className="flex-1 py-4 brutalist-border text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-trippin-surface transition-all"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleFinish}
            className="flex-[2] py-4 bg-trippin-ink text-trippin-bg text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-trippin-accent hover:text-white transition-all shadow-xl"
          >
            {t.finishCheckIn}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
