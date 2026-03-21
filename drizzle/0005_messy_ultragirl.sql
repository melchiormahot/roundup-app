ALTER TABLE `charities` ADD `country_of_origin` text;--> statement-breakpoint
ALTER TABLE `charities` ADD `founded_year` integer;--> statement-breakpoint
ALTER TABLE `charities` ADD `website_url` text;--> statement-breakpoint
ALTER TABLE `charities` ADD `certifications` text;--> statement-breakpoint
ALTER TABLE `charities` ADD `jurisdictions_eligible` text;--> statement-breakpoint
ALTER TABLE `charities` ADD `loi_coluche_eligible` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `charities` ADD `cross_border_method` text;--> statement-breakpoint
ALTER TABLE `charities` ADD `currency` text DEFAULT 'EUR' NOT NULL;