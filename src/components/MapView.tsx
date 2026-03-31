import React, { useEffect, useRef } from "react";
import Map, { Marker, Source, Layer, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Place } from "../types";

interface MapViewProps {
  places: Place[];
  activePlaceId: string | null;
  onPlaceClick: (place: Place) => void;
  position: { coordinates: [number, number]; zoom: number; pitch?: number; bearing?: number; duration?: number };
  onMoveEnd: (position: { coordinates: [number, number]; zoom: number; pitch?: number; bearing?: number; duration?: number }) => void;
  mode: "overview" | "explore";
  mapTheme: string;
  showRoute: boolean;
  showBuildings: boolean;
}

export default function MapView({ places, activePlaceId, onPlaceClick, position, onMoveEnd, mode, mapTheme, showRoute, showBuildings }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: position.coordinates,
        zoom: position.zoom,
        pitch: position.pitch || 0,
        bearing: position.bearing || 0,
        duration: position.duration || 3000,
        curve: 1.2,
        speed: 0.8,
        essential: true
      });
    }
  }, [position]);

  const mapStyle = mode === 'overview'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : `https://basemaps.cartocdn.com/gl/${mapTheme}-gl-style/style.json`;

  const routeGeoJSON = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [...(places || [])].sort((a, b) => a.orderIndex - b.orderIndex).map(p => [p.lng, p.lat])
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full z-0 bg-[#0f172a]">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: position.coordinates[0],
          latitude: position.coordinates[1],
          zoom: position.zoom,
          pitch: position.pitch || 0,
          bearing: position.bearing || 0
        }}
        mapStyle={mapStyle}
        onMoveEnd={(e) => {
          if (e.originalEvent) {
            const viewState = e.viewState;
            onMoveEnd({
              coordinates: [viewState.longitude, viewState.latitude],
              zoom: viewState.zoom,
              pitch: viewState.pitch,
              bearing: viewState.bearing
            });
          }
        }}
        onDblClick={(e) => {
          if (mode === 'explore') {
            e.preventDefault();
            onMoveEnd({
              coordinates: [e.lngLat.lng, e.lngLat.lat],
              zoom: position.zoom + 2,
              pitch: position.pitch,
              bearing: position.bearing
            });
          }
        }}
        interactive={mode === 'explore'}
        attributionControl={false}
      >
        {showBuildings && (
          <Layer
            id="3d-buildings"
            source="openmaptiles"
            source-layer="building"
            filter={['==', 'extrude', 'true']}
            type="fill-extrusion"
            minzoom={14}
            paint={{
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'render_height'],
              'fill-extrusion-base': ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.6
            }}
          />
        )}

        {showRoute && places.length > 1 && (
          <Source id="route" type="geojson" data={routeGeoJSON as any}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#f27d26',
                'line-width': 2,
                'line-dasharray': [2, 2],
                'line-opacity': 0.6
              }}
            />
          </Source>
        )}

        {places.map((place) => {
          const isActive = place.id === activePlaceId;
          return (
          <Marker
            key={place.id}
            longitude={place.lng}
            latitude={place.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPlaceClick(place);
            }}
          >
            <div className="relative flex flex-col items-center justify-center cursor-pointer group">
              <div className={`w-2 h-2 rounded-sm z-10 group-hover:scale-150 transition-transform ${isActive ? 'bg-[#f27d26] shadow-[0_0_20px_#f27d26]' : 'bg-white shadow-[0_0_15px_#ffffff]'}`}></div>
              <div className={`absolute w-6 h-6 rounded-sm opacity-40 animate-ping ${isActive ? 'bg-[#f27d26]' : 'bg-white'}`}></div>
              <div className={`absolute top-4 whitespace-nowrap text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded backdrop-blur-sm transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${mode === 'overview' ? 'text-white' : 'text-white bg-black/50'}`}>
                {place.cityName}
              </div>
            </div>
          </Marker>
        )})}
      </Map>
    </div>
  );
}
