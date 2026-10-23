'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  MapPin, 
  SlidersHorizontal,
  X,
  Trash2,
  Sparkles,
  RotateCcw,
  Settings,
  ShieldCheck,
  LayoutGrid,
  List,
  Columns,
  Eye,
  Edit3,
  Send,
  ExternalLink,
  Ruler,
  Layers,
  Home,
  FileText,
  DollarSign,
  Users,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Property, Contract, FinancialTransaction, PropertyStatus, UITheme, UIBackground, PropertyDivision, ViewMode, UserSession } from '@/types';
import { formatArea, formatPrice, getPropertyStatusLabel, getPropertyTypeLabel, getPropertyPurposeLabel, generateWhatsAppMessage } from '@/lib/utils';
import { dataService } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { LoginModal } from '@/components/LoginModal';
import { DashboardStats } from '@/components/DashboardStats';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { PropertyMap } from '@/components/PropertyMap';
import { ContractsView } from '@/components/ContractsView';
import { AccountingView } from '@/components/AccountingView';
import { BackupModal } from '@/components/BackupModal';
import { EmployeeManagementModal } from '@/components/EmployeeManagementModal';
import { VoiceSearch } from '@/components/VoiceSearch';
import { Language, translations } from '@/lib/i18n';
import { checkServerSession, clearSession, getCurrentUser } from '@/lib/auth';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';

