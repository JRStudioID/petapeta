import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { diagnosisLeads, diagnosisResults, ownerExportLogs, premiumCustomers, premiumPayments, networthSnapshots, manualPaymentRequests, retirementGoals, dailyMetrics } from "../drizzle/schema";

const leadInput = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  whatsapp: z.string().min(8),
  birthDate: z.string().min(4),
  city: z.string().min(2),
  source: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  lead: router({
    create: publicProcedure.input(leadInput).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { id: 0, persisted: false };
      const result = await db.insert(diagnosisLeads).values(input);
      return { id: Number(result[0].insertId), persisted: true };
    }),
  }),
  diagnosis: router({
    save: publicProcedure.input(z.object({
      leadId: z.number().int().positive(),
      characterProfile: z.enum(["melankolis", "koleris", "sanguinis", "phlegmatis"]),
      riskProfile: z.enum(["konservatif", "moderat", "bertumbuh", "agresif"]),
      strengths: z.string(), blindSpot: z.string(), insight: z.string(), nextStep: z.string(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { id: 0, persisted: false };
      await db.update(diagnosisLeads).set({ status: "completed" }).where(eq(diagnosisLeads.id, input.leadId));
      const result = await db.insert(diagnosisResults).values(input);
      return { id: Number(result[0].insertId), persisted: true };
    }),
  }),
  payment: router({
    createManualRequest: publicProcedure.input(z.object({ leadId: z.number().int().positive(), whatsapp: z.string().min(8), amount: z.number().int().positive().default(168000) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { id: 0, persisted: false };
      const result = await db.insert(manualPaymentRequests).values(input);
      return { id: Number(result[0].insertId), persisted: true };
    }),
  }),
  retirement: router({
    save: protectedProcedure.input(z.object({ customerId: z.number().int().positive(), currentAge: z.number().int().min(18).max(90), retirementAge: z.number().int().min(40).max(90), monthlyNeed: z.number().int().positive(), inflationRate: z.number().int().default(4), returnRate: z.number().int().default(7), withdrawalRate: z.number().int().default(4), liquidAssets: z.number().int().nonnegative(), targetAmount: z.number().int().positive(), recommendedDca: z.number().int().nonnegative() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { persisted: false };
      await db.insert(retirementGoals).values(input);
      return { persisted: true };
    }),
  }),
  admin: router({
    leads: adminProcedure.query(async () => {
      const db = await getDb();
      return db ? db.select().from(diagnosisLeads).orderBy(desc(diagnosisLeads.createdAt)) : [];
    }),
    premium: adminProcedure.query(async () => {
      const db = await getDb();
      return db ? db.select().from(premiumCustomers).orderBy(desc(premiumCustomers.createdAt)) : [];
    }),
    payments: adminProcedure.query(async () => {
      const db = await getDb();
      return db ? db.select().from(premiumPayments).orderBy(desc(premiumPayments.paidAt)) : [];
    }),
    snapshots: adminProcedure.query(async () => {
      const db = await getDb();
      return db ? db.select().from(networthSnapshots).orderBy(desc(networthSnapshots.updatedAt)) : [];
    }),
    manualPayments: adminProcedure.query(async () => {
      const db = await getDb();
      return db ? db.select().from(manualPaymentRequests).orderBy(desc(manualPaymentRequests.createdAt)) : [];
    }),
    dailyMetrics: adminProcedure.query(async () => {
      const db = await getDb();
      return db ? db.select().from(dailyMetrics).orderBy(desc(dailyMetrics.metricDate)) : [];
    }),
    confirmPayment: adminProcedure.input(z.object({ id: z.number().int().positive(), leadId: z.number().int().positive(), amount: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { persisted: false };
      const request = await db.select().from(manualPaymentRequests).where(eq(manualPaymentRequests.id, input.id)).limit(1);
      if (!request[0] || request[0].status === "confirmed") return { persisted: false, alreadyConfirmed: true };
      const now = new Date();
      await db.update(manualPaymentRequests).set({ status: "confirmed", confirmedBy: ctx.user.id, confirmedAt: now }).where(eq(manualPaymentRequests.id, input.id));
      await db.update(diagnosisLeads).set({ status: "converted" }).where(eq(diagnosisLeads.id, input.leadId));
      const expires = new Date(now);
      expires.setFullYear(expires.getFullYear() + 1);
      const existingCustomer = await db.select().from(premiumCustomers).where(eq(premiumCustomers.leadId, input.leadId)).limit(1);
      let customerId = existingCustomer[0]?.id ?? 0;
      if (customerId) await db.update(premiumCustomers).set({ status: "active", startedAt: now, expiresAt: expires, purchasePrice: input.amount }).where(eq(premiumCustomers.id, customerId));
      else { const customer = await db.insert(premiumCustomers).values({ leadId: input.leadId, packageName: "premium_2026", purchasePrice: input.amount, status: "active", startedAt: now, expiresAt: expires }); customerId = Number(customer[0].insertId); }
      if (customerId) await db.insert(premiumPayments).values({ customerId, transactionId: `MANUAL-${input.id}-${Date.now()}`, amount: input.amount, status: "paid", paidAt: now });
      return { persisted: true, premiumActivated: Boolean(customerId) };
    }),
    logExport: adminProcedure.input(z.object({ exportType: z.enum(["leads_diagnosis", "premium_customers", "diagnosis_results", "premium_payments", "networth_snapshots"]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { persisted: false };
      await db.insert(ownerExportLogs).values({ userId: ctx.user.id, exportType: input.exportType });
      return { persisted: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
