'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property, PropertyPurpose, PropertyDivision } from '@/types';
import { formatPrice, getPropertyTypeLabel, formatArea } from '@/lib/utils';
import { 
  Eye, 
  MapPin, 
  Copy, 
  Check, 
  Navigation, 
  Search, 
  Satellite, 
  Layers, 
  Crosshair, 
  Share2, 
  ExternalLink,
  Maximize2,
  Minimize2,
  Tag,
  Building,
  Home,
  Compass,
  Sparkles,
  Filter,
  DollarSign
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { 
  CITY_CENTERS, 
  formatPriceCompact, 
  parseCoordinatesInput 
} from '@/lib/locationPresets';

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 1. Zillow / Airbnb style Interactive Price Badge Icon
const createPriceBadgeIcon = (property: Property, isHovered: boolean = false) => {
  let bgGradient = 'from-emerald-500 to-emerald-600 text-white border-emerald-300';
  let dotColor = '#10b981';

  if (property.status === 'rented') {
    bgGradient = 'from-blue-600 to-blue-700 text-white border-blue-300';
    dotColor = '#3b82f6';
  } else if (property.status === 'sold') {
    bgGradient = 'from-purple-600 to-purple-700 text-white border-purple-300';
    dotColor = '#a855f7';
  } else if (property.purpose === 'rent') {
    bgGradient = 'from-sky-500 to-blue-600 text-white border-sky-300';
    dotColor = '#0ea5e9';
  } else if (property.purpose === 'exchange') {
    bgGradient = 'from-pink-500 to-rose-600 text-white border-pink-300';
    dotColor = '#ec4899';
  }

  const compactPrice = formatPriceCompact(property.price, property.currency);
  const isLand = property.property_type === 'commercial_land' || property.property_type === 'agriculture_land';
  const typeEmoji = isLand 
    ? '🌾' 
    : property.property_type === 'villa' 
    ? '🏰' 
    : property.property_type === 'apartment' 
    ? '🏢' 
    : property.property_type === 'building' 
    ? '🏛️' 
    : (property.property_type === 'shop' || property.property_type === 'office') 
    ? '🏪' 
    : '🏠';

  return L.divIcon({
    className: 'custom-price-badge-icon',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        ${isHovered ? 'transform: translate(-50%, -105%) scale(1.12); z-index: 999;' : ''}
      ">
        <div style="
          padding: 3px 8px;
          border-radius: 9999px;
          background: linear-gradient(135deg, ${bgGradient.includes('emerald') ? '#059669, #047857' : bgGradient.includes('sky') ? '#0284c7, #2563eb' : bgGradient.includes('pink') ? '#db2777, #e11d48' : bgGradient.includes('purple') ? '#7e22ce, #6b21a8' : '#2563eb, #1d4ed8'});
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.65), 0 0 10px ${dotColor}88;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          color: #ffffff;
          font-family: monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: -0.3px;
        ">
          <span style="font-size: 11px;">${typeEmoji}</span>
          <span>${compactPrice}</span>
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${dotColor};
          margin-top: -1px;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -32],
  });
};

