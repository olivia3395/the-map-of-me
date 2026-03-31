import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Download, 
  Map as MapIcon, 
  Sparkles, 
  Play, 
  Pause, 
  Languages, 
  Compass, 
  BookOpen, 
  Settings, 
  Search,
  ChevronRight,
  Globe,
  Clock,
  MapPin,
  User,
  List
} from "lucide-react";
import { Toaster, toast } from "sonner";
import MapView from "./components/MapView";
import Constellation from "./components/Constellation";
import CityProfileCard from "./components/CityProfileCard";
import AddPlaceModal from "./components/AddPlaceModal";
import Timeline from "./components/Timeline";
import TrippinPick from "./components/TrippinPick";
import WorkDetail from "./components/WorkDetail";
import CheckInModal from "./components/CheckInModal";
import { ManagePlacesModal, ProfileModal, SettingsModal } from "./components/Modals";
import { Place, Work, CheckInPoint, CheckInRecord } from "./types";
import { t as translations, Language } from "./i18n";

const MOCK_WORKS: Work[] = [
  {
    id: '1',
    title: 'Begin Again',
    titleZh: '再次出发之纽约遇见你',
    type: 'movie',
    year: '2013',
    director: 'John Carney',
    matchRate: 98,
    locations: ['New York'],
    quote: "You can tell a lot about a person by what's on their playlist.",
    quoteZh: "看一个人的播放列表，就能了解他很多。",
    introduction: "A chance encounter between a disgraced music-business executive and a young singer-songwriter new to Manhattan turns into a promising collaboration.",
    introductionZh: "格雷塔跟随男友来到纽约，却遭遇背叛。在失意之时，她遇到了同样落魄的音乐制作人丹，两人决定在纽约的街头录制一张专辑。",
    posterUrl: 'https://picsum.photos/seed/beginagain/800/1200',
    checkInPoints: [
      { id: 'p1', name: 'Washington Square Park', nameZh: '华盛顿广场公园', location: 'Greenwich Village, Manhattan', locationZh: '曼哈顿格林威治村' },
      { id: 'p2', name: 'Times Square', nameZh: '时代广场', location: 'Manhattan', locationZh: '曼哈顿' },
      { id: 'p3', name: 'Central Park', nameZh: '中央公园', location: 'Manhattan', locationZh: '曼哈顿' },
    ]
  },
  {
    id: '2',
    title: 'The Great Gatsby',
    titleZh: '了不起的盖茨比',
    type: 'book',
    year: '1925',
    author: 'F. Scott Fitzgerald',
    matchRate: 95,
    locations: ['New York', 'Long Island'],
    quote: "So we beat on, boats against the current, borne back ceaselessly into the past.",
    quoteZh: "于是我们奋力向前，逆水行舟，被不断地向后推，推入过去。",
    introduction: "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    introductionZh: "尼克来到纽约，卷入了邻居盖茨比与黛西之间的情感纠葛。这是一个关于梦想、爱情与幻灭的故事。",
    posterUrl: 'https://picsum.photos/seed/gatsby/800/1200',
    checkInPoints: [
      { id: 'p4', name: 'Plaza Hotel', nameZh: '广场饭店', location: '5th Ave, Manhattan', locationZh: '曼哈顿第五大道' },
      { id: 'p5', name: 'Queensboro Bridge', nameZh: '皇后区大桥', location: 'New York City', locationZh: '纽约市' },
    ]
  }
];

