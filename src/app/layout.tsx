import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerReg";

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
  themeColor: "#0b1628",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-navy-900 text-text-primary overscroll-none">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
