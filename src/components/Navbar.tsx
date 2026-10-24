'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Home, 
  MapPin, 
  FileText, 
  DollarSign, 
  PlusCircle, 
  Lock, 
  LogOut,
  Database, 
  Menu, 
  X, 
  HardDrive, 
  Globe, 
  ChevronDown, 
  Key,
  Settings,
  Palette,
  Layers,
  Sparkles,
  LayoutGrid,
  Users,
  ShieldCheck,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Language, translations } from '@/lib/i18n';
import { UITheme, UIBackground, PropertyDivision, UserSession } from '@/types';

interface NavbarProps {
  activeTab: 'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting';
  setActiveTab: (tab: 'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting') => void;
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onOpenSettingsModal?: () => void;
  onOpenEmployeesModal?: () => void;
  onLockSystem: () => void;
  onOpenLoginModal: () => void;
  isAdmin: boolean;
  currentUser?: UserSession | null;
  propertiesCount: number;
  lang: Language;
  onToggleLang: () => void;
  onChangeLang?: (lang: Language) => void;
  theme?: UITheme;
  onChangeTheme?: (theme: UITheme) => void;
  bgPattern?: UIBackground;
  onChangeBgPattern?: (bg: UIBackground) => void;
  selectedDivision?: PropertyDivision;
  onSelectDivision?: (division: PropertyDivision) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenBackupModal,
  onOpenSettingsModal,
  onOpenEmployeesModal,
  onLockSystem,
  onOpenLoginModal,
  isAdmin,
  currentUser,
  propertiesCount,
  lang,
  onToggleLang,
  onChangeLang,
  theme = 'minimalism',
  onChangeTheme,
  bgPattern = 'minimalism',
  onChangeBgPattern,
  selectedDivision = 'all',
  onSelectDivision,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [divisionMenuOpen, setDivisionMenuOpen] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'themes' | 'backgrounds'>('themes');
  const t = translations[lang] as any;

  const isStaff = Boolean(currentUser);

  const themeOptions: { id: UITheme; label: string; icon: string; dotClass: string }[] = [
    { id: 'minimalism', label: t.theme_minimalism || 'سادەی مۆدێرن', icon: '⚪', dotClass: 'bg-slate-400' },
    { id: 'gold', label: t.theme_gold || 'زێڕینی لوکس', icon: '🌟', dotClass: 'bg-amber-400' },
    { id: 'sapphire', label: t.theme_sapphire || 'شینی شاهانە', icon: '💎', dotClass: 'bg-sky-400' },
    { id: 'emerald', label: t.theme_emerald || 'زمڕودی شاهانە', icon: '🌲', dotClass: 'bg-emerald-400' },
    { id: 'pearl', label: t.theme_pearl || 'ڕووناکی مۆدێرن', icon: '☀️', dotClass: 'bg-slate-300' },
    { id: 'solid', label: t.theme_solid || 'ڕەشی پڕ', icon: '⬛', dotClass: 'bg-zinc-200' },
    { id: 'brutalism', label: t.theme_brutalism || 'بروتالیزمی وشک', icon: '🧱', dotClass: 'bg-yellow-400' },
  ];

  const bgOptions: { id: UIBackground; label: string; icon: string }[] = [
    { id: 'minimalism', label: t.bg_minimalism || 'سادەی مۆدێرن (مینیمالیزم)', icon: '⚪' },
    { id: 'obsidian', label: t.bg_obsidian || 'تاریکی ئۆبسیدیان', icon: '🌌' },
    { id: 'topographic', label: t.bg_topographic || 'تۆپۆگرافی زەوی', icon: '🗺️' },
    { id: 'blueprint', label: t.bg_blueprint || 'نەخشەی ئەندازیاری', icon: '📐' },
    { id: 'dots', label: t.bg_dots || 'خاڵبەندی مۆدێرن', icon: '⁖' },
    { id: 'carbon', label: t.bg_carbon || 'کاربۆنی تاریک', icon: '🏁' },
    { id: 'aurora', label: t.bg_aurora || 'تیشکی شین و سەوز', icon: '✨' },
    { id: 'pearl', label: t.bg_pearl || 'مرواری ڕۆژ', icon: '☀️' },
  ];

