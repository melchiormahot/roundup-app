import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerReg";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "RoundUp",
  description: "Give effortlessly. Save on taxes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RoundUp",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-152.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1628" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

// Blocking script to prevent flash of wrong theme
const themeScript = `(function(){try{var t=localStorage.getItem('roundup_theme')||'dark';if(t==='system'){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-navy-900 text-text-primary overscroll-none">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
