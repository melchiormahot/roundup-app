// Multi-country tax calculation engine

export interface JurisdictionConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  brackets: { label: string; marginalRate: number }[];
  receiptFormat: string;
  receiptLabel: string;
  taxLabels: { enhanced?: string; standard: string };
  calculate: (totalDonated: number, enhancedDonated: number, standardDonated: number, bracket: number) => TaxResult;
  previewText: (bracket: number, taxSaving: number) => string;
  ceilingNote?: string;
  carryForward?: number;
}

export interface TaxResult {
  totalSaving: number;
  tiers: TaxTier[];
  effectiveCostPer10: number; // cost of €/£10 donation after tax
  projectionNote?: string;
}

export interface TaxTier {
  label: string;
  donated: number;
  saving: number;
  rate: number;
  ceiling?: number;
}

const JURISDICTIONS: Record<string, JurisdictionConfig> = {
  FR: {
    code: "FR",
    name: "France",
    currency: "EUR",
    currencySymbol: "€",
    brackets: [
      { label: "Under €30,000", marginalRate: 30 },
      { label: "€30,000 to €60,000", marginalRate: 30 },
      { label: "€60,000 to €100,000", marginalRate: 41 },
      { label: "€100,000+", marginalRate: 45 },
    ],
    receiptFormat: "cerfa_11580",
    receiptLabel: "Cerfa 11580 (Reçu fiscal)",
    taxLabels: { enhanced: "Loi Coluche (75%)", standard: "Standard (66%)" },
    ceilingNote: "Loi Coluche: 75% deduction on first €2,000 to eligible aid organisations. Standard: 66% on all other eligible donations. Excess can be carried forward 5 years.",
    carryForward: 5,
    calculate: (total, enhanced, standard) => {
      const ceiling = 2000;
      const enhancedSaving = Math.min(enhanced, ceiling) * 0.75;
      const standardSaving = standard * 0.66;
      const totalSaving = +(enhancedSaving + standardSaving).toFixed(2);
      const tiers: TaxTier[] = [];
      if (enhanced > 0) tiers.push({ label: "Loi Coluche (75%)", donated: +enhanced.toFixed(2), saving: +enhancedSaving.toFixed(2), rate: 75, ceiling });
      if (standard > 0) tiers.push({ label: "Standard (66%)", donated: +standard.toFixed(2), saving: +standardSaving.toFixed(2), rate: 66 });
      return { totalSaving, tiers, effectiveCostPer10: +(10 - 10 * 0.66).toFixed(2) };
    },
    previewText: (bracket, saving) => `Based on your income bracket, donating through RoundUp could save you up to €${saving} per year in tax credits under French law.`,
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    brackets: [
      { label: "Under £25,000", marginalRate: 20 },
      { label: "£25,000 to £50,270", marginalRate: 20 },
      { label: "£50,271 to £125,140", marginalRate: 40 },
      { label: "£125,141+", marginalRate: 45 },
    ],
    receiptFormat: "gift_aid_receipt",
    receiptLabel: "Gift Aid Receipt",
    taxLabels: { enhanced: "Higher Rate Relief", standard: "Gift Aid (25% reclaimed)" },
    ceilingNote: "Gift Aid lets the charity reclaim 25% from HMRC on top of your donation. Higher rate taxpayers can claim additional relief on their self-assessment.",
    calculate: (total, _enhanced, _standard, bracket) => {
      // Gift Aid: charity reclaims 25% (basic rate). Higher rate taxpayers get additional relief.
      const giftAidReclaim = total * 0.25; // charity gets this
      let personalRelief = 0;
      const marginalRate = [0.20, 0.20, 0.40, 0.45][bracket] || 0.20;
      if (marginalRate > 0.20) {
        const grossDonation = total / 0.80; // gross up
        personalRelief = grossDonation * (marginalRate - 0.20);
      }
      const totalSaving = +(giftAidReclaim + personalRelief).toFixed(2);
      const tiers: TaxTier[] = [
        { label: "Gift Aid (charity reclaims)", donated: +total.toFixed(2), saving: +giftAidReclaim.toFixed(2), rate: 25 },
      ];
      if (personalRelief > 0) {
        tiers.push({ label: `Higher Rate Relief (${marginalRate * 100}%)`, donated: +total.toFixed(2), saving: +personalRelief.toFixed(2), rate: +((marginalRate - 0.20) * 100).toFixed(0) });
      }
      return { totalSaving, tiers, effectiveCostPer10: +(10 - totalSaving / Math.max(total, 1) * 10).toFixed(2) };
    },
    previewText: (bracket, saving) => {
      if (bracket >= 2) return `You donate £100, the charity gets £125 through Gift Aid, and you claim back £${Math.round(saving / 5)} on your self-assessment. Total benefit: £${saving}.`;
      return `Through Gift Aid, every £100 you donate becomes £125 for the charity, at no extra cost to you.`;
    },
  },
  DE: {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    currencySymbol: "€",
    brackets: [
      { label: "Under €30,000", marginalRate: 30 },
      { label: "€30,000 to €60,000", marginalRate: 42 },
      { label: "€60,000 to €100,000", marginalRate: 42 },
      { label: "€100,000+", marginalRate: 45 },
    ],
    receiptFormat: "zuwendungsbestaetigung",
    receiptLabel: "Zuwendungsbestätigung",
    taxLabels: { standard: "Sonderausgaben (marginal rate)" },
    ceilingNote: "Donations deductible as Sonderausgaben up to 20% of gross income. Effective savings depend on your marginal tax rate.",
    calculate: (total, _e, _s, bracket) => {
      const rate = [0.30, 0.42, 0.42, 0.45][bracket] || 0.42;
      const saving = +(total * rate).toFixed(2);
      return {
        totalSaving: saving,
        tiers: [{ label: `Sonderausgaben (${rate * 100}%)`, donated: +total.toFixed(2), saving, rate: rate * 100 }],
        effectiveCostPer10: +(10 - 10 * rate).toFixed(2),
      };
    },
    previewText: (bracket, saving) => `Your €500 donation reduces your Einkommensteuer by approximately €${saving}. Donations are deductible as Sonderausgaben.`,
  },
  BE: {
    code: "BE",
    name: "Belgium",
    currency: "EUR",
    currencySymbol: "€",
    brackets: [
      { label: "Under €30,000", marginalRate: 25 },
      { label: "€30,000 to €60,000", marginalRate: 40 },
      { label: "€60,000 to €100,000", marginalRate: 45 },
      { label: "€100,000+", marginalRate: 50 },
    ],
    receiptFormat: "attestation_281_71",
    receiptLabel: "Attestation fiscale 281.71",
    taxLabels: { standard: "Réduction d'impôt (45%)" },
    ceilingNote: "45% tax reduction on donations over €40 per year per institution. Maximum: 10% of net taxable income or €397,850.",
    calculate: (total) => {
      const qualifying = Math.max(0, total - 40); // Only amounts over €40 qualify
      const saving = +(Math.max(0, total) * 0.45).toFixed(2);
      return {
        totalSaving: saving,
        tiers: [{ label: "Réduction d'impôt (45%)", donated: +total.toFixed(2), saving, rate: 45 }],
        effectiveCostPer10: +(10 - 10 * 0.45).toFixed(2),
      };
    },
    previewText: (_bracket, saving) => `Every €100 you donate saves you €45 on your Belgian tax return. Your projected annual saving: €${saving}.`,
  },
  ES: {
    code: "ES",
    name: "Spain",
    currency: "EUR",
    currencySymbol: "€",
    brackets: [
      { label: "Under €20,000", marginalRate: 19 },
      { label: "€20,000 to €35,000", marginalRate: 24 },
      { label: "€35,000 to €60,000", marginalRate: 30 },
      { label: "€60,000+", marginalRate: 37 },
    ],
    receiptFormat: "certificado_donacion",
    receiptLabel: "Certificado de donación",
    taxLabels: { enhanced: "First €250 (80%)", standard: "Above €250 (40%)" },
    ceilingNote: "First €250 donated each year: 80% deduction. Amounts above €250: 40% deduction (45% if donating to the same charity for 3+ consecutive years). Maximum: 10% of taxable income.",
    calculate: (total) => {
      const first250 = Math.min(total, 250);
      const above250 = Math.max(0, total - 250);
      const saving1 = +(first250 * 0.80).toFixed(2);
      const saving2 = +(above250 * 0.40).toFixed(2);
      const totalSaving = +(saving1 + saving2).toFixed(2);
      const tiers: TaxTier[] = [];
      if (first250 > 0) tiers.push({ label: "First €250 (80%)", donated: +first250.toFixed(2), saving: saving1, rate: 80, ceiling: 250 });
      if (above250 > 0) tiers.push({ label: "Above €250 (40%)", donated: +above250.toFixed(2), saving: saving2, rate: 40 });
      return { totalSaving, tiers, effectiveCostPer10: total > 0 ? +(10 - (totalSaving / total) * 10).toFixed(2) : 4.6 };
    },
    previewText: (_bracket, saving) => `Spain offers an 80% deduction on the first €250 you donate, and 40% on the rest. Your projected saving: €${saving}.`,
  },
};

