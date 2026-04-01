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

const CITY_CULTURAL_DATA: Record<string, any> = {
  'new york': {
    cityName: 'New York',
    cityNameZh: '纽约',
    culturalSummary: 'New York through culture: Seen on screen in Begin Again and The Great Gatsby; read on the page in The Catcher in the Rye.',
    culturalSummaryZh: '文化视角下的纽约：在《再次出发》和《了不起的盖茨比》的镜头中穿行；在《麦田里的守望者》的文字里寻找共鸣。',
    onScreen: [
      { 
        title: 'Begin Again', 
        titleZh: '再次出发', 
        location: 'Washington Square Park', 
        locationZh: '华盛顿广场公园',
        genre: 'Music/Drama',
        genreZh: '音乐/剧情',
        summary: 'A chance encounter between a disgraced music-business executive and a young singer-songwriter new to Manhattan turns into a promising collaboration.',
        summaryZh: '一个失意的音乐制作人和一个刚到曼哈顿的年轻创作歌手偶然相遇，开启了一段充满希望的合作。'
      },
      { 
        title: 'The Great Gatsby', 
        titleZh: '了不起的盖茨比', 
        location: 'Plaza Hotel', 
        locationZh: '广场饭店',
        genre: 'Drama/Romance',
        genreZh: '剧情/浪漫',
        summary: 'A writer and Wall Street trader, Nick, finds himself drawn to the past and lifestyle of his millionaire neighbor, Jay Gatsby.',
        summaryZh: '作家兼华尔街交易员尼克发现自己被百万富翁邻居杰·盖茨比的过去和生活方式所吸引。'
      },
      { 
        title: 'Spider-Man', 
        titleZh: '蜘蛛侠', 
        location: 'Queensboro Bridge', 
        locationZh: '皇后区大桥',
        genre: 'Action',
        genreZh: '动作',
        summary: 'After being bitten by a genetically modified spider, a shy teenager gains spider-like abilities that he uses to fight evil.',
        summaryZh: '在被一只基因改造过的蜘蛛咬伤后，一个害羞的少年获得了像蜘蛛一样的能力，并用它来对抗邪恶。'
      },
    ],
    onThePage: [
      { 
        title: 'The Catcher in the Rye', 
        titleZh: '麦田里的守望者',
        genre: 'Classic Literature',
        genreZh: '经典文学',
        summary: 'A teenager in New York City struggles with the phoniness of the adult world.',
        summaryZh: '纽约市的一个少年在与成人世界的虚伪作斗争。'
      },
      { 
        title: 'A Tree Grows in Brooklyn', 
        titleZh: '布鲁克林有棵树',
        genre: 'Coming-of-age',
        genreZh: '成长小说',
        summary: 'A young girl grows up in the slums of Brooklyn in the early 20th century.',
        summaryZh: '一个年轻女孩在20世纪初布鲁克林的贫民窟长大。'
      },
    ],
    walkTheCity: [
      { title: 'Central Park', titleZh: '中央公园' },
      { title: 'Times Square', titleZh: '时代广场' },
      { title: 'High Line', titleZh: '高线公园' },
    ]
  },
  '纽约': { $ref: 'new york' },
  'paris': {
    cityName: 'Paris',
    cityNameZh: '巴黎',
    culturalSummary: 'Paris through culture: Seen on screen in Midnight in Paris and Amélie; read on the page in Les Misérables.',
    culturalSummaryZh: '文化视角下的巴黎：在《午夜巴黎》和《天使爱美丽》的梦幻中沉醉；在《悲惨世界》的历史长河中感悟。',
    onScreen: [
      { 
        title: 'Midnight in Paris', 
        titleZh: '午夜巴黎', 
        location: 'Shakespeare and Company', 
        locationZh: '莎士比亚书店',
        genre: 'Fantasy/Romance',
        genreZh: '奇幻/浪漫',
        summary: 'While on a trip to Paris with his fiancée\'s family, a nostalgic screenwriter finds himself mysteriously going back to the 1920s every day at midnight.',
        summaryZh: '在与未婚妻家人去巴黎旅行期间，一位怀旧的编剧发现自己每天午夜都会神秘地回到20世纪20年代。'
      },
      { 
        title: 'Amélie', 
        titleZh: '天使爱美丽', 
        location: 'Montmartre', 
        locationZh: '蒙马特高地',
        genre: 'Romance/Comedy',
        genreZh: '浪漫/喜剧',
        summary: 'Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.',
        summaryZh: '艾米莉是巴黎一个纯真无邪的女孩，有着自己的正义感。她决定帮助周围的人，并在此过程中发现了真爱。'
      },
    ],
    onThePage: [
      { 
        title: 'Les Misérables', 
        titleZh: '悲惨世界',
        genre: 'Historical Fiction',
        genreZh: '历史小说',
        summary: 'In 19th-century France, Jean Valjean, who for decades has been hunted by the ruthless policeman Javert after breaking parole, agrees to care for a factory worker\'s daughter.',
        summaryZh: '在19世纪的法国，冉阿让在违反假释规定后被无情的警察沙威追捕了数十年，他同意照顾一名工厂女工的女儿。'
      },
      { 
        title: 'A Moveable Feast', 
        titleZh: '流动的盛宴',
        genre: 'Memoir',
        genreZh: '回忆录',
        summary: 'Ernest Hemingway\'s memoir about his years as a struggling young expatriate journalist and writer in Paris in the 1920s.',
        summaryZh: '欧内斯特·海明威关于20世纪20年代他在巴黎作为一名奋斗中的年轻外籍记者和作家的回忆录。'
      },
    ],
    walkTheCity: [
      { title: 'Seine River', titleZh: '塞纳河畔' },
      { title: 'Notre-Dame', titleZh: '巴黎圣母院' },
      { title: 'Shakespeare and Co', titleZh: '莎士比亚书店' },
    ]
  },
  '巴黎': { $ref: 'paris' },
  'tokyo': {
    cityName: 'Tokyo',
    cityNameZh: '东京',
    culturalSummary: 'Tokyo through culture: Seen on screen in Lost in Translation and Shoplifters; read on the page in Norwegian Wood.',
    culturalSummaryZh: '文化视角下的东京：在《迷失东京》和《小偷家族》的镜头中穿行；在《挪威的森林》的文字里寻找慰藉。',
    onScreen: [
      { 
        title: 'Lost in Translation', 
        titleZh: '迷失东京', 
        location: 'Park Hyatt Tokyo', 
        locationZh: '东京柏悦酒店',
        genre: 'Drama',
        genreZh: '剧情',
        summary: 'A faded movie star and a neglected young woman form an unlikely bond after crossing paths in Tokyo.',
        summaryZh: '一个过气的电影明星和一个被忽视的年轻女子在东京相遇后，建立了一种奇妙的联系。'
      },
      { 
        title: 'Shoplifters', 
        titleZh: '小偷家族', 
        location: 'Sumida City', 
        locationZh: '墨田区',
        genre: 'Drama',
        genreZh: '剧情',
        summary: 'A family of small-time crooks take in a child they find outside in the cold.',
        summaryZh: '一个靠偷窃维持生计的家庭收留了一个在寒冷的户外发现的孩子。'
      },
    ],
    onThePage: [
      { 
        title: 'Norwegian Wood', 
        titleZh: '挪威的森林',
        genre: 'Fiction',
        genreZh: '小说',
        summary: 'A story of loss and burgeoning sexuality in 1960s Tokyo.',
        summaryZh: '讲述了20世纪60年代东京的一个关于丧失和萌芽的性意识的故事。'
      },
      { 
        title: 'Kitchen', 
        titleZh: '厨房',
        genre: 'Fiction',
        genreZh: '小说',
        summary: 'A young woman deals with the loss of her grandmother and finds comfort in kitchens and a new friend.',
        summaryZh: '一个年轻女子在失去祖母后，在厨房和一位新朋友那里找到了安慰。'
      },
    ],
    walkTheCity: [
      { title: 'Shibuya Crossing', titleZh: '涩谷十字路口' },
      { title: 'Shinjuku Gyoen', titleZh: '新宿御苑' },
      { title: 'Tsukiji Market', titleZh: '筑地市场' },
    ]
  },
  '东京': { $ref: 'tokyo' },
};

