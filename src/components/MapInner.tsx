'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '@/types';
import { formatPrice, getPropertyTypeLabel, getPropertyPurposeLabel, formatArea } from '@/lib/utils';
import { Eye, MapPin, Copy, Check, Navigation, Search } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin markers
const createCustomIcon = (status: string, purpose: string) => {
  let color = '#f59e0b'; // Gold default
  if (status === 'rented') color = '#3b82f6'; // Blue
  else if (status === 'sold') color = '#a855f7'; // Purple
  else if (purpose === 'sale') color = '#10b981'; // Emerald
  else if (purpose === 'exchange') color = '#ec4899'; // Pink for exchange

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #0f172a;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Map flyTo controller for smooth auto-centering on search or target
function MapFlyController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

interface MapClickEventsProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickEvents({ onMapClick }: MapClickEventsProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapInnerProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  lang?: Language;
}

export default function MapInner({ properties, onSelectProperty, lang = 'ckb' }: MapInnerProps) {
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [flyCenter, setFlyCenter] = useState<[number, number] | null>(null);
  const [flyZoom, setFlyZoom] = useState(12);
  const [mapSearch, setMapSearch] = useState('');

  const t = translations[lang] as any;
  const defaultCenter: [number, number] = [36.19, 44.01]; // Erbil center

  const handleCopyCoords = () => {
    if (clickedCoords) {
      navigator.clipboard.writeText(`${clickedCoords.lat.toFixed(5)}, ${clickedCoords.lng.toFixed(5)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Search quick jump
  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;

    const term = mapSearch.toLowerCase().trim();
    // 1. Try to find property match
    const matched = properties.find((p) => 
      p.lat && p.lng && (
        p.title.toLowerCase().includes(term) ||
        p.property_code.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term) ||
        p.neighborhood?.toLowerCase().includes(term)
      )
    );

    if (matched && matched.lat && matched.lng) {
      setFlyCenter([matched.lat, matched.lng]);
      setFlyZoom(15);
      return;
    }

    // 2. City coordinates quick match
    const citiesMap: Record<string, [number, number]> = {
      'هەولێر': [36.19, 44.01],
      'erbil': [36.19, 44.01],
      'اربیل': [36.19, 44.01],
      'سلێمانی': [35.56, 45.43],
      'sulaymaniyah': [35.56, 45.43],
      'سليمانية': [35.56, 45.43],
      'دهۆک': [36.87, 42.99],
      'duhok': [36.87, 42.99],
      'دهوك': [36.87, 42.99],
      'کەرکووک': [35.47, 44.39],
      'kirkuk': [35.47, 44.39],
      'كركوك': [35.47, 44.39],
      'بەغدا': [33.31, 44.36],
      'baghdad': [33.31, 44.36],
      'بغداد': [33.31, 44.36],
    };

    for (const [key, coords] of Object.entries(citiesMap)) {
      if (term.includes(key)) {
        setFlyCenter(coords);
        setFlyZoom(12);
        return;
      }
    }
  };

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* Search on Map Floating Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-md mx-auto">
        <form onSubmit={handleMapSearch} className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700 shadow-2xl">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search map: city, project, or code...' : 'گەڕان لەسەر نەخشە: شار، پڕۆژە، کۆد...'}
            className="flex-1 bg-transparent border-none text-white text-xs outline-none placeholder-slate-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
          >
            {t.view || 'بچۆ بۆی'}
          </button>
        </form>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyController center={flyCenter} zoom={flyZoom} />

        <MapClickEvents onMapClick={(lat, lng) => setClickedCoords({ lat, lng })} />

        {/* Property Markers */}
        {properties
          .filter((p) => p.lat && p.lng)
          .map((property) => (
            <Marker
              key={property.id}
              position={[property.lat!, property.lng!]}
              icon={createCustomIcon(property.status, property.purpose)}
            >
              <Popup>
                <div className="w-64 p-3 bg-slate-900 text-white rounded-xl">
                  {property.images && property.images.length > 0 && (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {property.property_code}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {getPropertyTypeLabel(property.property_type, lang)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                    {property.title}
                  </h4>
                  {property.project_name && (
                    <div className="text-xs text-slate-400 mb-1">
                      {t.project}: {property.project_name} (نهۆم: {property.floor_number || 1})
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {formatPrice(property.price, property.currency, lang)}
                    </span>
                    <span className="text-[11px] text-slate-300 font-semibold font-mono bg-slate-800/80 px-2 py-0.5 rounded">
                      {formatArea(property.area_sqm, property.land_details, lang).primary}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.view || 'بینینی هەموو زانیارییەکان'}</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Temporary marker on click for coordinate picking */}
        {clickedCoords && (
          <Marker position={[clickedCoords.lat, clickedCoords.lng]}>
            <Popup>
              <div className="p-2 text-center text-xs">
                <p className="font-bold mb-1">پۆوتانی دیاریکراو:</p>
                <p className="font-mono text-amber-400 mb-2">
                  {clickedCoords.lat.toFixed(5)}, {clickedCoords.lng.toFixed(5)}
                </p>
                <button
                  onClick={handleCopyCoords}
                  className="px-2 py-1 rounded bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 mx-auto"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'کۆپیکرا!' : 'کۆپیکردنی پۆوتان'}</span>
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Info Guide */}
      <div className="absolute bottom-4 right-4 z-20 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300">{t.for_sale}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-slate-300">{t.for_rent}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
          <span className="text-slate-300">{t.for_exchange}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          <span className="text-slate-300">{t.sold}</span>
        </div>
      </div>
    </div>
  );
}
