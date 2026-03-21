"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface WarmGlowProps {
  message: string;
  brandColor?: string;
  visible: boolean;
  onDismiss: () => void;
}

const GLOW_VARIANTS = [
  { emoji: "💚", prefix: "Today, your spare change" },
  { emoji: "✨", prefix: "Because of you" },
  { emoji: "🌟", prefix: "Your generosity" },
];

export function WarmGlow({ message, brandColor = "#86efac", visible, onDismiss }: WarmGlowProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onDismiss}
          className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
          style={{ background: `radial-gradient(circle at center, ${brandColor}15 0%, #121212 70%)` }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="text-center px-8 max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
              className="text-5xl mb-4"
            >
              💚
            </motion.div>
            <p className="text-text-primary text-lg font-semibold mb-2 leading-relaxed">{message}</p>
            <p className="text-text-secondary text-xs font-medium">Tap anywhere to continue</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Stories for identifiable victim effect
export const CHARITY_STORIES: Record<string, { name: string; story: string }[]> = {
  "Médecins Sans Frontières": [
    { name: "Amara", story: "Amara, 9, was treated for severe malaria at an MSF clinic in South Sudan. She received medication within 2 hours of arriving. Today she's back in school." },
    { name: "Fatima", story: "Fatima walked 40 km to reach an MSF hospital in Yemen. Her baby was delivered safely by an MSF midwife. Both are healthy." },
  ],
  "Restos du Cœur": [
    { name: "Jean-Pierre", story: "Jean-Pierre, 62, lost his job and his apartment. At the Restos du Coeur centre in Lyon, he gets a hot meal every day and help with his housing application." },
    { name: "Nadia", story: "Nadia, a single mother of three, feeds her family thanks to the Restos weekly food parcels. She says it's the one thing she doesn't have to worry about." },
  ],
  "WWF France": [
    { name: "Griffon vultures", story: "In the Cévennes, a family of griffon vultures returned to a cliff face that had been empty for decades, thanks to a WWF habitat restoration project." },
    { name: "Mediterranean coral", story: "Off the coast of Marseille, a WWF marine reserve has seen coral coverage increase by 30% in five years. Fish populations are returning." },
  ],
  "Secours Populaire": [
    { name: "Lucas", story: "Lucas, 8, had never seen the sea. Thanks to a Secours Populaire 'Oubliés des Vacances' trip, he spent a day at the beach. He still talks about it." },
    { name: "Marie", story: "Marie, a retired teacher, couldn't afford heating last winter. Secours Populaire helped her with energy bills and warm clothing." },
  ],
  "Amnesty International": [
    { name: "Ahmed", story: "Ahmed, a journalist imprisoned for reporting on corruption, was released after an Amnesty letter-writing campaign generated 50,000 appeals to the government." },
  ],
  "UNICEF": [
    { name: "Aisha", story: "Aisha, 4, received her measles vaccine at a UNICEF-supported clinic in Chad. She was the 49 millionth child vaccinated by UNICEF that year." },
  ],
  "Red Cross / ICRC": [
    { name: "The Khalil family", story: "The Khalil family, separated by conflict in Syria, were reunited after 3 years thanks to Red Cross family tracing services." },
  ],
};

// Impact messages tied to donation amounts
export function getImpactMessage(charityName: string, amount: number): string {
  const impacts: Record<string, { threshold: number; message: string }[]> = {
    "Médecins Sans Frontières": [
      { threshold: 0.5, message: "provided a dose of oral rehydration salts" },
      { threshold: 3, message: "funded malaria treatment for a child" },
      { threshold: 7, message: "provided a day of care for a malnourished child" },
    ],
    "Restos du Cœur": [
      { threshold: 0.25, message: "provided a meal to someone in need" },
      { threshold: 1, message: "provided 4 balanced meals" },
      { threshold: 10, message: "fed a family for a week" },
    ],
    "WWF France": [
      { threshold: 1, message: "protected forest habitat for a day" },
      { threshold: 5, message: "protected a hectare of forest for a month" },
    ],
    "UNICEF": [
      { threshold: 0.2, message: "provided a dose of life-saving vaccine" },
      { threshold: 1, message: "provided 5 vaccine doses" },
    ],
    "Secours Populaire": [
      { threshold: 2, message: "provided school supplies for a child" },
      { threshold: 15, message: "funded a day at the seaside for a child" },
    ],
  };

  const charityImpacts = impacts[charityName];
  if (!charityImpacts) return `went to ${charityName}`;

  // Find the best matching impact
  const sorted = [...charityImpacts].sort((a, b) => b.threshold - a.threshold);
  for (const impact of sorted) {
    const units = Math.floor(amount / impact.threshold);
    if (units >= 1) {
      return `${units === 1 ? "" : `${units} `}${impact.message}${units > 1 ? "" : ""}`;
    }
  }
  return `went to ${charityName}`;
}
