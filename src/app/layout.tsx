import type { Metadata, Viewport } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0E7C66',
};

export const metadata: Metadata = {
  title: 'FormBridge GP',
  description:
    'AI-powered medical form automation for Australian GP clinics. Dictate clinical info, get completed government forms.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'FormBridge GP',
    description:
      'AI-powered medical form automation for Australian GP clinics. Dictate clinical info, get completed government forms.',
    siteName: 'FormBridge GP',
    type: 'website',
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FormBridge GP',
    description:
      'AI-powered medical form automation for Australian GP clinics. Dictate clinical info, get completed government forms.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${plusJakarta.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
