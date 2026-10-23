// ==========================================================================
// KURDISTAN & IRAQ GEOGRAPHICAL LOCATION PRESETS & MAP UTILITIES
// Nashville House Real Estate System
// ==========================================================================

export interface LocationPreset {
  id: string;
  nameKrd: string;
  nameAr: string;
  nameEn: string;
  cityKrd: string;
  cityAr: string;
  cityEn: string;
  lat: number;
  lng: number;
  zoom?: number;
  isPopular?: boolean;
}

export const CITY_CENTERS: Record<string, { lat: number; lng: number; zoom: number; labelKrd: string; labelAr: string; labelEn: string }> = {
  erbil: {
    lat: 36.1911,
    lng: 44.0092,
    zoom: 12,
    labelKrd: 'هەولێر',
    labelAr: 'أربيل',
    labelEn: 'Erbil',
  },
  sulaymaniyah: {
    lat: 35.5558,
    lng: 45.4351,
    zoom: 12,
    labelKrd: 'سلێمانی',
    labelAr: 'السليمانية',
    labelEn: 'Sulaymaniyah',
  },
  duhok: {
    lat: 36.8679,
    lng: 42.9886,
    zoom: 12,
    labelKrd: 'دهۆک',
    labelAr: 'دهوك',
    labelEn: 'Duhok',
  },
  kirkuk: {
    lat: 35.4681,
    lng: 44.3922,
    zoom: 12,
    labelKrd: 'کەرکووک',
    labelAr: 'كركوك',
    labelEn: 'Kirkuk',
  },
  baghdad: {
    lat: 33.3152,
    lng: 44.3661,
    zoom: 11,
    labelKrd: 'بەغدا',
    labelAr: 'بغداد',
    labelEn: 'Baghdad',
  },
};