export default function HomePage() {
  // Trilingual State: 'ckb' (Kurdish) | 'ar' (Arabic) | 'en' (English)
  const [lang, setLang] = useState<Language>('ckb');

  // Chooseable UI Theme, Background & Layout Modes
  const [theme, setTheme] = useState<UITheme>('minimalism');
  const [bgPattern, setBgPattern] = useState<UIBackground>('minimalism');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Category Division & Grouped Sections state (managed by usePropertyFilters)
  const [isDividedSections, setIsDividedSections] = useState<boolean>(false);

  // Authentication & Multi-Role User state
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [employeesModalOpen, setEmployeesModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isEmployee = currentUser?.role === 'employee';
  const isStaff = Boolean(currentUser);
  const isUnlocked = isStaff;

  // Load theme, background and language preference from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('rasel_lang') as Language;
      if (savedLang === 'en' || savedLang === 'ckb' || savedLang === 'ar') {
        setLang(savedLang);
      }

      const savedTheme = localStorage.getItem('rasel_ui_theme') as UITheme;
      if (savedTheme && ['gold', 'sapphire', 'emerald', 'pearl', 'solid', 'minimalism', 'brutalism'].includes(savedTheme)) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        setTheme('minimalism');
        document.documentElement.setAttribute('data-theme', 'minimalism');
      }

      const savedBg = localStorage.getItem('rasel_ui_bg') as UIBackground;
      if (savedBg && ['obsidian', 'blueprint', 'topographic', 'dots', 'carbon', 'aurora', 'pearl', 'minimalism'].includes(savedBg)) {
        setBgPattern(savedBg);
      } else {
        setBgPattern('minimalism');
      }

      const savedView = localStorage.getItem('rasel_view_mode') as ViewMode;
      if (savedView && ['grid', 'list', 'split'].includes(savedView)) {
        setViewMode(savedView);
      }
    }
  }, []);

  const handleThemeChange = (newTheme: UITheme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rasel_ui_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const handleBgPatternChange = (newBg: UIBackground) => {
    setBgPattern(newBg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rasel_ui_bg', newBg);
    }
  };

  const getBgClass = (bg: UIBackground) => {
    switch (bg) {
      case 'minimalism': return 'bg-pattern-minimalism';
      case 'blueprint': return 'bg-pattern-blueprint';
      case 'topographic': return 'bg-pattern-topographic';
      case 'dots': return 'bg-pattern-dots';
      case 'carbon': return 'bg-pattern-carbon';
      case 'aurora': return 'bg-pattern-aurora';
      case 'pearl': return 'bg-pattern-pearl';
      case 'obsidian': return 'bg-pattern-obsidian';
      default: return 'bg-pattern-minimalism';
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rasel_view_mode', mode);
    }
  };

  const handleSelectLang = (nextLang: Language) => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rasel_lang', nextLang);
    }
  };

  const handleToggleLang = () => {
    const cycle: Language[] = ['ckb', 'ar', 'en'];
    const next = cycle[(cycle.indexOf(lang) + 1) % cycle.length];
    handleSelectLang(next);
  };

  const t = translations[lang];

  // App Tabs: 'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting'>('properties');

  // Guard internal tabs
  useEffect(() => {
    if (!isStaff && (activeTab === 'dashboard' || activeTab === 'contracts' || activeTab === 'accounting')) {
      setActiveTab('properties');
    }
    // Employees cannot access accounting or dashboard (accounting is admin only)
    if (isEmployee && (activeTab === 'accounting' || activeTab === 'dashboard')) {
      setActiveTab('properties');
    }
  }, [isStaff, isEmployee, activeTab]);

  // Core Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupModalTab, setBackupModalTab] = useState<'security' | 'supabase' | 'backup'>('security');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleOpenSettings = (tab: 'security' | 'supabase' | 'backup' = 'security') => {
    setBackupModalTab(tab);
    setBackupModalOpen(true);
  };

  // Decoupled Property Filters and Live Search Hook
  const {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedPurpose,
    setSelectedPurpose,
    selectedPayment,
    setSelectedPayment,
    selectedCondition,
    setSelectedCondition,
    selectedStatus,
    setSelectedStatus,
    selectedCity,
    setSelectedCity,
    selectedAreaRange,
    setSelectedAreaRange,
    selectedDivision,
    setSelectedDivision,
    availableCities,
    isFilterActive,
    resetFilters,
    filteredProperties,
    divisionCounts,
  } = usePropertyFilters(properties);

  // Check initial login state
  useEffect(() => {
    async function verifyAuth() {
      if (typeof window !== 'undefined') {
        const sessionRes = await checkServerSession();
        if (sessionRes.authenticated && sessionRes.user) {
          setCurrentUser(sessionRes.user);
        } else {
          const localUser = getCurrentUser();
          if (localUser) setCurrentUser(localUser);
        }
      }
      setAuthChecked(true);
    }
    verifyAuth();
  }, []);

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [props, cnts, txs] = await Promise.all([
        dataService.getProperties(),
        dataService.getContracts(),
        dataService.getTransactions(),
      ]);
      setProperties(props);
      setContracts(cnts);
      setTransactions(txs);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to guard actions
  const requireStaff = (action: () => void) => {
    if (isStaff) {
      action();
    } else {
      setLoginModalOpen(true);
    }
  };

  const requireAdmin = (action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setLoginModalOpen(true);
    }
  };

  // Computed Stats
  const stats = useMemo(() => {
    return dataService.calculateStats(properties, transactions);
  }, [properties, transactions]);

  // Handlers for Properties
  const handleOpenAdd = () => {
    requireStaff(() => {
      setEditingProperty(null);
      setFormModalOpen(true);
    });
  };

  const handleSaveProperty = async (property: Property) => {
    const saved = await dataService.saveProperty(property);
    setProperties((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteProperty = async (id: string) => {
    requireAdmin(async () => {
      if (confirm('دڵنیایت لە سڕینەوەی ئەم موڵکە بە یەکجاری؟')) {
        await dataService.deleteProperty(id);
        setProperties((prev) => prev.filter((p) => p.id !== id));
      }
    });
  };

  const handleEditProperty = (property: Property) => {
    requireStaff(() => {
      setEditingProperty(property);
      setFormModalOpen(true);
    });
  };

  // Clear All Data Handler (Clean Slate for Customer)
  const handleClearAllData = async () => {
    await dataService.clearAllData(false);
    await loadData();
    setShowClearConfirm(false);
  };

  // Restore Demo Data Handler
  const handleRestoreDemo = async () => {
    dataService.resetDemoData();
    await loadData();
  };

  // Handlers for Contracts
  const handleSaveContract = async (contract: Contract) => {
    const saved = await dataService.saveContract(contract);
    setContracts((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteContract = async (id: string) => {
    await dataService.deleteContract(id);
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdatePropertyStatus = async (propertyId: string, newStatus: PropertyStatus) => {
    const matched = properties.find((p) => p.id === propertyId);
    if (matched) {
      const updated = { ...matched, status: newStatus };
      await handleSaveProperty(updated);
    }
  };

  // Handlers for Transactions
  const handleSaveTransaction = async (tx: FinancialTransaction) => {
    const saved = await dataService.saveTransaction(tx);
    setTransactions((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    await dataService.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Lock system (returns to guest/public mode)
  const handleLock = async () => {
    await clearSession();
    setCurrentUser(null);
    setActiveTab('properties');
  };

  const resetAllFilters = resetFilters;

  if (!authChecked) return null;

  return (
    <div dir={lang === 'en' ? 'ltr' : 'rtl'} className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col ${getBgClass(bgPattern)} text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300`}>
      
      {/* Login Modal: Opened only when requested or when an admin action is performed */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={(user) => {
          if (user) {
            setCurrentUser(user);
          } else {
            const current = getCurrentUser();
            if (current) setCurrentUser(current);
            else {
              setCurrentUser({
                id: 'emp-admin',
                name: 'بەڕێوەبەری گشتی (Admin)',
                username: 'admin',
                role: 'admin',
              });
            }
          }
          setLoginModalOpen(false);
        }}
      />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAdd}
        onOpenBackupModal={() => requireAdmin(() => handleOpenSettings('supabase'))}
        onOpenSettingsModal={() => requireAdmin(() => handleOpenSettings('security'))}
        onOpenEmployeesModal={() => requireAdmin(() => setEmployeesModalOpen(true))}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLockSystem={handleLock}
        isAdmin={isAdmin}
        currentUser={currentUser}
        propertiesCount={properties.length}
        lang={lang}
        onToggleLang={handleToggleLang}
        onChangeLang={handleSelectLang}
        theme={theme}
        onChangeTheme={handleThemeChange}
        bgPattern={bgPattern}
        onChangeBgPattern={handleBgPatternChange}
        selectedDivision={selectedDivision}
        onSelectDivision={(div) => setSelectedDivision(div)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Staff & Admin Suite Quick Bar (Visible ONLY when logged in) */}
        {isStaff && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-amber-500/30 shadow-xl shadow-amber-500/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isAdmin 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              }`}>
                {isAdmin ? <ShieldCheck className="w-5 h-5 stroke-[2.2]" /> : <UserCheck className="w-5 h-5 stroke-[2.2]" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {isAdmin ? 'دەسەڵاتی سەرپەرشتیار (Admin Suite)' : `هەژماری کارمەند: ${currentUser?.name}`}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isAdmin 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                      : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  }`}>
                    {isAdmin ? 'Admin' : 'Agent'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isAdmin 
                    ? 'بەڕێوەبردنی تەواوی موڵکەکان، گرێبەست، ژمێریاری، ستاف و ڕێکخستنەکان' 
                    : 'بەڕێوەبردنی موڵکەکان، گرێبەستی کڕیاران و بینینی زانیاری خاوەن موڵک'}
                </p>
              </div>
            </div>

            {/* Quick Navigation Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'properties' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.properties}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{t.dashboard}</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('contracts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'contracts' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.contracts}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('accounting')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'accounting' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{t.accounting}</span>
                </button>
              )}
            </div>

            {/* Suite Action Buttons & LOG OUT */}
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setEmployeesModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-sky-400 border border-slate-700/80 hover:border-sky-500/40 font-bold text-xs shadow-sm transition-all active:scale-95"
                    title="بەڕێوەبردنی ستاف و کارمەندان"
                  >
                    <Users className="w-4 h-4" />
                    <span>کارمەندان</span>
                  </button>

                  <button
                    onClick={() => handleOpenSettings('security')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-amber-400 border border-slate-700/80 hover:border-amber-500/40 font-bold text-xs shadow-sm transition-all active:scale-95"
                  >
                    <Settings className="w-4 h-4" />
                    <span>ڕێکخستنەکان</span>
                  </button>

                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-900/50 text-xs font-bold transition-all active:scale-95"
                    title="سڕینەوەی هەموو داتاکان بۆ کڕیار"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden xl:inline">سفرکردنەوە بۆ کڕیار</span>
                  </button>
                </>
              )}

              {/* DEDICATED PROMINENT LOGOUT BUTTON */}
              <button
                onClick={handleLock}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 hover:text-white border border-rose-800/60 hover:border-rose-600 font-bold text-xs transition-all active:scale-95 shadow-sm"
                title="چوونەدەرەوە لە هەژمار (Logout)"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>دەرچوون (Logout)</span>
              </button>
            </div>
          </div>
        )}
        
        {/* TAB 1: DASHBOARD (ADMIN ONLY) */}
        {isAdmin && activeTab === 'dashboard' && (
          <DashboardStats
            stats={stats}
            properties={properties}
            lang={lang}
            onOpenAddModal={handleOpenAdd}
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToProperties={(filter) => {
              if (filter === 'available') setSelectedStatus('available');
              else if (filter === 'rent') setSelectedPurpose('rent');
              else if (filter === 'sale') setSelectedPurpose('sale');
              else if (filter === 'exchange') setSelectedPurpose('exchange');
              else {
                setSelectedStatus('all');
                setSelectedPurpose('all');
              }
              setActiveTab('properties');
            }}
            onNavigateToAccounting={() => {
              if (!isUnlocked) setLoginModalOpen(true);
              else setActiveTab('accounting');
            }}
          />
        )}

        {/* TAB 2: PROPERTIES (موڵکەکانم) */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-amber-400" />
                  <span>{t.properties}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.welcome_desc}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {isUnlocked ? (
                  <button
                    onClick={handleOpenAdd}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.new_property}</span>
                  </button>
                ) : (
                  <a
                    href="https://wa.me/?text=سڵاو،%20دەمەوێت%20ڕاوێژ%20بکەم%20دەربارەی%20کڕین%20یان%20فرۆشتنی%20موڵک%20لە%20نەشڤیل%20هاوس"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>پەیوەندی لەگەڵ نەشڤیل هاوس</span>
                  </a>
                )}
              </div>
            </div>

            {/* Clear All Confirmation Modal Prompt */}
            {showClearConfirm && (
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border border-rose-600/50 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-rose-300 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>سڕینەوەی یەکجاری هەموو داتاکان (سفرکردنەوەی سیستم بۆ کڕیار)</span>
                  </h4>
                  <button onClick={() => setShowClearConfirm(false)} className="text-slate-400 hover:text-white text-xs">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ئایا دڵنیایت لە سڕینەوەی سەرجەم موڵک، گرێبەست و ژمێریارییەکان؟ ئەم کردارە سیستەمەکە تەواو خاوێن و سپی دەکاتەوە بۆ ئەوەی کڕیار بە خاوێنی داتاکانی خۆی دابنێت.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleClearAllData}
                    className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                  >
                    بەڵێ، هەموو داتاکان بسڕەوە
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    پەشیمانبوونەوە
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY & DIVISION MENU ("مێنیوی دابەشکردنی بەشەکان") */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <Layers className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">
                        {t.divide_menu || 'مێنیوی دابەشکردنی بەشەکان'}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold">
                        {filteredProperties.length} {t.properties}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      دابەشکردنی خێرا بەپێی نیشتەجێبوون، زەوی و باخچە، شوێنی بازرگانی، و پڕۆژە نوێیەکان
                    </p>
                  </div>
                </div>

                {/* Section Grouping Toggle Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDividedSections(!isDividedSections)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isDividedSections
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/25 scale-102'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                    title="پیشاندانی هەموو بەشەکان بە دەستەبەندی جیاوازی سەر شاشە"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>{isDividedSections ? (t.section_view || 'دابەشکراو بە بەشەکان (چالاکە)') : (t.section_view || 'دابەشکردن بەپێی بەش')}</span>
                  </button>
                </div>
              </div>

              {/* Major Divisions Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                {[
                  { id: 'all' as PropertyDivision, label: t.divide_all || 'هەموو موڵکەکان', icon: '🏢', count: divisionCounts.all, desc: 'سەرجەم موڵکەکان' },
                  { id: 'residential' as PropertyDivision, label: t.divide_residential || 'نیشتەجێبوون', icon: '🏡', count: divisionCounts.residential, desc: 'خانوو، ڤێلا، شوقە' },
                  { id: 'land' as PropertyDivision, label: t.divide_land || 'زەوی و باخچە', icon: '🌾', count: divisionCounts.land, desc: 'کشتوکاڵی، نیشتەجێبوون' },
                  { id: 'commercial' as PropertyDivision, label: t.divide_commercial || 'شوێنی بازرگانی', icon: '🏬', count: divisionCounts.commercial, desc: 'دووکان، ئۆفیس، کۆگا' },
                  { id: 'projects' as PropertyDivision, label: t.divide_projects || 'پڕۆژە نوێیەکان', icon: '🏗️', count: divisionCounts.projects, desc: 'تاوەر و باڵەخانەکان' },
                ].map((div) => {
                  const isSelected = selectedDivision === div.id;
                  return (
                    <button
                      key={div.id}
                      onClick={() => setSelectedDivision(div.id)}
                      className={`flex flex-col justify-between p-3 rounded-2xl border text-right rtl:text-right transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">{div.icon}</span>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {div.count}
                        </span>
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                          {div.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                          {div.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Deal Type Row */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 ml-1">
                  <span>{t.quick_filter_deal || 'جۆری مامەڵە'}:</span>
                </span>
                {[
                  { id: 'all', label: 'هەموو مامەڵەکان' },
                  { id: 'sale', label: '🏷️ فرۆشتن (نەقد)' },
                  { id: 'rent', label: '🔑 بەکرێدان' },
                  { id: 'exchange', label: '🔄 ئاڵوگۆڕ' },
                  { id: 'investment', label: '💼 وەبەرهێنان' },
                ].map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => setSelectedPurpose(deal.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedPurpose === deal.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {deal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Comprehensive Filters Bar */}
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-4">
              
              {/* Search Bar with Voice AI Integration */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search_placeholder}
                    className="w-full px-4 py-3 ltr:pl-10 rtl:pr-10 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  />
                  <Search className="w-5 h-5 text-slate-500 absolute ltr:left-3.5 rtl:right-3.5 top-3.5 pointer-events-none" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute ltr:right-3.5 rtl:left-3.5 top-3.5 text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.clear}</span>
                    </button>
                  )}
                </div>

                {/* Voice Search AI Button */}
                <VoiceSearch
                  lang={lang}
                  onSearch={(txt) => setSearchQuery(txt)}
                />
              </div>

              {/* Filter Dropdowns Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                
                {/* 1. Type Filter */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.property_type}</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="all">{t.all_types}</option>
                    <option value="house">{t.house}</option>
                    <option value="apartment">{t.apartment}</option>
                    <option value="villa">{t.villa}</option>
                    <option value="commercial_land">{t.commercial_land}</option>
                    <option value="agriculture_land">{t.agriculture_land}</option>
                    <option value="shop">{t.shop}</option>
                    <option value="office">{t.office}</option>
                    <option value="building">{t.building}</option>
                  </select>
                </div>

                {/* 2. Purpose Filter (Sale / Rent / Exchange / Investment) */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.purpose}</label>
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="all">{t.all_purposes}</option>
                    <option value="sale">{t.for_sale}</option>
                    <option value="rent">{t.for_rent}</option>
                    <option value="exchange">{t.for_exchange}</option>
                    <option value="investment">{t.for_investment}</option>
                  </select>
                </div>

                {/* 3. Payment Method Filter (Cash / Installments / Exchange) */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.payment_method}</label>
                  <select
                    value={selectedPayment}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="all">{t.all_purposes}</option>
                    <option value="cash">{t.cash}</option>
                    <option value="installments">{t.installments}</option>
                    <option value="exchange">{t.exchange}</option>
                  </select>
                </div>

                {/* 4. Condition Filter (Brand New / Used) */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.condition}</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="all">{t.all_purposes}</option>
                    <option value="brand_new">{t.brand_new}</option>
                    <option value="used">{t.used}</option>
                  </select>
                </div>

                {/* 5. Status Filter */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.status}</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="all">{t.all_statuses}</option>
                    <option value="available">{t.available}</option>
                    <option value="rented">{t.rented}</option>
                    <option value="sold">{t.sold}</option>
                    <option value="reserved">{t.reserved}</option>
                    <option value="under_maintenance">{t.under_maintenance}</option>
                  </select>
                </div>

                {/* 6. City Filter */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t.city}</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="all">{t.all_cities}</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* 7. Measurement & Area Filter */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.area || 'ڕووبەر'}</span>
                  </label>
                  <select
                    value={selectedAreaRange}
                    onChange={(e) => setSelectedAreaRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="all">{t.all_areas || 'هەموو ڕووبەرەکان'}</option>
                    <option value="under_200">{t.area_small || 'کەمتر لە ٢٠٠ م²'}</option>
                    <option value="200_500">{t.area_medium || '٢٠٠ بۆ ٥٠٠ م²'}</option>
                    <option value="500_2500">{t.area_large || '٥٠٠ بۆ ٢,٥٠٠ م²'}</option>
                    <option value="donum_plus">{t.area_donum_plus || '١ دۆنم و زیاتر (+٢٥٠٠م²)'}</option>
                  </select>
                </div>

              </div>

              {/* Filter Reset if any active */}
              {isFilterActive && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">
                    {t.found_count} <strong className="text-amber-400">{filteredProperties.length}</strong> {t.properties}
                  </span>
                  <button
                    onClick={resetAllFilters}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    {t.reset_filters}
                  </button>
                </div>
              )}

            </div>

            {/* CHOOSEABLE VIEW MODE TOOLBAR (Grid / Compact List / Split Map) */}
            {properties.length > 0 && filteredProperties.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1">
                <div className="text-xs text-slate-400">
                  {t.found_count} <span className="text-amber-400 font-bold">{filteredProperties.length}</span> {t.properties}
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                      viewMode === 'grid'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={t.view_grid || 'کارتەکان'}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.view_grid || 'کارتەکان'}</span>
                  </button>

                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                      viewMode === 'list'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={t.view_list || 'لیستەی چڕ'}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.view_list || 'لیستەی چڕ'}</span>
                  </button>

                  <button
                    onClick={() => handleViewModeChange('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                      viewMode === 'split'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={t.view_split || 'نەخشە و لیست'}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.view_split || 'نەخشە و لیست'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Properties Grid or Empty State */}
            {properties.length === 0 ? (
              isUnlocked ? (
                /* Admin View When Portfolio is Empty */
                <div className="p-12 sm:p-16 text-center rounded-3xl glass-card border border-amber-500/30 space-y-4 max-w-2xl mx-auto my-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">پۆرتفۆلیۆی نوسینگە خاوێنە</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                    دەتوانیت دەستبکەیت بە زیادکردنی موڵکە ڕاستەقینەکانی نەشڤیل هاوس، یان داتای نموونەیی سەرەتایی تاقی بکەیتەوە.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      onClick={handleOpenAdd}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>زیادکردنی یەکەم موڵک</span>
                    </button>

                    <button
                      onClick={handleRestoreDemo}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>بارکردنی موڵکە نموونەییەکان</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Customer View When Portfolio is Updating */
                <div className="p-12 sm:p-16 text-center rounded-3xl glass-card border border-slate-800 space-y-4 max-w-xl mx-auto my-6">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border border-slate-700/80 mx-auto shadow-2xl shadow-sky-950/60 bg-slate-950 flex items-center justify-center">
                    <img src="/logo.png" alt="Nashville House" className="w-full h-full object-cover scale-105" />
                  </div>
                  <h3 className="text-xl font-black text-white">کۆمپانیای نەشڤیل هاوس (Nashville House)</h3>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    لیستی موڵکەکان لە ئێستادا نوێ دەکرێتەوە. بۆ دۆزینەوەی باشترین خانوو، ڤێلا، شوقە یان زەوی، پەیوەندی بە ڕاوێژکارانی نەشڤیل هاوس بکەن.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://wa.me/?text=سڵاو،%20دەمەوێت%20ڕاوێژ%20بکەم%20دەربارەی%20کڕین%20یان%20فرۆشتنی%20موڵک"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
                    >
                      <span>پەیوەندی لەگەڵ نوسینگە لە واتسئەپ</span>
                    </a>
                  </div>
                </div>
              )
            ) : filteredProperties.length === 0 ? (
              <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">{t.no_properties_found}</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {t.no_properties_desc}
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  {t.new_property}
                </button>
              </div>
            ) : viewMode === 'list' ? (
              /* 1. CHOOSEABLE COMPACT LIST / TABLE VIEW */
              <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">کۆد و وێنە</th>
                        <th className="p-3.5">ناوی موڵک و ناونیشان</th>
                        <th className="p-3.5">جۆر و مەبەست</th>
                        <th className="p-3.5">ڕووبەر و پێوانە</th>
                        <th className="p-3.5">نرخ و مامەڵە</th>
                        <th className="p-3.5">بارودۆخ</th>
                        <th className="p-3.5 text-center">کردارەکان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProperties.map((p) => {
                        const areaI = formatArea(p.area_sqm, p.land_details, lang);
                        const statusI = getPropertyStatusLabel(p.status, lang);
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                                  alt=""
                                  className="w-12 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 cursor-pointer"
                                  onClick={() => setDetailProperty(p)}
                                />
                                <span className="font-mono text-amber-400 font-bold">{p.property_code}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div 
                                onClick={() => setDetailProperty(p)} 
                                className="font-bold text-white hover:text-amber-400 cursor-pointer line-clamp-1"
                              >
                                {p.title}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                <span>{p.city} - {p.neighborhood || p.address}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-slate-300 block">{getPropertyTypeLabel(p.property_type, lang)}</span>
                              <span className="text-[10px] text-amber-400">{getPropertyPurposeLabel(p.purpose, lang)}</span>
                            </td>
                            <td className="p-3.5 font-mono">
                              <span className="font-bold text-white block">{areaI.primary}</span>
                              {areaI.badge && (
                                <span className="text-[10px] text-amber-400 font-semibold">{areaI.badge}</span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono">
                              <span className="font-bold text-emerald-400 block text-sm">
                                {formatPrice(p.price, p.currency, lang)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {p.payment_method === 'installments' ? t.installments : t.cash}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusI.bg}`}>
                                {statusI.label}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setDetailProperty(p)}
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                                  title="بینین"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {isStaff && (
                                  <button
                                    onClick={() => handleEditProperty(p)}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300"
                                    title="دەستکاری"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                )}
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteProperty(p.id)}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                                    title="سڕینەوە"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : viewMode === 'split' ? (
              /* 2. CHOOSEABLE SPLIT MAP & LIST VIEW */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="sticky top-24 h-[650px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
                  <PropertyMap
                    properties={filteredProperties}
                    lang={lang}
                    onSelectProperty={(p) => setDetailProperty(p)}
                  />
                </div>
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      lang={lang}
                      isAdmin={isStaff}
                      canDelete={isAdmin}
                      onView={(p) => setDetailProperty(p)}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                    />
                  ))}
                </div>
              </div>
            ) : isDividedSections ? (
              /* 4. CHOOSEABLE DIVIDED SECTIONS VIEW */
              <div className="space-y-8">
                {[
                  {
                    id: 'residential',
                    title: t.divide_residential || 'نیشتەجێبوون (خانوو، ڤێلا، شوقە)',
                    desc: 'خانووەکان، ڤێلای شاهانە، و شوقەی نیشتەجێبوون بۆ فرۆشتن و کرێ',
                    icon: '🏡',
                    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
                    items: filteredProperties.filter((p) => ['house', 'villa', 'apartment'].includes(p.property_type)),
                  },
                  {
                    id: 'land',
                    title: t.divide_land || 'زەوی و باخچە (کشتوکاڵی، نیشتەجێبوون، پیشەسازی)',
                    desc: 'زەوییەکان بە پێوانەی ورد، دۆنم، ئۆڵک، بەرە و قووڵی',
                    icon: '🌾',
                    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    items: filteredProperties.filter((p) => ['residential_land', 'commercial_land', 'agricultural_land', 'industrial_land', 'farm'].includes(p.property_type)),
                  },
                  {
                    id: 'commercial',
                    title: t.divide_commercial || 'شوێنی بازرگانی (دووکان، ئۆفیس، باڵەخانە)',
                    desc: 'دووکانی بازاڕ، کۆگا، ئۆفیس و باڵەخانەی بازرگانی و وەبەرهێنان',
                    icon: '🏬',
                    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    items: filteredProperties.filter((p) => ['shop', 'office', 'building', 'warehouse', 'showroom'].includes(p.property_type)),
                  },
                  {
                    id: 'projects',
                    title: t.divide_projects || 'پڕۆژە نوێیەکان و تاوەرەکان',
                    desc: 'پڕۆژە بەردەستەکان و پڕۆژەی لەژێر دروستکردن',
                    icon: '🏗️',
                    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                    items: filteredProperties.filter((p) => Boolean(p.project_name) || p.property_type === 'building'),
                  },
                ].map((sec) => (
                  <div key={sec.id} className="space-y-4 p-5 sm:p-6 rounded-3xl glass-card border border-slate-800 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2.5 rounded-2xl bg-slate-900 border border-slate-800">{sec.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-white">{sec.title}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${sec.badgeColor}`}>
                              {sec.items.length} {t.properties}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{sec.desc}</p>
                        </div>
                      </div>
                      {isUnlocked && (
                        <button
                          onClick={handleOpenAdd}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold border border-slate-800 transition-all"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>زیادکردن لەم بەشە</span>
                        </button>
                      )}
                    </div>

                    {sec.items.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-2xl border border-slate-900">
                        هیچ موڵکێک لەم بەشەدا نەدۆزرایەوە بەپێی فلتەرەکان
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sec.items.map((property) => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            lang={lang}
                            isAdmin={isStaff}
                            canDelete={isAdmin}
                            onView={(p) => setDetailProperty(p)}
                            onEdit={handleEditProperty}
                            onDelete={handleDeleteProperty}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* 3. CHOOSEABLE LUXURY GRID VIEW (Default) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    lang={lang}
                    isAdmin={isStaff}
                    canDelete={isAdmin}
                    onView={(p) => setDetailProperty(p)}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: MAP VIEW */}
        {activeTab === 'map' && (
          <PropertyMap
            properties={properties}
            lang={lang}
            onSelectProperty={(property) => setDetailProperty(property)}
          />
        )}

        {/* TAB 4: CONTRACTS & LEASING (STAFF & ADMIN) */}
        {isStaff && activeTab === 'contracts' && (
          <ContractsView
            contracts={contracts}
            properties={properties}
            onSaveContract={handleSaveContract}
            onDeleteContract={handleDeleteContract}
            onUpdatePropertyStatus={handleUpdatePropertyStatus}
          />
        )}

        {/* TAB 5: ACCOUNTING & INVESTMENT (ADMIN ONLY) */}
        {isAdmin && activeTab === 'accounting' && (
          <AccountingView
            transactions={transactions}
            properties={properties}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

      </main>

      {/* Property Registration & Edit Modal */}
      <PropertyFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        editingProperty={editingProperty}
        existingCount={properties.length}
        lang={lang}
      />

      {/* Property Full Details View Modal */}
      <PropertyDetailModal
        property={detailProperty}
        onClose={() => setDetailProperty(null)}
        onEdit={handleEditProperty}
        onDelete={handleDeleteProperty}
        isAdmin={isAdmin}
        isStaff={isStaff}
        lang={lang}
      />

      {/* Backup & Supabase Settings Modal */}
      <BackupModal
        isOpen={backupModalOpen}
        initialTab={backupModalTab}
        onClose={() => setBackupModalOpen(false)}
        onDataRestored={loadData}
        theme={theme}
        onChangeTheme={handleThemeChange}
        bgPattern={bgPattern}
        onChangeBgPattern={handleBgPatternChange}
      />

      {/* Employee Management Modal (Admin Only) */}
      <EmployeeManagementModal
        isOpen={employeesModalOpen}
        onClose={() => setEmployeesModalOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Nashville House" className="w-5 h-5 rounded-md object-cover" />
            <span className="font-bold text-slate-400">{t.agency_title}</span>
            <span>—</span>
            <span>{t.agency_subtitle}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
            <Link 
              href="/guide" 
              className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 flex items-center gap-1"
            >
              📖 ڕێبەری بەکارهێنان
            </Link>
            <span className="hidden sm:inline">•</span>
            <span>
              {lang === 'en' 
                ? 'Private, secure, optimized for mobile, tablet and desktop'
                : lang === 'ar'
                ? 'خاص، آمن، ومتوافق مع الهواتف الذكية وأجهزة الكمبيوتر'
                : 'تایبەت، پارێزراو و پشتگیریکراو لە مۆبایل و کۆمپیوتەر'}
            </span>
          </div>
        </div>

        {/* Developer Watermark */}
        <div className="mt-4 pt-3 border-t border-slate-900/80 max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <div className="text-slate-600">
            © {new Date().getFullYear()} Nashville House Real Estate. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 select-none text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>developed by</span>
            <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md hover:bg-amber-500/20 hover:border-amber-500/40 transition-colors">
              null-tech
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
