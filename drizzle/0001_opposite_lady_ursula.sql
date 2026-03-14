PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_master_biographies` (
	`id` text PRIMARY KEY NOT NULL,
	`master_id` text NOT NULL,
	`locale` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`master_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_master_biographies`("id", "master_id", "locale", "content") SELECT "id", "master_id", "locale", "content" FROM `master_biographies`;--> statement-breakpoint
DROP TABLE `master_biographies`;--> statement-breakpoint
ALTER TABLE `__new_master_biographies` RENAME TO `master_biographies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;