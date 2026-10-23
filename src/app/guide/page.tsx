'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ArrowRight, 
  Printer, 
  KeyRound, 
  PlusCircle, 
  MapPin, 
  Edit3, 
  Trash2, 
  Layers, 
  RotateCcw, 
  Users, 
  FileText, 
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function GuidePage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0b0d10] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 print:bg-white print:text-black">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>گەڕانەوە بۆ ماڵپەڕی نەشڤیل هاوس</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all active:scale-95"
              title="چاپکردن یان پاشەکەوتکردن وەک PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپکردن / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Title Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto border border-amber-500/40 shadow-lg bg-slate-950 flex items-center justify-center">
            <img src="/logo.png" alt="Nashville House" className="w-full h-full object-cover scale-105" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white">
            ڕێبەری فەرمی بەکارهێنانی نەشڤیل هاوس
          </h1>
          <p className="text-xs sm:text-sm text-amber-400 font-medium">
            (Nashville House Real Estate — Operator Manual)
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            ڕێبەرێکی ئاسان و ڕوون بۆ ستاف، برۆکەران و بەڕێوەبەر بۆ چۆنیەتی زیادکردن، سڕینەوە، هەڵبژاردن و بەڕێوەبردنی موڵکەکان.
          </p>
        </div>

        {/* Quick Summary Table */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>کورتەی سەرەکی هەموو کردارەکان</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">کردار</th>
                  <th className="p-2.5">لە کوێیە؟</th>
                  <th className="p-2.5">کێ دەتوانێت بیکات؟</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">چوونەژوورەوە</td>
                  <td className="p-2.5">دوگمەی «بەشی ستاف» لە سەرەوە</td>
                  <td className="p-2.5">ئەدمین (<code className="text-amber-300">Ibo0909</code>) یان کارمەند (<code className="text-sky-300">1122, 3344</code>)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">زیادکردنی موڵک</td>
                  <td className="p-2.5">دوگمەی زەردی «+ موڵکی نوێ»</td>
                  <td className="p-2.5">هەم ئەدمین، هەم کارمەند</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">دەستکاری موڵک</td>
                  <td className="p-2.5">ئایکۆنی قەڵەم ✏️ لەسەر کارتەکە</td>
                  <td className="p-2.5">هەم ئەدمین، هەم کارمەند</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-rose-400">سڕینەوەی موڵک</td>
                  <td className="p-2.5">ئایکۆنی سەتڵی خۆڵ 🗑️ لەسەر کارتەکە</td>
                  <td className="p-2.5 font-bold text-rose-300">تەنها ئەدمین</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">دیاریکردنی نەخشە</td>
                  <td className="p-2.5">کلیک لەسەر نەخشەکە لە کاتی زیادکردن</td>
                  <td className="p-2.5">هەم ئەدمین، هەم کارمەند</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">هەڵبژاردنی بەشەکان</td>
                  <td className="p-2.5">دوگمەکانی نیشتەجێبوون، زەوی، بازرگانی</td>
                  <td className="p-2.5">هەموو کەسێک تەنانەت کڕیاریش</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-rose-400">سفرکردنەوە (Reset)</td>
                  <td className="p-2.5">دوگمەی سووری «سفرکردنەوە بۆ کڕیار»</td>
                  <td className="p-2.5 font-bold text-rose-300">تەنها ئەدمین</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-400">بەڕێوەبردنی ستاف</td>
                  <td className="p-2.5">دوگمەی شینی «کارمەندان»</td>
                  <td className="p-2.5 font-bold text-amber-300">تەنها ئەدمین</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-rose-400">دەرچوون (Logout)</td>
                  <td className="p-2.5">دوگمەی سووری «دەرچوون»</td>
                  <td className="p-2.5">هەم ئەدمین، هەم کارمەند</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 1: Login */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <KeyRound className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">١. چۆن دەچیتە ژوورەوە؟ (Login)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            کڕیاری ئاسایی پێویستی بە وشەی نهێنی نییە و ڕاستەوخۆ دەتوانێت موڵکەکان ببینێت. بەڵام بۆ ئەوەی دەسەڵاتی زیادکردن و دەستکاریت هەبێت:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 pr-1">
            <li>لە سەرەوەی ماڵپەڕ، کلیک لەسەر دوگمەی <strong className="text-amber-400">«بەشی ستاف»</strong> بکە.</li>
            <li>پەنجەرەیەکی ڕەش دەکرێتەوە کە تەنها خانەی وشەی نهێنی تێدایە.</li>
            <li>وشەی نهێنی بنووسە:
              <div className="mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                <div>👑 بۆ ئەدمین (بەڕێوەبەر): <span className="text-amber-400 font-bold">Ibo0909</span></div>
                <div>👤 بۆ کارمەند ١ (ئاراس): <span className="text-sky-400 font-bold">1122</span></div>
                <div>👤 بۆ کارمەند ٢ (سارا): <span className="text-sky-400 font-bold">3344</span></div>
              </div>
            </li>
            <li>کلیک لە دوگمەی زەردی <strong className="text-amber-400">«چوونەژوورەوە»</strong> بکە. دەستبەجێ دەسەڵاتەکانت چالاک دەبن.</li>
          </ol>
        </section>

        {/* Section 2: Add Property */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <PlusCircle className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">٢. چۆن موڵکی نوێ زیاد دەکەیت؟ (Add Property)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            دوای چوونەژوورەوە، دوگمەیەکی زەردی گەورە لە سەرەوە دەردەکەوێت بە ناوی <strong className="text-amber-400">«+ موڵکی نوێ»</strong>. کلیکی لێ بکە و ئەم هەنگاوانە پڕبکەرەوە:
          </p>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside pr-1">
            <li><strong className="text-white">ناوی موڵک</strong>: بۆ نموونە «خانووی مۆدێرن لە گوندی ئەڵمانی».</li>
            <li><strong className="text-white">مەبەست</strong>: دیاری بکە (فرۆشتن، کرێ، یان ئاڵوگۆڕ).</li>
            <li><strong className="text-white">جۆری موڵک</strong>: هەڵبژێرە (خانوو، شوقە، زەوی، دووکان...).</li>
            <li><strong className="text-white">ڕووبەر</strong>: ئەگەر خانوو یان شوقەیە بە مەتری چوارگۆشە بنووسە. ئەگەر زەوییە، ڕاستەوخۆ چەند دۆنم و چەند ئۆڵک دیاری بکە.</li>
            <li><strong className="text-white">دیاریکردنی نەخشە</strong>: شار هەڵبژێرە (هەولێر، سلێمانی، دهۆک...)، پاشان لەسەر نەخشەکە بە پەنجە یان بە ماوس کلیک لەو شوێنە بکە کە موڵکەکەی لێیە تا نیشانە زەردەکە بچێتە سەر شوێنەکە.</li>
            <li><strong className="text-white">زانیاری نهێنی خاوەن موڵک</strong>: ناوی خاوەن موڵک و ژمارەی مۆبایلەکەی بنووسە. (⚠️ ئەم ژمارەیە کڕیاری دەرەوە نایبینێت، تەنها تۆ و ستاف دەیبینن).</li>
            <li><strong className="text-white">وێنەکان</strong>: وێنەی موڵکەکە دابنێ.</li>
            <li>کلیک لە دوگمەی زەردی <strong className="text-amber-400">«پاشەکەوتکردن»</strong> بکە. موڵکەکە ڕاستەوخۆ لەسەر ماڵپەڕ بڵاودەبێتەوە.</li>
          </ul>
        </section>

        {/* Section 3: Edit and Delete */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Edit3 className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">٣. چۆن دەستکاری و سڕینەوە دەکەیت؟ (Edit & Delete)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            لەسەر هەموو کارتێکی موڵک لە گۆشەی خوارەوە دوو دوگمە هەیە:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Edit3 className="w-4 h-4" />
                <span>دەستکاریکردن (Edit)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                ئایکۆنی قەڵەمەکە دابگرە. دەتوانیت نرخ بگۆڕیت، وێنەی نوێ دابنێیت، یان ناونیشانەکەی نوێ بکەیتەوە. هەم کارمەند و هەم ئەدمین دەتوانن دەستکاری بکەن.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-400">
                <Trash2 className="w-4 h-4" />
                <span>سڕینەوە (Delete)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                ئایکۆنی سەتڵی خۆڵ دابگرە. <strong>تەنها بۆ ئەدمین (<code className="text-amber-300">Ibo0909</code>) دەردەکەوێت!</strong> کارمەند و کڕیار بە هیچ شێوەیەک ناتوانن موڵک بسڕنەوە.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Selection and Categories */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Layers className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">٤. چۆن بەشەکان هەڵدەبژێریت؟ (Categories & Divisions)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            لە سەرەوە چوار دوگمەی گەورە هەیە بۆ جیاکردنەوەی خێرای موڵکەکان:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center font-bold">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-sky-400">
              🏡 نیشتەجێبوون
              <div className="text-[10px] text-slate-500 font-normal mt-1">خانوو، ڤێلا، شوقە</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
              🌾 زەوی و باخچە
              <div className="text-[10px] text-slate-500 font-normal mt-1">کشتوکاڵی، نیشتەجێبوون، باخ</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-400">
              🏬 شوێنی بازرگانی
              <div className="text-[10px] text-slate-500 font-normal mt-1">دووکان، ئۆفیس، باڵەخانە</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-rose-400">
              🏗️ پڕۆژە نوێیەکان
              <div className="text-[10px] text-slate-500 font-normal mt-1">تاوەر و پڕۆژەکان</div>
            </div>
          </div>
        </section>

        {/* Section 5: Reset Data */}
        <section className="p-5 sm:p-6 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400">
            <RotateCcw className="w-5 h-5" />
            <h2 className="text-base font-bold text-rose-300">٥. چۆن هەموو داتاکان سفر (Reset) دەکەیتەوە بۆ کڕیار؟</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ئەگەر ویستت ماڵپەڕەکە لە هەموو موڵک و گرێبەستە تاقیکارییەکان پاک بکەیتەوە تا بە تەواوی خاوێن و سپی ڕادەستی کڕیاری بکەیت:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-800/60 space-y-2 text-xs">
            <div className="font-bold text-amber-400">🔒 ئەم دوگمەیە تەنها بۆ ئەدمین دەردەکەوێت:</div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pr-1">
              <li>بە وشەی نهێنی <code className="text-amber-300">Ibo0909</code> بچۆ ژوورەوە.</li>
              <li>لە شریتە ڕەشەکەی ستاف لە سەرەوە، دوگمەیەکی سوور دەبینیت بە ناوی <strong className="text-rose-400">«سفرکردنەوە بۆ کڕیار»</strong>.</li>
              <li>کلیکی لێ بکە، پەیامێکی دڵنیابوونەوە دەردەکەوێت، کلیک لەسەر <strong className="text-rose-400">«بەڵێ، هەموو داتاکان بسڕەوە»</strong> بکە.</li>
              <li>دەستبەجێ هەموو داتاکان پاک دەبنەوە و سیستەمەکە سپی دەبێتەوە.</li>
            </ol>
          </div>
        </section>

        {/* Section 6: Manage Employees */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Users className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">٦. چۆن کارمەند زیاد و کەم دەکەیت؟ (Employees)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            بەڕێوەبەری سەرەکی دەتوانێت لە شریتی ستاف کلیک لە دوگمەی شینی <strong className="text-sky-400">«کارمەندان»</strong> بکات:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside pr-1">
            <li><strong className="text-white">بۆ زیادکردنی کارمەند</strong>: ناوی بنووسە، ژمارەی تەلەفۆنەکەی، و PINی ٤ ژمارەیی بۆ دانێ، پاشان پاشەکەوتی بکە.</li>
            <li><strong className="text-white">بۆ سڕینەوە</strong>: تەنیشت ناوی کارمەندەکە کلیک لە سەتڵی خۆڵ 🗑️ بکە.</li>
            <li><strong className="text-white">بۆ ڕاگرتنی کاتی</strong>: دەتوانیت دوگمەی سەوزەکە بکەیت بە خۆڵەمێشی تا بۆ ماوەیەک نەتوانێت بچێتە ژوورەوە.</li>
          </ul>
        </section>

        {/* Section 7: Logout */}
        <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400">
            <LogOut className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">٧. چۆن لە هەژمار دێیتە دەرەوە؟ (Logout)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            لە هەر شوێنێک بیت، لە تەنیشت ناوی هەژمارەکەت لە سەرەوە، یان لەناو شریتی ستاف، یان لە مێنۆی مۆبایل، کلیک لە دوگمەی سووری <strong className="text-rose-400">«دەرچوون (Logout)»</strong> بکە. دەستبەجێ پەڕەکە دادەخرێتەوە و دەبێتەوە بە میوانی ئاسایی.
          </p>
        </section>

        {/* Bottom Back Button */}
        <div className="pt-4 text-center print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>گەڕانەوە بۆ پەڕەی سەرەکی ماڵپەڕ</span>
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Nashville House" className="w-5 h-5 rounded-md object-cover" />
            <span className="font-bold text-slate-400">نەشڤیل هاوس (Nashville House)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            developed by <strong className="text-amber-400">null-tech</strong>
          </div>
        </div>
      </footer>

    </div>
  );
}
