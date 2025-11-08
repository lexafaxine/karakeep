CREATE TABLE `searchHistory` (
	`id` text PRIMARY KEY NOT NULL,
	`searchTerm` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `searchHistory_userId_idx` ON `searchHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `searchHistory_createdAt_idx` ON `searchHistory` (`createdAt`);