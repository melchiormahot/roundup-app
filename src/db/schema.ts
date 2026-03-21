import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  password_hash: text('password_hash').notNull(),
  name: text('name').notNull(),
  jurisdiction: text('jurisdiction').default('FR'),
  income_bracket: integer('income_bracket').default(0), // 0-3
  debit_frequency: text('debit_frequency').default('weekly'),
  onboarding_completed: integer('onboarding_completed').default(0),
  onboarding_step_reached: integer('onboarding_step_reached').default(0),
  referral_code: text('referral_code').unique(),
  is_admin: integer('is_admin').default(0),
  user_level: integer('user_level').default(1), // 1-4
  level_unlocked_at: text('level_unlocked_at'), // JSON timestamps
  theme_preference: text('theme_preference').default('dark'),
  haptic_enabled: integer('haptic_enabled').default(1),
  created_at: text('created_at'),
});

// ─── Charities ───────────────────────────────────────────────────────────────

export const charities = sqliteTable('charities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  icon: text('icon'),
  country_code: text('country_code'),
  display_countries: text('display_countries'), // JSON array
  quality_label: text('quality_label'),
  tax_rate: integer('tax_rate'),
  loi_coluche_eligible: integer('loi_coluche_eligible').default(0),
  mission: text('mission'),
  founding_story: text('founding_story'),
  impact: text('impact'), // JSON array
  how_your_money_helps: text('how_your_money_helps'), // JSON array of {amount, description}
  financial_transparency: text('financial_transparency'), // JSON {programs_pct, admin_pct, fundraising_pct}
  certifications: text('certifications'), // JSON array of {name, year}
  milestones: text('milestones'), // JSON array of {year, title, description}
  jurisdictions_eligible: text('jurisdictions_eligible'), // JSON array
  cross_border_method: text('cross_border_method'),
  story: text('story'),
  website_url: text('website_url'),
  founded_year: integer('founded_year'),
  currency: text('currency').default('EUR'),
  brand_color: text('brand_color'),
});

// ─── User-Charity allocations ────────────────────────────────────────────────

export const user_charities = sqliteTable('user_charities', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  charity_id: text('charity_id').references(() => charities.id),
  allocation_pct: integer('allocation_pct'),
});

// ─── Roundups ────────────────────────────────────────────────────────────────

export const roundups = sqliteTable('roundups', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  amount: real('amount'),
  merchant_name: text('merchant_name'),
  category: text('category'),
  timestamp: text('timestamp'),
});

// ─── Debits ──────────────────────────────────────────────────────────────────

export const debits = sqliteTable('debits', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  total_amount: real('total_amount'),
  period_start: text('period_start'),
  period_end: text('period_end'),
  roundup_count: integer('roundup_count'),
  status: text('status').default('pending'),
});

// ─── Allocations ─────────────────────────────────────────────────────────────

export const allocations = sqliteTable('allocations', {
  id: text('id').primaryKey(),
  debit_id: text('debit_id').references(() => debits.id),
  charity_id: text('charity_id').references(() => charities.id),
  amount: real('amount'),
  tax_rate: integer('tax_rate'),
});

// ─── Notifications ───────────────────────────────────────────────────────────

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  type: text('type'),
  title: text('title'),
  body: text('body'),
  read: integer('read').default(0),
  created_at: text('created_at'),
});

// ─── Jurisdiction tax rules ──────────────────────────────────────────────────

export const jurisdiction_tax_rules = sqliteTable('jurisdiction_tax_rules', {
  id: text('id').primaryKey(),
  country_code: text('country_code'),
  standard_rate: integer('standard_rate'),
  enhanced_rate: integer('enhanced_rate'),
  enhanced_ceiling: real('enhanced_ceiling'),
  income_cap_pct: integer('income_cap_pct'),
  carry_forward_years: integer('carry_forward_years'),
  receipt_format: text('receipt_format'),
  currency: text('currency'),
  currency_symbol: text('currency_symbol'),
});

// ─── Early access ────────────────────────────────────────────────────────────

export const early_access = sqliteTable('early_access', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  country: text('country'),
  created_at: text('created_at'),
});

// ─── Simulation state ────────────────────────────────────────────────────────

export const simulation_state = sqliteTable('simulation_state', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  current_date: text('current_date'),
  day_count: integer('day_count').default(0),
  notification_style: text('notification_style').default('warm'),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  user_charities: many(user_charities),
  roundups: many(roundups),
  debits: many(debits),
  notifications: many(notifications),
  simulation_state: many(simulation_state),
}));

export const charitiesRelations = relations(charities, ({ many }) => ({
  user_charities: many(user_charities),
  allocations: many(allocations),
}));

export const userCharitiesRelations = relations(user_charities, ({ one }) => ({
  user: one(users, { fields: [user_charities.user_id], references: [users.id] }),
  charity: one(charities, { fields: [user_charities.charity_id], references: [charities.id] }),
}));

export const roundupsRelations = relations(roundups, ({ one }) => ({
  user: one(users, { fields: [roundups.user_id], references: [users.id] }),
}));

export const debitsRelations = relations(debits, ({ one, many }) => ({
  user: one(users, { fields: [debits.user_id], references: [users.id] }),
  allocations: many(allocations),
}));

export const allocationsRelations = relations(allocations, ({ one }) => ({
  debit: one(debits, { fields: [allocations.debit_id], references: [debits.id] }),
  charity: one(charities, { fields: [allocations.charity_id], references: [charities.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.user_id], references: [users.id] }),
}));

export const simulationStateRelations = relations(simulation_state, ({ one }) => ({
  user: one(users, { fields: [simulation_state.user_id], references: [users.id] }),
}));
