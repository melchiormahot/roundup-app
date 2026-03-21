CREATE TABLE `allocations` (
	`id` text PRIMARY KEY NOT NULL,
	`debit_id` text NOT NULL,
	`charity_id` text NOT NULL,
	`amount` real NOT NULL,
	`tax_rate` integer NOT NULL,
	FOREIGN KEY (`debit_id`) REFERENCES `debits`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`charity_id`) REFERENCES `charities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `charities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`icon` text NOT NULL,
	`quality_label` text,
	`tax_rate` integer NOT NULL,
	`mission` text NOT NULL,
	`impact` text NOT NULL,
	`crisis_eligible` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `debits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`total_amount` real NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`roundup_count` integer NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jurisdiction_tax_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`country_code` text NOT NULL,
	`standard_rate` integer NOT NULL,
	`enhanced_rate` integer NOT NULL,
	`enhanced_ceiling` real NOT NULL,
	`income_cap_pct` integer NOT NULL,
	`receipt_format` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jurisdiction_tax_rules_country_code_unique` ON `jurisdiction_tax_rules` (`country_code`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roundups` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`merchant_name` text NOT NULL,
	`purchase_amount` real NOT NULL,
	`roundup_amount` real NOT NULL,
	`timestamp` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_charities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`charity_id` text NOT NULL,
	`allocation_pct` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`charity_id`) REFERENCES `charities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`jurisdiction` text DEFAULT 'FR' NOT NULL,
	`income_bracket` integer DEFAULT 0 NOT NULL,
	`debit_frequency` text DEFAULT 'weekly' NOT NULL,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`referral_code` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_referral_code_unique` ON `users` (`referral_code`);