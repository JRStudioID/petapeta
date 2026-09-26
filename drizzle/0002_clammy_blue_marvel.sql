CREATE TABLE `daily_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricDate` varchar(10) NOT NULL,
	`visitors` int NOT NULL DEFAULT 0,
	`leads` int NOT NULL DEFAULT 0,
	`diagnosesCompleted` int NOT NULL DEFAULT 0,
	`pdfDownloads` int NOT NULL DEFAULT 0,
	`premiumClicks` int NOT NULL DEFAULT 0,
	`premiumCustomers` int NOT NULL DEFAULT 0,
	`paymentsPending` int NOT NULL DEFAULT 0,
	`revenue` bigint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manual_payment_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`packageName` varchar(80) NOT NULL DEFAULT 'premium_2026',
	`amount` bigint NOT NULL,
	`status` enum('waiting_payment','waiting_confirmation','confirmed','rejected') NOT NULL DEFAULT 'waiting_payment',
	`proofUrl` text,
	`whatsapp` varchar(32) NOT NULL,
	`confirmedBy` int,
	`confirmedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manual_payment_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retirement_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`currentAge` int NOT NULL,
	`retirementAge` int NOT NULL,
	`monthlyNeed` bigint NOT NULL,
	`inflationRate` int NOT NULL DEFAULT 4,
	`returnRate` int NOT NULL DEFAULT 7,
	`withdrawalRate` int NOT NULL DEFAULT 4,
	`liquidAssets` bigint NOT NULL,
	`targetAmount` bigint NOT NULL,
	`recommendedDca` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retirement_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `manual_payment_requests` ADD CONSTRAINT `manual_payment_requests_leadId_diagnosis_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `diagnosis_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manual_payment_requests` ADD CONSTRAINT `manual_payment_requests_confirmedBy_users_id_fk` FOREIGN KEY (`confirmedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `retirement_goals` ADD CONSTRAINT `retirement_goals_customerId_premium_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `premium_customers`(`id`) ON DELETE no action ON UPDATE no action;