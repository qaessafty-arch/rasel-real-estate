'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Phone, 
  User, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Check,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from 'lucide-react';
import { Employee } from '@/types';
import { getEmployees, saveEmployee, deleteEmployee, toggleEmployeeStatus } from '@/lib/auth';
import { Language, translations } from '@/lib/i18n';

interface EmployeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const EmployeeManagementModal: React.FC<EmployeeManagementModalProps> = ({
  isOpen,
  onClose,
  lang = 'ckb',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  // New employee form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [showPin, setShowPin] = useState(false);

  const t = translations[lang] as any;

  // Load employees
  useEffect(() => {
    if (isOpen) {
      setEmployees(getEmployees());
    }
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !pin.trim()) {
      setFeedback('تکایە ناو، یوزەرنەیم و PIN بنووسە!');
      return;
    }

    // Check unique username
    const exists = employees.some(
      (emp) => emp.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (exists) {
      setFeedback('ئەم یوزەرنەیمە پێشتر بەکارهاتووە! تکایە دانەیەکی تر هەڵبژێرە.');
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      pin: pin.trim(),
      phone: phone.trim() || undefined,
      role: 'employee',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    saveEmployee(newEmp);
    setEmployees(getEmployees());
    setIsAdding(false);
    setName('');
    setUsername('');
    setPin('');
    setPhone('');
    setFeedback(`کارمەند "${newEmp.name}" بە سەرکەوتوویی زیادکرا!`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleToggle = (id: string) => {
    toggleEmployeeStatus(id);
    setEmployees(getEmployees());
  };

  const handleDelete = (id: string, empName: string) => {
    if (confirm(`دڵنیایت لە سڕینەوەی کارمەند "${empName}"؟`)) {
      deleteEmployee(id);
      setEmployees(getEmployees());
    }
  };

  const handleCopyCredentials = (emp: Employee) => {
    const text = `هەژماری کارمەندی نەشڤیل هاوس:\nناو: ${emp.name}\nیوزەرنەیم: ${emp.username}\nوشەی نهێنی (PIN): ${emp.pin}\nماڵپەڕ: https://www.nashvillehouse.site`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(emp.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emp-modal-title"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700 shadow-2xl bg-slate-900 text-right p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="emp-modal-title" className="text-lg sm:text-xl font-black text-white">
                بەڕێوەبردنی ستاف و کارمەندان (Staff & Employees)
              </h2>
              <p className="text-xs text-amber-400/90 font-medium">
                زیادکردنی برۆکەرەکان، دیاریکردنی وشەی نهێنی و کۆنتڕۆڵی دەسەڵاتەکان
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Top Controls: Add Button & Stats */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="text-xs text-slate-400">
            کۆی ستافی تۆمارکراو: <strong className="text-amber-400 font-mono text-sm">{employees.length}</strong> کارمەند
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAdding ? 'داخستنی فۆڕم' : 'زیادکردنی کارمەندی نوێ'}</span>
          </button>
        </div>

        {/* Add Employee Form Drawer */}
        {isAdding && (
          <form onSubmit={handleAddEmployee} className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>فۆڕمی زیادکردنی کارمەندی نوێ بۆ نوسینگە</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ناوی سیانی کارمەند *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نموونە: هێمن علی ئەحمەد"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">یوزەرنەیم (Username) *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="hemin (بە ئینگلیزی)"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">وشەی نهێنی یان PIN *</label>
                <div className="relative flex items-center">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="نموونە: 5566 یان وشەی نهێنی"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute left-3 text-slate-400 hover:text-white"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ژمارەی تەلەفۆن</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0750 000 0000"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                پەشیمانبوونەوە
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                پاشەکەوتکردنی کارمەند
              </button>
            </div>
          </form>
        )}

        {/* Employees Cards List */}
        <div className="space-y-3">
          {employees.map((emp) => {
            const isAdmin = emp.role === 'admin';
            const isActive = emp.status === 'active';

            return (
              <div 
                key={emp.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isAdmin 
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm' 
                    : isActive 
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' 
                    : 'bg-slate-950/30 border-rose-900/40 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 font-bold ${
                    isAdmin 
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                      : isActive 
                      ? 'bg-slate-800 text-slate-200' 
                      : 'bg-rose-950/40 text-rose-400'
                  }`}>
                    {isAdmin ? '👑' : '👤'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        isAdmin 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}>
                        {isAdmin ? 'سەرپەرشتیار (Admin)' : 'کارمەند (Agent)'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {isActive ? 'چالاک' : 'ناچالاک'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1 flex-wrap">
                      <span>یوزەر: <strong className="text-white">{emp.username}</strong></span>
                      <span>PIN: <strong className="text-amber-400 font-bold">{emp.pin}</strong></span>
                      {emp.phone && <span>📞 {emp.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handleCopyCredentials(emp)}
                    title="کۆپیکردنی زانیارییەکان بۆ ناردن بۆ کارمەند"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs flex items-center gap-1"
                  >
                    {copiedId === emp.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">کۆپی</span>
                  </button>

                  {!isAdmin && (
                    <>
                      <button
                        onClick={() => handleToggle(emp.id)}
                        title={isActive ? 'ناچالاککردنی هەژمار' : 'چالاککردنەوە'}
                        className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
                          isActive 
                            ? 'bg-amber-950/20 text-amber-400 border-amber-900/40 hover:bg-amber-900/30' 
                            : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/30'
                        }`}
                      >
                        {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isActive ? 'ناچالاککردن' : 'چالاککردن'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        title="سڕینەوەی ئەم کارمەندە"
                        className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-900/40 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>دەسەڵاتی کارمەندان: بەڕێوەبردنی موڵک و گرێبەستەکان بەبێ دەستگەیشتن بە ژمێریاری و ڕێکخستنەکان.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
          >
            داخستن
          </button>
        </div>

      </div>
    </div>
  );
};
