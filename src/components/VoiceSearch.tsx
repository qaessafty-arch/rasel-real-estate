'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface VoiceSearchProps {
  onSearch: (text: string) => void;
  lang: Language;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearch, lang }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const t = translations[lang] as any;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(lang === 'en' ? 'Voice search is not supported in this browser. Please use Chrome/Edge.' : 'گەڕان بە دەنگ لەم وێبگەڕەدا پشتگیری نەکراوە. تکایە Chrome یان Edge بەکاربهێنە.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select speech language
      if (lang === 'en') {
        recognition.lang = 'en-US';
      } else if (lang === 'ar') {
        recognition.lang = 'ar-IQ';
      } else {
        // Kurdish / Arabic dialect
        recognition.lang = 'ckb';
        recognition.fallback = 'ar-IQ';
      }

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onSearch(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition exception:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={startListening}
        title={t.voice_search}
        className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all ${
          isListening
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40'
        }`}
      >
        {isListening ? (
          <MicOff className="w-4 h-4 animate-bounce" />
        ) : (
          <div className="relative">
            <Mic className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Floating listening indicator popup */}
      {isListening && (
        <div className="absolute top-12 left-0 sm:left-auto sm:right-0 z-30 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 shadow-xl text-xs text-amber-300 font-bold whitespace-nowrap flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{t.voice_listening}</span>
        </div>
      )}
    </div>
  );
};