// 2. Minimalist SVG Pin Icon
const createMinimalPinIcon = (status: string, purpose: string) => {
  let color = '#f59e0b'; // Gold default
  if (status === 'rented') color = '#3b82f6';
  else if (status === 'sold') color = '#a855f7';
  else if (purpose === 'sale') color = '#10b981';
  else if (purpose === 'exchange') color = '#ec4899';

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 8px ${color}66;
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #0b0d10;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// 3. User Location Beacon Icon
const createUserBeaconIcon = () => {
  return L.divIcon({
    className: 'user-beacon',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #38bdf8;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.4), 0 0 16px rgba(56, 189, 248, 0.8);
      " class="beacon-pulse"></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Map flyTo controller for smooth auto-centering on search or target
function MapFlyController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.4 });
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
  const [flyZoom, setFlyZoom] = useState(13);
  const [mapSearch, setMapSearch] = useState('');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'dark' | 'streets'>('satellite');
  const [markerStyle, setMarkerStyle] = useState<'prices' | 'pins'>('prices');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In-Map Filters
  const [purposeFilter, setPurposeFilter] = useState<'all' | PropertyPurpose>('all');
  const [divisionFilter, setDivisionFilter] = useState<'all' | PropertyDivision>('all');

  const t = translations[lang] as any;
  const defaultCenter: [number, number] = [36.1911, 44.0092]; // Erbil center

  // Filtered properties for map display
  const mapProperties = useMemo(() => {
    return properties.filter((p) => {
      if (!p.lat || !p.lng) return false;
      if (purposeFilter !== 'all' && p.purpose !== purposeFilter) return false;
      if (divisionFilter !== 'all') {
        if (divisionFilter === 'residential' && !['house', 'villa', 'apartment'].includes(p.property_type)) return false;
        if (divisionFilter === 'land' && !['commercial_land', 'agriculture_land'].includes(p.property_type)) return false;
        if (divisionFilter === 'commercial' && !['shop', 'office', 'building', 'commercial_land'].includes(p.property_type)) return false;
        if (divisionFilter === 'projects' && !p.project_name) return false;
      }
      return true;
    });
  }, [properties, purposeFilter, divisionFilter]);

  // Total Portfolio Value on Map
  const totalValueOnMap = useMemo(() => {
    return mapProperties.reduce((acc, p) => acc + (p.currency === 'USD' ? p.price : p.price / 1530), 0);
  }, [mapProperties]);

  const handleCopyCoords = () => {
    if (clickedCoords) {
      navigator.clipboard.writeText(`${clickedCoords.lat.toFixed(5)}, ${clickedCoords.lng.toFixed(5)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // GPS Locate User
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserCoords([uLat, uLng]);
        setFlyCenter([uLat, uLng]);
        setFlyZoom(15);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search quick jump
  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;

    // 1. Check if user pasted coordinates or Google Maps link
    const parsedCoords = parseCoordinatesInput(mapSearch);
    if (parsedCoords) {
      setFlyCenter([parsedCoords.lat, parsedCoords.lng]);
      setFlyZoom(16);
      return;
    }

    const term = mapSearch.toLowerCase().trim();

    // 2. City coordinates quick match
    for (const [key, center] of Object.entries(CITY_CENTERS)) {
      if (
        term.includes(key) || 
        term.includes(center.labelKrd.toLowerCase()) || 
        term.includes(center.labelAr.toLowerCase()) || 
        term.includes(center.labelEn.toLowerCase())
      ) {
        setFlyCenter([center.lat, center.lng]);
        setFlyZoom(center.zoom);
        return;
      }
    }

    // 3. Search matched property
    const matched = properties.find((p) => 
      p.lat && p.lng && (
        p.title.toLowerCase().includes(term) ||
        p.property_code.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term) ||
        p.neighborhood?.toLowerCase().includes(term) ||
        p.project_name?.toLowerCase().includes(term)
      )
    );

    if (matched && matched.lat && matched.lng) {
      setFlyCenter([matched.lat, matched.lng]);
      setFlyZoom(16);
    }
  };

  // Jump to City Center
  const handleJumpToCity = (cityKey: string) => {
    const center = CITY_CENTERS[cityKey];
    if (center) {
      setFlyCenter([center.lat, center.lng]);
      setFlyZoom(center.zoom);
    }
  };

  // WhatsApp Share with Location
  const handleShareWhatsApp = (property: Property) => {
    const mapsUrl = `https://www.google.com/maps?q=${property.lat},${property.lng}`;
    const text = `🏡 *Nashville House Real Estate*\n📍 *${property.title}* (${property.property_code})\n💰 نرخ: ${property.price} ${property.currency}\n🗺️ شوێن لەسەر نەخشە:\n${mapsUrl}\n📞 0750 150 0505 | 0750 214 6614`;
    window.open(`https://wa.me/9647501500505?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div 
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl h-[calc(100vh-32px)]' : 'h-[680px]'
      }`}
    >
      {/* Top Floating Header & Filter Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 max-w-4xl mx-auto pointer-events-none">
        
        {/* Row 1: Search Form + Quick City Jump + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Search bar */}
          <form 
            onSubmit={handleMapSearch} 
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex-1 min-w-[240px] max-w-md"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder={
                lang === 'en' 
                  ? 'Search: Empire, Dream City, code, or paste GPS...' 
                  : 'گەڕان: ئیمپایەر، دریم ستی، کۆد، پۆوتان...'
              }
              className="flex-1 bg-transparent border-none text-white text-xs outline-none placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              {lang === 'en' ? 'Go' : 'بچۆ'}
            </button>
          </form>

          {/* City Quick Jump Pills */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl overflow-x-auto">
            {Object.entries(CITY_CENTERS).map(([key, c]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleJumpToCity(key)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap"
              >
                📍 {lang === 'en' ? c.labelEn : lang === 'ar' ? c.labelAr : c.labelKrd}
              </button>
            ))}
          </div>

          {/* Right Action Icons: GPS, Marker Style, Layers, Fullscreen */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl">
            {/* GPS Locate Me */}
            <button
              type="button"
              onClick={handleLocateMe}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-all"
              title={lang === 'en' ? 'My Location' : 'شوێنی ئێستام'}
            >
              <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Toggle Price Badges vs Compact Pins */}
            <button
              type="button"
              onClick={() => setMarkerStyle(markerStyle === 'prices' ? 'pins' : 'prices')}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                markerStyle === 'prices' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
              title={markerStyle === 'prices' ? 'Show Pins' : 'Show Price Badges'}
            >
              <Tag className="w-4 h-4" />
            </button>

            {/* Layer Switcher */}
            <button
              type="button"
              onClick={() => setMapLayer(mapLayer === 'satellite' ? 'dark' : mapLayer === 'dark' ? 'streets' : 'satellite')}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-sky-400 hover:text-sky-300 transition-all flex items-center gap-1"
              title={lang === 'en' ? 'Toggle Satellite / Dark / Streets' : 'گۆڕینی شێوازی نەخشە'}
            >
              {mapLayer === 'satellite' ? <Satellite className="w-4 h-4" /> : mapLayer === 'dark' ? <Layers className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Row 2: In-Map Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Purpose Filters */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 shadow-lg text-[11px] overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setPurposeFilter('all')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                purposeFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'All' : 'هەموو'}
            </button>
            <button
              type="button"
              onClick={() => setPurposeFilter('sale')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                purposeFilter === 'sale' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.for_sale || 'فرۆشتن'}
            </button>
            <button
              type="button"
              onClick={() => setPurposeFilter('rent')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                purposeFilter === 'rent' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.for_rent || 'کرێ'}
            </button>
            <button
              type="button"
              onClick={() => setPurposeFilter('exchange')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                purposeFilter === 'exchange' ? 'bg-pink-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.for_exchange || 'گۆڕینەوە'}
            </button>
          </div>

          {/* Division Filters */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 shadow-lg text-[11px] overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setDivisionFilter('all')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                divisionFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'All Types' : 'تەواوی جۆرەکان'}
            </button>
            <button
              type="button"
              onClick={() => setDivisionFilter('residential')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                divisionFilter === 'residential' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏡 {lang === 'en' ? 'Residential' : 'نیشتەجێبوون'}
            </button>
            <button
              type="button"
              onClick={() => setDivisionFilter('land')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                divisionFilter === 'land' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌾 {lang === 'en' ? 'Lands' : 'زەوی'}
            </button>
            <button
              type="button"
              onClick={() => setDivisionFilter('commercial')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                divisionFilter === 'commercial' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 {lang === 'en' ? 'Commercial' : 'بازرگانی'}
            </button>
          </div>
        </div>
      </div>

      {/* THE MAIN LEAFLET MAP */}
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dynamic Tile Layers (100% Free, No API Key Required) */}
        {mapLayer === 'satellite' && (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; World Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              opacity={0.85}
            />
          </>
        )}

        {mapLayer === 'dark' && (
          <TileLayer
            className="dark-map-tiles"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {mapLayer === 'streets' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Map Fly Controller */}
        <MapFlyController center={flyCenter} zoom={flyZoom} />

        {/* Click on Map Listener */}
        <MapClickEvents onMapClick={(lat, lng) => setClickedCoords({ lat, lng })} />

        {/* User GPS Location Beacon */}
        {userCoords && (
          <Marker position={userCoords} icon={createUserBeaconIcon()}>
            <Popup>
              <div className="p-2 text-center text-xs text-white">
                <span className="font-bold text-sky-400">📍 {lang === 'en' ? 'Your Current Location' : 'شوێنی ئێستات'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Property Markers / Price Badges */}
        {mapProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.lat!, property.lng!]}
            icon={
              markerStyle === 'prices'
                ? createPriceBadgeIcon(property)
                : createMinimalPinIcon(property.status, property.purpose)
            }
          >
            <Popup className="nashville-property-popup">
              <div className="w-72 p-3 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl">
                {property.images && property.images.length > 0 && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2.5">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                        {property.property_code}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-md ${
                        property.purpose === 'sale' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {property.purpose === 'sale' ? (t.for_sale || 'فرۆشتن') : (t.for_rent || 'کرێ')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>{getPropertyTypeLabel(property.property_type, lang)}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {property.city} {property.neighborhood ? `• ${property.neighborhood}` : ''}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1.5">
                  {property.title}
                </h4>

                {property.project_name && (
                  <div className="text-xs text-amber-400/90 font-medium mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{t.project || 'پڕۆژە'}: {property.project_name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 mb-2.5">
                  <div>
                    <div className="text-[10px] text-slate-400">{t.price || 'نرخ'}</div>
                    <div className="text-sm font-black text-amber-400 font-mono">
                      {formatPrice(property.price, property.currency, lang)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">{t.area || 'ڕووبەر'}</div>
                    <div className="text-xs text-slate-200 font-bold font-mono">
                      {formatArea(property.area_sqm, property.land_details, lang).primary}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Full View, Google Maps, WhatsApp */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onSelectProperty(property)}
                    className="col-span-1 py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow"
                    title={lang === 'en' ? 'View Details' : 'بینینی زانیاری'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'View' : 'بینین'}</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    title={lang === 'en' ? 'Google Maps Navigation' : 'ڕێنوێنی Google Maps'}
                  >
                    <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    <span>{lang === 'en' ? 'Nav' : 'نەخشە'}</span>
                  </a>

                  <button
                    onClick={() => handleShareWhatsApp(property)}
                    className="col-span-1 py-1.5 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    title={lang === 'en' ? 'Share Location on WhatsApp' : 'ناردن بۆ واتسئەپ'}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>واتسئەپ</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Temporary Marker on Click with Coordinates */}
        {clickedCoords && (
          <Marker position={[clickedCoords.lat, clickedCoords.lng]}>
            <Popup>
              <div className="p-3 text-center text-xs bg-slate-950 text-white rounded-xl border border-slate-800">
                <p className="font-bold mb-1 text-slate-300">
                  {lang === 'en' ? 'Selected Coordinates:' : 'پۆوتانی دیاریکراو:'}
                </p>
                <p className="font-mono text-amber-400 font-bold mb-2.5">
                  {clickedCoords.lat.toFixed(5)}, {clickedCoords.lng.toFixed(5)}
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={handleCopyCoords}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 border border-slate-800 transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? (lang === 'en' ? 'Copied!' : 'کۆپیکرا!') : (lang === 'en' ? 'Copy GPS' : 'کۆپیکردن')}</span>
                  </button>
                  <a
                    href={`https://www.google.com/maps?q=${clickedCoords.lat},${clickedCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 border border-slate-800 transition-all"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Bottom Stats & Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Visible Properties Count & Combined Portfolio Value */}
        <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs shadow-xl">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{mapProperties.length} {lang === 'en' ? 'on map' : 'موڵک لەسەر نەخشە'}</span>
          </div>

          {totalValueOnMap > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 font-mono font-semibold">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>{Math.round(totalValueOnMap).toLocaleString()} USD</span>
            </div>
          )}
        </div>

        {/* Right: Legend */}
        <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] shadow-xl text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
            <span>{t.for_sale || 'فرۆشتن'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" />
            <span>{t.for_rent || 'کرێ'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shadow-sm" />
            <span>{t.for_exchange || 'گۆڕینەوە'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm" />
            <span>{t.sold || 'فرۆشراو'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