export const NEIGHBORHOOD_PRESETS: LocationPreset[] = [
  // --- ERBIL (هەولێر) ---
  {
    id: 'erbil_empire',
    nameKrd: 'ئیمپایەر وۆڕڵد (Empire World)',
    nameAr: 'إمباير وورلد (Empire World)',
    nameEn: 'Empire World',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2085,
    lng: 43.9852,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'erbil_dream_city',
    nameKrd: 'دریم ستی (Dream City)',
    nameAr: 'دريم سيتي (Dream City)',
    nameEn: 'Dream City',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2162,
    lng: 43.9981,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'erbil_italian_1',
    nameKrd: 'گوندی ئیتاڵی ١ (Italian Village 1)',
    nameAr: 'القرية الإيطالية 1',
    nameEn: 'Italian Village 1',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2238,
    lng: 44.0245,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'erbil_italian_2',
    nameKrd: 'گوندی ئیتاڵی ٢ (Italian Village 2)',
    nameAr: 'القرية الإيطالية 2',
    nameEn: 'Italian Village 2',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2305,
    lng: 44.0322,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'erbil_english',
    nameKrd: 'گوندی ئینگلیزی (English Village)',
    nameAr: 'القرية الإنجليزية',
    nameEn: 'English Village',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2131,
    lng: 43.9912,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'erbil_gulan',
    nameKrd: 'شەقامی گوڵان (١٠٠ مەتری)',
    nameAr: 'شارع كولان (100 متري)',
    nameEn: 'Gulan St (100m)',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2024,
    lng: 44.0085,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'erbil_bakhtiyari',
    nameKrd: 'بەختیاری (Bakhtiyari)',
    nameAr: 'بختياري',
    nameEn: 'Bakhtiyari',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2045,
    lng: 44.0156,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'erbil_ankawa',
    nameKrd: 'عەنکاوە (Ankawa)',
    nameAr: 'عنكاوا',
    nameEn: 'Ankawa',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2312,
    lng: 43.9954,
    zoom: 14,
    isPopular: true,
  },
  {
    id: 'erbil_waziran',
    nameKrd: 'وەزیران (Waziran)',
    nameAr: 'حي الوزيران',
    nameEn: 'Waziran',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.1882,
    lng: 44.0185,
    zoom: 15,
  },
  {
    id: 'erbil_120m',
    nameKrd: 'شەقامی ١٢٠ مەتری',
    nameAr: 'طريق 120 متري السريع',
    nameEn: '120 Meter Highway',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2255,
    lng: 44.0410,
    zoom: 14,
  },
  {
    id: 'erbil_atlantic',
    nameKrd: 'ئەتڵەنتیک ستی (Atlantic City)',
    nameAr: 'أتلانتيك سيتي',
    nameEn: 'Atlantic City',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.1752,
    lng: 44.0456,
    zoom: 15,
  },
  {
    id: 'erbil_masif',
    nameKrd: 'مەسیف سەڵاحەدین (Masif)',
    nameAr: 'مصيف صلاح الدين',
    nameEn: 'Masif Saladin',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.3852,
    lng: 44.2051,
    zoom: 13,
  },
  {
    id: 'erbil_kasnazan',
    nameKrd: 'ڕێگای کەسنەزان (Kasnazan Rd)',
    nameAr: 'طريق كسنزان',
    nameEn: 'Kasnazan Road',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.1950,
    lng: 44.0855,
    zoom: 14,
  },
  {
    id: 'erbil_lebanese',
    nameKrd: 'گوندی لوبنانی (Lebanese Village)',
    nameAr: 'القرية اللبنانية',
    nameEn: 'Lebanese Village',
    cityKrd: 'هەولێر',
    cityAr: 'أربيل',
    cityEn: 'Erbil',
    lat: 36.2355,
    lng: 44.0505,
    zoom: 15,
  },

  // --- SULAYMANIYAH (سلێمانی) ---
  {
    id: 'suly_sarchinar',
    nameKrd: 'سەرچنار (Sarchinar)',
    nameAr: 'سرجنار',
    nameEn: 'Sarchinar',
    cityKrd: 'سلێمانی',
    cityAr: 'السليمانية',
    cityEn: 'Sulaymaniyah',
    lat: 35.5802,
    lng: 45.3855,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'suly_tuwi_malik',
    nameKrd: 'تووی مەلیک (Tuwi Malik)',
    nameAr: 'توي ملك',
    nameEn: 'Tuwi Malik',
    cityKrd: 'سلێمانی',
    cityAr: 'السليمانية',
    cityEn: 'Sulaymaniyah',
    lat: 35.5655,
    lng: 45.4255,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'suly_raparin',
    nameKrd: 'ڕاپەڕین (Raparin)',
    nameAr: 'حي راپەرين',
    nameEn: 'Raparin',
    cityKrd: 'سلێمانی',
    cityAr: 'السليمانية',
    cityEn: 'Sulaymaniyah',
    lat: 35.5501,
    lng: 45.3402,
    zoom: 14,
  },
  {
    id: 'suly_qaiwan',
    nameKrd: 'قەیوان ستی (Qaiwan City)',
    nameAr: 'مدينة قيوان',
    nameEn: 'Qaiwan City',
    cityKrd: 'سلێمانی',
    cityAr: 'السليمانية',
    cityEn: 'Sulaymaniyah',
    lat: 35.6105,
    lng: 45.3705,
    zoom: 15,
  },

  // --- DUHOK (دهۆک) ---
  {
    id: 'duhok_malta',
    nameKrd: 'ماڵتا (Malta)',
    nameAr: 'مالطا',
    nameEn: 'Malta',
    cityKrd: 'دهۆک',
    cityAr: 'دهوك',
    cityEn: 'Duhok',
    lat: 36.8552,
    lng: 42.9705,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'duhok_avro',
    nameKrd: 'ئەڤرۆ ستی (Avro City)',
    nameAr: 'أفرو سيتي',
    nameEn: 'Avro City',
    cityKrd: 'دهۆک',
    cityAr: 'دهوك',
    cityEn: 'Duhok',
    lat: 36.8455,
    lng: 42.9205,
    zoom: 15,
    isPopular: true,
  },
  {
    id: 'duhok_masik',
    nameKrd: 'ماسیک (Masik)',
    nameAr: 'ماسيك',
    nameEn: 'Masik',
    cityKrd: 'دهۆک',
    cityAr: 'دهوك',
    cityEn: 'Duhok',
    lat: 36.8705,
    lng: 42.9505,
    zoom: 15,
  },

  // --- KIRKUK (کەرکووک) ---
  {
    id: 'kirkuk_shoraw',
    nameKrd: 'شۆراو (Shoraw)',
    nameAr: 'شوراو',
    nameEn: 'Shoraw',
    cityKrd: 'کەرکووک',
    cityAr: 'كركوك',
    cityEn: 'Kirkuk',
    lat: 35.5105,
    lng: 44.3805,
    zoom: 14,
    isPopular: true,
  },
  {
    id: 'kirkuk_almas',
    nameKrd: 'ئەڵماس (Almas)',
    nameAr: 'حي الألماس',
    nameEn: 'Almas',
    cityKrd: 'کەرکووک',
    cityAr: 'كركوك',
    cityEn: 'Kirkuk',
    lat: 35.4805,
    lng: 44.4005,
    zoom: 15,
  },

  // --- BAGHDAD (بەغدا) ---
  {
    id: 'baghdad_mansour',
    nameKrd: 'مەنسوور (Al-Mansour)',
    nameAr: 'حي المنصور',
    nameEn: 'Al-Mansour',
    cityKrd: 'بەغدا',
    cityAr: 'بغداد',
    cityEn: 'Baghdad',
    lat: 33.3155,
    lng: 44.3505,
    zoom: 14,
    isPopular: true,
  },
  {
    id: 'baghdad_jadriya',
    nameKrd: 'جادریە (Al-Jadriya)',
    nameAr: 'الجادرية',
    nameEn: 'Al-Jadriya',
    cityKrd: 'بەغدا',
    cityAr: 'بغداد',
    cityEn: 'Baghdad',
    lat: 33.2755,
    lng: 44.3855,
    zoom: 14,
  },
];

