'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Home, 
  MapPin, 
  FileText, 
  DollarSign, 
  PlusCircle, 
  Lock, 
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
  LayoutGrid
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Language, translations } from '@/lib/i18n';
import { UITheme, UIBackground, PropertyDivision } from '@/types';

interface NavbarProps {
  activeTab: 'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting';
  setActiveTab: (tab: 'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting') => void;
  onOpenAddModal: () => void;
  onOpenBackupModal: () => void;
  onOpenSettingsModal?: () => void;
  onLockSystem: () => void;
  onOpenLoginModal: () => void;
  isAdmin: boolean;
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
  onLockSystem,
  onOpenLoginModal,
  isAdmin,
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
  }

  const publicNavItems: NavItem[] = [
    { id: 'properties', label: t.properties, icon: Building2, badge: propertiesCount },
    { id: 'map', label: t.map, icon: MapPin },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'properties', label: t.properties, icon: Building2, badge: propertiesCount },
    { id: 'map', label: t.map, icon: MapPin },
    { id: 'contracts', label: t.contracts, icon: FileText, adminOnly: true },
    { id: 'accounting', label: t.accounting, icon: DollarSign, adminOnly: true },
  ];

  const navItems = isAdmin ? adminNavItems : publicNavItems;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ckb', label: 'کوردی (سۆرانی)', flag: '☀️' },
    { code: 'ar', label: 'العربية', flag: '🌍' },
    { code: 'en', label: 'English', flag: '🌐' },
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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Agency Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-lg shadow-amber-500/20 text-slate-950">
              <Building2 className="w-7 h-7 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
                  NASHVILLE <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-normal">HOUSE</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">{t.agency_subtitle}</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.adminOnly && !isAdmin && (
                    <Lock className="w-3 h-3 text-slate-500 ml-0.5" />
                  )}
                  {item.badge !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Category Division Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setDivisionMenuOpen(!divisionMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  selectedDivision && selectedDivision !== 'all'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white border-transparent hover:bg-slate-800/60'
                }`}
                title={t.divide_menu || 'مێنیوی دابەشکردنی بەشەکان'}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t.divisions || 'بەشەکان'}</span>
                {selectedDivision && selectedDivision !== 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {divisionMenuOpen && (
                <div className="absolute top-full mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 rtl:right-auto rtl:left-0">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>{t.divide_menu || 'دابەشکردنی بەشەکان'}</span>
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono">NASHVILLE</span>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {divisionOptions.map((div) => (
                      <button
                        key={div.id}
                        onClick={() => {
                          if (onSelectDivision) onSelectDivision(div.id);
                          setActiveTab('properties');
                          setDivisionMenuOpen(false);
                        }}
                        className={`w-full text-right rtl:text-right ltr:text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                          selectedDivision === div.id
                            ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{div.icon}</span>
                          <div>
                            <div className="font-semibold text-white">{div.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal leading-tight">{div.desc}</div>
                          </div>
                        </div>
                        {selectedDivision === div.id && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Trilingual Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'ckb' ? 'کوردی' : lang === 'ar' ? 'العربية' : 'English'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50">
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

            {/* UI Theme & Background Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/30 text-xs font-bold transition-all shadow-sm"
                title={`${t.theme || 'ڕووکار'} & ${t.background || 'پشتینە'}`}
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">
                  {themeOptions.find((o) => o.id === theme)?.icon}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                  {/* Tabs: Theme / Background */}
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

            {/* Supabase status badge (Admin Only) */}
            {isAdmin && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 bg-slate-900/60 text-slate-400">
                {isSupabaseConfigured ? (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{t.connected_supabase}</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300">{t.local_storage}</span>
                  </>
                )}
              </div>
            )}

            {/* Add Property Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>{t.new_property}</span>
              </button>
            )}

            {/* Admin Status & Actions */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                {/* Dedicated Settings Button */}
                <button
                  onClick={onOpenSettingsModal || onOpenBackupModal}
                  title="ڕێکخستنەکانی سیستەم (Settings)"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>{t.settings || 'ڕێکخستنەکان'}</span>
                </button>

                <button
                  onClick={onOpenBackupModal}
                  title={t.backup_db}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                >
                  <Database className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  onClick={onLockSystem}
                  title={t.lock}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-900/50 text-xs font-bold transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>دەرچوون</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="چوونەژوورەوەی ستاف و بەڕێوەبەر"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'en' ? 'Staff Portal' : lang === 'ar' ? 'بوابة الموظفين' : 'بەشی ستاف'}</span>
              </button>
            )}

          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            {!isAdmin && (
              <button
                onClick={onOpenLoginModal}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-amber-400 border border-slate-800 text-xs font-bold flex items-center gap-1"
                title="چوونەژوورەوەی ستاف"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>ستاف</span>
              </button>
            )}
            <button
              onClick={() => {
                const order: Language[] = ['ckb', 'ar', 'en'];
                const next = order[(order.indexOf(lang) + 1) % 3];
                if (onChangeLang) onChangeLang(next);
                else onToggleLang();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-amber-400 border border-slate-800 text-xs font-bold"
            >
              {lang === 'ckb' ? 'کوردی' : lang === 'ar' ? 'عربي' : 'EN'}
            </button>
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="p-2 rounded-lg bg-emerald-600 text-white"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 px-4 pt-3 pb-5 space-y-2">
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.adminOnly && !isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Admin</span>
                  )}
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

          {/* Mobile Theme Selector */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.theme || 'شێوازی دیزاین'}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (onChangeTheme) onChangeTheme(opt.id);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all ${
                    theme === opt.id
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
                  <span>{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Background Selector */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.background || 'پشتینەی پڕۆژە'}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {bgOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    if (onChangeBgPattern) onChangeBgPattern(bg.id);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-all ${
                    bgPattern === bg.id
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>{bg.icon}</span>
                  <span className="truncate">{bg.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    if (onOpenSettingsModal) onOpenSettingsModal();
                    else onOpenBackupModal();
                    setMobileMenuOpen(false);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30"
                >
                  <Settings className="w-4 h-4" />
                  <span>{t.settings || 'ڕێکخستنەکان'}</span>
                </button>
                <button
                  onClick={() => {
                    onOpenBackupModal();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-800"
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>{t.backup_db}</span>
                </button>
                <button
                  onClick={() => {
                    onLockSystem();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/30 text-rose-300 text-xs font-semibold border border-rose-900/40"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t.lock}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30"
              >
                <Key className="w-4 h-4" />
                <span>چوونەژوورەوەی ئەدمین</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
