import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RASEL Real Estate | کۆمپانیای ڕاسێل بۆ خانووبەرە و وەبەرهێنان',
  description: 'سیستەمی پیشەیی بەڕێوەبردن و تۆمارکردنی ڕۆژانەی موڵک، خانوو، شوقە، ڤیلا، زەوی و وەبەرهێنان لە هەرێمی کوردستان',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ckb" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* Preload Google Fonts for Kurdish Sorani Typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&family=Cairo:wght@400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800;900&family=Vazirmatn:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
