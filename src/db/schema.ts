import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  jurisdiction: text("jurisdiction").notNull().default("FR"),
  incomeBracket: integer("income_bracket").notNull().default(0),
  debitFrequency: text("debit_frequency").notNull().default("weekly"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).notNull().default(false),
  referralCode: text("referral_code").unique(),
  createdAt: text("created_at").notNull(),
});

export const charities = sqliteTable("charities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  qualityLabel: text("quality_label"),
  taxRate: integer("tax_rate").notNull(),
  mission: text("mission").notNull(),
  impact: text("impact").notNull(), // JSON array of strings
  crisisEligible: integer("crisis_eligible", { mode: "boolean" }).notNull().default(false),
});

export const userCharities = sqliteTable("user_charities", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  charityId: text("charity_id").notNull().references(() => charities.id),
  allocationPct: integer("allocation_pct").notNull().default(0),
});

export const roundups = sqliteTable("roundups", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  merchantName: text("merchant_name").notNull(),
  purchaseAmount: real("purchase_amount").notNull(),
  roundupAmount: real("roundup_amount").notNull(),
  timestamp: text("timestamp").notNull(),
  status: text("status").notNull().default("pending"),
});

export const debits = sqliteTable("debits", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  totalAmount: real("total_amount").notNull(),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  roundupCount: integer("roundup_count").notNull(),
  status: text("status").notNull().default("scheduled"),
});

export const allocations = sqliteTable("allocations", {
  id: text("id").primaryKey(),
  debitId: text("debit_id").notNull().references(() => debits.id),
  charityId: text("charity_id").notNull().references(() => charities.id),
  amount: real("amount").notNull(),
  taxRate: integer("tax_rate").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const simulationState = sqliteTable("simulation_state", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  currentDate: text("current_date").notNull(),
  dayCount: integer("day_count").notNull().default(0),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  notificationStyle: text("notification_style").notNull().default("factual"),
  seed: integer("seed").notNull().default(42),
});

export const earlyAccess = sqliteTable("early_access", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  country: text("country"),
  createdAt: text("created_at").notNull(),
});

export const jurisdictionTaxRules = sqliteTable("jurisdiction_tax_rules", {
  id: text("id").primaryKey(),
  countryCode: text("country_code").notNull().unique(),
  standardRate: integer("standard_rate").notNull(),
  enhancedRate: integer("enhanced_rate").notNull(),
  enhancedCeiling: real("enhanced_ceiling").notNull(),
  incomeCapPct: integer("income_cap_pct").notNull(),
  receiptFormat: text("receipt_format").notNull(),
});
