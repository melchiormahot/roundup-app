import type { Metadata, Viewport } from 'next';
import { ThemeProvider, ThemeScript } from '@/lib/theme';
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
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
