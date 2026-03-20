CREATE TABLE `teaching_themes` (
	`teaching_id` text NOT NULL,
	`theme_id` text NOT NULL,
	PRIMARY KEY(`teaching_id`, `theme_id`),
	FOREIGN KEY (`teaching_id`) REFERENCES `teachings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `theme_names` (
	`id` text PRIMARY KEY NOT NULL,
	`theme_id` text NOT NULL,
	`locale` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `themes` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`sort_order` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `themes_slug_unique` ON `themes` (`slug`);