/**
 * Intelligent parser that extracts latitude and longitude from:
 * 1. Comma or space separated numbers: "36.195, 44.01" or "36.195 44.01"
 * 2. Google Maps URLs: https://www.google.com/maps/@36.195,44.01,17z
 * 3. Google Maps query: https://maps.google.com/?q=36.195,44.01
 * 4. Google Maps place: https://maps.google.com/maps/place/.../@36.195,44.01...
 */
export function parseCoordinatesInput(input: string): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();

  // Pattern 1: URL with @lat,lng
  const atMatch = clean.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Pattern 2: URL with q=lat,lng or ll=lat,lng
  const qMatch = clean.match(/[?&](?:q|ll)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Pattern 3: Standard raw numbers "36.195, 44.01" or "36.195 44.01"
  const rawMatch = clean.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Pattern 4: Any two decimal floats anywhere in the string
  const floats = clean.match(/-?\d+\.\d+/g);
  if (floats && floats.length >= 2) {
    const lat = parseFloat(floats[0]);
    const lng = parseFloat(floats[1]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Format price compactly for map pin badges (e.g. $180k, $1.2M, 240M IQD)
 */
export function formatPriceCompact(price: number, currency: 'USD' | 'IQD' = 'USD'): string {
  if (!price || isNaN(price)) return 'N/A';
  if (currency === 'USD') {
    if (price >= 1_000_000) {
      return `$${(price / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (price >= 1_000) {
      return `$${Math.round(price / 1_000)}k`;
    }
    return `$${price}`;
  } else {
    if (price >= 1_000_000) {
      return `${(price / 1_000_000).toFixed(1).replace(/\.0$/, '')}M د.ع`;
    }
    if (price >= 1_000) {
      return `${Math.round(price / 1_000)}k د.ع`;
    }
    return `${price} د.ع`;
  }
}
