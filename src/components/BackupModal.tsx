'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Sparkles,
  Palette
} from 'lucide-react';
import { dataService } from '@/lib/storage';
import { getSupabaseConfig, testConnection, normalizeSupabaseUrl, normalizeSupabaseKey } from '@/lib/supabase';
import { UITheme } from '@/types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  initialTab?: 'security' | 'supabase' | 'backup';
  theme?: UITheme;
  onChangeTheme?: (theme: UITheme) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  initialTab = 'security',
  theme = 'gold',
  onChangeTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'supabase' | 'security'>(initialTab);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [schemaCopied, setSchemaCopied] = useState(false);

  // Security password state
  const [newPin, setNewPin] = useState('');
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync initial tab when modal opens or prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Load existing configuration
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setSupabaseUrl(config.url);
      setSupabaseKey(config.key);
      setIsConnected(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
    const cleanKey = normalizeSupabaseKey(supabaseKey);

    if (!cleanUrl || !cleanKey) {
      setErrorMsg('تکایە هەردوو خانەی URL و Anon Key پڕبکەرەوە!');
      return;
    }

    setSupabaseUrl(cleanUrl);
    setSupabaseKey(cleanKey);
    setTestingConnection(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await testConnection(cleanUrl, cleanKey);
    setTestingConnection(false);

    if (res.cleanUrl) setSupabaseUrl(res.cleanUrl);
    if (res.cleanKey) setSupabaseKey(res.cleanKey);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSaveConnection = async () => {
    const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
    const cleanKey = normalizeSupabaseKey(supabaseKey);

    if (!cleanUrl || !cleanKey) {
      setErrorMsg('تکایە هەردوو خانەی URL و Anon Key پڕبکەرەوە!');
      return;
    }

    setSupabaseUrl(cleanUrl);
    setSupabaseKey(cleanKey);
    setTestingConnection(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await testConnection(cleanUrl, cleanKey);
    setTestingConnection(false);

    if (!res.success) {
      setErrorMsg(`پەیوەندی سەرکەوتوو نەبوو: ${res.message}`);
      return;
    }

    // Save in localStorage for instant dynamic use
    localStorage.setItem(
      'rasel_supabase_custom_config',
      JSON.stringify({ url: cleanUrl, key: cleanKey })
    );

    setIsConnected(true);
    setSuccessMsg('پەیوەندی بە سەرکەوتوویی پاشەکەوت کرا و سیستەم بەستراوەتەوە بە Supabase!');
    onDataRestored();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDisconnect = () => {
    if (confirm('دڵنیایت لە پچڕاندنی پەیوەندی بە Supabase؟ سیستەمەکە دەگەڕێتەوە سەر پاشەکەوتی خۆجێیی.')) {
      localStorage.removeItem('rasel_supabase_custom_config');
      setIsConnected(false);
      setSupabaseUrl('');
      setSupabaseKey('');
      setSuccessMsg('پەیوەندی بە سەرکەوتوویی پچڕێنرا و گەڕایەوە سەر خۆجێیی.');
      onDataRestored();
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSyncData = async () => {
    setSyncingData(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await dataService.syncLocalToSupabase();
    setSyncingData(false);

    if (res.success) {
      setSuccessMsg(`هەموو داتاکانت (${res.count} تۆمار) بە سەرکەوتوویی ڕەوانەی Supabase کران!`);
      onDataRestored();
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(`هەڵە لە سینککردن: ${res.error}`);
    }
  };

  const handleExport = () => {
    try {
      const backupJson = dataService.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rasel-real-estate-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMsg('فایلی پاشەکەوت بە سەرکەوتوویی داگیرا!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg('هەڵەیەک ڕوویدا لە کاتی دەرکردنی پاشەکەوت.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = dataService.importBackup(text);
        if (ok) {
          setSuccessMsg('زانیارییەکان بە سەرکەوتوویی گەڕێندرانەوە!');
          onDataRestored();
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setErrorMsg('فایلی هەڵبژێردراو نادروستە یان تێکچووە!');
        }
      } catch (err) {
        setErrorMsg('هەڵە لە خوێندنەوەی فایل!');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    setClearingData(true);
    await dataService.clearAllData(false);
    onDataRestored();
    setClearingData(false);
    setShowClearConfirm(false);
    setSuccessMsg('سەرجەم داتاکان بە سەرکەوتوویی سڕانەوە! ئێستا دەتوانیت سیستەمەکە ڕادەستی کڕیار بکەیت تا خۆی موڵک و زانیارییەکانی بنووسێت.');
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleResetDemo = () => {
    if (confirm('دڵنیایت لە گەڕاندنەوەی سیستەم بۆ داتای نموونەیی سەرەتایی؟')) {
      dataService.resetDemoData();
      onDataRestored();
      setSuccessMsg('داتاکان گەڕێندرانەوە بۆ دۆخی بنەڕەتی!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      localStorage.setItem('rasel_custom_pin', newPin.trim());
      setSuccessMsg('وشەی نهێنی بە سەرکەوتوویی گۆڕدرا!');
      setNewPin('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg('وشەی نهێنی پێویستە بە لایەنی کەمەوە ٤ پیت یان ژمارە بێت.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700 shadow-2xl bg-slate-900 text-right p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                ڕێکخستنەکانی سیستەم (Settings)
              </h2>
              <p className="text-xs text-amber-400/90 font-medium">
                وشەی نهێنی، سفرکردنەوەی داتا بۆ کڕیار، سوپابەیس و پاشەکەوت
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6 text-xs">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'security' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ڕێکخستن و سفرکردنەوە</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'supabase' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>داتابەیسی هەوری (Supabase)</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'backup' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>پاشەکەوت و هێنانەوە</span>
          </button>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Supabase Live Connector */}
        {activeTab === 'supabase' && (
          <div className="space-y-5">
            {/* Connection Status Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">دۆخی پەیوەندی داتابەیس</h4>
                  <p className="text-xs text-slate-400">
                    {isConnected 
                      ? 'سیستەمەکە بەستراوەتەوە بە داتابەیسی هەوری Supabase (PostgreSQL)' 
                      : 'لە دۆخی خۆجێییدایە (داتاکان لەناو وێبگەڕدا دەپارێزرێن)'}
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {isConnected ? 'بەستراوەتەوە (Active)' : 'دەرهێڵ / خۆجێیی'}
              </span>
            </div>

            {/* Credentials Input Form */}
            <div className="space-y-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span>زانیارییەکانی دەستگەیشتن بە پڕۆژەی Supabase</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Project URL (ناونیشانی پڕۆژە لە Supabase) *
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Project API Anon / Public Key (کلیلە گشتییەکەی پڕۆژە) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showSupabaseKey ? 'text' : 'password'}
                    dir="ltr"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white font-mono text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                    className="absolute right-2.5 text-slate-400 hover:text-amber-400 p-1"
                    title={showSupabaseKey ? "شاردنەوە" : "پیشاندان"}
                  >
                    {showSupabaseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestConnection}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>تاقیکردنەوەی پەیوەندی</span>
                </button>

                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleSaveConnection}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all disabled:opacity-50"
                >
                  پاشەکەوتکردن و بەستنەوە
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-900/50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>پچڕاندن</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sync Local Data to Cloud Button */}
            {isConnected && (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-0.5">
                    <Zap className="w-4 h-4" />
                    <span>گواستنەوەی موڵکە خۆجێییەکان بۆ Supabase</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    هەموو ئەو موڵک و گرێبەستانەی کە پێشتر تۆمارت کردووە بە یەک کلیک دەنێرێتە سەر Supabase.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={syncingData}
                  onClick={handleSyncData}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Upload className={`w-3.5 h-3.5 ${syncingData ? 'animate-bounce' : ''}`} />
                  <span>{syncingData ? 'لە بارکردندایە...' : 'سینککردنی داتاکان'}</span>
                </button>
              </div>
            )}

            {/* Schema.sql Guide */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">فایلی دروستکردنی خشتەکان (schema.sql)</span>
                <span className="text-[11px] text-amber-400 font-mono">supabase/schema.sql</span>
              </div>
              <p className="leading-relaxed">
                ئەگەر یەکەم جارە پڕۆژەکەت لە Supabase دروست دەکەیت، بچۆ بەشی <strong>SQL Editor</strong> لە داشبۆردی Supabase، فایلی ئامادەکراوی خشتەکان کە لە پڕۆژەکەتدا هەیە لەوێ دابنێ و Run دابگرە بۆ دروستبوونی خشتەکان و بەشی وێنەکان (Storage Buckets).
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>دەرکردنی فایلی پاشەکەوت (Backup Export)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                هەموو موڵکەکانت، وێنەکان، گرێبەستەکان، و تۆمارە داراییەکانت بە شێوەی فایلی JSON دادەبەزێنێتە سەر کۆمپیوتەر یان مۆبایلەکەت بۆ ئەوەی هەرگیز داتاکانت لەدەست نەچێت.
              </p>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>داگرتنی فایلی تەواوی داتاکان (Download JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>گەڕاندنەوەی فایلی پاشەکەوت (Restore Data)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                دەتوانیت فایلی پێشووی پاشەکەوت باربکەیت بۆ گەڕاندنەوەی هەموو موڵک و گرێبەستەکانت.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>هەڵبژاردنی فایلی JSON لە کۆمپیوتەر</span>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            {/* CLEAR ALL STORED DATA FOR CUSTOMER HANDOVER */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>سڕینەوەی هەموو داتاکان (سفرکردنەوە بۆ کڕیار)</span>
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  Clean Slate for Customer
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                سڕینەوەی یەکجاری هەموو موڵکە نموونەییەکان، گرێبەستەکان و تۆمارە ژمێریارییەکان، بۆ ئەوەی کڕیارەکەت سیستەمێکی تەواو بەتاڵ و خاوێن وەربگرێت و دەستبکات بە زیادکردنی موڵکەکانی خۆی بە ئارەزووی خۆی.
              </p>

              {showClearConfirm ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/60 space-y-3">
                  <p className="text-xs text-rose-300 font-bold">
                    ⚠️ ئایا تەواو دڵنیایت؟ سەرجەم موڵک، گرێبەست و ژمێریارییەکان دەسڕێنەوە و سیستەمەکە دەبێتە پەڕەی سپی.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearAllData}
                      disabled={clearingData}
                      className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      {clearingData ? 'دەسڕێتەوە...' : 'بەڵێ، دڵنیام هەموو داتاکان بسڕەوە'}
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="py-2 px-3 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
                    >
                      پەشیمانبوونەوە
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>سڕینەوەی هەموو داتاکان (سفرکردنەوە بۆ کڕیار)</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>دەتەوێت بگەڕێیتەوە بۆ نموونەی سەرەتایی؟</span>
              <button
                onClick={handleResetDemo}
                className="text-rose-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>گەڕاندنەوە بۆ دۆخی سەرەتایی</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Security & PIN & Reset Data */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            
            {/* 1. RESET INFORMATION FOR CUSTOMER */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>سفرکردنەوەی هەموو زانیارییەکان بۆ کڕیار (Reset All Data)</span>
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  سڕینەوەی گشتی
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                سڕینەوەی یەکجاری سەرجەم موڵکە نموونەییەکان، گرێبەستەکان و ژمێریارییەکان، بۆ ئەوەی کڕیارەکەت پەڕەیەکی تەواو سپی و خاوێن وەربگرێت و خۆی دەستبکات بە داخڵکردنی داتاکانی.
              </p>

              {showClearConfirm ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/60 space-y-3">
                  <p className="text-xs text-rose-300 font-bold">
                    ⚠️ ئایا تەواو دڵنیایت لە سفرکردنەوەی سەرجەم زانیارییەکان؟
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearAllData}
                      disabled={clearingData}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      {clearingData ? 'دەسڕێتەوە...' : 'بەڵێ، دڵنیام هەموو داتاکان بسڕەوە'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="py-2.5 px-4 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
                    >
                      پەشیمانبوونەوە
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>سفرکردنەوەی هەموو زانیارییەکان (Reset)</span>
                </button>
              )}

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-rose-950/40">
                <span>دەتەوێت داتای نموونەیی بگەڕێنیتەوە؟</span>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>گەڕاندنەوە بۆ داتای نموونەیی سەرەتایی</span>
                </button>
              </div>
            </div>

            {/* 2. CHANGE MASTER PASSWORD */}
            <form onSubmit={handleSavePin} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>گۆڕینی وشەی نهێنی بەڕێوەبەر (Master Password)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  وشەی نهێنی بنەڕەتی ئێستا: <span className="font-mono text-amber-400 font-bold">Ibo0909</span>. دەتوانیت لەم بەشەدا بیگۆڕیت بۆ هەر وشەیەکی تر.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  وشەی نهێنی نوێ بنووسە:
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="وشەی نهێنی نوێ بنووسە..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute left-2.5 text-slate-400 hover:text-amber-400 p-1"
                    title={showNewPin ? "شاردنەوە" : "پیشاندان"}
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                پاشەکەوتکردنی وشەی نهێنی نوێ
              </button>
            </form>

            {/* 3. CHOOSEABLE UI THEME */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>شێوازی ڕووکار و دیزاین (Choose UI Theme)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  دیزاینی دڵخوازی خۆت هەڵبژێرە بە ڕەنگ و ستایلی جیاواز.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                {[
                  { id: 'gold' as UITheme, label: 'زێڕینی لوکس', sub: 'Obsidian Gold', icon: '🌟', border: 'border-amber-500/50', bg: 'bg-amber-500/10' },
                  { id: 'sapphire' as UITheme, label: 'شینی شاهانە', sub: 'Royal Sapphire', icon: '💎', border: 'border-sky-500/50', bg: 'bg-sky-500/10' },
                  { id: 'emerald' as UITheme, label: 'زمڕودی شاهانە', sub: 'Emerald Oasis', icon: '🌲', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' },
                  { id: 'pearl' as UITheme, label: 'ڕووناکی مۆدێرن', sub: 'Modern Pearl', icon: '☀️', border: 'border-slate-400/50', bg: 'bg-slate-200/20' },
                  { id: 'solid' as UITheme, label: 'ڕەشی پڕ', sub: 'Solid Pitch', icon: '⬛', border: 'border-zinc-400/50', bg: 'bg-zinc-800/30' },
                  { id: 'minimalism' as UITheme, label: 'سادەی مۆدێرن', sub: 'Minimalism', icon: '⚪', border: 'border-slate-400/50', bg: 'bg-slate-800/30' },
                  { id: 'brutalism' as UITheme, label: 'بروتالیزمی وشک', sub: 'Dry Brutalism', icon: '🧱', border: 'border-yellow-400/60', bg: 'bg-yellow-500/15' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeTheme && onChangeTheme(item.id)}
                    className={`p-3 rounded-2xl border text-center transition-all ${item.bg} ${
                      theme === item.id 
                        ? `${item.border} ring-2 ring-amber-500/40 shadow-lg scale-102` 
                        : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            داخستن
          </button>
        </div>

      </div>
    </div>
  );
};
