export interface FeatureAccess {
  // Level 1 (default)
  dashboard: boolean;
  charityBrowser: boolean;
  basicSettings: boolean;

  // Level 2 (Day 7+, EUR 10+)
  taxDashboard: boolean;
  weeklySummary: boolean;
  allocationSliders: boolean;
  milestones: boolean;
  socialProof: boolean;
  notificationInbox: boolean;

  // Level 3 (Day 30+, EUR 50+)
  crisisResponse: boolean;
  consistencyCounter: boolean;
  yearEndProjection: boolean;
  maxCharities: number; // 3 for L1-2, 6 for L3+
  impactCalculator: boolean;
  sparklines: boolean;
  shareButton: boolean;

  // Level 4 (Day 90+, EUR 200+)
  fullCatalogue: boolean;
  pdfGeneration: boolean;
  taxCeilingAlerts: boolean;
  referralProgram: boolean;
  advancedNotifications: boolean;
  categorySearch: boolean;
}

const LEVEL_1_ACCESS: FeatureAccess = {
  // Level 1
  dashboard: true,
  charityBrowser: true,
  basicSettings: true,

  // Level 2
  taxDashboard: false,
  weeklySummary: false,
  allocationSliders: false,
  milestones: false,
  socialProof: false,
  notificationInbox: false,

  // Level 3
  crisisResponse: false,
  consistencyCounter: false,
  yearEndProjection: false,
  maxCharities: 3,
  impactCalculator: false,
  sparklines: false,
  shareButton: false,

  // Level 4
  fullCatalogue: false,
  pdfGeneration: false,
  taxCeilingAlerts: false,
  referralProgram: false,
  advancedNotifications: false,
  categorySearch: false,
};

const LEVEL_2_ACCESS: FeatureAccess = {
  ...LEVEL_1_ACCESS,
  taxDashboard: true,
  weeklySummary: true,
  allocationSliders: true,
  milestones: true,
  socialProof: true,
  notificationInbox: true,
};

const LEVEL_3_ACCESS: FeatureAccess = {
  ...LEVEL_2_ACCESS,
  crisisResponse: true,
  consistencyCounter: true,
  yearEndProjection: true,
  maxCharities: 6,
  impactCalculator: true,
  sparklines: true,
  shareButton: true,
};

const LEVEL_4_ACCESS: FeatureAccess = {
  ...LEVEL_3_ACCESS,
  fullCatalogue: true,
  pdfGeneration: true,
  taxCeilingAlerts: true,
  referralProgram: true,
  advancedNotifications: true,
  categorySearch: true,
};

export function getFeatureAccess(level: number): FeatureAccess {
  if (level >= 4) return LEVEL_4_ACCESS;
  if (level >= 3) return LEVEL_3_ACCESS;
  if (level >= 2) return LEVEL_2_ACCESS;
  return LEVEL_1_ACCESS;
}

/**
 * Thresholds: each entry is [minDays, minDonated]
 */
const LEVEL_THRESHOLDS: Array<[number, number]> = [
  [0, 0],     // Level 1 - default
  [7, 10],    // Level 2
  [30, 50],   // Level 3
  [90, 200],  // Level 4
];

/**
 * Calculate the user's level.
 *
 * Rules:
 * - Max one level advance per week since the previous level was unlocked.
 * - Once unlocked, never reset (ratchet upward only).
 * - Level 1: default
 * - Level 2: Day 7+ AND EUR 10+
 * - Level 3: Day 30+ AND EUR 50+
 * - Level 4: Day 90+ AND EUR 200+
 */
export function calculateUserLevel(params: {
  daysSinceCreation: number;
  totalDonated: number;
  currentLevel: number;
  levelUnlockedAt: Record<number, string>; // JSON timestamps keyed by level
  referenceDate?: Date; // for simulation: the simulated "now"
}): number {
  const { daysSinceCreation, totalDonated, currentLevel, levelUnlockedAt, referenceDate } =
    params;

  // Only advance one level at a time
  const candidateLevel = currentLevel + 1;
  if (candidateLevel > 4) return currentLevel;

  const [minDays, minDonated] = LEVEL_THRESHOLDS[candidateLevel - 1];

  // Check thresholds
  if (daysSinceCreation < minDays || totalDonated < minDonated) {
    return currentLevel;
  }

  // Check cooldown: at least 7 days since last level-up
  const lastLevelTimestamp = levelUnlockedAt[currentLevel];
  if (lastLevelTimestamp) {
    const lastUnlocked = new Date(lastLevelTimestamp).getTime();
    const now = referenceDate ? referenceDate.getTime() : Date.now();
    const daysSinceLastUnlock = (now - lastUnlocked) / (1000 * 60 * 60 * 24);

    if (daysSinceLastUnlock < 7) {
      return currentLevel;
    }
  }

  return candidateLevel;
}
