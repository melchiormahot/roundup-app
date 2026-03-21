CREATE TABLE `early_access` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`country` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `early_access_email_unique` ON `early_access` (`email`);