// Helper to get city data with ref support
const getCityCulturalData = (name: string): Partial<Place> | null => {
  const key = name.trim().toLowerCase();
  const data = CITY_CULTURAL_DATA[key];
  if (data && (data as any).$ref) {
    return CITY_CULTURAL_DATA[(data as any).$ref] || null;
  }
  return data || null;
};

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
    posterUrl: 'https://upload.wikimedia.org/wikipedia/zh/b/bd/Begin_Again_film_poster_2014.jpg',
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
    posterUrl: 'https://upload.wikimedia.org/wikipedia/zh/thumb/2/26/TheGreatGatsby2012Poster.jpg/250px-TheGreatGatsby2012Poster.jpg',
    checkInPoints: [
      { id: 'p4', name: 'Plaza Hotel', nameZh: '广场饭店', location: '5th Ave, Manhattan', locationZh: '曼哈顿第五大道' },
      { id: 'p5', name: 'Queensboro Bridge', nameZh: '皇后区大桥', location: 'New York City', locationZh: '纽约市' },
    ]
  },
  {
    id: '3',
    title: 'Midnight in Paris',
    titleZh: '午夜巴黎',
    type: 'movie',
    year: '2011',
    director: 'Woody Allen',
    matchRate: 92,
    locations: ['Paris'],
    quote: "That's what the present is. It's a little unsatisfying because life is a little unsatisfying.",
    quoteZh: "这就是现在。它有点不尽如人意，因为生活就是有点不尽如人意。",
    introduction: "While on a trip to Paris with his fiancée's family, a nostalgic screenwriter finds himself mysteriously going back to the 1920s every day at midnight.",
    introductionZh: "吉尔随未婚妻一家来到巴黎。午夜时分，他意外地穿越回了20世纪20年代的巴黎，在那里他遇到了海明威、菲茨杰拉德等文坛巨匠。",
    posterUrl: 'https://img.savoirtw.org/images/article/1601454736_1559806585-016ad195308c5d2861a487a05986e182.jpg',
    checkInPoints: [
      { id: 'p6', name: 'Shakespeare and Company', nameZh: '莎士比亚书店', location: 'Paris', locationZh: '巴黎' },
      { id: 'p7', name: 'Pont Alexandre III', nameZh: '亚历山大三世桥', location: 'Paris', locationZh: '巴黎' },
    ]
  },
  {
    id: '4',
    title: 'Lost in Translation',
    titleZh: '迷失东京',
    type: 'movie',
    year: '2003',
    director: 'Sofia Coppola',
    matchRate: 94,
    locations: ['Tokyo'],
    quote: "The more you know who you are, and what you want, the less you let things upset you.",
    quoteZh: "你越了解自己，越清楚自己想要什么，就越不会让事情困扰你。",
    introduction: "A faded movie star and a neglected young woman form an unlikely bond after crossing paths in Tokyo.",
    introductionZh: "过气的电影明星鲍勃和年轻的夏洛特在东京的一家酒店相遇。两个孤独的灵魂在这个陌生的城市里产生了一种奇妙的联系。",
    posterUrl: 'https://upload.wikimedia.org/wikipedia/zh/6/68/Lost_in_Translation_movie.jpg',
    checkInPoints: [
      { id: 'p8', name: 'Park Hyatt Tokyo', nameZh: '东京柏悦酒店', location: 'Shinjuku, Tokyo', locationZh: '东京新宿' },
      { id: 'p9', name: 'Shibuya Crossing', nameZh: '涩谷十字路口', location: 'Shibuya, Tokyo', locationZh: '东京涩谷' },
    ]
  },
  {
    id: '5',
    title: 'Norwegian Wood',
    titleZh: '挪威的森林',
    type: 'book',
    year: '1987',
    author: 'Haruki Murakami',
    matchRate: 90,
    locations: ['Tokyo', 'Kyoto'],
    quote: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.",
    quoteZh: "如果你只读每个人都在读的书，你就只能想到每个人都在想的事。",
    introduction: "A story of loss and burgeoning sexuality in 1960s Tokyo.",
    introductionZh: "渡边在东京的大学生活中，徘徊在直子和绿子两个女孩之间。这是一个关于青春、孤独与死亡的故事。",
    posterUrl: 'https://www.filmcritics.org.hk/sites/default/files/2024-12/NorwegianWood_1.jpg',
    checkInPoints: [
      { id: 'p10', name: 'Waseda University', nameZh: '早稻田大学', location: 'Tokyo', locationZh: '东京' },
    ]
  },
  {
    id: '6',
    title: 'Farewell My Concubine',
    titleZh: '霸王别姬',
    type: 'movie',
    year: '1993',
    director: 'Chen Kaige',
    matchRate: 97,
    locations: ['Beijing'],
    quote: "I'm talking about a lifetime! One year, one month, one day, even one second's difference means it's not a lifetime!",
    quoteZh: "说好是一辈子，差一年，一个月，一天，一个时辰，都不算一辈子！",
    introduction: "The story of two performers in the Peking Opera and the woman who comes between them.",
    introductionZh: "讲述了程蝶衣与段小楼两个京剧演员半个世纪的悲欢离合，展现了中国近现代史的变迁。",
    posterUrl: 'https://hips.hearstapps.com/hmg-prod/images/j3czmhisqin799r-1583933414.jpg',
    checkInPoints: [
      { id: 'p11', name: 'Prince Kung\'s Mansion', nameZh: '恭王府', location: 'Beijing', locationZh: '北京' },
    ]
  },
  {
    id: '7',
    title: 'Notting Hill',
    titleZh: '诺丁山',
    type: 'movie',
    year: '1999',
    director: 'Roger Michell',
    matchRate: 89,
    locations: ['London'],
    quote: "I'm also just a girl, standing in front of a boy, asking him to love her.",
    quoteZh: "我也只是个女孩，站在一个男孩面前，请求他爱她。",
    introduction: "The life of a simple bookshop owner changes when he meets the most famous film star in the world.",
    introductionZh: "一个平凡的旅行书店老板威廉，意外遇到了好莱坞大明星安娜，两人的生活从此发生了翻天覆地的变化。",
    posterUrl: 'https://p0.itc.cn/q_70/images03/20220713/3fdd4995f713406097995d4b3a0ef94e.jpeg',
    checkInPoints: [
      { id: 'p12', name: 'The Travel Book Shop', nameZh: '旅行书店', location: 'Notting Hill, London', locationZh: '伦敦诺丁山' },
    ]
  },
  {
    id: '8',
    title: 'Roman Holiday',
    titleZh: '罗马假日',
    type: 'movie',
    year: '1953',
    director: 'William Wyler',
    matchRate: 96,
    locations: ['Rome'],
    quote: "Rome! By all means, Rome. I will cherish my visit here in memory as long as I live.",
    quoteZh: "罗马！当然是罗马。我会用我的一生来珍藏在这里度过的每一分钟。",
    introduction: "A bored and sheltered princess escapes her guardians and falls in love with an American newsman in Rome.",
    introductionZh: "厌倦了繁琐礼节的安妮公主，在罗马访问期间私自出游，偶遇美国记者乔，两人在罗马度过了一个难忘的假日。",
    posterUrl: 'https://image.tmdb.org/t/p/original/hEj6NVGPwhue2eBxWGcodkIGLTC.jpg',
    checkInPoints: [
      { id: 'p13', name: 'The Mouth of Truth', nameZh: '真理之口', location: 'Rome', locationZh: '罗马' },
      { id: 'p14', name: 'Spanish Steps', nameZh: '西班牙阶梯', location: 'Rome', locationZh: '罗马' },
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
  const [isSearching, setIsSearching] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [searchedCityData, setSearchedCityData] = useState<Partial<Place> | null>(null);
  const [filteredWorks, setFilteredWorks] = useState<Work[]>(MOCK_WORKS);

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
    const culturalData = getCityCulturalData(newPlaceData.cityName) || {};

    const newPlace: Place = {
      ...newPlaceData,
      ...culturalData,
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

  const handleCityChange = (city: string) => {
    const cityData = getCityCulturalData(city);
    setSearchedCityData(cityData || null);
  };

  const handlePick = (city: string) => {
    setIsSearching(true);
    toast.success(language === 'zh' ? `正在为你寻找关于 ${city} 的灵感...` : `Finding inspiration for ${city}...`);
    
    // Simulate search delay
    setTimeout(() => {
      const cityData = getCityCulturalData(city);
      setSearchedCityData(cityData || null);

      const cityNameLower = city.toLowerCase().trim();

      if (!city.trim()) {
        setFilteredWorks(MOCK_WORKS);
        setIsFallback(false);
      } else {
        const filtered = MOCK_WORKS.filter(work => {
          const cityMatch = work.locations.some(loc => 
            loc.toLowerCase().includes(cityNameLower) || 
            (language === 'zh' && work.titleZh.includes(city))
          );
          return cityMatch;
        });

        if (filtered.length > 0) {
          setFilteredWorks(filtered);
          setIsFallback(false);
        } else {
          // Fallback to all works if no specific match, but maybe shuffle them
          setFilteredWorks([...MOCK_WORKS].sort(() => Math.random() - 0.5));
          setIsFallback(true);
          toast.info(language === 'zh' ? `未找到 ${city} 的特定灵感，为你推荐全球精彩内容` : `No specific inspiration for ${city}, showing global recommendations.`);
        }
      }
      setIsSearching(false);
    }, 1000);
  };

  const handleSelectWork = (work: Work) => {
    setSelectedWork(work);
    setMode("work-detail");
  };

  const handleCheckInFinish = (record: CheckInRecord) => {
    if (!selectedWork || !activeCheckInPoint) return;

    const normalizeCountry = (location: string) => {
      const chinaRegions = ['Hong Kong', 'Macau', 'Taiwan', '香港', '澳门', '台湾'];
      if (chinaRegions.some(r => location.includes(r))) {
        return language === 'zh' ? '中国' : 'China';
      }
      return "USA"; // Mock default
    };

    const newPlace: Place = {
      id: crypto.randomUUID(),
      cityName: language === 'zh' ? activeCheckInPoint.nameZh : activeCheckInPoint.name,
      country: normalizeCountry(activeCheckInPoint.locationZh || activeCheckInPoint.location),
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      year: new Date().getFullYear().toString(),
      memory: record.reflection,
      tag: language === 'zh' ? selectedWork.titleZh : selectedWork.title,
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
      <Toaster position="top-center" richColors />
      
      {/* Sidebar Navigation */}
      <aside className="z-50 flex w-20 flex-col items-center border-r border-trippin-line bg-trippin-bg py-8">
        <div className="mb-12 flex h-12 w-12 items-center justify-center rounded-xl bg-trippin-ink text-trippin-bg shadow-lg">
          <Globe className="h-6 w-6" />
        </div>
        
        <nav className="flex flex-1 flex-col gap-8">
          <button 
            onClick={() => setMode("atlas")}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${mode === "atlas" ? "bg-trippin-ink text-trippin-bg" : "text-trippin-ink/40 hover:bg-trippin-line hover:text-trippin-ink"}`}
          >
            <MapIcon className="h-6 w-6" />
            <span className="absolute left-16 hidden rounded bg-trippin-ink px-2 py-1 text-xs text-trippin-bg group-hover:block">Atlas</span>
          </button>
          
          <button 
            onClick={() => setMode("discover")}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${mode === "discover" ? "bg-trippin-ink text-trippin-bg" : "text-trippin-ink/40 hover:bg-trippin-line hover:text-trippin-ink"}`}
          >
            <Compass className="h-6 w-6" />
            <span className="absolute left-16 hidden rounded bg-trippin-ink px-2 py-1 text-xs text-trippin-bg group-hover:block">Discover</span>
          </button>
          
          <button 
            onClick={() => setMode("journal")}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${mode === "journal" ? "bg-trippin-ink text-trippin-bg" : "text-trippin-ink/40 hover:bg-trippin-line hover:text-trippin-ink"}`}
          >
            <BookOpen className="h-6 w-6" />
            <span className="absolute left-16 hidden rounded bg-trippin-ink px-2 py-1 text-xs text-trippin-bg group-hover:block">Journal</span>
          </button>
        </nav>
        
        <div className="mt-auto flex flex-col gap-6">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-trippin-ink/40 transition-colors hover:bg-trippin-line hover:text-trippin-ink"
          >
            <Languages className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-trippin-ink/40 transition-colors hover:bg-trippin-line hover:text-trippin-ink"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-trippin-line bg-trippin-line"
          >
            <User className="h-5 w-5 text-trippin-ink/60" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "atlas" && (
            <motion.div 
              key="atlas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <MapView 
                places={places} 
                activePlaceId={selectedPlace?.id || null}
                onPlaceClick={handlePlaceClick}
                position={position}
                onMoveEnd={setPosition}
                mode={mode}
                mapTheme={mapTheme}
                showRoute={showRoute}
                showBuildings={showBuildings}
              />
              <Constellation 
                places={places} 
                onPlaceClick={handlePlaceClick} 
                activePlaceId={selectedPlace?.id || null} 
              />
              
              {/* Atlas UI Overlays */}
              <div className="pointer-events-none absolute inset-0 flex flex-col p-8">
                {/* Top Bar */}
                <div className="pointer-events-auto flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <h1 className="font-serif text-4xl italic tracking-tight text-trippin-ink">
                      {t.atlasTitle}
                    </h1>
                    <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-trippin-ink/40">
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {places.length} {t.places}</span>
                      <span className="h-1 w-1 rounded-full bg-trippin-ink/20"></span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2024 Collection</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex h-12 items-center gap-2 rounded-full bg-trippin-ink px-6 text-sm font-medium text-trippin-bg shadow-xl transition-transform hover:scale-105 active:scale-95"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                      {isPlaying ? t.pauseJourney : t.playJourney}
                    </button>
                    
                    <button 
                      onClick={() => setIsAddingPlace(true)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-trippin-accent text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                {/* Bottom Timeline */}
                <div className="pointer-events-auto mt-auto">
                  <Timeline 
                    places={places} 
                    activePlaceId={selectedPlace?.id || null} 
                    onSelectPlace={handlePlaceClick} 
                    language={language}
                  />
                </div>
              </div>
              
              {/* Selected Place Detail Card */}
              <AnimatePresence>
                {selectedPlace && (
                  <CityProfileCard 
                    place={selectedPlace} 
                    onClose={() => setSelectedPlace(null)}
                    language={language}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {mode === "discover" && (
            <motion.div 
              key="discover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full w-full overflow-y-auto bg-trippin-warm-bg p-12"
            >
              <TrippinPick 
                onPick={handlePick} 
                works={filteredWorks}
                isSearching={isSearching}
                isFallback={isFallback}
                language={language}
                onSelectWork={handleSelectWork}
                cityData={searchedCityData}
                onCityChange={handleCityChange}
              />
            </motion.div>
          )}

          {mode === "journal" && (
            <motion.div 
              key="journal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full w-full overflow-y-auto bg-trippin-bg p-12"
            >
              <div className="mx-auto max-w-4xl">
                <header className="mb-16 flex items-end justify-between border-b border-trippin-line pb-8">
                  <div>
                    <h2 className="mb-2 font-serif text-5xl italic text-trippin-ink">{t.travelJournal}</h2>
                    <p className="text-trippin-ink/60">Your cultural footprints across the globe.</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center gap-2 rounded-full border border-trippin-line px-4 py-2 text-sm font-medium hover:bg-trippin-line">
                      <Download className="h-4 w-4" /> Export
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-2 rounded-full bg-trippin-ink px-4 py-2 text-sm font-medium text-trippin-bg hover:opacity-90">
                      Share Journey
                    </button>
                  </div>
                </header>
                
                <div className="grid gap-12">
                  {places.map((place, index) => (
                    <motion.div 
                      key={place.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative grid grid-cols-[120px_1fr] gap-8"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-4xl font-light text-trippin-ink/20">{(index + 1).toString().padStart(2, '0')}</span>
                        <div className="my-4 h-full w-px bg-trippin-line group-last:hidden"></div>
                      </div>
                      
                      <div className="rounded-3xl border border-trippin-line bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-semibold text-trippin-ink">{language === 'zh' ? place.cityNameZh || place.cityName : place.cityName}</h3>
                            <p className="text-sm font-medium uppercase tracking-widest text-trippin-ink/40">{place.country}</p>
                          </div>
                          <span className="rounded-full bg-trippin-line px-3 py-1 text-xs font-medium text-trippin-ink/60">{place.year}</span>
                        </div>
                        
                        <p className="mb-6 leading-relaxed text-trippin-ink/80">{place.memory}</p>
                        
                        {place.tag && (
                          <div className="flex items-center gap-2 text-sm font-medium text-trippin-accent">
                            <Sparkles className="h-4 w-4" />
                            {place.tag}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {mode === "work-detail" && selectedWork && (
            <motion.div 
              key="work-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <WorkDetail 
                work={selectedWork} 
                onBack={() => setMode("discover")}
                onCheckIn={(point) => setActiveCheckInPoint(point)}
                language={language}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global UI Elements */}
        <div className="pointer-events-none absolute bottom-8 right-8 z-40 flex flex-col gap-3">
          <button 
            onClick={handleThemeToggle}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-trippin-ink shadow-lg ring-1 ring-trippin-line transition-transform hover:scale-105 active:scale-95"
          >
            <Globe className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setShowRoute(!showRoute)}
            className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-1 ring-trippin-line transition-transform hover:scale-105 active:scale-95 ${showRoute ? 'bg-trippin-accent text-white' : 'bg-white text-trippin-ink'}`}
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>
      </main>

      {/* Modals */}
      <AddPlaceModal 
        isOpen={isAddingPlace} 
        onClose={() => setIsAddingPlace(false)} 
        onAdd={handleAddPlace}
        language={language}
      />
      
      {activeCheckInPoint && selectedWork && (
        <CheckInModal
          point={activeCheckInPoint}
          work={selectedWork}
          onClose={() => setActiveCheckInPoint(null)}
          onFinish={handleCheckInFinish}
          language={language}
        />
      )}

      <ManagePlacesModal 
        isOpen={isManageOpen} 
        onClose={() => setIsManageOpen(false)} 
        places={places}
        setPlaces={setPlaces}
        onSelectPlace={handlePlaceClick}
        language={language}
      />

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        language={language}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        language={language}
      />
    </div>
  );
}