  const divisionOptions: { id: PropertyDivision; label: string; icon: string; desc: string }[] = [
    { id: 'all', label: t.divide_all || 'هەموو موڵکەکان', icon: '🏢', desc: 'تەواوی موڵک و زەوییەکان' },
    { id: 'residential', label: t.divide_residential || 'نیشتەجێبوون', icon: '🏡', desc: t.divide_residential_desc || 'خانوو، ڤێلا، شوقە' },
    { id: 'land', label: t.divide_land || 'زەوی و باخچە', icon: '🌾', desc: t.divide_land_desc || 'کشتوکاڵی، نیشتەجێبوون، پیشەسازی' },
    { id: 'commercial', label: t.divide_commercial || 'شوێنی بازرگانی', icon: '🏬', desc: t.divide_commercial_desc || 'دووکان، ئۆفیس، باڵەخانە، کۆگا' },
    { id: 'projects', label: t.divide_projects || 'پڕۆژە نوێیەکان', icon: '🏗️', desc: t.divide_projects_desc || 'باڵەخانە و تاوەرەکان' },
  ];

  interface NavItem {
    id: 'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    adminOnly?: boolean;
    staffOnly?: boolean;
  }

  // Streamlined navigation for clean non-overflow top header
  const navItems: NavItem[] = [
    { id: 'properties', label: t.properties, icon: Building2, badge: propertiesCount },
    { id: 'map', label: t.map, icon: MapPin },
  ];

  const languages: { code: Language; label: string; flag: string; short: string }[] = [
    { code: 'ckb', label: 'کوردی (سۆرانی)', flag: '☀️', short: 'کوردی' },
    { code: 'ar', label: 'العربية', flag: '🌍', short: 'عربي' },
    { code: 'en', label: 'English', flag: '🌐', short: 'EN' },
  ];

