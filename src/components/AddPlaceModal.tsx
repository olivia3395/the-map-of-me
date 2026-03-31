import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Calendar, Image as ImageIcon, Tag, Loader2, Globe } from "lucide-react";
import { Place } from "../types";

import { t as translations, Language } from "../i18n";

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (place: Omit<Place, "id" | "orderIndex">) => void;
  language: Language;
}

export default function AddPlaceModal({ isOpen, onClose, onAdd, language }: AddPlaceModalProps) {
  const t = translations[language];
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [year, setYear] = useState("");
  const [memory, setMemory] = useState("");
  const [tag, setTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName || !country) {
      setError(language === 'zh' ? "城市和国家是必填项。" : "City and Country are required.");
      return;
    }

    setIsSearching(true);
    setError("");

    const normalizeCountry = (cityName: string, countryName: string) => {
      const chinaRegions = ['Hong Kong', 'Macau', 'Taiwan', '香港', '澳门', '台湾'];
      if (chinaRegions.some(r => cityName.includes(r) || countryName.includes(r))) {
        return language === 'zh' ? '中国' : 'China';
      }
      return countryName;
    };

    const finalCountry = normalizeCountry(cityName, country);

    try {
      // Simple geocoding using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          cityName
        )}&country=${encodeURIComponent(finalCountry)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        onAdd({
          cityName,
          country: finalCountry,
          lat,
          lng,
          year,
          memory,
          tag,
          imageUrl,
        });
        
        // Reset form
        setCityName("");
        setCountry("");
        setYear("");
        setMemory("");
        setTag("");
        setImageUrl("");
        onClose();
      } else {
        setError(language === 'zh' ? "无法找到该地点的坐标，请检查拼写。" : "Could not find coordinates for this location. Please check the spelling.");
      }
    } catch (err) {
      setError(language === 'zh' ? "搜索地点失败，请重试。" : "Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-trippin-ink/40 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-trippin-bg border border-trippin-line rounded-[2rem] shadow-2xl z-[70] overflow-hidden"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-trippin-accent/10 flex items-center justify-center text-trippin-accent">
                    <Globe size={20} />
                  </div>
                  <h2 className="text-3xl font-serif italic text-trippin-ink">{language === 'en' ? 'Mark a Place' : '标记地点'}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-trippin-ink/20 hover:text-trippin-ink transition-colors bg-trippin-line/50 rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-trippin-ink/40 flex items-center gap-2 font-bold">
                      <MapPin className="w-3 h-3" /> {language === 'en' ? 'City' : '城市'}
                    </label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      className="w-full bg-white border border-trippin-line rounded-xl px-4 py-3 text-trippin-ink focus:outline-none focus:border-trippin-accent transition-all placeholder:opacity-20"
                      placeholder={language === 'en' ? 'Paris' : '巴黎'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-trippin-ink/40 font-bold">
                      {language === 'en' ? 'Country' : '国家'}
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white border border-trippin-line rounded-xl px-4 py-3 text-trippin-ink focus:outline-none focus:border-trippin-accent transition-all placeholder:opacity-20"
                      placeholder={language === 'en' ? 'France' : '法国'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-trippin-ink/40 flex items-center gap-2 font-bold">
                      <Calendar className="w-3 h-3" /> {language === 'en' ? 'Year / Date' : '年份 / 日期'}
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-white border border-trippin-line rounded-xl px-4 py-3 text-trippin-ink focus:outline-none focus:border-trippin-accent transition-all placeholder:opacity-20"
                      placeholder={language === 'en' ? 'Summer 2018' : '2018年夏天'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-trippin-ink/40 flex items-center gap-2 font-bold">
                      <Tag className="w-3 h-3" /> {language === 'en' ? 'Mood / Tag' : '心情 / 标签'}
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full bg-white border border-trippin-line rounded-xl px-4 py-3 text-trippin-ink focus:outline-none focus:border-trippin-accent transition-all placeholder:opacity-20"
                      placeholder={language === 'en' ? 'first solo trip' : '第一次独自旅行'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-trippin-ink/40 font-bold">
                    {language === 'en' ? 'Memory (Optional)' : '记忆 (可选)'}
                  </label>
                  <textarea
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-trippin-line rounded-xl px-4 py-3 text-trippin-ink focus:outline-none focus:border-trippin-accent transition-all resize-none placeholder:opacity-20"
                    placeholder={language === 'en' ? 'Leave blank for a curated poetic memory...' : '留空以生成诗意的记忆...'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-trippin-ink/40 flex items-center gap-2 font-bold">
                    <ImageIcon className="w-3 h-3" /> {language === 'en' ? 'Image URL (Optional)' : '图片链接 (可选)'}
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white border border-trippin-line rounded-xl px-4 py-3 text-trippin-ink focus:outline-none focus:border-trippin-accent transition-all placeholder:opacity-20"
                    placeholder={language === 'en' ? 'Leave blank for a curated image...' : '留空以使用精选图片...'}
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-xs font-mono uppercase tracking-widest">{error}</div>
                )}

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full flex items-center justify-center gap-3 bg-trippin-ink hover:bg-trippin-accent text-white rounded-xl px-4 py-4 uppercase tracking-[0.3em] text-xs font-bold transition-all disabled:opacity-50 shadow-xl shadow-trippin-ink/10"
                  >
                    {isSearching ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'en' ? 'Locating...' : '定位中...'}</>
                    ) : (
                      language === 'en' ? "Leave a Light" : "点亮足迹"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
