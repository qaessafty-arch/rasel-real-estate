'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Satellite, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Check, 
  ExternalLink,
  Sparkles,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Language } from '@/lib/i18n';
import { 
  NEIGHBORHOOD_PRESETS, 
  CITY_CENTERS, 
  LocationPreset, 
  parseCoordinatesInput 
} from '@/lib/locationPresets';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Vibrant Custom Draggable Pin
const createPickerPinIcon = () => {
  return L.divIcon({
    className: 'picker-pin',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: 2.5px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 6px 16px rgba(0,0,0,0.6), 0 0 12px rgba(245, 158, 11, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: bounce 1s infinite alternate ease-in-out;
      ">
        <div style="
          width: 14px;
          height: 14px;
          background: #0f172a;
          border-radius: 50%;
          transform: rotate(45deg);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface PropertyLocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  city?: string;
  neighborhood?: string;
  onChangeLocation: (coords: { lat: number; lng: number; city?: string; neighborhood?: string }) => void;
  lang?: Language;
}

export default function PropertyLocationPicker({
  lat,
  lng,
  city = 'هەولێر',
  neighborhood = '',
  onChangeLocation,
  lang = 'ckb',
}: PropertyLocationPickerProps) {
  // Current coordinates or Erbil default
  const currentLat = lat ?? 36.1911;
  const currentLng = lng ?? 44.0092;

  const [mapLayer, setMapLayer] = useState<'satellite' | 'dark' | 'streets'>('satellite');
  const [isExpanded, setIsExpanded] = useState(false);
  const [flyCenter, setFlyCenter] = useState<[number, number] | null>(null);
  const [flyZoom, setFlyZoom] = useState<number>(14);
  const [selectedCityKey, setSelectedCityKey] = useState<string>('erbil');
  const [searchOrPasteInput, setSearchOrPasteInput] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const markerRef = useRef<any>(null);

  // Sync city tab with current city prop
  useEffect(() => {
    if (!city) return;
    const lower = city.toLowerCase();
    if (lower.includes('هەولێر') || lower.includes('erbil') || lower.includes('أربيل')) {
      setSelectedCityKey('erbil');
    } else if (lower.includes('سلێمانی') || lower.includes('sulaymaniyah') || lower.includes('السليمانية')) {
      setSelectedCityKey('sulaymaniyah');
    } else if (lower.includes('دهۆک') || lower.includes('duhok') || lower.includes('دهوك')) {
      setSelectedCityKey('duhok');
    } else if (lower.includes('کەرکووک') || lower.includes('kirkuk') || lower.includes('كركوك')) {
      setSelectedCityKey('kirkuk');
    } else if (lower.includes('بەغدا') || lower.includes('baghdad') || lower.includes('بغداد')) {
      setSelectedCityKey('baghdad');
    }
  }, [city]);

  // Presets filtered for active city
  const cityPresets = useMemo(() => {
    const targetCityKrd = CITY_CENTERS[selectedCityKey]?.labelKrd;
    return NEIGHBORHOOD_PRESETS.filter((p) => p.cityKrd === targetCityKrd);
  }, [selectedCityKey]);

  // Handle map click
  const handleMapClick = (clickLat: number, clickLng: number) => {
    onChangeLocation({ lat: clickLat, lng: clickLng });
    setGpsError(null);
  };

  // Handle marker drag end
  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const pos = marker.getLatLng();
      onChangeLocation({ lat: pos.lat, lng: pos.lng });
    }
  };

  // Preset button click
  const handleSelectPreset = (preset: LocationPreset) => {
    const localizedCity = lang === 'en' ? preset.cityEn : lang === 'ar' ? preset.cityAr : preset.cityKrd;
    const localizedNeighborhood = lang === 'en' ? preset.nameEn : lang === 'ar' ? preset.nameAr : preset.nameKrd;

    onChangeLocation({
      lat: preset.lat,
      lng: preset.lng,
      city: localizedCity,
      neighborhood: localizedNeighborhood,
    });
    setFlyCenter([preset.lat, preset.lng]);
    setFlyZoom(preset.zoom || 15);
    setGpsError(null);
  };

  // City center click
  const handleSelectCityCenter = (cityKey: string) => {
    setSelectedCityKey(cityKey);
    const center = CITY_CENTERS[cityKey];
    if (center) {
      const localizedCity = lang === 'en' ? center.labelEn : lang === 'ar' ? center.labelAr : center.labelKrd;
      onChangeLocation({
        lat: center.lat,
        lng: center.lng,
        city: localizedCity,
      });
      setFlyCenter([center.lat, center.lng]);
      setFlyZoom(center.zoom);
    }
  };

  // Detect GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError(lang === 'en' ? 'Geolocation is not supported by your browser.' : 'شوێندۆزی GPS لەم وێبگەڕەدا پشتگیری نەکراوە.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        onChangeLocation({ lat: userLat, lng: userLng });
        setFlyCenter([userLat, userLng]);
        setFlyZoom(16);
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        setGpsError(
          error.code === 1
            ? (lang === 'en' ? 'Location permission was denied.' : 'مۆڵەتی دەستگەیشتن بە شوێن ڕەتکرایەوە.')
            : (lang === 'en' ? 'Unable to retrieve location.' : 'نەتوانرا شوێنی ئێستات بدۆزرێتەوە.')
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Parse Google Maps link or typed coordinates
  const handleApplyCoordinatesInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchOrPasteInput.trim()) return;

    const parsed = parseCoordinatesInput(searchOrPasteInput);
    if (parsed) {
      onChangeLocation({ lat: parsed.lat, lng: parsed.lng });
      setFlyCenter([parsed.lat, parsed.lng]);
      setFlyZoom(16);
      setSearchOrPasteInput('');
      setGpsError(null);
    } else {
      setGpsError(
        lang === 'en' 
          ? 'Invalid format. Paste a Google Maps link or coordinates like: 36.195, 44.01' 
          : 'شێوازەکە هەڵەیە. لینکی گووگڵ ماپ یان پۆوتان بنووسە: 36.195, 44.01'
      );
    }
  };

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{lang === 'en' ? 'Select Location on Map' : lang === 'ar' ? 'تحديد الموقع على الخريطة' : 'دیاریکردنی شوێن لەسەر نەخشە'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {lang === 'en' ? 'Live Pin' : 'سەر نەخشە'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {lang === 'en' 
                ? 'Click on the map or drag the pin to place property exactly' 
                : 'لەسەر نەخشەکە کلیک بکە یان نیشانەکە (Pin) ڕابکێشە بۆ شوێنی دروستی موڵکەکە'}
            </p>
          </div>
        </div>

        {/* Action Controls: GPS, Layer, Expand */}
        <div className="flex items-center gap-1.5">
          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={gpsLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 text-xs font-semibold transition-all disabled:opacity-50"
            title={lang === 'en' ? 'Use Current GPS Location' : 'شوێنی ئێستام دیاری بکە'}
          >
            <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{lang === 'en' ? 'GPS' : 'شوێنی ئێستام'}</span>
          </button>

          {/* Map Layer Switcher: Satellite / Dark / Streets */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
                mapLayer === 'satellite' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite Photorealistic"
            >
              <Satellite className="w-3 h-3" />
              <span>{lang === 'en' ? 'Satellite' : 'مانگی دەستکرد'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('dark')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
                mapLayer === 'dark' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Modern Dark"
            >
              <Layers className="w-3 h-3" />
              <span>{lang === 'en' ? 'Dark' : 'تاریک'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('streets')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
                mapLayer === 'streets' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Street Grid"
            >
              <MapPin className="w-3 h-3" />
              <span>{lang === 'en' ? 'Streets' : 'شەقامەکان'}</span>
            </button>
          </div>

          {/* Fullscreen / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
            title={isExpanded ? 'Minimize' : 'Expand View'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* GPS Error Alert if any */}
      {gpsError && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Paste Google Maps Link or Coordinates */}
      <form onSubmit={handleApplyCoordinatesInput} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchOrPasteInput}
            onChange={(e) => setSearchOrPasteInput(e.target.value)}
            placeholder={
              lang === 'en' 
                ? 'Paste Google Maps link or coordinates (e.g. 36.208, 43.985)...' 
                : 'لینکی گووگڵ ماپ یان پۆوتان لێرە بلکێنە (نموونە: 36.208, 43.985)...'
            }
            className="w-full px-3 py-2 pl-8 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500/50 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => handleApplyCoordinatesInput()}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all shadow-md"
        >
          {lang === 'en' ? 'Apply' : 'جێبەجێکردن'}
        </button>
      </form>

      {/* City Presets Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {Object.entries(CITY_CENTERS).map(([key, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelectCityCenter(key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCityKey === key
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            📍 {lang === 'en' ? c.labelEn : lang === 'ar' ? c.labelAr : c.labelKrd}
          </button>
        ))}
      </div>

      {/* Neighborhood Pills for Active City */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] text-slate-500 font-semibold shrink-0">
          {lang === 'en' ? 'Popular Areas:' : 'گەڕەکە ناسراوەکان:'}
        </span>
        {cityPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>{lang === 'en' ? preset.nameEn : lang === 'ar' ? preset.nameAr : preset.nameKrd}</span>
          </button>
        ))}
      </div>

      {/* THE INTERACTIVE LEAFLET MAP */}
      <div 
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 ${
          isExpanded ? 'h-[500px]' : 'h-[280px]'
        }`}
      >
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Tile Layers (100% Free, No API Key Required) */}
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
          <MapFlyTo center={flyCenter} zoom={flyZoom} />

          {/* Map Click Listener */}
          <MapClickHandler onClick={handleMapClick} />

          {/* The Draggable Marker */}
          <Marker
            ref={markerRef}
            position={[currentLat, currentLng]}
            icon={createPickerPinIcon()}
            draggable={true}
            eventHandlers={{
              dragend: handleDragEnd,
            }}
          />
        </MapContainer>

        {/* Floating Instruction Overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none">
          <div className="mx-auto max-w-sm px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl text-center">
            <span className="text-[11px] font-semibold text-slate-300">
              💡 {lang === 'en' ? 'Click anywhere or drag pin to adjust location' : 'کلیک بکە یان نیشانەکە ڕابکێشە بۆ دانانی شوێنی موڵک'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Readout & Manual Fine-tuning Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 font-medium">{lang === 'en' ? 'Selected GPS:' : 'پۆوتانی دیاریکراو:'}</span>
          <span className="font-mono font-bold text-amber-300">
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Test on Google Maps */}
          <a
            href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-semibold"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
