import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Place } from "../types";

interface ConstellationProps {
  places: Place[];
  onPlaceClick: (place: Place) => void;
  activePlaceId: string | null;
}

export default function Constellation({ places, onPlaceClick, activePlaceId }: ConstellationProps) {
  const width = 240;
  const height = 160;
  const padding = 20;

  const { points, lines } = useMemo(() => {
    if (!places || places.length === 0) return { points: [], lines: [] };

    // Find min/max to scale coordinates
    const lons = places.map(p => p.lng);
    const lats = places.map(p => p.lat);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const lonRange = maxLon - minLon || 1;
    const latRange = maxLat - minLat || 1;

    // To preserve aspect ratio roughly, we can just scale to fit within the box
    // but a simple independent scaling might distort the map. 
    // Let's just do independent scaling for abstract look, or preserve aspect ratio.
    // Abstract look is fine for a constellation.
    
    const sortedPlaces = [...places].sort((a, b) => a.orderIndex - b.orderIndex);

    const points = sortedPlaces.map(place => {
      const x = padding + ((place.lng - minLon) / lonRange) * (width - padding * 2);
      const y = height - padding - ((place.lat - minLat) / latRange) * (height - padding * 2);
      return { ...place, x, y };
    });

    const lines = [];
    for (let i = 0; i < points.length - 1; i++) {
      lines.push({
        id: `${points[i].id}-${points[i+1].id}`,
        x1: points[i].x,
        y1: points[i].y,
        x2: points[i+1].x,
        y2: points[i+1].y,
      });
    }

    return { points, lines };
  }, [places]);

  if (places.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-8 right-8 w-[240px] h-[160px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 pointer-events-auto"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900/50 to-black/80" />
      
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Memory Galaxy</span>
        <span className="text-[10px] text-yellow-500/80">{places.length} Stars</span>
      </div>

      <svg width={width} height={height} className="absolute inset-0 z-0">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Lines */}
        {lines.map((line, i) => (
          <motion.line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(253, 224, 71, 0.3)"
            strokeWidth="1"
            strokeDasharray="2 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.2 }}
          />
        ))}

        {/* Stars */}
        {points.map((point, i) => {
          const isActive = point.id === activePlaceId;
          return (
            <motion.g 
              key={point.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="cursor-pointer group"
              onClick={() => onPlaceClick(point)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={isActive ? 6 : 3}
                fill={isActive ? "#fde047" : "#fff"}
                filter="url(#glow)"
                className="transition-all duration-300"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={isActive ? 12 : 6}
                fill={isActive ? "rgba(253, 224, 71, 0.2)" : "rgba(255, 255, 255, 0.1)"}
                className="animate-pulse"
              />
              <text
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize="8"
                className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                {point.cityName}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </motion.div>
  );
}
