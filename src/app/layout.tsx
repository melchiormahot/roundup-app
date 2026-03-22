import type { Metadata, Viewport } from 'next';
import { ThemeProvider, ThemeScript } from '@/lib/theme';
import { ServiceWorkerRegistrar, InstallPrompt } from '@/lib/pwa';
import './globals.css';

export const metadata: Metadata = {
  title: 'RoundUp - Give effortlessly. Save on taxes.',
  description:
    'Round up your everyday purchases and donate the spare change to curated charities. Track your impact and save on taxes.',
  openGraph: {
    title: 'RoundUp - Give effortlessly. Save on taxes.',
    description:
      'Round up your everyday purchases and donate the spare change to curated charities.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RoundUp" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <ServiceWorkerRegistrar />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
