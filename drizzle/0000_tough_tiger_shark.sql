CREATE TABLE `assertion_citations` (
	`assertion_id` text NOT NULL,
	`citation_id` text NOT NULL,
	PRIMARY KEY(`assertion_id`, `citation_id`),
	FOREIGN KEY (`assertion_id`) REFERENCES `assertions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`citation_id`) REFERENCES `citations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assertions` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`field_name` text NOT NULL,
	`value` text,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`field_name` text,
	`action` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`actor` text,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `citations` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`field_name` text,
	`excerpt` text,
	`page_or_section` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_descriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`locale` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_masters` (
	`event_id` text NOT NULL,
	`master_id` text NOT NULL,
	`role` text,
	PRIMARY KEY(`event_id`, `master_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`master_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_names` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`locale` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_schools` (
	`event_id` text NOT NULL,
	`school_id` text NOT NULL,
	`role` text,
	PRIMARY KEY(`event_id`, `school_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_temples` (
	`event_id` text NOT NULL,
	`temple_id` text NOT NULL,
	`role` text,
	PRIMARY KEY(`event_id`, `temple_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`type` text,
	`date_start` integer,
	`date_start_precision` text,
	`date_end` integer,
	`date_end_precision` text,
	`lat` real,
	`lng` real,
	`region` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `ingestion_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`run_date` text NOT NULL,
	`script_name` text,
	`status` text NOT NULL,
	`record_count` integer,
	`notes` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `master_biographies` (
	`id` text PRIMARY KEY NOT NULL,
	`master_id` text NOT NULL,
	`locale` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`master_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `master_names` (
	`id` text PRIMARY KEY NOT NULL,
	`master_id` text NOT NULL,
	`locale` text NOT NULL,
	`name_type` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`master_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `master_temples` (
	`master_id` text NOT NULL,
	`temple_id` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`master_id`, `temple_id`),
	FOREIGN KEY (`master_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `master_transmissions` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`teacher_id` text NOT NULL,
	`type` text NOT NULL,
	`is_primary` integer,
	`notes` text,
	FOREIGN KEY (`student_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teacher_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `masters` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`birth_year` integer,
	`birth_precision` text,
	`birth_confidence` text,
	`death_year` integer,
	`death_precision` text,
	`death_confidence` text,
	`ordination_year` integer,
	`ordination_precision` text,
	`school_id` text,
	`generation` integer,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `masters_slug_unique` ON `masters` (`slug`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`type` text,
	`storage_path` text,
	`source_url` text,
	`license` text,
	`attribution` text,
	`alt_text` text,
	`width` integer,
	`height` integer,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `review_status` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`field_name` text,
	`locale` text,
	`status` text NOT NULL,
	`reviewer` text,
	`reviewed_at` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `school_names` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`locale` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`tradition` text,
	`parent_id` text,
	`founder_id` text,
	`founded_year` integer,
	`founded_precision` text,
	`founded_confidence` text,
	`practices` text,
	`active` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `schools_slug_unique` ON `schools` (`slug`);--> statement-breakpoint
CREATE TABLE `search_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`token` text NOT NULL,
	`original` text,
	`locale` text,
	`token_type` text
);
--> statement-breakpoint
CREATE TABLE `source_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`ingestion_run_id` text NOT NULL,
	`snapshot_date` text NOT NULL,
	`content_hash` text,
	`archive_url` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingestion_run_id`) REFERENCES `ingestion_runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text,
	`title` text,
	`author` text,
	`url` text,
	`publication_date` text,
	`reliability` text
);
--> statement-breakpoint
CREATE TABLE `teaching_content` (
	`id` text PRIMARY KEY NOT NULL,
	`teaching_id` text NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`teaching_id`) REFERENCES `teachings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teaching_relations` (
	`teaching_id` text NOT NULL,
	`related_id` text NOT NULL,
	`relation_type` text NOT NULL,
	PRIMARY KEY(`teaching_id`, `related_id`),
	FOREIGN KEY (`teaching_id`) REFERENCES `teachings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`related_id`) REFERENCES `teachings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teachings` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`type` text,
	`author_id` text,
	`collection` text,
	`era` text,
	FOREIGN KEY (`author_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teachings_slug_unique` ON `teachings` (`slug`);--> statement-breakpoint
CREATE TABLE `temple_names` (
	`id` text PRIMARY KEY NOT NULL,
	`temple_id` text NOT NULL,
	`locale` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`temple_id`) REFERENCES `temples`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `temples` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`lat` real,
	`lng` real,
	`region` text,
	`country` text,
	`founded_year` integer,
	`founded_precision` text,
	`founded_confidence` text,
	`founder_id` text,
	`school_id` text,
	`status` text,
	FOREIGN KEY (`founder_id`) REFERENCES `masters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `temples_slug_unique` ON `temples` (`slug`);