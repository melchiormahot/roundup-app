import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoundUp",
  description: "Give effortlessly. Save on taxes.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-navy-900 text-text-primary">
        {children}
      </body>
    </html>
  );
}
