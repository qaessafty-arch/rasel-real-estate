'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  X,
  KeyRound
} from 'lucide-react';
import { loginWithServer } from '@/lib/auth';

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
}) => {
  // Login form state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const res = await loginWithServer(password, remember);
      if (res.success) {
        setPassword('');
        onSuccess();
      } else {
        setError(res.message || 'وشەی نهێنی هەڵەیە!');
      }
    } catch (err) {
      setError('هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden bg-slate-900/95">
        
        {/* Top Close Button */}
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
          <Building2 className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h2 id="login-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-wide mb-1">
          NASHVILLE HOUSE
        </h2>
        <p className="text-xs text-amber-400/90 font-medium mb-6">
          چوونەژوورەوەی ستاف و بەڕێوەبەر (Admin Access)
        </p>

        {/* SECURE LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-right text-xs text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ئەم بەشە پارێزراوە؛ وشەی نهێنی بنووسە بۆ دەستگەیشتن بە ئەدمین.</span>
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
              <span>بمپارێزە لەسەر ئەم ئامێرە (Remember Me)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'چاوەڕوانبە...' : 'چوونەژوورەوە'}</span>
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

      </div>
    </div>
  );
};
