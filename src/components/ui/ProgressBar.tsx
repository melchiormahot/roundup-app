"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: "green" | "blue" | "purple";
  glow?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const colorStyles = {
  green: "bg-accent-green",
  blue: "bg-accent-blue",
  purple: "bg-accent-purple",
};

const glowStyles = {
  green: "shadow-[0_0_12px_rgba(92,224,184,0.4)]",
  blue: "shadow-[0_0_12px_rgba(74,158,255,0.4)]",
  purple: "shadow-[0_0_12px_rgba(180,142,255,0.4)]",
};

export function ProgressBar({
  value,
  max,
  color = "green",
  glow = false,
  label,
  showValue = true,
  className = "",
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2 text-sm">
          {label && <span className="text-text-secondary">{label}</span>}
          {showValue && (
            <span className="text-text-primary font-medium">
              €{value.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} / €{max.toLocaleString("fr-FR")}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 bg-navy-600 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorStyles[color]} ${glow ? glowStyles[color] : ""}`}
        />
      </div>
    </div>
  );
}
