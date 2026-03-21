CREATE TABLE `allocations` (
	`id` text PRIMARY KEY NOT NULL,
	`debit_id` text,
	`charity_id` text,
	`amount` real,
	`tax_rate` integer,
	FOREIGN KEY (`debit_id`) REFERENCES `debits`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`charity_id`) REFERENCES `charities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `charities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`icon` text,
	`country_code` text,
	`display_countries` text,
	`quality_label` text,
	`tax_rate` integer,
	`loi_coluche_eligible` integer DEFAULT 0,
	`mission` text,
	`founding_story` text,
	`impact` text,
	`how_your_money_helps` text,
	`financial_transparency` text,
	`certifications` text,
	`milestones` text,
	`jurisdictions_eligible` text,
	`cross_border_method` text,
	`story` text,
	`website_url` text,
	`founded_year` integer,
	`currency` text DEFAULT 'EUR',
	`brand_color` text
);
--> statement-breakpoint
CREATE TABLE `debits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`total_amount` real,
	`period_start` text,
	`period_end` text,
	`roundup_count` integer,
	`status` text DEFAULT 'pending',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `early_access` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`country` text,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `early_access_email_unique` ON `early_access` (`email`);--> statement-breakpoint
CREATE TABLE `jurisdiction_tax_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`country_code` text,
	`standard_rate` integer,
	`enhanced_rate` integer,
	`enhanced_ceiling` real,
	`income_cap_pct` integer,
	`carry_forward_years` integer,
	`receipt_format` text,
	`currency` text,
	`currency_symbol` text
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text,
	`title` text,
	`body` text,
	`read` integer DEFAULT 0,
	`created_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roundups` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`amount` real,
	`merchant_name` text,
	`category` text,
	`timestamp` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `simulation_state` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`current_date` text,
	`day_count` integer DEFAULT 0,
	`notification_style` text DEFAULT 'warm',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_charities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`charity_id` text,
	`allocation_pct` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`charity_id`) REFERENCES `charities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`jurisdiction` text DEFAULT 'FR',
	`income_bracket` integer DEFAULT 0,
	`debit_frequency` text DEFAULT 'weekly',
	`onboarding_completed` integer DEFAULT 0,
	`onboarding_step_reached` integer DEFAULT 0,
	`referral_code` text,
	`is_admin` integer DEFAULT 0,
	`user_level` integer DEFAULT 1,
	`level_unlocked_at` text,
	`theme_preference` text DEFAULT 'dark',
	`haptic_enabled` integer DEFAULT 1,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_referral_code_unique` ON `users` (`referral_code`);