PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_locationLog` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`started_at` integer NOT NULL,
	`ended_at` integer NOT NULL,
	`lat` real NOT NULL,
	`long` real NOT NULL,
	`location_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `location`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_locationLog`("id", "name", "description", "started_at", "ended_at", "lat", "long", "location_id", "user_id", "created_at", "updated_at") SELECT "id", "name", "description", "started_at", "ended_at", "lat", "long", "location_id", "user_id", "created_at", "updated_at" FROM `locationLog`;--> statement-breakpoint
DROP TABLE `locationLog`;--> statement-breakpoint
ALTER TABLE `__new_locationLog` RENAME TO `locationLog`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_locationLogImage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`location_log_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`location_log_id`) REFERENCES `locationLog`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_locationLogImage`("id", "key", "location_log_id", "user_id", "created_at", "updated_at") SELECT "id", "key", "location_log_id", "user_id", "created_at", "updated_at" FROM `locationLogImage`;--> statement-breakpoint
DROP TABLE `locationLogImage`;--> statement-breakpoint
ALTER TABLE `__new_locationLogImage` RENAME TO `locationLogImage`;