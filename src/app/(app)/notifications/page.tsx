"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const typeDots: Record<string, string> = {
  weekly: "bg-accent-blue",
  monthly: "bg-accent-green",
  crisis: "bg-accent-red",
  charity_update: "bg-accent-purple",
  milestone: "bg-accent-yellow",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(console.error);
  }, []);

  function markRead(id: string) {
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Inbox</h1>
        <p className="text-text-secondary text-sm mt-1">Your activity and updates</p>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              onClick={() => !notif.read && markRead(notif.id)}
              className={notif.read ? "opacity-60" : ""}
            >
              <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${typeDots[notif.type] || "bg-navy-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-text-primary text-sm font-semibold">{notif.title}</h3>
                    <span className="text-text-secondary text-xs whitespace-nowrap shrink-0">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed">{notif.body}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-secondary">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
