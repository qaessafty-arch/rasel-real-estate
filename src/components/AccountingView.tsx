'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Wallet, 
  Trash2, 
  X, 
  Calendar, 
  Tag,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  Filter
} from 'lucide-react';
import { FinancialTransaction, Property, TransactionType, TransactionCategory } from '@/types';
import { formatPrice } from '@/lib/utils';

interface AccountingViewProps {
  transactions: FinancialTransaction[];
  properties: Property[];
  onSaveTransaction: (tx: FinancialTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  transactions,
  properties,
  onSaveTransaction,
  onDeleteTransaction,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // New transaction form
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    property_id: '',
    type: 'income',
    category: 'rent_collected',
    amount: 500,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    payer_or_payee: '',
    receipt_number: `REC-${Date.now().toString().slice(-4)}`,
  });

  // Calculate totals
  const totalIncomeUSD = transactions
    .filter((t) => t.type === 'income' && t.currency === 'USD')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpenseUSD = transactions
    .filter((t) => t.type === 'expense' && t.currency === 'USD')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netProfitUSD = totalIncomeUSD - totalExpenseUSD;

  // Filtered list
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const getCategoryLabel = (cat: TransactionCategory) => {
    const map: Record<TransactionCategory, string> = {
      rent_collected: 'کرێی وەرگیراو',
      sale_commission: 'کۆمیسیۆنی فرۆشتن',
      maintenance: 'چاککردنەوە و نۆژەنکردنەوە',
      utility_fee: 'ئاو و کارەبا و خزمەتگوزاری',
      renovation: 'دەستکاری و کەرەستە',
      legal_tax: 'باج و تێچووی یاسایی/دادنووس',
      marketing: 'ڕیکلام و پەرەپێدان',
      other: 'خەرجی یان داهاتی تر',
    };
    return map[cat] || cat;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert('تکایە ناونیشان و بڕی پارە دیاریبکە!');
      return;
    }

    const matchedProp = properties.find((p) => p.id === formData.property_id);

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      property_id: formData.property_id || null,
      property_code: matchedProp?.property_code || null,
      property_title: matchedProp?.title || null,
      type: (formData.type as TransactionType) || 'income',
      category: (formData.category as TransactionCategory) || 'other',
      amount: Number(formData.amount),
      currency: formData.currency || 'USD',
      date: formData.date || new Date().toISOString().split('T')[0],
      title: formData.title,
      description: formData.description || '',
      payer_or_payee: formData.payer_or_payee || '',
      receipt_number: formData.receipt_number || `REC-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };

    onSaveTransaction(newTx);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span>ژمێریاری و شیکاری وەبەرهێنان</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تۆمارکردنی داهات، خەرجییەکان، چاککردنەوەی موڵک و بەدواداچوونی قازانجی پوخت
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              property_id: properties[0]?.id || '',
              type: 'income',
              category: 'rent_collected',
              amount: 500,
              currency: 'USD',
              date: new Date().toISOString().split('T')[0],
              title: '',
              description: '',
              payer_or_payee: '',
              receipt_number: `REC-${Date.now().toString().slice(-4)}`,
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>تۆمارکردنی داهات / خەرجی</span>
        </button>
      </div>

      {/* 3 Main Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Income */}
        <div className="p-6 rounded-2xl glass-card border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">کۆی داهات (Income)</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mb-1">
            {formatPrice(totalIncomeUSD, 'USD')}
          </div>
          <span className="text-xs text-slate-400">کرێ، کۆمیسیۆنی فرۆشتن و داهاتەکان</span>
        </div>

        {/* Total Expenses */}
        <div className="p-6 rounded-2xl glass-card border-rose-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">کۆی خەرجییەکان (Expenses)</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mb-1">
            {formatPrice(totalExpenseUSD, 'USD')}
          </div>
          <span className="text-xs text-slate-400">چاککردنەوە، نۆژەنکردنەوە، باج، ڕیکلام</span>
        </div>

        {/* Net Profit */}
        <div className="p-6 rounded-2xl glass-card border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">قازانجی پوخت (Net Profit)</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono mb-1 ${
            netProfitUSD >= 0 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {formatPrice(netProfitUSD, 'USD')}
          </div>
          <span className="text-xs text-slate-400">داهاتی ماوە دوای کەمکردنەوەی هەموو تێچووەکان</span>
        </div>

      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            هەموو جوڵەکان ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'income' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            تەنها داهات
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterType === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            تەنها خەرجی
          </button>
        </div>

        <span className="text-xs text-slate-400">
          پیشاندانی {filteredTransactions.length} لە کۆی {transactions.length}
        </span>
      </div>

      {/* Transactions Ledger Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/90 text-xs font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">جۆر</th>
                <th className="p-4">ناونیشان و وەسف</th>
                <th className="p-4">پۆلێن (کاتیگۆری)</th>
                <th className="p-4">موڵکی پەیوەندیدار</th>
                <th className="p-4">بەروار</th>
                <th className="p-4">بڕی پارە</th>
                <th className="p-4 text-center">سڕینەوە</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    هیچ داتایەکی ژمێریاری لەم بەشەدا نییە.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      {tx.type === 'income' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>داهات</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>خەرجی</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{tx.title}</div>
                      {tx.description && <div className="text-xs text-slate-400 mt-0.5">{tx.description}</div>}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60">
                        {getCategoryLabel(tx.category)}
                      </span>
                    </td>
                    <td className="p-4">
                      {tx.property_title ? (
                        <div>
                          <div className="text-xs font-bold text-slate-200">{tx.property_title}</div>
                          <span className="text-[10px] font-mono text-amber-400">{tx.property_code}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">گشتی نوسینگە</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs">{tx.date}</td>
                    <td className="p-4 font-mono font-bold text-base">
                      <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                        {tx.type === 'income' ? '+' : '-'} {formatPrice(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm('دڵنیایت لە سڕینەوەی ئەم تۆمارە داراییە؟')) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700 shadow-2xl bg-slate-900 text-right p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span>تۆمارکردنی داهات یان خەرجی نوێ</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">جۆری جوڵە *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                  >
                    <option value="income">داهات (وەرگیراو)</option>
                    <option value="expense">خەرجی (دراو)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">پۆلێن (کاتیگۆری)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                  >
                    <option value="rent_collected">کرێی وەرگیراو</option>
                    <option value="sale_commission">کۆمیسیۆنی فرۆشتن</option>
                    <option value="maintenance">چاککردنەوە و نۆژەنکردنەوە</option>
                    <option value="utility_fee">ئاو و کارەبا و خزمەتگوزاری</option>
                    <option value="renovation">کەرەستە و بۆیاخ</option>
                    <option value="legal_tax">باج و گرێبەستی یاسایی</option>
                    <option value="marketing">ڕیکلام و سپۆنسەر</option>
                    <option value="other">تر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ناونیشانی تۆمار *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="نموونە: چاککردنەوەی پەمپی ئاو لە ڤیلای گوندی ئیتاڵی"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">بڕی پارە *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">دراو</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                  >
                    <option value="USD">دۆلاری ئەمریکی ($ USD)</option>
                    <option value="IQD">دیناری عێراقی (IQD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">موڵکی پەیوەندیدار</label>
                  <select
                    value={formData.property_id || ''}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                  >
                    <option value="">گشتی (بە هیچ موڵکێکەوە نەبەستراوە)</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.property_code} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">بەروار</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">وەسف و ڕوونکردنەوە</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وەسفی پارەکە، ژمارەی پسوولە..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm"
                >
                  پاشەکەوتکردن
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm"
                >
                  داخستن
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
