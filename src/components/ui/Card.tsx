"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: "green" | "blue" | "purple";
  delay?: number;
}

export function Card({ children, className = "", onClick, glow, delay = 0 }: CardProps) {
  const glowClass = glow ? `glow-${glow}` : "";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={onClick}
      className={`bg-navy-700 border border-navy-600 rounded-[16px] p-5 ${glowClass} ${
        onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
