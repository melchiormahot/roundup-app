"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Heart, Receipt, Bell, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/charities", label: "Charities", icon: Heart },
  { href: "/tax", label: "Tax", icon: Receipt },
  { href: "/notifications", label: "Inbox", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy-800/80 backdrop-blur-xl border-t border-navy-600/50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const showDot = tab.href === "/notifications" && unreadCount > 0;

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                active ? "text-accent-blue" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {showDot && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-red rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
