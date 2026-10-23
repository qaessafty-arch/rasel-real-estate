'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  X,
  KeyRound
} from 'lucide-react';
import { loginWithServer } from '@/lib/auth';
import { UserSession } from '@/types';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: (user?: UserSession) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onSuccess, 
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('تکایە وشەی نهێنی یان PIN بنووسە');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginWithServer(password, remember);
      if (res.success && res.user) {
        setPassword('');
        onSuccess(res.user);
      } else {
        setError(res.message || 'وشەی نهێنی یان PIN هەڵەیە!');
      }
    } catch {
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
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-center relative overflow-hidden bg-slate-900/98">
        
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
        <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-sky-950/60 mb-3 border border-slate-700/80 bg-slate-950 flex items-center justify-center">
          <img src="/logo.png" alt="Nashville House" className="w-full h-full object-cover scale-105" />
        </div>

        <h2 id="login-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-wide mb-1">
          NASHVILLE HOUSE
        </h2>
        <p className="text-xs text-amber-400/90 font-medium mb-5">
          چوونەژوورەوەی ستاف و بەڕێوەبەر (Staff Portal)
        </p>

        {/* SECURE LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-right text-xs text-slate-300 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>سیستەمی داخراو — تەنها ستاف و بەڕێوەبەر مافی چوونەژوورەوەیان هەیە</span>
          </div>

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              وشەی نهێنی یان PIN
            </label>
            
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                data-lpignore="true"
                autoFocus
                className="w-full px-12 py-3 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-600 outline-none text-center font-mono text-base tracking-widest transition-all"
              />
              
              <KeyRound className="w-5 h-5 text-slate-500 absolute right-3.5 pointer-events-none" />

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
              <span>لەبیرم مەبە لەسەر ئەم ئامێرە</span>
            </label>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>پارێزراوە بە تەواوی</span>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'خەریکی چوونەژوورەوەیە...' : 'چوونەژوورەوە (Login)'}
          </button>
        </form>

      </div>
    </div>
  );
};
