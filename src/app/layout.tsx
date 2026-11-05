import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Golino HQ | کنسول فرماندهی مدیرعامل',
  description: 'اتاق کنترل هوشمند ایجنت‌ها و دپارتمان‌های پلتفرم گلینو',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0f17',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-[#0b0f17] text-slate-100 pb-20">
        <Navigation />
        <main className="max-w-5xl mx-auto px-4 py-5">{children}</main>
      </body>
    </html>
  );
}
