'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  ArrowLeft, 
  X, 
  Eye, 
  EyeOff,
  Settings,
  Trash2,
  CheckCircle2,
  Key,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { dataService } from '@/lib/storage';
import { loginWithServer, setCustomPin } from '@/lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  onResetData?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onSuccess, 
  onClose,
  onResetData 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'settings'>('login');
  
  // Login form state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  // Settings panel state
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Keyboard Escape listener
  React.useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await loginWithServer(password, remember);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.message || 'وشەی نهێنی هەڵەیە! تکایە وشەی ڕاست بنووسە.');
    }
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await setCustomPin(newPassword);
    if (success) {
      setSettingsSuccess('وشەی نهێنی نوێ بە پارێزراوی (SHA-256) پاشەکەوت کرا!');
      setNewPassword('');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } else {
      setSettingsError('وشەی نهێنی پێویستە بە لایەنی کەمەوە ٤ پیت یان ژمارە بێت.');
      setTimeout(() => setSettingsError(''), 4000);
    }
  };

  const handleResetAllInformation = async () => {
    setIsResetting(true);
    await dataService.clearAllData(false);
    if (onResetData) {
      onResetData();
    }
    setIsResetting(false);
    setShowResetConfirm(false);
    setSettingsSuccess('سەرجەم زانیارییەکان بە سەرکەوتوویی سفرکرانەوە! سیستەمەکە ئێستا تەواو خاوێنە بۆ بەکارهێنانی کڕیار.');
    setTimeout(() => setSettingsSuccess(''), 5000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden bg-slate-900/95">
        
        {/* Top Right Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rtl:left-auto rtl:right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-all z-20"
            title="داخستن"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Agency Emblem */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/25 mb-3">
          <Building2 className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mb-1">
          RASEL REAL ESTATE
        </h2>
        <p className="text-xs text-amber-400/90 font-medium mb-5">
          سیستەمی بەڕێوەبردنی موڵک و وەبەرهێنان
        </p>

        {/* Mode Switch Tabs: Login vs Settings */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>چوونەژوورەوە</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ڕێکخستن و سفرکردنەوە</span>
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-right text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ئەم بەشە پارێزراوە؛ تکایە وشەی نهێنی بنووسە بۆ دەستگەیشتن بە ئەدمین.</span>
            </div>

            <div className="text-right">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                وشەی نهێنی چوونەژوورەوە
              </label>
              
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="وشەی نهێنی بنووسە..."
                  autoFocus
                  className="w-full px-12 py-3 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 outline-none text-center font-mono text-base transition-all"
                />
                
                {/* Right Side Key Icon */}
                <KeyRound className="w-5 h-5 text-slate-500 absolute right-3.5 pointer-events-none" />

                {/* Left Side Password Show/Hide Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 p-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                  title={showPassword ? 'شاردنەوەی وشەی نهێنی' : 'پیشاندانی وشەی نهێنی'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>بمپارێزە لەسەر ئەم ئامێرە</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>چوونەژوورەوە</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs border border-slate-800 transition-all"
              >
                گەڕانەوە بۆ سەیرکردنی گشتی موڵکەکان (Public Mode)
              </button>
            )}

          </form>
        )}

        {/* TAB 2: SETTINGS & RESET INFORMATION PANEL */}
        {activeTab === 'settings' && (
          <div className="space-y-4 text-right">
            
            {/* Feedback messages */}
            {settingsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}
            
            {settingsError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-400 text-xs font-semibold">
                {settingsError}
              </div>
            )}

            {/* RESET INFORMATION CARD FOR CUSTOMER */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>سفرکردنەوەی هەموو زانیارییەکان</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                  Reset Information
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                سڕینەوەی هەموو موڵکە نموونەییەکان و تۆمارەکان بە یەکجاری، تا کڕیارەکەت پەڕەیەکی تەواو خاوێن و سپی وەربگرێت و خۆی دەستبکات بە زیادکردنی داتاکانی.
              </p>

              {showResetConfirm ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/60 space-y-2.5">
                  <p className="text-xs text-rose-300 font-bold">
                    ⚠️ ئایا تەواو دڵنیایت لە سفرکردنەوەی سەرجەم زانیارییەکان؟
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={handleResetAllInformation}
                      className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                    >
                      {isResetting ? 'دەسڕێتەوە...' : 'بەڵێ، زانیارییەکان بسڕەوە'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="py-2 px-3 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
                    >
                      پەشیمانبوونەوە
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>سفرکردنەوەی هەموو زانیارییەکان بۆ کڕیار (Reset)</span>
                </button>
              )}
            </div>

            {/* CHANGE PASSWORD IN SETTINGS PANEL */}
            <form onSubmit={handleSaveNewPassword} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                <span>گۆڕینی وشەی نهێنی</span>
              </span>

              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="وشەی نهێنی نوێ بنووسە..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-2.5 text-slate-400 hover:text-amber-400 p-1"
                  title={showNewPassword ? 'شاردنەوە' : 'پیشاندان'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all"
              >
                پاشەکەوتکردنی وشەی نهێنی نوێ
              </button>
            </form>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="w-full py-2 px-3 text-center text-xs text-slate-400 hover:text-white"
            >
              گەڕانەوە بۆ چوونەژوورەوە
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