export function getJurisdiction(code: string): JurisdictionConfig {
  return JURISDICTIONS[code] || JURISDICTIONS.FR;
}

export function getAllJurisdictions(): JurisdictionConfig[] {
  return Object.values(JURISDICTIONS);
}

export function calculateDeduction(
  totalDonated: number,
  enhancedDonated: number,
  standardDonated: number,
  jurisdiction: string,
  bracket: number
): TaxResult {
  const config = getJurisdiction(jurisdiction);
  return config.calculate(totalDonated, enhancedDonated, standardDonated, bracket);
}

export function getCeiling(jurisdiction: string): number | null {
  switch (jurisdiction) {
    case "FR": return 2000;
    case "ES": return 250; // first tier
    default: return null;
  }
}

export function getProjection(
  currentDonations: number,
  daysElapsed: number,
  jurisdiction: string,
  bracket: number
): { projectedTotal: number; projectedSaving: number } {
  if (daysElapsed <= 0) return { projectedTotal: 0, projectedSaving: 0 };
  const projectedTotal = +((currentDonations / daysElapsed) * 365).toFixed(2);
  const result = calculateDeduction(projectedTotal, projectedTotal * 0.5, projectedTotal * 0.5, jurisdiction, bracket);
  return { projectedTotal, projectedSaving: result.totalSaving };
}

// Charity eligibility per jurisdiction
export const CHARITY_ELIGIBILITY: Record<string, string[]> = {
  "Médecins Sans Frontières": ["FR", "GB", "DE", "BE", "ES"],
  "WWF France": ["FR", "GB", "DE", "BE", "ES"],
  "Ligue contre le cancer": ["FR"],
  "Restos du Cœur": ["FR"],
  "Amnesty International": ["FR", "GB", "DE", "BE", "ES"],
  "Secours Populaire": ["FR"],
};

export function isCharityEligible(charityName: string, jurisdiction: string): boolean {
  const eligible = CHARITY_ELIGIBILITY[charityName];
  return eligible ? eligible.includes(jurisdiction) : true;
}
