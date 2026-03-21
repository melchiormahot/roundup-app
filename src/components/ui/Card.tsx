"use client";

import { motion } from "framer-motion";
import { ReactNode, KeyboardEvent } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: "green" | "blue" | "purple";
  delay?: number;
}

export function Card({ children, className = "", onClick, glow, delay = 0 }: CardProps) {
  const glowClass = glow ? `glow-${glow}` : "";
  const interactive = !!onClick;

  function handleKeyDown(e: KeyboardEvent) {
    if (interactive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={`bg-navy-700 rounded-[16px] p-5 ${glowClass} ${
        interactive ? "cursor-pointer active:scale-[0.98] transition-transform" : ""
      } ${className}`}
      style={{ border: "var(--t-card-border)", boxShadow: "var(--t-card-shadow)" }}
    >
      {children}
    </motion.div>
  );
}
