import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nashvillehouse.site'),
  title: 'Nashville House | کۆمپانیای نەشڤیل هاوس بۆ خانووبەرە و وەبەرهێنان',
  description: 'سیستەمی پیشەیی نەشڤیل هاوس بۆ بەڕێوەبردن و تۆمارکردنی ڕۆژانەی موڵک، خانوو، شوقە، ڤیلا، زەوی و وەبەرهێنان لە هەرێمی کوردستان',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Nashville House | کۆمپانیای نەشڤیل هاوس',
    description: 'کۆمپانیای نەشڤیل هاوس بۆ کڕین، فرۆشتن و بەکرێدانی موڵک و زەوی',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'Nashville House Real Estate Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ckb" dir="rtl" data-theme="minimalism" className="dark bg-[#0b0d10]" style={{ colorScheme: 'dark', backgroundColor: '#0b0d10' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0b0d10" />
        {/* Preload Google Fonts for Kurdish Sorani Typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-900 overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
