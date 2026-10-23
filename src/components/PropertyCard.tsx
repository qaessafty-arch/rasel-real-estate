'use client';

import React from 'react';
import { 
  MapPin, 
  Eye, 
  Edit3, 
  Trash2, 
  Video, 
  Send,
  Building,
  Wallet,
  Sparkles
} from 'lucide-react';
import { Property } from '@/types';
import { formatPrice, getPropertyTypeLabel, getPropertyPurposeLabel, getPropertyStatusLabel, generateWhatsAppMessage, formatArea } from '@/lib/utils';
import { Language, translations } from '@/lib/i18n';

interface PropertyCardProps {
  property: Property;
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  lang?: Language;
  isAdmin?: boolean;
  canDelete?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onView,
  onEdit,
  onDelete,
  lang = 'ckb',
  isAdmin = false,
  canDelete = false,
}) => {
  const t = translations[lang] as any;
  const statusInfo = getPropertyStatusLabel(property.status, lang);
  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  const areaInfo = formatArea(property.area_sqm, property.land_details, lang);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = generateWhatsAppMessage(property, lang);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="group rounded-3xl glass-card overflow-hidden border border-slate-800/80 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onView(property)}>
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md ${statusInfo.bg}`}>
            {statusInfo.label}
          </span>
          {/* Purpose Badge (فرۆشتن، کرێ، گۆڕینەوە) */}
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900/85 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            {getPropertyPurposeLabel(property.purpose, lang)}
          </span>
        </div>

        {/* Property Code Badge & Video Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-950/85 text-slate-300 border border-slate-700 backdrop-blur-md">
            {property.property_code}
          </span>
          {property.video_url && (
            <span className="p-1 rounded-lg bg-red-600/90 text-white backdrop-blur-md" title="ڤیدیۆ هەیە">
              <Video className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Project Name or Condition Badge (bottom left of image) */}
        {property.project_name && (
          <div className="absolute bottom-12 right-3">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span>{property.project_name}</span>
            </span>
          </div>
        )}

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono drop-shadow-md">
              {formatPrice(property.price, property.currency, lang)}
            </div>
            {property.purpose === 'rent' && (
              <span className="text-xs text-amber-300 font-semibold drop-shadow">
                / {property.rental_period === 'yearly' ? t.yearly : t.monthly}
              </span>
            )}
            {property.payment_method === 'installments' && (
              <span className="text-[10px] text-emerald-400 font-semibold block drop-shadow">
                {t.installments} ({property.installment_cycle || t.monthly})
              </span>
            )}
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60">
            {getPropertyTypeLabel(property.property_type, lang)}
          </span>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onView(property)} 
            className="text-base font-bold text-white hover:text-amber-400 cursor-pointer line-clamp-1 transition-colors mb-1.5"
          >
            {property.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3.5 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{property.city} - {property.neighborhood || property.address}</span>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center text-xs mb-3.5">
            <div>
              <span className="block text-[11px] text-slate-400">{t.area}</span>
              <span className="font-bold text-slate-200">{areaInfo.primary}</span>
              {areaInfo.badge && (
                <span className="block text-[10px] text-amber-400 font-bold truncate mt-0.5">
                  {areaInfo.badge}
                </span>
              )}
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">{property.bedrooms ? t.bedrooms : t.floors}</span>
              <span className="font-bold text-slate-200">{property.bedrooms ? `${property.bedrooms}` : (property.floors || 1)}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">مامەڵە</span>
              <span className="font-bold text-amber-400">
                {property.payment_method === 'installments' ? t.installments : property.payment_method === 'both' ? 'نەقد/قیست' : t.cash}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & WhatsApp */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
          <button
            onClick={() => onView(property)}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.view}</span>
          </button>

          {/* Quick WhatsApp Share */}
          <button
            onClick={handleWhatsApp}
            title={t.share_whatsapp}
            className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-900/50 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          
          {/* Staff Edit & Admin Delete Controls */}
          {(isAdmin || canDelete) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(property);
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-amber-950/40 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/30 transition-all"
              title={t.edit}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(t.confirm_delete)) {
                  onDelete(property.id);
                }
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
