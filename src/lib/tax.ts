// ─── Types ──────────────────────────────────────────────────────────────────

interface TaxCalculation {
  totalDeduction: number;
  effectiveCost: number;
  breakdown: { rate: number; amount: number; deduction: number }[];
  ceilingUsed: number;
  ceilingRemaining: number;
  ceilingPct: number;
}

type CharityType = 'standard' | 'enhanced';

// ─── Income bracket approximations (annual) ────────────────────────────────
// Bracket 0: <25k, Bracket 1: 25k-50k, Bracket 2: 50k-100k, Bracket 3: >100k

const BRACKET_INCOME: Record<number, number> = {
  0: 20_000,
  1: 37_500,
  2: 75_000,
  3: 150_000,
};

// ─── Jurisdiction-specific tax rules ────────────────────────────────────────

function getFranceDeduction(amount: number, charityType: CharityType): { rate: number; deduction: number }[] {
  const breakdown: { rate: number; deduction: number }[] = [];

  if (charityType === 'enhanced') {
    // Loi Coluche: 75% up to 2000, then 66% on the rest
    const enhancedPortion = Math.min(amount, 2_000);
    const standardPortion = Math.max(0, amount - 2_000);

    if (enhancedPortion > 0) {
      breakdown.push({ rate: 75, deduction: enhancedPortion * 0.75 });
    }
    if (standardPortion > 0) {
      breakdown.push({ rate: 66, deduction: standardPortion * 0.66 });
    }
  } else {
    // Standard: 66%
    breakdown.push({ rate: 66, deduction: amount * 0.66 });
  }

  return breakdown;
}

function getUKDeduction(amount: number, incomeBracket: number): { rate: number; deduction: number }[] {
  // Gift Aid: charity reclaims 25% basic rate
  // Higher/additional rate taxpayers can claim back the difference
  const basicReclaim = amount * 0.25;

  if (incomeBracket >= 3) {
    // Additional rate (45%): can claim additional 25%
    return [
      { rate: 25, deduction: basicReclaim },
      { rate: 25, deduction: amount * 0.25 },
    ];
  } else if (incomeBracket >= 2) {
    // Higher rate (40%): can claim additional 20%
    return [
      { rate: 25, deduction: basicReclaim },
      { rate: 20, deduction: amount * 0.20 },
    ];
  }

  // Basic rate: only Gift Aid reclaim to charity
  return [{ rate: 25, deduction: basicReclaim }];
}

function getGermanyDeduction(amount: number, incomeBracket: number): { rate: number; deduction: number }[] {
  // Marginal rate depends on bracket
  const rates: Record<number, number> = { 0: 14, 1: 30, 2: 42, 3: 45 };
  const rate = rates[incomeBracket] ?? 14;
  return [{ rate, deduction: amount * (rate / 100) }];
}

function getSpainDeduction(amount: number): { rate: number; deduction: number }[] {
  const breakdown: { rate: number; deduction: number }[] = [];

  // First 250: 80% deduction
  const firstTier = Math.min(amount, 250);
  const secondTier = Math.max(0, amount - 250);

  if (firstTier > 0) {
    breakdown.push({ rate: 80, deduction: firstTier * 0.80 });
  }
  if (secondTier > 0) {
    // 35% standard (40% if recurring 3+ years, we use 35% as default)
    breakdown.push({ rate: 35, deduction: secondTier * 0.35 });
  }

  return breakdown;
}

function getBelgiumDeduction(amount: number): { rate: number; deduction: number }[] {
  // Flat 30% tax reduction
  return [{ rate: 30, deduction: amount * 0.30 }];
}

// ─── Ceiling / cap calculation ──────────────────────────────────────────────

export function getCeiling(jurisdiction: string, incomeBracket: number): number {
  const income = BRACKET_INCOME[incomeBracket] ?? BRACKET_INCOME[0];

  switch (jurisdiction) {
    case 'FR':
      return income * 0.20; // 20% of income
    case 'UK':
      return Infinity; // No cap
    case 'DE':
      return income * 0.20; // 20% of income
    case 'ES':
      return income * 0.10; // 10% of income
    case 'BE':
      return Math.min(income * 0.10, 397_850); // 10% of income or 397,850
    default:
      return income * 0.20; // Default: 20%
  }
}

