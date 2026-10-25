'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Lock, Moon, Pause, Play, Search, Sun } from 'lucide-react';
import { Property } from '@/types';
import { formatArea, formatPrice, getPropertyPurposeLabel, getPropertyStatusLabel } from '@/lib/utils';
import { Language, translations } from '@/lib/i18n';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { PropertyMap } from '@/components/PropertyMap';
import './public-home.css';

type Filters = ReturnType<typeof usePropertyFilters>;

interface PublicHomeProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  properties: Property[];
  loading: boolean;
  filters: Filters;
  onView: (property: Property) => void;
  onOpenLogin: () => void;
}

const WA = [
  { n: '9647501500505', d: '0750 150 0505' },
  { n: '9647502146614', d: '0750 214 6614' },
];

const FALLBACK_IMG ='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

const copy: Record<Language, { title: string; sub: string; whatsapp: string; orWa: string; search: string; listings: string; cities: string; all: string; props: string; empty: string; emptyDesc: string; play: string; pause: string; finalTitle: string; finalSub: string }> = {
  ckb: {
    title: 'موڵک لە هەولێر و هەموو کوردستان',
    sub: 'ڤیلا، شوقە، خانوو و زەوی. بە واتسئەپ پەیوەندیمان پێوە بکە.',
    whatsapp: 'نامە بنێرە لە واتسئەپ',
    orWa: 'یان لە واتسئەپ نامەمان بۆ بنێرە',
    search: 'گەڕان',
    listings: 'موڵک',
    cities: 'شار',
    all: 'هەموو',
    props: 'موڵکەکان',
    empty: 'لیستی موڵکەکان نوێ دەکرێتەوە',
    emptyDesc: 'بۆ دۆزینەوەی خانوو، شوقە، ڤیلا یان زەوی، پەیوەندی بە ڕاوێژکارانمان بکە.',
    play: 'لێدانی ڤیدیۆ',
    pause: 'ڕاگرتنی ڤیدیۆ',
    finalTitle: 'موڵکێکی دیاریکراوت دەوێت؟',
    finalSub: 'پێمان بڵێ چیت دەوێت، لە واتسئەپ وەڵامت دەدەینەوە.',
  },
  ar: {
    title: 'عقارات في أربيل وكل كردستان',
    sub: 'فلل وشقق ومنازل وأراضٍ. راسلنا عبر واتساب.',
    whatsapp: 'راسلنا على واتساب',
    orWa: 'أو راسلنا على واتساب',
    search: 'بحث',
    listings: 'عقار',
    cities: 'مدن',
    all: 'الكل',
    props: 'العقارات',
    empty: 'قائمة العقارات قيد التحديث',
    emptyDesc: 'للعثور على منزل أو شقة أو فيلا أو أرض، تواصل مع مستشارينا.',
    play: 'تشغيل الفيديو',
    pause: 'إيقاف الفيديو',
    finalTitle: 'تبحث عن عقار معين؟',
    finalSub: 'أخبرنا بما تريد وسنرد عليك عبر واتساب.',
  },
  en: {
    title: 'Property in Erbil and across Kurdistan',
    sub: 'Villas, apartments, houses and land. Message us on WhatsApp.',
    whatsapp: 'Message on WhatsApp',
    orWa: 'or message us on WhatsApp',
    search: 'Search',
    listings: 'listings',
    cities: 'cities',
    all: 'All',
    props: 'Properties',
    empty: 'The listings are being updated',
    emptyDesc: 'To find a house, apartment, villa or land, get in touch with our advisors.',
    play: 'Play video',
    pause: 'Pause video',
    finalTitle: 'Looking for something specific?',
    finalSub: 'Tell us what you need and we will reply on WhatsApp.',
  },
};

