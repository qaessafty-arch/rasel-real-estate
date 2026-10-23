'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Phone, 
  User, 
  FileText, 
  Printer, 
  Edit3, 
  Trash2,
  Share2,
  Check,
  Video,
  Send,
  Compass,
  Wallet,
  Clock,
  ExternalLink,
  ShieldAlert,
  Percent,
  Image as ImageIcon,
  Box,
  Navigation
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { formatPrice, getPropertyTypeLabel, getPropertyPurposeLabel, getPropertyStatusLabel, generateWhatsAppMessage, formatArea, sqmToDonum } from '@/lib/utils';
import { Language, translations } from '@/lib/i18n';

// Client-only lazy load for 3D visualizer
const Property3DVisualizer = dynamic(
  () => import('@/components/Property3DVisualizer').then((mod) => mod.Property3DVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl glass-panel border border-slate-800 text-center text-amber-400 h-80">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold">خەریکی بارکردنی مۆدێلی ٣D...</span>
      </div>
    ),
  }
);

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  lang?: Language;
  isAdmin?: boolean;
  isStaff?: boolean;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onEdit,
  onDelete,
  lang = 'ckb',
  isAdmin = false,
  isStaff = false,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mediaTab, setMediaTab] = useState<'photos' | '3d'>('photos');
  const t = translations[lang] as any;

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!property) return null;

  const statusInfo = getPropertyStatusLabel(property.status, lang);
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `NASHVILLE HOUSE: ${property.title} | ${t.code || 'کۆد'}: ${property.property_code} | ${formatPrice(property.price, property.currency, lang)}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = generateWhatsAppMessage(property, lang);
    const url = `https://wa.me/9647501500505?text=${text}`;
    window.open(url, '_blank');
  };

  const isLand = property.property_type === 'commercial_land' || property.property_type === 'agriculture_land';
  const areaInfo = formatArea(property.area_sqm, property.land_details, lang);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-detail-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700 shadow-2xl bg-slate-900 text-right">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {property.property_code}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${statusInfo.bg}`}>
              {statusInfo.label}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
              {getPropertyPurposeLabel(property.purpose, lang)}
            </span>
            {property.condition && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-amber-300 border border-slate-700">
                {property.condition === 'brand_new' ? t.brand_new : t.used}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              title={t.share_whatsapp}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleShare}
              title="کۆپیکردنی کورتە"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => window.print()}
              title="چاپکردن"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Media Header & Mode Switcher */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h3 id="property-detail-title" className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>پێشانگای وێنە و مۆدێلی ٣D</span>
            </h3>
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <button
                type="button"
                onClick={() => setMediaTab('photos')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mediaTab === 'photos'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>وێنەکان ({images.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaTab('3d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mediaTab === '3d'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>مۆدێلی ئەندازیاری ٣D</span>
              </button>
            </div>
          </div>

          {/* Conditional Media Rendering */}
          {mediaTab === '3d' ? (
            <Property3DVisualizer property={property} />
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs text-white">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnail switcher */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImageIndex === idx ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video Tour Section (if available) */}
          {property.video_url && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.watch_video}</h4>
                  <p className="text-xs text-slate-400">ڤیدیۆی تەواوی موڵک بە دەنگ و ڕەنگ</p>
                </div>
              </div>
              <a
                href={property.video_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>کردنەوەی ڤیدیۆ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Title, Project & Price Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white mb-1.5">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{property.city} - {property.neighborhood}</span>
                </span>
                {property.project_name && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-amber-300 font-semibold text-xs border border-slate-700">
                    🏢 {t.project}: {property.project_name} (نهۆم: {property.floor_number || 1})
                  </span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono" dir="ltr">
                {formatPrice(property.price, property.currency, lang)}
              </div>
              {property.purpose === 'rent' && (
                <div className="text-xs text-slate-400 font-medium">
                  {property.rental_period === 'yearly' ? t.yearly : t.monthly}
                </div>
              )}
            </div>
          </div>

          {/* Payment Plan Card (If installments) */}
          {(property.payment_method === 'installments' || property.payment_method === 'both') && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                <span>شێوازی پارەدان بە قیست (Payment Plan)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block mb-1">{t.down_payment}</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatPrice(property.down_payment || 0, property.currency, lang)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block mb-1">{t.installment_amount}</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatPrice(property.installment_amount || 0, property.currency, lang)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block mb-1">{t.installment_type}</span>
                  <span className="font-bold text-white text-sm">
                    {property.installment_cycle === 'yearly' ? t.yearly : property.installment_cycle === 'quarterly' ? t.quarterly : t.monthly}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block mb-1">ژمارەی قیستەکان</span>
                  <span className="font-bold text-white text-sm">{property.installment_count || 12} قیست</span>
                </div>
              </div>
            </div>
          )}

          {/* Construction Timeline (If Available) */}
          {(property.construction_start_date || property.completion_date) && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              {property.construction_start_date && (
                <div>
                  <span className="text-slate-400 block mb-1">{t.start_date}:</span>
                  <span className="font-mono font-bold text-white text-sm">{property.construction_start_date}</span>
                </div>
              )}
              {property.completion_date && (
                <div>
                  <span className="text-slate-400 block mb-1">{t.completion_date}:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{property.completion_date}</span>
                </div>
              )}
            </div>
          )}

          {/* Measurements & Land Detailed Specs */}
          {property.land_details && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>وردەکاری پێوانە و سەنەد (Measurements & Deed)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {property.land_details.frontage_meter && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block mb-1">{t.frontage}</span>
                    <span className="font-mono font-bold text-white text-sm">{property.land_details.frontage_meter} مەتر</span>
                  </div>
                )}
                {property.land_details.depth_meter && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block mb-1">{t.depth || 'قووڵی / درێژی'}</span>
                    <span className="font-mono font-bold text-white text-sm">{property.land_details.depth_meter} مەتر</span>
                  </div>
                )}
                {property.land_details.frontage_meter && property.land_details.depth_meter && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block mb-1">{t.dimensions || 'پێوانەی بەرە و قووڵی'}</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {property.land_details.frontage_meter} × {property.land_details.depth_meter} م
                    </span>
                  </div>
                )}
                {property.land_details.street_width && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block mb-1">{t.street_width}</span>
                    <span className="font-mono font-bold text-white text-sm">{property.land_details.street_width} مەتر</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block mb-1">{t.zoning}</span>
                  <span className="font-bold text-amber-300">{property.land_details.zoning_type || 'تاپۆ'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block mb-1">شوێن</span>
                  <span className="font-bold text-white">{property.land_details.is_corner ? t.corner : 'سەر شەقام'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">{t.property_type}</span>
              <span className="text-sm font-bold text-slate-200">{getPropertyTypeLabel(property.property_type, lang)}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">{t.area}</span>
              <span className="text-sm font-bold text-slate-200">{areaInfo.primary}</span>
              {areaInfo.badge && (
                <span className="block text-xs text-amber-400 font-bold mt-1">
                  {areaInfo.badge}
                </span>
              )}
              {areaInfo.sqft && (
                <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                  ({areaInfo.sqft})
                </span>
              )}
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">{t.bedrooms}</span>
              <span className="text-sm font-bold text-slate-200">{property.bedrooms ? `${property.bedrooms}` : '—'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">{t.bathrooms}</span>
              <span className="text-sm font-bold text-slate-200">{property.bathrooms || 1}</span>
            </div>
          </div>

          {/* Address & GPS */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">ناونیشانی تەواو</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{property.address}</p>
            {property.lat && property.lng && (
              <p className="text-xs text-slate-400 font-mono">
                GPS: {property.lat.toFixed(4)}, {property.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">تایبەتمەندی و مۆسەفاتەکان</h4>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-200 border border-slate-700/60"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{feature}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confidential Staff & Owner Card (Staff / Admin Only) */}
          {(isAdmin || isStaff) ? (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  زانیاری پەیوەندی خاوەن موڵک (تایبەت بە ستاف و نوسینگە)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  {isAdmin ? 'دەسەڵاتی ئەدمین' : 'تایبەت بە ستاف'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">{t.owner_name}:</span>
                  <span className="font-bold text-white text-sm">{property.owner_contact?.name || 'دیاری نەکراوە'}</span>
                  {property.owner_contact?.phone && (
                    <a href={`tel:${property.owner_contact.phone}`} className="font-mono text-amber-400 block mt-1 hover:underline">
                      <span className="flex items-center gap-1">
                        <span>📞</span>
                        <span dir="ltr" className="inline-block font-mono">{property.owner_contact.phone}</span>
                      </span>
                    </a>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t.agency_name}:</span>
                  <span className="font-bold text-white text-sm">{property.agency_name || 'Nashville House'}</span>
                  {property.freelancer_name && (
                    <span className="text-slate-300 block mt-1">
                      👤 {t.freelancer_name}: <strong className="text-amber-300">{property.freelancer_name}</strong>
                    </span>
                  )}
                </div>

                {isAdmin ? (
                  <div>
                    <span className="text-slate-400 block mb-0.5">{t.commission}:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatPrice(property.commission_amount || 0, property.currency, lang)}
                    </span>
                    <span className="text-slate-400 block mt-1">
                      {t.net_to_owner}: <strong className="text-white font-mono">{formatPrice(property.net_to_owner || (property.price - (property.commission_amount || 0)), property.currency, lang)}</strong>
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-400 block mb-0.5">بارودۆخی موڵک:</span>
                    <span className="font-bold text-emerald-400 text-sm">بەردەست بۆ پیشاندان بە کڕیار</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Public Customer Contact Card */
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-white">کۆمپانیای نەشڤیل هاوس (Nashville House)</h5>
                    <span className="text-[11px] text-amber-400 font-semibold">بۆ کڕین، فرۆشتن، کرێ و وەبەرهێنان</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  بەردەستە بۆ سەردانیکردن
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                بۆ ڕێکخستنی کاتی سەردانیکردنی ئەم موڵکە، وەرگرتنی زانیاری زیاتر یان دەستپێکردنی گفتوگۆی کڕین و مامەڵە، ڕاستەوخۆ پەیوەندی بە نوسینگەی نەشڤیل هاوس بکەن.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={`https://wa.me/9647501500505?text=${encodeURIComponent('سڵاو، دەمەوێت پەیوەندی بکەم لەسەر موڵکی: ' + property.title + ' بە کۆدی: ' + property.property_code + ' لەسەر ماڵپەڕی نەشڤیل هاوس')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span className="flex items-center gap-1.5">
                    <span>واتسئەپ ١:</span>
                    <span dir="ltr" className="font-mono tracking-wider">0750 150 0505</span>
                  </span>
                </a>

                <a
                  href={`https://wa.me/9647502146614?text=${encodeURIComponent('سڵاو، دەمەوێت پەیوەندی بکەم لەسەر موڵکی: ' + property.title + ' بە کۆدی: ' + property.property_code + ' لەسەر ماڵپەڕی نەشڤیل هاوس')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span className="flex items-center gap-1.5">
                    <span>واتسئەپ ٢:</span>
                    <span dir="ltr" className="font-mono tracking-wider">0750 214 6614</span>
                  </span>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <a href="tel:07501500505" className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">0750 150 0505</span>
                  </a>
                  <span className="text-slate-600">•</span>
                  <a href="tel:07502146614" className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">0750 214 6614</span>
                  </a>
                </div>

                {property.lat && property.lng && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(property);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                <span>{t.edit}</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(t.confirm_delete)) {
                    onDelete(property.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 text-xs font-semibold transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.delete}</span>
              </button>
            </div>
          ) : isStaff ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(property);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                <span>{t.edit}</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">
              کۆدی موڵک: <span className="font-mono text-amber-400 font-bold">{property.property_code}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            داخستن
          </button>
        </div>

      </div>
    </div>
  );
};
