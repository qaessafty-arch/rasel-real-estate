'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Calendar, 
  Phone, 
  User, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trash2, 
  X,
  Printer
} from 'lucide-react';
import { Contract, Property } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ContractsViewProps {
  contracts: Contract[];
  properties: Property[];
  onSaveContract: (contract: Contract) => void;
  onDeleteContract: (id: string) => void;
  onUpdatePropertyStatus: (propertyId: string, status: Property['status']) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  properties,
  onSaveContract,
  onDeleteContract,
  onUpdatePropertyStatus,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Contract>>({
    property_id: '',
    type: 'rent',
    client_name: '',
    client_phone: '',
    client_national_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    total_amount: 0,
    paid_amount: 0,
    currency: 'USD',
    payment_cycle: 'monthly',
    status: 'active',
    notes: '',
  });

  const totalContractValue = contracts.reduce((acc, c) => acc + Number(c.total_amount), 0);
  const totalPaidValue = contracts.reduce((acc, c) => acc + Number(c.paid_amount), 0);
  const remainingValue = totalContractValue - totalPaidValue;

  const handleOpenAdd = () => {
    setFormData({
      property_id: properties[0]?.id || '',
      type: 'rent',
      client_name: '',
      client_phone: '',
      client_national_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      total_amount: 1000,
      paid_amount: 1000,
      currency: 'USD',
      payment_cycle: 'monthly',
      status: 'active',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.property_id || !formData.client_name || !formData.total_amount) {
      alert('تکایە هەموو خانە سەرەکییەکان پڕبکەرەوە!');
      return;
    }

    const matchedProp = properties.find((p) => p.id === formData.property_id);

    const newContract: Contract = {
      id: `cnt-${Date.now()}`,
      property_id: formData.property_id,
      property_code: matchedProp?.property_code || 'RSL',
      property_title: matchedProp?.title || 'موڵک',
      type: (formData.type as 'rent' | 'sale') || 'rent',
      client_name: formData.client_name,
      client_phone: formData.client_phone || '',
      client_national_id: formData.client_national_id || '',
      start_date: formData.start_date || new Date().toISOString().split('T')[0],
      end_date: formData.end_date || null,
      total_amount: Number(formData.total_amount),
      paid_amount: Number(formData.paid_amount) || 0,
      currency: formData.currency || 'USD',
      payment_cycle: formData.payment_cycle as any,
      status: (formData.status as any) || 'active',
      notes: formData.notes || '',
      created_at: new Date().toISOString(),
    };

    onSaveContract(newContract);

    // Auto-update property status
    if (newContract.type === 'rent') {
      onUpdatePropertyStatus(newContract.property_id, 'rented');
    } else if (newContract.type === 'sale') {
      onUpdatePropertyStatus(newContract.property_id, 'sold');
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>بەڕێوەبردنی گرێبەست، فرۆشتن و کرێ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تۆمارکردنی زانیاری کڕیاران و کرێچییەکان، پارەی وەرگیراو و ماوەی گرێبەستەکان
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>گرێبەستی نوێ</span>
        </button>
      </div>

      {/* Contract Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">کۆی بەهای گرێبەستەکان</span>
          <span className="text-xl font-black text-white font-mono">{formatPrice(totalContractValue, 'USD')}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">پارەی وەرگیراو (قەبزکراو)</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{formatPrice(totalPaidValue, 'USD')}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">پارەی ماوە (قیست یان کرێی ماوە)</span>
          <span className="text-xl font-black text-amber-400 font-mono">{formatPrice(remainingValue, 'USD')}</span>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900/90 text-xs font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">موڵک</th>
                <th className="p-4">جۆر</th>
                <th className="p-4">کڕیار / کرێچی</th>
                <th className="p-4">مۆبایل</th>
                <th className="p-4">بەروار</th>
                <th className="p-4">کۆی پارە</th>
                <th className="p-4">وەرگیراو</th>
                <th className="p-4">ماوە</th>
                <th className="p-4 text-center">کردارەکان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    هیچ گرێبەستێک تۆمار نەکراوە. دوگمەی &quot;گرێبەستی نوێ&quot; دابگرە بۆ تۆمارکردن.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => {
                  const remaining = Number(c.total_amount) - Number(c.paid_amount);
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{c.property_title}</div>
                        <span className="text-[11px] font-mono text-amber-400">{c.property_code}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          c.type === 'rent' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {c.type === 'rent' ? 'کرێ' : 'فرۆشتن'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-white">{c.client_name}</td>
                      <td className="p-4 font-mono text-xs">{c.client_phone || '—'}</td>
                      <td className="p-4 text-xs font-mono">
                        <div>دەستپێک: {c.start_date}</div>
                        {c.end_date && <div className="text-slate-500">کۆتایی: {c.end_date}</div>}
                      </td>
                      <td className="p-4 font-mono font-bold text-white">
                        {formatPrice(c.total_amount, c.currency)}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {formatPrice(c.paid_amount, c.currency)}
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">
                        {remaining > 0 ? formatPrice(remaining, c.currency) : 'تەواو'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              if (confirm('دڵنیایت لە سڕینەوەی ئەم گرێبەستە؟')) {
                                onDeleteContract(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
                            title="سڕینەوە"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contract Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700 shadow-2xl bg-slate-900 text-right p-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>تۆمارکردنی گرێبەستی نوێ</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">موڵک هەڵبژێرە *</label>
                <select
                  value={formData.property_id}
                  onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                  required
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.property_code} - {p.title} ({formatPrice(p.price, p.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">جۆری گرێبەست</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                  >
                    <option value="rent">گرێبەستی کرێ</option>
                    <option value="sale">گرێبەستی فرۆشتن</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">دراو</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                  >
                    <option value="USD">دۆلار ($ USD)</option>
                    <option value="IQD">دیناری عێراقی (IQD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ناوی کڕیار یان کرێچی *</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="نموونە: هێمن عەلی محەمەد"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ژمارەی مۆبایل</label>
                  <input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    placeholder="0750xxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">کۆی بڕی پارەی گرێبەست *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.total_amount || ''}
                    onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">پارەی وەرگیراو ئێستا</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paid_amount || ''}
                    onChange={(e) => setFormData({ ...formData, paid_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">بەرواری دەستپێک</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">بەرواری کۆتایی</label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">تێبینییەکان</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="مەرجی پارەدان، بارمتە، وەسیقە..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm"
                >
                  پاشەکەوتکردنی گرێبەست
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
