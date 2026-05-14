CREATE TABLE `transmission_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`transmission_id` text NOT NULL,
	`tier` text NOT NULL,
	`verified_at` text,
	`human_review_needed` integer DEFAULT false NOT NULL,
	`reducer_notes` text,
	`reviewer_notes` text,
	FOREIGN KEY (`transmission_id`) REFERENCES `master_transmissions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "transmission_evidence_tier_check" CHECK("transmission_evidence"."tier" IN ('A','B','C','D'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transmission_evidence_transmission_id_unique` ON `transmission_evidence` (`transmission_id`);--> statement-breakpoint
CREATE INDEX `idx_transmission_evidence_tier` ON `transmission_evidence` (`tier`);--> statement-breakpoint
CREATE TABLE `transmission_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`evidence_id` text NOT NULL,
	`publisher` text NOT NULL,
	`url` text NOT NULL,
	`domain_class` text NOT NULL,
	`retrieved_on` text NOT NULL,
	`quote` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`evidence_id`) REFERENCES `transmission_evidence`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_transmission_sources_evidence` ON `transmission_sources` (`evidence_id`);