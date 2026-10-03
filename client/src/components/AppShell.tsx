import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ArrowUpRight, CircleUserRound, Lock, LogOut, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const isLanding = location === "/";

  // Navigation Items setup according to role and auth state
  const baseNavItems = [
    { href: "/diagnosis", label: "Diagnosa", public: true },
    { href: "/networth", label: "Net Worth Tracking", public: false },
    { href: "/retirement", label: "Goal Pensiun", public: false },
    { href: "/pricing", label: "Premium", public: false },
  ];

  const visibleNavItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ href: "/owner", label: "Owner Workspace", public: false, isOwner: true }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#1f2e2a]">
      <header className="sticky top-0 z-40 border-b border-[#dfe6dc]/80 bg-[#f6f7f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#1f2e2a] text-[#f6f7f2] shadow-sm">
              <Sparkles size={16} strokeWidth={1.8} />
            </span>
            <span className="font-display text-[25px] leading-none tracking-[-.03em]">petakaya</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((item) => {
              const active = location === item.href;
              const isLocked = !isAuthenticated && !item.public;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    active
                      ? "bg-[#e3ebe0] text-[#1f2e2a]"
                      : item.isOwner
                      ? "bg-[#f9e9e1] text-[#bc6c4c] hover:bg-[#f3ded4]"
                      : "text-[#65736a] hover:bg-white hover:text-[#1f2e2a]"
                  }`}
                >
                  {item.label}
                  {isLocked && <Lock size={12} className="text-[#a1ada4]" />}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <span className="flex items-center gap-1 rounded-full bg-[#f9e9e1] px-3 py-1 text-[11px] font-bold text-[#bc6c4c]">
                    <ShieldCheck size={13} /> Owner / Admin
                  </span>
                )}
                <div className="flex items-center gap-2 rounded-full border border-[#d4ded3] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#1f2e2a] shadow-sm">
                  <CircleUserRound size={16} className="text-[#65736a]" />
                  <span className="max-w-[120px] truncate text-xs">{user?.name || user?.email || "Akun"}</span>
                  <button
                    onClick={() => logout()}
                    title="Keluar"
                    className="ml-1 rounded-full p-1 text-[#87938a] hover:bg-[#f0f3ef] hover:text-[#b24e33]"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => startLogin()}
                className="flex items-center gap-2 rounded-full border border-[#d4ded3] bg-[#1f2e2a] px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#30443d]"
              >
                <CircleUserRound size={15} /> Masuk
              </button>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full p-2 text-[#1f2e2a] md:hidden" aria-label="Buka menu">
            <Menu size={21} />
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#dfe6dc] bg-[#f6f7f2] px-5 pb-5 pt-3 md:hidden">
            <div className="flex flex-col gap-1">
              {visibleNavItems.map((item) => {
                const isLocked = !isAuthenticated && !item.public;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white"
                  >
                    <span>{item.label}</span>
                    {isLocked && <Lock size={14} className="text-[#a1ada4]" />}
                  </Link>
                );
              })}

              <div className="mt-3 pt-3 border-t border-[#dfe6dc]">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold text-[#65736a]">{user?.email || user?.name}</span>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#b24e33]"
                    >
                      <LogOut size={14} /> Keluar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      startLogin();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f2e2a] py-3 text-sm font-bold text-white"
                  >
                    <CircleUserRound size={16} /> Masuk / Daftar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      {isLanding && (
        <footer className="border-t border-[#dfe6dc] bg-[#eef2eb]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <div className="font-display text-[24px]">petakaya</div>
              <p className="mt-1 text-sm text-[#718077]">Teman berpikir untuk keputusan uang yang lebih tenang.</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#718077]">
              <span>Privasi</span><span>Keamanan data</span><span>© 2026 Petakaya</span>
              <Link href="/diagnosis" className="flex items-center gap-1 text-[#bc6c4c]">Mulai gratis <ArrowUpRight size={13} /></Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

