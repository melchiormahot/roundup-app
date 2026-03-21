// Consistent brand colours for each charity (warm charcoal palette)
export const CHARITY_COLORS: Record<string, string> = {
  "Médecins Sans Frontières": "#fca5a5",
  "WWF France": "#86efac",
  "WWF": "#86efac",
  "Ligue contre le cancer": "#c084fc",
  "Restos du Cœur": "#fbbf24",
  "Amnesty International": "#67e8f9",
  "Secours Populaire": "#fb923c",
  "Deutsche Krebshilfe": "#f9a8d4",
  "SOS Children's Villages": "#a5b4fc",
  "Terre des Hommes": "#fde68a",
  "Greenpeace": "#86efac",
  "Handicap International": "#c4b5fd",
  "UNICEF": "#7dd3fc",
  "Red Cross / ICRC": "#fca5a5",
  "Save the Children": "#fbbf24",
  "Cancer Research UK": "#f9a8d4",
  "Macmillan Cancer Support": "#86efac",
  "British Heart Foundation": "#fca5a5",
  "St. Jude Children's Research Hospital": "#fde68a",
  "Direct Relief": "#7dd3fc",
  "Action contre la Faim": "#fb923c",
  "Médecins du Monde": "#a5b4fc",
  "Fondation pour la Recherche Médicale": "#c084fc",
  "Croix-Rouge française": "#fca5a5",
};

export function getCharityColor(name: string): string {
  return CHARITY_COLORS[name] || "#60a5fa";
}
