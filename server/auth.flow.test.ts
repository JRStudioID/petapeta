import { beforeAll, describe, expect, it } from "vitest";

// Simulasi lingkungan lokal TANPA database & OAuth (kondisi yang kemungkinan dialami user).
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-test-secret-test-secret";
delete process.env.DATABASE_URL;
delete process.env.VITE_APP_ID;
delete process.env.OAUTH_SERVER_URL;

type Cookie = { name: string; value: string };

async function setup() {
  const { appRouter } = await import("./routers");
  const { sdk } = await import("./_core/sdk");
  const { COOKIE_NAME } = await import("../shared/const");

  const login = async (input: Parameters<ReturnType<typeof appRouter.createCaller>["auth"]["login"]>[0]) => {
    const cookies: Cookie[] = [];
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "http", headers: {} } as any,
      res: { cookie: (name: string, value: string) => cookies.push({ name, value }), clearCookie() {} } as any,
    });
    const result = await caller.auth.login(input);
    return { result, cookies };
  };

  // Meniru request berikutnya dari browser: kirim cookie / Bearer token -> context.user -> auth.me
  const me = async (headers: Record<string, string>) => {
    let user: any = null;
    try {
      user = await sdk.authenticateRequest({ headers } as any);
    } catch {
      user = null;
    }
    const caller = appRouter.createCaller({ user, req: {} as any, res: {} as any });
    return caller.auth.me();
  };

  return { login, me, COOKIE_NAME };
}

describe("Alur login -> sesi dikenali (tanpa DB & OAuth)", () => {
  let t: Awaited<ReturnType<typeof setup>>;
  // Import pertama modul server bisa lambat di Windows (~7s), beri batas waktu longgar.
  beforeAll(async () => {
    t = await setup();
  }, 60_000);

  it("login admin -> auth.me via COOKIE mengembalikan role admin", async () => {
    const { result, cookies } = await t.login({ email: "admin@petakaya.com", password: "admin123", role: "admin" });
    expect(result.success).toBe(true);
    const user = await t.me({ cookie: `${t.COOKIE_NAME}=${cookies[0].value}` });
    expect(user).not.toBeNull();
    expect(user?.role).toBe("admin");
  });

  it("login admin -> auth.me via Bearer token mengembalikan role admin", async () => {
    const { result } = await t.login({ email: "admin", password: "admin123" });
    const user = await t.me({ authorization: `Bearer ${(result as any).token}` });
    expect(user?.role).toBe("admin");
  });

  it("login user biasa -> auth.me mengembalikan role user", async () => {
    const { cookies } = await t.login({ email: "budi@gmail.com", name: "Budi" });
    const user = await t.me({ cookie: `${t.COOKIE_NAME}=${cookies[0].value}` });
    expect(user).not.toBeNull();
    expect(user?.role).toBe("user");
    expect(user?.email).toBe("budi@gmail.com");
  });

  it("tanpa cookie/token -> auth.me null", async () => {
    expect(await t.me({})).toBeNull();
  });

  it("token palsu/diubah -> auth.me null", async () => {
    const { cookies } = await t.login({ email: "budi@gmail.com" });
    const tampered = cookies[0].value.slice(0, -3) + "abc";
    expect(await t.me({ cookie: `${t.COOKIE_NAME}=${tampered}` })).toBeNull();
  });
});