type AppMode = 'atlas' | 'discover' | 'journal' | 'work-detail';

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const [mode, setMode] = useState<AppMode>("atlas");
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number; pitch?: number; bearing?: number; duration?: number }>({ coordinates: [0, 30], zoom: 1, pitch: 0, bearing: 0 });
  const [places, setPlaces] = useState<Place[]>([]);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [activeCheckInPoint, setActiveCheckInPoint] = useState<CheckInPoint | null>(null);

  const [mapTheme, setMapTheme] = useState("voyager");
  const [showRoute, setShowRoute] = useState(true);
  const [showBuildings, setShowBuildings] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && places.length > 0) {
      timeout = setTimeout(() => {
        const currentIndex = selectedPlace ? places.findIndex(p => p.id === selectedPlace.id) : -1;
        const nextIndex = currentIndex + 1;

        if (nextIndex < places.length) {
          handlePlaceClick(places[nextIndex]);
        } else {
          setIsPlaying(false);
          toast.success(t.journeyCompleted);
        }
      }, selectedPlace ? 6000 : 500);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, selectedPlace, places]);

  const handleAddPlace = (newPlaceData: Omit<Place, "id" | "orderIndex">) => {
    const newPlace: Place = {
      ...newPlaceData,
      id: crypto.randomUUID(),
      orderIndex: places.length,
    };
    setPlaces([...(places || []), newPlace]);
    setMode("atlas");
    setPosition({ coordinates: [newPlace.lng, newPlace.lat], zoom: 13, pitch: 45, bearing: 15 });
    setSelectedPlace(newPlace);
  };

  const handlePlaceClick = (place: Place) => {
    setMode("atlas");
    setPosition({ coordinates: [place.lng, place.lat], zoom: 13, pitch: 45, bearing: 15 });
    setSelectedPlace(place);
  };

  const handlePick = (city: string, genres: string[]) => {
    toast.success(language === 'zh' ? `正在为你寻找关于 ${city} 的灵感...` : `Finding inspiration for ${city}...`);
  };

  const handleSelectWork = (work: Work) => {
    setSelectedWork(work);
    setMode("work-detail");
  };

  const handleCheckInFinish = (record: CheckInRecord) => {
    if (!selectedWork || !activeCheckInPoint) return;

    const newPlace: Place = {
      id: crypto.randomUUID(),
      cityName: activeCheckInPoint.nameZh,
      country: "USA",
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      year: new Date().getFullYear().toString(),
      memory: record.reflection,
      tag: selectedWork.titleZh,
      orderIndex: places.length,
    };

    setPlaces([...places, newPlace]);
    setActiveCheckInPoint(null);
    setMode("atlas");
    setPosition({ coordinates: [newPlace.lng, newPlace.lat], zoom: 15, pitch: 45, bearing: 0 });
    setSelectedPlace(newPlace);
    toast.success(language === 'zh' ? '打卡成功！已添加到你的旅程地图。' : 'Check-in successful! Added to your journey map.');
  };

  const handleExport = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t.linkCopied);
  };

  const handleThemeToggle = () => {
    const themes = ['voyager', 'positron', 'dark-matter'];
    const nextIndex = (themes.indexOf(mapTheme) + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setMapTheme(nextTheme);
    toast.success(`${t.themeChanged}`);
  };

  const handleRegionClick = (region: string) => {
    const regions: Record<string, { coordinates: [number, number], zoom: number }> = {
      'Asia': { coordinates: [100, 35], zoom: 3 },
      'Europe': { coordinates: [15, 50], zoom: 4 },
      'Americas': { coordinates: [-95, 40], zoom: 3 },
    };
    if (regions[region]) {
      setPosition({ ...regions[region], pitch: 0, bearing: 0 });
      setSelectedPlace(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-trippin-bg text-trippin-ink selection:bg-trippin-accent selection:text-white">
      <Toaster position="top-center" expand={false} richColors />

      {/* Side Rail Navigation */}
      <nav className="w-16 md:w-20 flex flex-col items-center py-8 brutalist-border-r z-50 bg-trippin-bg">
        <div className="mb-12">
          <div className="w-10 h-10 bg-trippin-accent rounded-sm flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <NavButton 
            active={mode === 'atlas'} 
            onClick={() => setMode('atlas')} 
            icon={<MapIcon size={22} />} 
            label="Atlas"
          />
          <NavButton 
            active={mode === 'discover' || mode === 'work-detail'} 
            onClick={() => setMode('discover')} 
            icon={<Compass size={22} />} 
            label="Discover"
          />
          <NavButton 
            active={mode === 'journal'} 
            onClick={() => setMode('journal')} 
            icon={<List size={22} />} 
            label="Journal"
          />
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          >
            {language === 'en' ? 'ZH' : 'EN'}
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'atlas' && (
            <motion.div 
              key="atlas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <MapView
                places={places}
                activePlaceId={selectedPlace?.id || null}
                onPlaceClick={handlePlaceClick}
                position={position}
                onMoveEnd={setPosition}
                mode="explore"
                mapTheme={mapTheme}
                showRoute={showRoute}
                showBuildings={showBuildings}
              />
              
              {/* Atlas Overlay UI */}
              <div className="absolute top-8 left-8 z-10">
                <h1 className="text-4xl font-serif italic mb-1">Atlas</h1>
                <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-50">Global Memory Grid</p>
              </div>

              {/* Region Quick Nav */}
              <div className="absolute top-32 left-8 flex flex-col gap-2 z-10">
                {['Americas', 'Europe', 'Asia'].map((region) => (
                  <button
                    key={region}
                    onClick={() => handleRegionClick(region)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all shadow-sm text-left"
                  >
                    {region}
                  </button>
                ))}
              </div>

              <div className="absolute bottom-8 right-8 z-10 flex gap-4">
                <button 
                  onClick={() => setIsAddingPlace(true)}
                  className="w-14 h-14 bg-trippin-accent text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
                >
                  <Plus size={24} />
                </button>
              </div>

              <Constellation 
                places={places} 
                onPlaceClick={handlePlaceClick} 
                activePlaceId={selectedPlace?.id || null} 
              />
            </motion.div>
          )}

          {mode === 'discover' && (
            <motion.div 
              key="discover"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="absolute inset-0 p-8 md:p-12 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <header className="mb-16 flex justify-between items-end">
                  <div>
                    <h1 className="text-6xl font-serif italic mb-4">Discovery</h1>
                    <p className="text-sm font-mono uppercase tracking-[0.3em] opacity-40">Cinema & Literature Mapping</p>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-mono opacity-30 uppercase mb-1">System Status</p>
                    <p className="text-xs font-mono text-trippin-accent">GRID_ACTIVE_024</p>
                  </div>
                </header>

                <TrippinPick 
                  language={language}
                  onPick={handlePick}
                  onSelectWork={handleSelectWork}
                  recommendedWorks={MOCK_WORKS}
                />
              </div>
            </motion.div>
          )}

          {mode === 'work-detail' && selectedWork && (
            <motion.div 
              key="work-detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="absolute inset-0 z-20 bg-trippin-bg"
            >
              <WorkDetail 
                language={language}
                work={selectedWork} 
                onBack={() => setMode('discover')} 
                onCheckIn={(point) => setActiveCheckInPoint(point)}
              />
            </motion.div>
          )}

          {mode === 'journal' && (
            <motion.div 
              key="journal"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute inset-0 p-8 md:p-12 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto">
                <header className="mb-16">
                  <h1 className="text-6xl font-serif italic mb-4">Journal</h1>
                  <p className="text-sm font-mono uppercase tracking-[0.3em] opacity-40">Chronological Records</p>
                </header>

                <Timeline 
                  places={places} 
                  activePlaceId={selectedPlace?.id || null} 
                  onSelectPlace={handlePlaceClick} 
                  language={language}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {selectedPlace && mode === 'atlas' && (
          <CityProfileCard 
            place={selectedPlace} 
            language={language}
            onClose={() => setSelectedPlace(null)} 
          />
        )}
        {activeCheckInPoint && selectedWork && (
          <CheckInModal
            language={language}
            work={selectedWork}
            point={activeCheckInPoint}
            onClose={() => setActiveCheckInPoint(null)}
            onFinish={handleCheckInFinish}
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 pointer-events-auto">
        <AddPlaceModal
          isOpen={isAddingPlace}
          language={language}
          onClose={() => setIsAddingPlace(false)}
          onAdd={handleAddPlace}
        />
        <ManagePlacesModal
          isOpen={isManageOpen}
          language={language}
          onClose={() => setIsManageOpen(false)}
          places={places}
          setPlaces={setPlaces}
          onSelectPlace={handlePlaceClick}
        />
        <ProfileModal
          isOpen={isProfileOpen}
          language={language}
          onClose={() => setIsProfileOpen(false)}
          places={places}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          language={language}
          onClose={() => setIsSettingsOpen(false)}
          showRoute={showRoute}
          setShowRoute={setShowRoute}
          showBuildings={showBuildings}
          setShowBuildings={setShowBuildings}
        />
      </div>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button 
      onClick={onClick}
      className={`relative group flex flex-col items-center gap-1 transition-all ${active ? 'text-trippin-accent' : 'text-trippin-muted hover:text-trippin-ink'}`}
    >
      <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-trippin-accent/10' : 'hover:bg-trippin-surface'}`}>
        {icon}
      </div>
      <span className="text-[9px] font-mono uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute -right-[21px] md:-right-[21px] w-1 h-8 bg-trippin-accent rounded-l-full"
        />
      )}
    </button>
  );
}
