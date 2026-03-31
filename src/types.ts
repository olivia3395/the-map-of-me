export interface Place {
  id: string;
  cityName: string;
  country: string;
  lat: number;
  lng: number;
  year: string;
  memory: string;
  imageUrl?: string;
  tag?: string;
  orderIndex: number;
}

export interface Work {
  id: string;
  title: string;
  titleZh: string;
  type: 'movie' | 'book';
  year: string;
  director?: string;
  author?: string;
  matchRate: number;
  locations: string[];
  quote: string;
  quoteZh: string;
  introduction: string;
  introductionZh: string;
  posterUrl: string;
  checkInPoints: CheckInPoint[];
}

export interface CheckInPoint {
  id: string;
  name: string;
  nameZh: string;
  location: string;
  locationZh: string;
  icon?: string;
}

export interface CheckInRecord {
  id: string;
  workId: string;
  pointId: string;
  photoUrl?: string;
  reflection: string;
  mood: 'moved' | 'healing' | 'shocked' | 'pilgrimage';
  timestamp: number;
}
