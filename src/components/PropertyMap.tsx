'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { MapPin, Loader2 } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

const DynamicMap = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      <span className="text-sm font-semibold">Loading Map...</span>
    </div>
  ),
});

interface PropertyMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  lang?: Language;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onSelectProperty, lang = 'ckb' }) => {
  const t = translations[lang] as any;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span>{t.map}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? 'View and explore all villas, apartments, lands, and commercial properties on the interactive map.' 
              : lang === 'ar'
              ? 'استكشف مواقع جميع الفلل، الشقق، الأراضي والعقارات التجارية على الخريطة التفاعلية.'
              : 'شوێنی جوگرافی هەموو خانوو، شوقە، ڤیلا و زەوییەکان لەسەر نەخشە ببینە.'}
          </p>
        </div>
        <div className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
          {properties.filter((p) => p.lat && p.lng).length} {t.in_portfolio}
        </div>
      </div>

      <DynamicMap properties={properties} onSelectProperty={onSelectProperty} lang={lang} />
    </div>
  );
};