  const handleSelectLanguage = (l: Language) => {
    if (onChangeLang) {
      onChangeLang(l);
    } else {
      onToggleLang();
    }
    setLangMenuOpen(false);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) {
      onOpenLoginModal();
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full overflow-x-clip glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* 1. Logo & Agency Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <img
                src="/logo.png"
                alt="Nashville House Logo"
                className="w-full h-full object-cover scale-105"
              />
            </div>
            <div className="leading-tight">
              <h1 className="text-base sm:text-xl font-black tracking-wider text-white whitespace-nowrap">
                NASHVILLE <span className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-normal">HOUSE</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate max-w-[140px] sm:max-w-xs">{t.agency_subtitle}</p>
            </div>
          </div>

          {/* 2. Desktop Center Navigation (Properties, Map, Categories) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

          </nav>

          {/* 3. Right Cluster: Language, Theme & Staff / Logout Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-400 border border-slate-800 hover:border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === lang)?.short || 'CKB'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all ${
                        lang === l.code
                          ? 'bg-amber-500/10 text-amber-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {lang === l.code && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* UI Theme & Background Selector */}
            {isStaff && (
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/30 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                title={`${t.theme || 'ڕووکار'} & ${t.background || 'پشتینە'}`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">
                  {themeOptions.find((o) => o.id === theme)?.icon}
                </span>
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                  <div className="px-2.5 pb-2 flex items-center gap-1 border-b border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCustomizerTab('themes')}
                      className={`flex-1 py-1 rounded-lg font-bold text-center transition-all ${
                        customizerTab === 'themes'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      🎨 {t.theme || 'ڕووکار'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomizerTab('backgrounds')}
                      className={`flex-1 py-1 rounded-lg font-bold text-center transition-all ${
                        customizerTab === 'backgrounds'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      🖼️ {t.background || 'پشتینە'}
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto p-1 space-y-0.5">
                    {customizerTab === 'themes' ? (
                      themeOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (onChangeTheme) onChangeTheme(opt.id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            theme === opt.id
                              ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${opt.dotClass}`} />
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                          {theme === opt.id && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                        </button>
                      ))
                    ) : (
                      bgOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (onChangeBgPattern) onChangeBgPattern(opt.id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            bgPattern === opt.id
                              ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                          {bgPattern === opt.id && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* 4. Staff Account & Prominent LOG OUT Button */}
            {isStaff ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* User Pill */}
                <div className="hidden sm:flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    currentUser?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {currentUser?.role === 'admin' ? '👑' : '👤'}
                  </div>
                  <div className="text-right leading-none">
                    <div className="text-[11px] font-bold text-white truncate max-w-[100px]">
                      {currentUser?.name?.split(' ')[0] || 'ستاف'}
                    </div>
                    <div className="text-[9px] text-amber-400 font-semibold mt-0.5">
                      {currentUser?.role === 'admin' ? 'بەڕێوەبەر' : 'کارمەند'}
                    </div>
                  </div>
                </div>

                {/* PROMINENT LOGOUT BUTTON */}
                <button
                  onClick={onLockSystem}
                  title="چوونەدەرەوە لە هەژمار (Logout)"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-900/50 hover:border-rose-600 text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>دەرچوون</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-white text-xs transition-colors whitespace-nowrap"
                title="چوونەژوورەوەی ستاف و بەڕێوەبەر"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>بەشی ستاف</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle (Visible on lg:hidden, fixes iPad/tablet menu) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-4 pt-3 pb-5 space-y-3">
          
          {/* User Status in Mobile */}
          {isStaff && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {currentUser?.role === 'admin' ? '👑' : '👤'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{currentUser?.name}</div>
                  <div className="text-[10px] text-amber-400 font-semibold">
                    {currentUser?.role === 'admin' ? 'بەڕێوەبەری سەرەکی' : 'کارمەند / برۆکەر'}
                  </div>
                </div>
              </div>

              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  onLockSystem();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-900/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>دەرچوون</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavClick(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Category Divisions */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.divide_menu || 'دابەشکردنی بەشەکان'}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {divisionOptions.map((div) => (
                <button
                  key={div.id}
                  onClick={() => {
                    if (onSelectDivision) onSelectDivision(div.id);
                    setActiveTab('properties');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all text-right rtl:text-right ${
                    selectedDivision === div.id
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{div.icon}</span>
                  <span className="truncate">{div.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct Contacts on Mobile */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <span>💬 واتسئەپی نوسینگە:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <a
                href="https://wa.me/9647501500505"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-bold hover:bg-emerald-900/50"
              >
                <span dir="ltr">0750 150 0505</span>
              </a>
              <a
                href="https://wa.me/9647502146614"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-bold hover:bg-emerald-900/50"
              >
                <span dir="ltr">0750 214 6614</span>
              </a>
            </div>
          </div>

          {/* Quick Guide Link on Mobile */}
          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/guide"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>ڕێبەری بەکارهێنانی ماڵپەڕ (Guide)</span>
            </Link>
          </div>

          {/* If NOT staff, show Staff Login in mobile menu */}
          {!isStaff && (
            <div className="pt-1">
              <button
                onClick={() => {
                  onOpenLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30"
              >
                <Lock className="w-4 h-4" />
                <span>چوونەژوورەوەی ستاف و بەڕێوەبەر</span>
              </button>
            </div>
          )}

          {/* Watermark in mobile menu */}
          <div className="pt-2 text-center text-[10px] text-slate-500 font-mono select-none">
            developed by <span className="text-amber-400 font-bold">null-tech</span>
          </div>

        </div>
      )}
    </header>
  );
};
