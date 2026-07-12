CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`current_savings` real DEFAULT 0 NOT NULL,
	`monthly_contribution` real DEFAULT 0 NOT NULL,
	`years` integer DEFAULT 10 NOT NULL,
	`goal_amount` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
