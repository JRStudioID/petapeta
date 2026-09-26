import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const diagnosisLeads = mysqlTable("diagnosis_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 32 }).notNull(),
  birthDate: varchar("birthDate", { length: 20 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "completed", "converted"]).default("new").notNull(),
  source: varchar("source", { length: 120 }),
  consentAt: timestamp("consentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const diagnosisResults = mysqlTable("diagnosis_results", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => diagnosisLeads.id),
  characterProfile: mysqlEnum("characterProfile", ["melankolis", "koleris", "sanguinis", "phlegmatis"]).notNull(),
  riskProfile: mysqlEnum("riskProfile", ["konservatif", "moderat", "bertumbuh", "agresif"]).notNull(),
  strengths: text("strengths").notNull(),
  blindSpot: text("blindSpot").notNull(),
  insight: text("insight").notNull(),
  nextStep: text("nextStep").notNull(),
  pdfDownloadedAt: timestamp("pdfDownloadedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const premiumCustomers = mysqlTable("premium_customers", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => diagnosisLeads.id),
  userId: int("userId").references(() => users.id),
  packageName: varchar("packageName", { length: 80 }).default("premium_2026").notNull(),
  purchasePrice: bigint("purchasePrice", { mode: "number" }).notNull(),
  status: mysqlEnum("status", ["active", "expired", "refunded", "cancelled"]).default("active").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  zoomAttended: int("zoomAttended").default(0).notNull(),
  groupJoined: int("groupJoined").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const premiumPayments = mysqlTable("premium_payments", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => premiumCustomers.id),
  transactionId: varchar("transactionId", { length: 120 }).notNull().unique(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  status: mysqlEnum("status", ["paid", "pending", "refunded"]).default("paid").notNull(),
  paidAt: timestamp("paidAt").defaultNow().notNull(),
});

export const manualPaymentRequests = mysqlTable("manual_payment_requests", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => diagnosisLeads.id),
  packageName: varchar("packageName", { length: 80 }).default("premium_2026").notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  status: mysqlEnum("status", ["waiting_payment", "waiting_confirmation", "confirmed", "rejected"]).default("waiting_payment").notNull(),
  proofUrl: text("proofUrl"),
  whatsapp: varchar("whatsapp", { length: 32 }).notNull(),
  confirmedBy: int("confirmedBy").references(() => users.id),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const retirementGoals = mysqlTable("retirement_goals", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => premiumCustomers.id),
  currentAge: int("currentAge").notNull(),
  retirementAge: int("retirementAge").notNull(),
  monthlyNeed: bigint("monthlyNeed", { mode: "number" }).notNull(),
  inflationRate: int("inflationRate").default(4).notNull(),
  returnRate: int("returnRate").default(7).notNull(),
  withdrawalRate: int("withdrawalRate").default(4).notNull(),
  liquidAssets: bigint("liquidAssets", { mode: "number" }).notNull(),
  targetAmount: bigint("targetAmount", { mode: "number" }).notNull(),
  recommendedDca: bigint("recommendedDca", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const dailyMetrics = mysqlTable("daily_metrics", {
  id: int("id").autoincrement().primaryKey(),
  metricDate: varchar("metricDate", { length: 10 }).notNull(),
  visitors: int("visitors").default(0).notNull(),
  leads: int("leads").default(0).notNull(),
  diagnosesCompleted: int("diagnosesCompleted").default(0).notNull(),
  pdfDownloads: int("pdfDownloads").default(0).notNull(),
  premiumClicks: int("premiumClicks").default(0).notNull(),
  premiumCustomers: int("premiumCustomers").default(0).notNull(),
  paymentsPending: int("paymentsPending").default(0).notNull(),
  revenue: bigint("revenue", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const networthSnapshots = mysqlTable("networth_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => premiumCustomers.id),
  period: varchar("period", { length: 30 }).notNull(),
  totalAssets: bigint("totalAssets", { mode: "number" }).notNull(),
  totalLiabilities: bigint("totalLiabilities", { mode: "number" }).notNull(),
  netWorth: bigint("netWorth", { mode: "number" }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const networthItems = mysqlTable("networth_items", {
  id: int("id").autoincrement().primaryKey(),
  snapshotId: int("snapshotId").notNull().references(() => networthSnapshots.id),
  side: mysqlEnum("side", ["asset", "liability"]).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  label: varchar("label", { length: 160 }).notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ownerExportLogs = mysqlTable("owner_export_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  exportType: mysqlEnum("exportType", ["leads_diagnosis", "premium_customers", "diagnosis_results", "premium_payments", "networth_snapshots"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DiagnosisLead = typeof diagnosisLeads.$inferSelect;
export type DiagnosisResult = typeof diagnosisResults.$inferSelect;
export type PremiumCustomer = typeof premiumCustomers.$inferSelect;
export type NetworthSnapshot = typeof networthSnapshots.$inferSelect;
