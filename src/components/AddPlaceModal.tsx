import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Calendar, Image as ImageIcon, Tag, Loader2 } from "lucide-react";
import { Place } from "../types";

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (place: Omit<Place, "id" | "orderIndex">) => void;
}

export default function AddPlaceModal({ isOpen, onClose, onAdd }: AddPlaceModalProps) {
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

        const curatedImage = `https://picsum.photos/seed/${encodeURIComponent(cityName + country)}/800/600?blur=2`;
        
        let curatedDescription = `A beautiful and unique place in ${country}.`;
        let highlights = ["Local Culture", "Historic Architecture", "Scenic Views"];

        try {
          const aiResponse = await fetch("/api/generate-place-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cityName, country })
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            if (aiData.description) curatedDescription = aiData.description;
            if (aiData.highlights) highlights = aiData.highlights;
          }
        } catch (e) {
          console.error("Failed to fetch AI details", e);
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
          curatedDescription,
          highlights
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
                <h2 className="text-2xl font-serif text-[var(--color-ivory)]">Mark a Place</h2>
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
                      <MapPin className="w-3 h-3" /> City
                    </label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder="Paris"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder="France"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Year / Date
                    </label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder="Summer 2018"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Mood / Tag
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                      placeholder="first solo trip"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400">
                    Memory (Optional)
                  </label>
                  <textarea
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all resize-none"
                    placeholder="Leave blank for a curated poetic memory..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all"
                    placeholder="Leave blank for a curated image..."
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
                      <><Loader2 className="w-4 h-4 animate-spin" /> Locating...</>
                    ) : (
                      "Leave a Light"
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
