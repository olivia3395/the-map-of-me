import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Calendar, Image as ImageIcon, Tag, Loader2 } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
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

  const generateAIDetails = async (city: string, countryName: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return null;

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a joyful storyteller. Generate one very happy, warm, and simple sentence (max 15 words) about the city of ${city}, ${countryName}. 
      Focus on pure joy, a beautiful smile, or a sunny memory. 
      Also, provide exactly 3 "Happy Highlights" (short phrases, max 3 words each) that make people smile about this city.
      Generate the response in BOTH English and Chinese.
      Return a JSON object with:
      - description: English joyful sentence
      - description_zh: Chinese joyful sentence
      - highlights: Array of 3 English happy highlights
      - highlights_zh: Array of 3 Chinese happy highlights`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              description_zh: { type: Type.STRING },
              highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
              highlights_zh: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["description", "description_zh", "highlights", "highlights_zh"]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (e) {
      console.error("Gemini generation failed:", e);
      return null;
    }
  };

  const searchRealImages = async (city: string, countryName: string) => {
    const queries = [
      `${city} ${countryName} skyline cityscape`,
      `${city} ${countryName} landmark iconic`,
      `${city} ${countryName} aerial view`
    ];
    const images: { url: string; attribution?: string; source: string }[] = [];

    try {
      for (const query of queries) {
        const encodedQuery = encodeURIComponent(query);
        const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodedQuery}&gsrlimit=3&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
        const wikiRes = await fetch(wikiUrl);
        const wikiData = await wikiRes.json();

        if (wikiData.query && wikiData.query.pages) {
          Object.values(wikiData.query.pages).forEach((page: any) => {
            if (page.imageinfo && page.imageinfo[0]) {
              const info = page.imageinfo[0];
              const metadata = info.extmetadata;
              const artist = metadata?.Artist?.value || "Unknown";
              const license = metadata?.LicenseShortName?.value || "Public Domain";
              
              // Avoid duplicates
              if (!images.find(img => img.url === info.url)) {
                images.push({
                  url: info.url,
                  attribution: `Photo by ${artist.replace(/<[^>]*>?/gm, '')} (${license}) via Wikimedia Commons`,
                  source: "Wikimedia Commons"
                });
              }
            }
          });
        }
        if (images.length >= 5) break;
      }

      return images.slice(0, 5); // Return up to 5 options
    } catch (e) {
      console.error("Image search failed:", e);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName || !country) {
      setError("City and Country are required.");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Simple geocoding using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          cityName
        )}&country=${encodeURIComponent(country)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        let curatedImage = `https://picsum.photos/seed/${encodeURIComponent(cityName + country)}/1920/1080`;
        let curatedImages: { url: string; attribution?: string; source: string }[] = [];
        
        const realImages = await searchRealImages(cityName, country);
        if (realImages.length > 0) {
          curatedImages = realImages;
          curatedImage = realImages[0].url;
        }

        let curatedDescription = `A beautiful and unique place in ${country}. The architecture and natural landscapes of ${cityName} offer an unforgettable experience.`;
        let curatedDescriptionZh = `位于${country}的一个美丽而独特的地方。${cityName}的建筑和自然景观将为您提供难忘的体验。`;
        let highlights = ["Local Culture", "Historic Architecture", "Scenic Views"];
        let highlightsZh = ["当地文化", "历史建筑", "优美风景"];

        const aiData = await generateAIDetails(cityName, country);
        if (aiData) {
          curatedDescription = aiData.description;
          curatedDescriptionZh = aiData.description_zh;
          highlights = aiData.highlights;
          highlightsZh = aiData.highlights_zh;
        }

        onAdd({
          cityName,
          country,
          lat,
          lng,
          year,
          memory,
          tag,
          imageUrl,
          curatedImage,
          curatedImages,
          curatedDescription,
          curatedDescriptionZh,
          highlights,
          highlightsZh
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
        setError("Could not find coordinates for this location. Please check the spelling.");
      }
    } catch (err) {
      setError("Failed to search location. Please try again.");
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--color-charcoal)] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif text-[var(--color-ivory)]">{language === 'en' ? 'Mark a Place' : '标记地点'}</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {language === 'en' ? 'City' : '城市'}
                    </label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder={language === 'en' ? 'Paris' : '巴黎'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400">
                      {language === 'en' ? 'Country' : '国家'}
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder={language === 'en' ? 'France' : '法国'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {language === 'en' ? 'Year / Date' : '年份 / 日期'}
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder={language === 'en' ? 'Summer 2018' : '2018年夏天'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Tag className="w-3 h-3" /> {language === 'en' ? 'Mood / Tag' : '心情 / 标签'}
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder={language === 'en' ? 'first solo trip' : '第一次独自旅行'}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400">
                    {language === 'en' ? 'Memory (Optional)' : '记忆 (可选)'}
                  </label>
                  <textarea
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all resize-none"
                    placeholder={language === 'en' ? 'Leave blank for a curated poetic memory...' : '留空以生成诗意的记忆...'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> {language === 'en' ? 'Image URL (Optional)' : '图片链接 (可选)'}
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                    placeholder={language === 'en' ? 'Leave blank for a curated image...' : '留空以使用精选图片...'}
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-gold)]/20 hover:bg-[var(--color-gold)]/30 text-[var(--color-gold)] border border-[var(--color-gold)]/50 rounded-lg px-4 py-3 uppercase tracking-widest text-sm transition-all disabled:opacity-50"
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
