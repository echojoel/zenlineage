CREATE TABLE `teaching_master_roles` (
	`teaching_id` text NOT NULL,
	`master_id` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`teaching_id`, `master_id`, `role`),
	FOREIGN KEY (`teaching_id`) REFERENCES `teachings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`master_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `teaching_content` ADD `translator` text;--> statement-breakpoint
ALTER TABLE `teaching_content` ADD `edition` text;--> statement-breakpoint
ALTER TABLE `teaching_content` ADD `license_status` text;--> statement-breakpoint
ALTER TABLE `teachings` ADD `case_number` text;--> statement-breakpoint
ALTER TABLE `teachings` ADD `compiler` text;--> statement-breakpoint
ALTER TABLE `teachings` ADD `attribution_status` text;