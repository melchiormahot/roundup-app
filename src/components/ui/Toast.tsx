"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: "text-accent-green",
  error: "text-accent-red",
  info: "text-accent-blue",
};

export function Toast() {
  const { message, type, hideToast } = useToastStore();
  const Icon = icons[type];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={hideToast}
          className="fixed top-4 left-4 right-4 z-50 bg-navy-700 border border-navy-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg cursor-pointer"
        >
          <Icon className={`w-5 h-5 ${colors[type]} shrink-0`} />
          <span className="text-text-primary text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
