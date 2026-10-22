'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  MapPin, 
  SlidersHorizontal,
  X,
  Trash2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Property, Contract, FinancialTransaction, PropertyStatus } from '@/types';
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
import { VoiceSearch } from '@/components/VoiceSearch';
import { Language, translations } from '@/lib/i18n';

export default function HomePage() {
  // Trilingual State: 'ckb' (Kurdish) | 'ar' (Arabic) | 'en' (English)
  const [lang, setLang] = useState<Language>('ckb');

  // Authentication & Security state: Public by default!
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Load language preference from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('rasel_lang') as Language;
      if (savedLang === 'en' || savedLang === 'ckb' || savedLang === 'ar') {
        setLang(savedLang);
      }
    }
  }, []);

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'map' | 'contracts' | 'accounting'>('dashboard');

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
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Check initial login state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalUnlocked = localStorage.getItem('rasel_auth_unlocked') === 'true';
      const isSessionUnlocked = sessionStorage.getItem('rasel_auth_unlocked') === 'true';
      if (isLocalUnlocked || isSessionUnlocked) {
        setIsUnlocked(true);
      }
    }
    setAuthChecked(true);
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

  // Helper to guard admin-only actions (allows visitors to browse freely)
  const requireAdmin = (action: () => void) => {
    if (isUnlocked) {
      action();
    } else {
      setLoginModalOpen(true);
    }
  };

  // Computed Stats
  const stats = useMemo(() => {
    return dataService.calculateStats(properties, transactions);
  }, [properties, transactions]);

  // Cities extracted dynamically
  const availableCities = useMemo(() => {
    const set = new Set(properties.map((p) => p.city).filter(Boolean));
    return Array.from(set);
  }, [properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // Search query (matches title, code, city, neighborhood, address, project, notes, owner, freelancer)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchCode = item.property_code?.toLowerCase().includes(query);
        const matchCity = item.city?.toLowerCase().includes(query);
        const matchAddress = item.address?.toLowerCase().includes(query);
        const matchProject = item.project_name?.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query);
        const matchOwner = item.owner_contact?.name?.toLowerCase().includes(query);
        const matchFreelancer = item.freelancer_name?.toLowerCase().includes(query);
        
        if (!matchTitle && !matchCode && !matchCity && !matchAddress && !matchProject && !matchNotes && !matchOwner && !matchFreelancer) {
          return false;
        }
      }

      // Property type filter
      if (selectedType !== 'all' && item.property_type !== selectedType) {
        return false;
      }

      // Purpose filter (sale, rent, exchange, investment)
      if (selectedPurpose !== 'all' && item.purpose !== selectedPurpose) {
        return false;
      }

      // Payment method filter (cash, installments, exchange)
      if (selectedPayment !== 'all') {
        if (item.payment_method) {
          if (item.payment_method !== selectedPayment) return false;
        } else {
          if (selectedPayment === 'installments' && !item.installment_count) return false;
        }
      }

      // Condition filter (brand_new, used)
      if (selectedCondition !== 'all') {
        if (item.condition && item.condition !== selectedCondition) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && item.city !== selectedCity) {
        return false;
      }

      return true;
    });
  }, [properties, searchQuery, selectedType, selectedPurpose, selectedPayment, selectedCondition, selectedStatus, selectedCity]);

  // Handlers for Properties
  const handleOpenAdd = () => {
    requireAdmin(() => {
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
    requireAdmin(() => {
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
  const handleLock = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rasel_auth_unlocked');
      sessionStorage.removeItem('rasel_auth_unlocked');
    }
    setIsUnlocked(false);
  };

  const isFilterActive = selectedType !== 'all' || 
    selectedPurpose !== 'all' || 
    selectedPayment !== 'all' || 
    selectedCondition !== 'all' || 
    selectedStatus !== 'all' || 
    selectedCity !== 'all' || 
    Boolean(searchQuery.trim());

  const resetAllFilters = () => {
    setSelectedType('all');
    setSelectedPurpose('all');
    setSelectedPayment('all');
    setSelectedCondition('all');
    setSelectedStatus('all');
    setSelectedCity('all');
    setSearchQuery('');
  };

  if (!authChecked) return null;

  return (
    <div dir={lang === 'en' ? 'ltr' : 'rtl'} className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Login Modal: Opened only when requested or when an admin action is performed */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onResetData={loadData}
        onSuccess={() => {
          setIsUnlocked(true);
          setLoginModalOpen(false);
        }}
      />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAdd}
        onOpenBackupModal={() => requireAdmin(() => setBackupModalOpen(true))}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onLockSystem={handleLock}
        isAdmin={isUnlocked}
        propertiesCount={properties.length}
        lang={lang}
        onToggleLang={handleToggleLang}
        onChangeLang={handleSelectLang}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
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
                
                {/* Clear All Data Button (Visible in Admin Mode to wipe data for customer) */}
                {isUnlocked && properties.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-white border border-rose-900/50 text-xs font-bold transition-all"
                    title="سڕینەوەی هەموو داتاکان بۆ کڕیار"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>سفرکردنەوە بۆ کڕیار</span>
                  </button>
                )}

                <button
                  onClick={handleOpenAdd}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.new_property}</span>
                </button>
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

            {/* Properties Grid or Empty State */}
            {properties.length === 0 ? (
              /* CLEAN SLATE FOR CUSTOMER */
              <div className="p-12 sm:p-16 text-center rounded-3xl glass-card border border-emerald-500/30 space-y-4 max-w-2xl mx-auto my-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">سیستەمەکە تەواو بەتاڵ و خاوێنە!</h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                  هەموو داتا و موڵکە نموونەییەکان بە سەرکەوتوویی سڕانەوە. ئێستا کڕیار دەتوانێت دەستبکات بە زیادکردنی موڵک و زانیارییەکانی خۆی بە خاوێنی.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>یەکەم موڵکی خۆت تۆمار بکە</span>
                  </button>

                  <button
                    onClick={handleRestoreDemo}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs"
                    title="ئەگەر دووبارە ویستت داتای نموونەیی تاقیبکەیتەوە"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>گەڕاندنەوەی داتای نموونەیی</span>
                  </button>
                </div>
              </div>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    lang={lang}
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

        {/* TAB 4: CONTRACTS & LEASING */}
        {activeTab === 'contracts' && (
          <ContractsView
            contracts={contracts}
            properties={properties}
            onSaveContract={handleSaveContract}
            onDeleteContract={handleDeleteContract}
            onUpdatePropertyStatus={handleUpdatePropertyStatus}
          />
        )}

        {/* TAB 5: ACCOUNTING & INVESTMENT */}
        {activeTab === 'accounting' && (
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
        lang={lang}
      />

      {/* Backup & Supabase Settings Modal */}
      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        onDataRestored={loadData}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-400">{t.agency_title}</span>
            <span>—</span>
            <span>{t.agency_subtitle}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {lang === 'en' 
              ? 'Private, secure, optimized for mobile, tablet and desktop'
              : lang === 'ar'
              ? 'خاص، آمن، ومتوافق مع الهواتف الذكية وأجهزة الكمبيوتر'
              : 'تایبەت، پارێزراو و پشتگیریکراو لە مۆبایل و کۆمپیوتەر'}
          </div>
        </div>
      </footer>

    </div>
  );
}
