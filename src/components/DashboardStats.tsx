'use client';

import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Wallet, 
  TrendingUp, 
  PlusCircle, 
  MapPin, 
  Layers, 
  ArrowUpRight,
  Sparkles,
  Repeat
} from 'lucide-react';
import { SystemStats, Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Language, translations } from '@/lib/i18n';

interface DashboardStatsProps {
  stats: SystemStats;
  properties: Property[];
  onOpenAddModal: () => void;
  onNavigateToMap: () => void;
  onNavigateToProperties: (filter?: string) => void;
  onNavigateToAccounting: () => void;
  lang?: Language;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  properties,
  onOpenAddModal,
  onNavigateToMap,
  onNavigateToProperties,
  onNavigateToAccounting,
  lang = 'ckb',
}) => {
  const t = translations[lang];

  const availablePercent = stats.totalProperties > 0 
    ? Math.round((stats.availableProperties / stats.totalProperties) * 100)
    : 0;

  // Breakdown by property type
  const typeCounts = properties.reduce((acc, p) => {
    acc[p.property_type] = (acc[p.property_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exchangeCount = properties.filter((p) => p.purpose === 'exchange').length;

  return (
    <div className="space-y-8">
      {/* Welcome & Agency Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-slate-900/90 to-amber-950/40 p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.agency_title}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {t.welcome_title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              {t.welcome_desc}
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenAddModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>{t.new_property}</span>
            </button>
            <button
              onClick={onNavigateToMap}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{t.map}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Properties */}
        <div 
          onClick={() => onNavigateToProperties()}
          className="cursor-pointer group p-6 rounded-2xl glass-card hover:border-amber-500/40 transition-all duration-300 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.total_properties}
            </span>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {stats.totalProperties}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{t.in_portfolio}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>{t.villa}: {typeCounts['villa'] || 0} | {t.apartment}: {typeCounts['apartment'] || 0}</span>
            <span className="text-amber-400 flex items-center gap-1 font-semibold group-hover:translate-x-[-2px] transition-transform">
              {t.view} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Available Properties */}
        <div 
          onClick={() => onNavigateToProperties('available')}
          className="cursor-pointer group p-6 rounded-2xl glass-card hover:border-emerald-500/40 transition-all duration-300 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.available_properties}
            </span>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">
              {stats.availableProperties}
            </span>
            <span className="text-xs text-emerald-400/80 font-semibold">({availablePercent}%)</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>{t.rented}: {stats.rentedProperties} | {t.sold}: {stats.soldProperties}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              {t.available} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Rental Income */}
        <div 
          onClick={() => onNavigateToAccounting()}
          className="cursor-pointer group p-6 rounded-2xl glass-card hover:border-blue-500/40 transition-all duration-300 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.rental_income}
            </span>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {formatPrice(stats.monthlyRentalIncomeUSD, 'USD')}
            </span>
            <span className="text-xs text-blue-400 font-semibold">{t.monthly}</span>
          </div>
          {stats.monthlyRentalIncomeIQD > 0 && (
            <p className="text-xs text-slate-400 font-mono mb-2">
              + {formatPrice(stats.monthlyRentalIncomeIQD, 'IQD')}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>{t.active_leases}</span>
            <span className="text-blue-400 flex items-center gap-1 font-semibold">
              {t.view} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Profit and Expenses */}
        <div 
          onClick={() => onNavigateToAccounting()}
          className="cursor-pointer group p-6 rounded-2xl glass-card hover:border-purple-500/40 transition-all duration-300 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.profit_and_expenses}
            </span>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-2xl sm:text-3xl font-black font-mono ${
              stats.netProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatPrice(stats.netProfitUSD, 'USD')}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{t.net_profit}</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            {t.total_expenses}: <span className="text-rose-400 font-mono">{formatPrice(stats.totalExpensesUSD, 'USD')}</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>{t.total_invested}: {formatPrice(stats.totalInvestmentValueUSD, 'USD')}</span>
            <span className="text-purple-400 flex items-center gap-1 font-semibold">
              {t.accounting} <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* Quick Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateToProperties()}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-center group"
        >
          <Layers className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-white">{t.all_properties}</span>
          <span className="text-xs text-slate-400">{stats.totalProperties} {t.properties}</span>
        </button>

        <button
          onClick={() => onNavigateToProperties('rent')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-center group"
        >
          <Wallet className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-white">{t.rental_properties}</span>
          <span className="text-xs text-slate-400">{t.active_leases}</span>
        </button>

        <button
          onClick={() => onNavigateToProperties('sale')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-center group"
        >
          <Building2 className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-white">{t.sale_properties}</span>
          <span className="text-xs text-slate-400">{t.contracts}</span>
        </button>

        <button
          onClick={() => onNavigateToProperties('exchange')}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-center group"
        >
          <Repeat className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-white">{t.exchange_properties}</span>
          <span className="text-xs text-indigo-400 font-bold">{exchangeCount} {t.properties}</span>
        </button>
      </div>
    </div>
  );
};