// ─── Main deduction calculation ─────────────────────────────────────────────

export function calculateDeduction(
  amount: number,
  charityType: CharityType,
  jurisdiction: string,
  incomeBracket: number = 0,
): number {
  let breakdown: { rate: number; deduction: number }[];

  switch (jurisdiction) {
    case 'FR':
      breakdown = getFranceDeduction(amount, charityType);
      break;
    case 'UK':
      breakdown = getUKDeduction(amount, incomeBracket);
      break;
    case 'DE':
      breakdown = getGermanyDeduction(amount, incomeBracket);
      break;
    case 'ES':
      breakdown = getSpainDeduction(amount);
      break;
    case 'BE':
      breakdown = getBelgiumDeduction(amount);
      break;
    default:
      breakdown = [{ rate: 0, deduction: 0 }];
  }

  const totalDeduction = breakdown.reduce((sum, b) => sum + b.deduction, 0);

  // Apply ceiling
  const ceiling = getCeiling(jurisdiction, incomeBracket);
  return Math.min(totalDeduction, ceiling);
}

// ─── Effective cost ─────────────────────────────────────────────────────────

export function getEffectiveCost(
  donationAmount: number,
  jurisdiction: string,
  incomeBracket: number,
  charityType: CharityType,
): number {
  const deduction = calculateDeduction(donationAmount, charityType, jurisdiction, incomeBracket);
  return Math.max(0, donationAmount - deduction);
}

// ─── Full tax calculation with breakdown ────────────────────────────────────

export function calculateFullTax(
  donations: { amount: number; charityType: CharityType }[],
  jurisdiction: string,
  incomeBracket: number,
): TaxCalculation {
  const ceiling = getCeiling(jurisdiction, incomeBracket);
  let totalAmount = 0;
  let rawDeduction = 0;
  const breakdown: { rate: number; amount: number; deduction: number }[] = [];

  for (const donation of donations) {
    totalAmount += donation.amount;
    let parts: { rate: number; deduction: number }[];

    switch (jurisdiction) {
      case 'FR':
        parts = getFranceDeduction(donation.amount, donation.charityType);
        break;
      case 'UK':
        parts = getUKDeduction(donation.amount, incomeBracket);
        break;
      case 'DE':
        parts = getGermanyDeduction(donation.amount, incomeBracket);
        break;
      case 'ES':
        parts = getSpainDeduction(donation.amount);
        break;
      case 'BE':
        parts = getBelgiumDeduction(donation.amount);
        break;
      default:
        parts = [{ rate: 0, deduction: 0 }];
    }

    for (const part of parts) {
      rawDeduction += part.deduction;
      breakdown.push({
        rate: part.rate,
        amount: Math.round((part.deduction / (part.rate / 100)) * 100) / 100,
        deduction: Math.round(part.deduction * 100) / 100,
      });
    }
  }

  const totalDeduction = Math.min(rawDeduction, ceiling);
  const ceilingUsed = Math.min(rawDeduction, ceiling);
  const ceilingRemaining = Math.max(0, ceiling - rawDeduction);
  const ceilingPct = ceiling === Infinity ? 0 : Math.round((ceilingUsed / ceiling) * 100);

  return {
    totalDeduction: Math.round(totalDeduction * 100) / 100,
    effectiveCost: Math.round((totalAmount - totalDeduction) * 100) / 100,
    breakdown,
    ceilingUsed: Math.round(ceilingUsed * 100) / 100,
    ceilingRemaining: ceiling === Infinity ? Infinity : Math.round(ceilingRemaining * 100) / 100,
    ceilingPct,
  };
}

// ─── Year projection ────────────────────────────────────────────────────────

export function getProjection(
  currentDonations: number,
  monthsRemaining: number,
  jurisdiction: string,
  incomeBracket: number,
): TaxCalculation {
  // Project based on current average monthly rate
  const monthsElapsed = 12 - monthsRemaining;
  const monthlyAvg = monthsElapsed > 0 ? currentDonations / monthsElapsed : 0;
  const projectedTotal = currentDonations + (monthlyAvg * monthsRemaining);

  // Calculate full-year tax benefit using projected total as standard donations
  return calculateFullTax(
    [{ amount: projectedTotal, charityType: 'standard' }],
    jurisdiction,
    incomeBracket,
  );
}
