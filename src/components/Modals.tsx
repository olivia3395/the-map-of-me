import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, MapPin, Globe, Route, Building2, Navigation } from "lucide-react";
import { Place } from "../types";
import { t } from "../i18n";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
  places?: Place[];
  setPlaces?: (places: Place[]) => void;
  onSelectPlace?: (place: Place) => void;
  showRoute?: boolean;
  setShowRoute?: (show: boolean) => void;
  showBuildings?: boolean;
  setShowBuildings?: (show: boolean) => void;
}

const ModalWrapper = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
            <h2 className="text-xl font-serif font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export function ManagePlacesModal({ isOpen, onClose, places, setPlaces, onSelectPlace, language }: ModalProps) {
  const handleDelete = (id: string) => {
    setPlaces?.(places?.filter((p: any) => p.id !== id) || []);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t[language].managePlaces}>
      {(places || []).length === 0 ? (
        <p className="text-slate-500 text-center py-4">{t[language].noPlaces}</p>
      ) : (
        <div className="space-y-3">
          {(places || []).map((place: any) => (
            <div key={place.id} className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-slate-100 shadow-sm">
              <div
                className="cursor-pointer flex-1"
                onClick={() => {
                  onSelectPlace(place);
                  onClose();
                }}
              >
                <h3 className="font-bold text-slate-800">{place.cityName}</h3>
                <p className="text-xs text-slate-500">{place.country}</p>
              </div>
              <button
                onClick={() => handleDelete(place.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Place"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ModalWrapper>
  );
}

export function ProfileModal({ isOpen, onClose, places, language }: ModalProps) {
  const uniqueCountries = new Set((places || []).map((p: any) => p.country)).size;

  const calculateTotalDistance = (placesList: any[]) => {
    if (!placesList || placesList.length < 2) return 0;
    let total = 0;
    const R = 6371; // km
    for (let i = 0; i < placesList.length - 1; i++) {
      const lon1 = placesList[i].lng;
      const lat1 = placesList[i].lat;
      const lon2 = placesList[i+1].lng;
      const lat2 = placesList[i+1].lat;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      total += R * c;
    }
    return Math.round(total);
  };

  const totalDistance = calculateTotalDistance(places || []);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t[language].travelerProfile}>
      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
          <span className="text-4xl text-white font-serif">M</span>
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">{t[language].myJourney}</h3>
        <p className="text-slate-500 text-sm mb-8 text-center px-4">
          {t[language].documentingLife}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
            <MapPin className="w-6 h-6 text-yellow-600 mb-2" />
            <span className="text-3xl font-bold text-slate-800">{(places || []).length}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">{t[language].places}</span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
            <Globe className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-3xl font-bold text-slate-800">{uniqueCountries}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">{t[language].countries}</span>
          </div>
        </div>

        <div className="mt-4 bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-sm w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700">{t[language].totalDistance}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-800">{totalDistance.toLocaleString()}</span>
            <span className="text-sm text-slate-500 ml-1">km</span>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

export function SettingsModal({ isOpen, onClose, showRoute, setShowRoute, showBuildings, setShowBuildings, language }: ModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t[language].mapSettings}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{t[language].showRouteLines}</h4>
              <p className="text-xs text-slate-500">{t[language].connectPlaces}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showRoute}
              onChange={(e) => setShowRoute?.(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{t[language].threeDBuildings}</h4>
              <p className="text-xs text-slate-500">{t[language].showThreeDBuildings}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showBuildings}
              onChange={(e) => setShowBuildings?.(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      </div>
    </ModalWrapper>
  );
}
