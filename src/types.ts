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
  curatedImage: string;
  curatedDescription: string;
  curatedDescriptionZh?: string;
  highlights: string[];
  highlightsZh?: string[];
}
