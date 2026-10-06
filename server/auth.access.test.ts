import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createMockContext(user: User | null = null): { ctx: TrpcContext; setCookies: any[] } {
  const setCookies: any[] = [];
  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx, setCookies };
}

describe("User Access Control & Login Integration", () => {
  describe("Login Role & Password Protection", () => {
    it("allows standard user login without password", async () => {
      const { ctx, setCookies } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const res = await caller.auth.login({
        email: "user@petakaya.com",
        name: "Pengguna Test",
        role: "user",
      });

      expect(res.success).toBe(true);
      expect(res.role).toBe("user");
      expect(setCookies.length).toBe(1);
    });

    it("allows admin login with correct password (admin123)", async () => {
      const { ctx, setCookies } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const res = await caller.auth.login({
        email: "admin@petakaya.com",
        password: "admin123",
        role: "admin",
      });

      expect(res.success).toBe(true);
      expect(res.role).toBe("admin");
      expect(setCookies.length).toBe(1);
    });

    it("rejects admin login with wrong password", async () => {
      const { ctx } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: "admin@petakaya.com",
          password: "wrong_password",
          role: "admin",
        })
      ).rejects.toThrow("Password admin salah");
    });

    it("rejects admin login when password is missing", async () => {
      const { ctx } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: "user@petakaya.com",
          role: "admin",
        })
      ).rejects.toThrow("Password admin diperlukan");
    });
  });

  describe("Route Access Control (RBAC)", () => {
    const regularUser: User = {
      id: 1,
      openId: "usr_user_test",
      email: "user@test.com",
      name: "User Biasa",
      loginMethod: "Password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const adminUser: User = {
      id: 2,
      openId: "usr_admin_test",
      email: "admin@petakaya.com",
      name: "Admin Owner",
      loginMethod: "Password",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    it("prevents unauthenticated user from accessing protected procedure", async () => {
      const { ctx } = createMockContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.retirement.save({
          customerId: 1,
          currentAge: 30,
          retirementAge: 60,
          monthlyNeed: 10000000,
          liquidAssets: 50000000,
          targetAmount: 2000000000,
          recommendedDca: 5000000,
        })
      ).rejects.toThrow();
    });

    it("prevents regular user from accessing admin endpoints", async () => {
      const { ctx } = createMockContext(regularUser);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.admin.users()).rejects.toThrow();
      await expect(caller.admin.leads()).rejects.toThrow();
    });

    it("allows admin user to access admin endpoints", async () => {
      const { ctx } = createMockContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const usersList = await caller.admin.users();
      expect(Array.isArray(usersList)).toBe(true);
    });
  });
});
