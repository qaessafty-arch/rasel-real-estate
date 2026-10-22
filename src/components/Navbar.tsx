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
  Palette
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Language, translations } from '@/lib/i18n';
import { UITheme } from '@/types';

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
  theme = 'gold',
  onChangeTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const t = translations[lang] as any;

  const themeOptions: { id: UITheme; label: string; icon: string; dotClass: string }[] = [
    { id: 'gold', label: t.theme_gold || 'زێڕینی لوکس', icon: '🌟', dotClass: 'bg-amber-400' },
    { id: 'sapphire', label: t.theme_sapphire || 'شینی شاهانە', icon: '💎', dotClass: 'bg-sky-400' },
    { id: 'emerald', label: t.theme_emerald || 'زمڕودی شاهانە', icon: '🌲', dotClass: 'bg-emerald-400' },
    { id: 'pearl', label: t.theme_pearl || 'ڕووناکی مۆدێرن', icon: '☀️', dotClass: 'bg-slate-300' },
    { id: 'solid', label: t.theme_solid || 'ڕەشی پڕ', icon: '⬛', dotClass: 'bg-zinc-200' },
    { id: 'minimalism', label: t.theme_minimalism || 'سادەی مۆدێرن', icon: '⚪', dotClass: 'bg-slate-400' },
    { id: 'brutalism', label: t.theme_brutalism || 'بروتالیزمی وشک', icon: '🧱', dotClass: 'bg-yellow-400' },
  ];

  interface NavItem {
    id: 'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    adminOnly?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'properties', label: t.properties, icon: Building2, badge: propertiesCount },
    { id: 'map', label: t.map, icon: MapPin },
    { id: 'contracts', label: t.contracts, icon: FileText, adminOnly: true },
    { id: 'accounting', label: t.accounting, icon: DollarSign, adminOnly: true },
  ];

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
                  RASEL <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-normal">REAL ESTATE</span>
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

            {/* UI Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/30 text-xs font-bold transition-all shadow-sm"
                title={t.theme || 'شێوازی دیزاین'}
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">
                  {themeOptions.find((o) => o.id === theme)?.icon}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                    {t.theme || 'شێوازی دیزاین'}
                  </div>
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (onChangeTheme) onChangeTheme(opt.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all ${
                        theme === opt.id
                          ? 'bg-amber-500/10 text-amber-400 font-bold'
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
                  ))}
                </div>
              )}
            </div>

            {/* Supabase status badge */}
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

            {/* Add Property Button (Prompts login if not admin) */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{t.new_property}</span>
            </button>

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
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Key className="w-3.5 h-3.5" />
                <span>چوونەژوورەوەی ئەدمین</span>
              </button>
            )}

          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2">
            {!isAdmin && (
              <button
                onClick={onOpenLoginModal}
                className="px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1"
              >
                <Key className="w-3 h-3" />
                <span>ئەدمین</span>
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
            <button
              onClick={onOpenAddModal}
              className="p-2 rounded-lg bg-emerald-600 text-white"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
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