export const PublicHome: React.FC<PublicHomeProps> = ({ lang, onChangeLang, properties, loading, filters: f, onView, onOpenLogin }) => {
  const t = translations[lang] as any;
  const c = copy[lang];
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nh_mode');
      setMode(saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');
    } catch {}
  }, []);

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    try { localStorage.setItem('nh_mode', next); } catch {}
  };

  // Counted from the live listings, never typed in, so the strip can't overstate anything.
  const facts = [
    { n: properties.length, label: c.listings },
    { n: properties.filter((p) => p.purpose === 'sale').length, label: t.for_sale },
    { n: properties.filter((p) => p.purpose === 'rent').length, label: t.for_rent },
    { n: new Set(properties.map((p) => p.city).filter(Boolean)).size, label: c.cities },
  ];
  const wa = `https://wa.me/${WA[0].n}`;
  const toList = () => document.getElementById('list')?.scrollIntoView({ behavior: 'smooth' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // With a reduced-motion setting the hero shows the still frame until the visitor presses play.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    videoRef.current?.play().catch(() => {});
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const purposes = [
    { id: 'all', label: c.all },
    { id: 'sale', label: t.for_sale },
    { id: 'rent', label: t.for_rent },
    { id: 'exchange', label: t.for_exchange },
    { id: 'investment', label: t.for_investment },
  ];
  const divisions = [
    { id: 'all', label: t.divide_all || c.all, count: f.divisionCounts.all },
    { id: 'residential', label: t.divide_residential, count: f.divisionCounts.residential },
    { id: 'land', label: t.divide_land, count: f.divisionCounts.land },
    { id: 'commercial', label: t.divide_commercial, count: f.divisionCounts.commercial },
    { id: 'projects', label: t.divide_projects, count: f.divisionCounts.projects },
  ];

  return (
    <div className="pub" data-mode={mode} dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <section className="pub-vid" id="top">
        {/* Real drone footage of a Kurdistan city (Haron Mziri, Pexels licence); see public/videos. */}
        <video
          ref={videoRef}
          className="bg"
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-kurdistan-poster.jpg"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-hidden="true"
        >
          <source src="/videos/hero-kurdistan-720.mp4" type="video/mp4" media="(max-width: 820px)" />
          <source src="/videos/hero-kurdistan-1080.mp4" type="video/mp4" />
        </video>
        <div className="veil" />
        <div className="pub-wrap ui">
            <header className="pub-head">
              <a className="pub-brand" href="#top">
                <img src="/logo.png" alt="" />
                <span>Nashville House</span>
              </a>
              <nav className="nav">
                <button className="pub-link" aria-pressed={view === 'grid'} onClick={() => { setView('grid'); document.getElementById('list')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  {c.props}
                </button>
                <button className="pub-link" aria-pressed={view === 'map'} onClick={() => { setView('map'); document.getElementById('list')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  {t.map}
                </button>
              </nav>
              <select className="pub-lang" value={lang} onChange={(e) => onChangeLang(e.target.value as Language)} aria-label="Language">
                <option value="ckb">کوردی</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
              <button className="pub-lock" onClick={toggleMode} aria-label={mode === 'dark' ? 'Light theme' : 'Dark theme'} title={mode === 'dark' ? 'Light theme' : 'Dark theme'}>
                {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="pub-lock" onClick={onOpenLogin} aria-label={t.staff_login || 'Staff login'} title={t.staff_login || 'Staff login'}>
                <Lock size={16} />
              </button>
            </header>
            <div className="copy">
              <h1>{c.title}</h1>
              <p>{c.sub}</p>
              {/* One job for the hero, as on Zillow/Sotheby's: search. WhatsApp stays as a quiet second path. */}
              <form className="pub-hsearch" role="search" onSubmit={(e) => { e.preventDefault(); setView('grid'); toList(); }}>
                <Search size={20} aria-hidden="true" />
                <input
                  type="search"
                  value={f.searchQuery}
                  onChange={(e) => f.setSearchQuery(e.target.value)}
                  placeholder={t.search_placeholder}
                  aria-label={t.search_placeholder}
                />
                <button type="submit">{c.search}</button>
              </form>
              <a className="pub-walink" href={wa} target="_blank" rel="noopener noreferrer">{c.orWa}</a>
            </div>
            <button className="vid-toggle" onClick={togglePlay} aria-label={playing ? c.pause : c.play}>
              {playing ? <Pause size={14} /> : <Play size={14} />}
              <span>{playing ? c.pause : c.play}</span>
            </button>
        </div>
      </section>

      <div className="pub-wrap">

        {properties.length > 0 && (
          <dl className="pub-facts">
            {facts.map((x) => (
              <div key={x.label}>
                <dt>{x.label}</dt>
                <dd><bdi>{x.n}</bdi></dd>
              </div>
            ))}
          </dl>
        )}

        <section className="pub-search">
          {f.searchQuery && (
            <p className="pub-query">
              «{f.searchQuery}» <button type="button" className="pub-clear" onClick={() => f.setSearchQuery('')}>{t.clear}</button>
            </p>
          )}
          <div className="pub-tabs" role="group">
            {purposes.map((p) => (
              <button key={p.id} className="pub-tab" aria-pressed={f.selectedPurpose === p.id} onClick={() => f.setSelectedPurpose(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="pub-tabs" role="group" style={{ marginTop: 6 }}>
            {divisions.map((d) => (
              <button key={d.id} className="pub-tab" aria-pressed={f.selectedDivision === d.id} onClick={() => f.setSelectedDivision(d.id as any)}>
                {d.label}
                {d.count > 0 && <small className="pub-ltr">{d.count}</small>}
              </button>
            ))}
          </div>

          <details>
            <summary>{lang === 'en' ? 'More filters' : lang === 'ar' ? 'المزيد من الفلاتر' : 'فلتەری زیاتر'}</summary>
            <div className="pub-more">
              <label>{t.property_type}
                <select value={f.selectedType} onChange={(e) => f.setSelectedType(e.target.value)}>
                  <option value="all">{t.all_types}</option>
                  {['house', 'apartment', 'villa', 'commercial_land', 'agriculture_land', 'shop', 'office', 'building'].map((k) => (
                    <option key={k} value={k}>{t[k]}</option>
                  ))}
                </select>
              </label>
              <label>{t.city}
                <select value={f.selectedCity} onChange={(e) => f.setSelectedCity(e.target.value)}>
                  <option value="all">{t.all_cities}</option>
                  {f.availableCities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </label>
              <label>{t.area}
                <select value={f.selectedAreaRange} onChange={(e) => f.setSelectedAreaRange(e.target.value)}>
                  <option value="all">{t.all_areas}</option>
                  <option value="under_200">{t.area_small}</option>
                  <option value="200_500">{t.area_medium}</option>
                  <option value="500_2500">{t.area_large}</option>
                  <option value="donum_plus">{t.area_donum_plus}</option>
                </select>
              </label>
              <label>{t.payment_method}
                <select value={f.selectedPayment} onChange={(e) => f.setSelectedPayment(e.target.value)}>
                  <option value="all">{c.all}</option>
                  <option value="cash">{t.cash}</option>
                  <option value="installments">{t.installments}</option>
                  <option value="exchange">{t.exchange}</option>
                </select>
              </label>
              <label>{t.condition}
                <select value={f.selectedCondition} onChange={(e) => f.setSelectedCondition(e.target.value)}>
                  <option value="all">{c.all}</option>
                  <option value="brand_new">{t.brand_new}</option>
                  <option value="used">{t.used}</option>
                </select>
              </label>
            </div>
          </details>
        </section>

        <section id="list">
          <div className="pub-bar">
            <h2>{view === 'map' ? t.map : c.props}</h2>
            {f.isFilterActive ? (
              <span>
                <span className="pub-ltr">{f.filteredProperties.length}</span> {c.props} ·{' '}
                <button className="pub-clear" style={{ textDecoration: 'underline' }} onClick={f.resetFilters}>{t.reset_filters}</button>
              </span>
            ) : (
              <span className="pub-ltr">{properties.length}</span>
            )}
          </div>

          {view === 'map' ? (
            <div className="pub-map">
              <PropertyMap properties={f.filteredProperties} onSelectProperty={onView} lang={lang} />
            </div>
          ) : f.filteredProperties.length > 0 ? (
            <div className="pub-grid">
              {f.filteredProperties.map((p) => {
                const status = getPropertyStatusLabel(p.status, lang);
                const area = formatArea(p.area_sqm, p.land_details, lang).primary;
                const rooms = p.bedrooms ? `${p.bedrooms} ${t.bedrooms}` : '';
                return (
                  <button key={p.id} className="pub-card" onClick={() => onView(p)}>
                    <div className="img">
                      <img src={p.images?.[0] || FALLBACK_IMG} alt="" loading="lazy" />
                      {p.status !== 'available' && <span className="status">{status.label}</span>}
                    </div>
                    {/* Portal order: price first, then the facts, then the name and place. */}
                    <div className="price">
                      <bdi className="pub-ltr">{formatPrice(p.price, p.currency, lang)}</bdi>
                      <span>
                        {getPropertyPurposeLabel(p.purpose, lang)}
                        {p.purpose === 'rent' && ` / ${p.rental_period === 'yearly' ? t.yearly : t.monthly}`}
                      </span>
                    </div>
                    <div className="specs">{[rooms, area].filter(Boolean).join(' · ')}</div>
                    <h3>{p.title}</h3>
                    <div className="meta">{[p.neighborhood || p.address, p.city].filter(Boolean).join('، ')}</div>
                  </button>
                );
              })}
            </div>
          ) : !loading && (
            <div className="pub-empty">
              <h3>{properties.length === 0 ? c.empty : t.no_properties_found}</h3>
              <p>{properties.length === 0 ? c.emptyDesc : t.no_properties_desc}</p>
              <div className="pub-cta">
                {properties.length === 0 ? (
                  <a className="pub-btn" href={wa} target="_blank" rel="noopener noreferrer">{c.whatsapp}</a>
                ) : (
                  <button className="pub-btn" onClick={f.resetFilters}>{t.reset_filters}</button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="pub-final">
        <div className="pub-wrap">
          <h2>{c.finalTitle}</h2>
          <p>{c.finalSub}</p>
          <div className="nums">
            {WA.map((w) => (
              <a key={w.n} className="pub-ltr" href={`https://wa.me/${w.n}`} target="_blank" rel="noopener noreferrer">{w.d}</a>
            ))}
          </div>
        </div>
      </section>

      <footer className="pub-foot">
        <div className="pub-wrap">
          <div>© {new Date().getFullYear()} Nashville House · Erbil, Kurdistan Region</div>
          <div className="group">
            {WA.map((w) => (
              <a key={w.n} className="pub-ltr" href={`https://wa.me/${w.n}`} target="_blank" rel="noopener noreferrer">{w.d}</a>
            ))}
            <Link href="/guide">{lang === 'en' ? 'User guide' : lang === 'ar' ? 'دليل الاستخدام' : 'ڕێبەری بەکارهێنان'}</Link>
            <span>Video: Haron Mziri / Pexels</span>
            <span>developed by null-tech</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
