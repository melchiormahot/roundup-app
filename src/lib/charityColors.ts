// Consistent brand colours for each charity
// Keyed by charity name for lookup
export const CHARITY_COLORS: Record<string, string> = {
  "Médecins Sans Frontières": "#ff6b6b",
  "WWF France": "#5ce0b8",
  "Ligue contre le cancer": "#b48eff",
  "Restos du Cœur": "#ffd93d",
  "Amnesty International": "#4ae0d2",
  "Secours Populaire": "#ff9a76",
};

export function getCharityColor(name: string): string {
  return CHARITY_COLORS[name] || "#4a9eff";
}
