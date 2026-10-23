'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  X,
  KeyRound,
  Users,
  UserCheck
} from 'lucide-react';
import { loginWithServer, getEmployees } from '@/lib/auth';
import { Employee, UserSession } from '@/types';

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
  const [username, setUsername] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load available staff list on open
  useEffect(() => {
    if (isOpen) {
      setEmployees(getEmployees());
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
    setError('');
    setLoading(true);

    try {
      const res = await loginWithServer(password, remember, selectedEmp ? selectedEmp.username : username);
      if (res.success && res.user) {
        setPassword('');
        setUsername('');
        setSelectedEmp(null);
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

  const handleSelectStaff = (emp: Employee) => {
    setSelectedEmp(emp);
    setUsername(emp.username);
    setPassword('');
    setError('');
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
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/25 mb-3">
          <Building2 className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h2 id="login-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-wide mb-1">
          NASHVILLE HOUSE
        </h2>
        <p className="text-xs text-amber-400/90 font-medium mb-4">
          چوونەژوورەوەی ستاف و بەڕێوەبەر (Staff Portal)
        </p>

        {/* Quick Staff Account Switcher Chips */}
        <div className="mb-4">
          <div className="text-[11px] text-slate-400 font-semibold mb-2 text-right">
            هەڵبژاردنی هەژمار (یان ڕاستەوخۆ PIN بنووسە):
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedEmp(null);
                setUsername('admin');
                setError('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                !selectedEmp || selectedEmp.role === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>👑</span>
              <span>بەڕێوەبەر</span>
            </button>

            {employees.filter(e => e.role === 'employee').map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => handleSelectStaff(emp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                  selectedEmp?.id === emp.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span>👤</span>
                <span>{emp.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECURE LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-right text-[11px] text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {selectedEmp 
                ? `چوونەژوورەوە وەک کارمەند: ${selectedEmp.name}` 
                : 'وشەی نهێنی سەرپەرشتیار (Ibo0909) یان PINی کارمەندان بنووسە.'}
            </span>
          </div>

          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {selectedEmp ? `PINی تایبەت بە ${selectedEmp.name}` : 'وشەی نهێنی یان PIN'}
            </label>
            
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder={selectedEmp ? `PINی ${selectedEmp.name} بنووسە...` : "Ibo0909 یان PIN بنووسە..."}
                autoFocus
                className="w-full px-12 py-3 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 outline-none text-center font-mono text-base transition-all"
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
            <span className="text-[11px] text-slate-500">SHA-256 Secure</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'خەریکی چوونەژوورەوەیە...' : selectedEmp ? `چوونەژوورەوە وەک ${selectedEmp.name}` : 'چوونەژوورەوە'}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-right space-y-1 font-mono">
          <div>👑 ئەدمین: <span className="text-amber-400">Ibo0909</span></div>
          <div>👤 کارمەند ١: <span className="text-sky-400">1122</span> (ئاراس) | کارمەند ٢: <span className="text-sky-400">3344</span> (سارا)</div>
        </div>

      </div>
    </div>
  );
};
