CREATE TABLE `simulation_state` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`current_date` text NOT NULL,
	`day_count` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`notification_style` text DEFAULT 'factual' NOT NULL,
	`seed` integer DEFAULT 42 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `simulation_state_user_id_unique` ON `simulation_state` (`user_id`);