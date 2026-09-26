import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} satisfies TrpcContext;

describe("lead and diagnosis input contracts", () => {
  it("rejects an incomplete diagnosis lead", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.lead.create({ name: "A", email: "bad", whatsapp: "1", birthDate: "", city: "" })).rejects.toThrow();
  });

  it("rejects unsupported diagnosis profiles", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.diagnosis.save({
      leadId: 1,
      characterProfile: "unknown" as never,
      riskProfile: "konservatif",
      strengths: "strength",
      blindSpot: "blind spot",
      insight: "insight",
      nextStep: "next step",
    })).rejects.toThrow();
  });
});
