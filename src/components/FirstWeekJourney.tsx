"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface JourneyStep {
  day: number;
  label: string;
  completed: boolean;
}

export function FirstWeekJourney({ dayCount, hasRoundups }: { dayCount: number; hasRoundups: boolean }) {
  if (dayCount > 7) return null; // Only show for first week

  const steps: JourneyStep[] = [
    { day: 1, label: "Signed up", completed: true },
    { day: 2, label: "First round up", completed: dayCount >= 1 && hasRoundups },
    { day: 3, label: "First impact", completed: dayCount >= 2 },
    { day: 5, label: "Charity update", completed: dayCount >= 4 },
    { day: 7, label: "Weekly summary", completed: dayCount >= 7 },
  ];

  return (
    <div className="bg-navy-700 border border-[#1f4070] rounded-[16px] p-4 mb-4">
      <p className="text-text-primary text-xs font-bold mb-3">YOUR FIRST WEEK</p>
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: step.completed ? 1 : 0.8 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step.completed
                  ? "bg-accent-green text-navy-900"
                  : "bg-navy-600 text-text-secondary"
              }`}
            >
              {step.completed ? <Check className="w-4 h-4" /> : step.day}
            </motion.div>
            <span className="text-[10px] text-text-secondary font-medium text-center leading-tight max-w-[56px]">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
