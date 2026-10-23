import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language, translations } from './i18n';
import { Property } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: 'USD' | 'IQD', lang: Language = 'ckb'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    const suffix = lang === 'en' ? ' IQD' : lang === 'ar' ? ' د.ع' : ' د.ع';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount) + suffix;
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getPropertyTypeLabel(type: string, lang: Language = 'ckb'): string {
  const t = translations[lang] as any;
  return t[type] || type;
}

export function getPropertyPurposeLabel(purpose: string, lang: Language = 'ckb'): string {
  const t = translations[lang] as any;
  if (purpose === 'sale') return t.for_sale;
  if (purpose === 'rent') return t.for_rent;
  if (purpose === 'exchange') return t.for_exchange;
  if (purpose === 'investment') return t.for_investment;
  return purpose;
}

export function getPropertyStatusLabel(status: string, lang: Language = 'ckb'): { label: string; bg: string; text: string } {
  const t = translations[lang] as any;
  switch (status) {
    case 'available':
      return { label: t.available || 'Available', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', text: 'text-emerald-400' };
    case 'rented':
      return { label: t.rented || 'Rented', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', text: 'text-blue-400' };
    case 'sold':
      return { label: t.sold || 'Sold', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', text: 'text-purple-400' };
    case 'reserved':
      return { label: t.reserved || 'Reserved', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', text: 'text-amber-400' };
    case 'under_maintenance':
      return { label: t.under_maintenance || 'Maintenance', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', text: 'text-rose-400' };
    default:
      return { label: status, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', text: 'text-slate-400' };
  }
}

/**
 * Format area in Kurdish / Iraqi real estate units:
 * 1 Donum = 2,500 m²
 * 1 Olk = 100 m² (25 Olk = 1 Donum)
 */
export function formatArea(areaSqm?: number, landDetails?: Property['land_details'], lang: Language = 'ckb'): {
  primary: string;
  badge?: string;
  fullDescription: string;
} {
  const sqmUnit = lang === 'en' ? 'm²' : 'م²';
  const donumUnit = lang === 'en' ? 'Donum' : lang === 'ar' ? 'دونم' : 'دۆنم';
  const olkUnit = lang === 'en' ? 'Olk' : lang === 'ar' ? 'أولك' : 'ئۆڵک';

  if (!areaSqm || areaSqm <= 0) {
    return { primary: `0 ${sqmUnit}`, fullDescription: `0 ${sqmUnit}` };
  }

  const primary = `${formatNumber(areaSqm)} ${sqmUnit}`;
  let badge: string | undefined = undefined;

  // Dimensions badge (e.g. 10 × 20m)
  if (landDetails?.frontage_meter && landDetails?.depth_meter) {
    badge = `${landDetails.frontage_meter} × ${landDetails.depth_meter}م`;
  }

  // If >= 2500 sqm (or explicitly has donum), calculate donums and olks
  if (areaSqm >= 2500 || (landDetails?.area_donum && landDetails.area_donum > 0)) {
    const donums = Math.floor(areaSqm / 2500);
    const remainderSqm = areaSqm % 2500;
    const olks = Math.floor(remainderSqm / 100);
    const leftoverSqm = remainderSqm % 100;

    let donumStr = `${formatNumber(donums)} ${donumUnit}`;
    if (olks > 0) {
      donumStr += ` ${lang === 'en' ? 'and' : 'و'} ${olks} ${olkUnit}`;
    }
    if (leftoverSqm > 0) {
      donumStr += ` (${leftoverSqm} ${sqmUnit})`;
    }
    badge = donumStr;
    return {
      primary,
      badge,
      fullDescription: `${primary} (${donumStr})`
    };
  }

  if (badge) {
    return {
      primary,
      badge,
      fullDescription: `${primary} (${badge})`
    };
  }

  return { primary, fullDescription: primary };
}

export function donumToSqm(donum: number, olk: number = 0): number {
  return (Number(donum || 0) * 2500) + (Number(olk || 0) * 100);
}

export function sqmToDonum(sqm: number): { donum: number; olk: number; remainderSqm: number } {
  const donum = Math.floor(sqm / 2500);
  const remainder = sqm % 2500;
  const olk = Math.floor(remainder / 100);
  const remainderSqm = remainder % 100;
  return { donum, olk, remainderSqm };
}

export function generateWhatsAppMessage(property: Property, lang: Language = 'ckb'): string {
  const t = translations[lang] as any;
  const price = formatPrice(property.price, property.currency, lang);
  const purpose = getPropertyPurposeLabel(property.purpose, lang);
  const type = getPropertyTypeLabel(property.property_type, lang);
  const areaInfo = formatArea(property.area_sqm, property.land_details, lang);

  const text = `🏡 *NASHVILLE HOUSE*
━━━━━━━━━━━━━━━━━
📌 *${property.title}*
🆔 ${t.code || 'کۆد'}: *${property.property_code}*
🏷️ ${t.property_type}: *${type}* (${purpose})
💰 ${t.price || 'نرخ'}: *${price}*
📐 ${t.area}: *${areaInfo.fullDescription}*
📍 ${t.city}: *${property.city} - ${property.neighborhood || property.address}*
${property.project_name ? `🏢 ${t.project}: *${property.project_name}* (نهۆم: ${property.floor_number || 1})` : ''}
${property.payment_method === 'installments' ? `💳 پێشەکی: ${formatPrice(property.down_payment || 0, property.currency, lang)} - قیست: ${property.installment_cycle || 'مانگانە'}` : ''}
${property.land_details?.frontage_meter ? `📐 بەرەی شەقام: ${property.land_details.frontage_meter}م ${property.land_details.depth_meter ? `× ${property.land_details.depth_meter}م قووڵی` : ''} | پانی شەقام: ${property.land_details.street_width || '—'}م` : ''}
${property.video_url ? `🎥 ڤیدیۆ: ${property.video_url}` : ''}
📞 بۆ پەیوەندی و زانیاری زیاتر: ${property.owner_contact?.phone || '0750xxxxxxx'}`;

  return encodeURIComponent(text);
}
