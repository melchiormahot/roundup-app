"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "green" | "blue" | "purple" | "red" | "yellow" | "orange";
  className?: string;
}

const variantStyles = {
  green: "bg-accent-green/15 text-accent-green",
  blue: "bg-accent-blue/15 text-accent-blue",
  purple: "bg-accent-purple/15 text-accent-purple",
  red: "bg-accent-red/15 text-accent-red",
  yellow: "bg-accent-yellow/15 text-accent-yellow",
  orange: "bg-accent-orange/15 text-accent-orange",
};

export function Badge({ children, variant = "blue", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-[20px] text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
