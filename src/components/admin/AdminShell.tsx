"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Funnel, DollarSign, Heart, Receipt,
  Bell, Mail, Zap, ArrowLeft, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/onboarding", label: "Onboarding", icon: Funnel },
  { href: "/admin/donations", label: "Donations", icon: DollarSign },
  { href: "/admin/charities", label: "Charities", icon: Heart },
  { href: "/admin/tax", label: "Tax", icon: Receipt },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/early-access", label: "Early Access", icon: Mail },
  { href: "/admin/simulation", label: "Simulation", icon: Zap },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-navy-800 border-r border-[#1f4070] shrink-0">
        <div className="p-4 border-b border-[#1f4070]">
          <p className="text-text-primary font-bold">💚 RoundUp Admin</p>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  active ? "bg-accent-blue/10 text-accent-blue font-semibold" : "text-text-secondary hover:text-text-primary hover:bg-navy-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#1f4070]">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-text-secondary text-sm hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-navy-800/95 backdrop-blur-xl border-b border-[#1f4070]">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-text-primary font-bold text-sm">💚 Admin</p>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-text-secondary">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {sidebarOpen && (
          <div className="px-4 pb-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    active ? "bg-accent-blue/10 text-accent-blue font-semibold" : "text-text-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
            <button onClick={() => router.push("/dashboard")} className="w-full flex items-center gap-3 px-3 py-2 text-text-secondary text-sm border-t border-[#1f4070] mt-2 pt-3">
              <ArrowLeft className="w-4 h-4" /> Back to App
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden md:overflow-y-auto">
        <div className="pt-14 md:pt-0 px-4 md:px-6 py-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
