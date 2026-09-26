CREATE TABLE `diagnosis_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`whatsapp` varchar(32) NOT NULL,
	`birthDate` varchar(20) NOT NULL,
	`city` varchar(120) NOT NULL,
	`status` enum('new','in_progress','completed','converted') NOT NULL DEFAULT 'new',
	`source` varchar(120),
	`consentAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diagnosis_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `diagnosis_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`characterProfile` enum('melankolis','koleris','sanguinis','phlegmatis') NOT NULL,
	`riskProfile` enum('konservatif','moderat','bertumbuh','agresif') NOT NULL,
	`strengths` text NOT NULL,
	`blindSpot` text NOT NULL,
	`insight` text NOT NULL,
	`nextStep` text NOT NULL,
	`pdfDownloadedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnosis_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `networth_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`snapshotId` int NOT NULL,
	`side` enum('asset','liability') NOT NULL,
	`category` varchar(80) NOT NULL,
	`label` varchar(160) NOT NULL,
	`amount` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `networth_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `networth_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`period` varchar(30) NOT NULL,
	`totalAssets` bigint NOT NULL,
	`totalLiabilities` bigint NOT NULL,
	`netWorth` bigint NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `networth_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `owner_export_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exportType` enum('leads_diagnosis','premium_customers','diagnosis_results','premium_payments','networth_snapshots') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `owner_export_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `premium_customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`userId` int,
	`packageName` varchar(80) NOT NULL DEFAULT 'premium_2026',
	`purchasePrice` bigint NOT NULL,
	`status` enum('active','expired','refunded','cancelled') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`zoomAttended` int NOT NULL DEFAULT 0,
	`groupJoined` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `premium_customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `premium_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`transactionId` varchar(120) NOT NULL,
	`amount` bigint NOT NULL,
	`status` enum('paid','pending','refunded') NOT NULL DEFAULT 'paid',
	`paidAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `premium_payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `premium_payments_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
ALTER TABLE `diagnosis_results` ADD CONSTRAINT `diagnosis_results_leadId_diagnosis_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `diagnosis_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `networth_items` ADD CONSTRAINT `networth_items_snapshotId_networth_snapshots_id_fk` FOREIGN KEY (`snapshotId`) REFERENCES `networth_snapshots`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `networth_snapshots` ADD CONSTRAINT `networth_snapshots_customerId_premium_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `premium_customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `owner_export_logs` ADD CONSTRAINT `owner_export_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `premium_customers` ADD CONSTRAINT `premium_customers_leadId_diagnosis_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `diagnosis_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `premium_customers` ADD CONSTRAINT `premium_customers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `premium_payments` ADD CONSTRAINT `premium_payments_customerId_premium_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `premium_customers`(`id`) ON DELETE no action ON UPDATE no action;