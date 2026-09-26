import { ArrowUpRight, CircleUserRound, Menu, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

const navItems = [
  { href: "/diagnosis", label: "Diagnosa" },
  { href: "/networth", label: "Net Worth Tracking" },
  { href: "/retirement", label: "Goal Pensiun" },
  { href: "/pricing", label: "Premium" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location === "/";

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
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${active ? "bg-[#e3ebe0] text-[#1f2e2a]" : "text-[#65736a] hover:bg-white hover:text-[#1f2e2a]"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/owner" className="text-[13px] font-semibold text-[#718077] hover:text-[#1f2e2a]">Owner preview</Link>
            <button className="flex items-center gap-2 rounded-full border border-[#d4ded3] bg-white px-4 py-2 text-[13px] font-semibold text-[#1f2e2a] shadow-sm hover:border-[#aebdae]">
              <CircleUserRound size={15} /> Masuk
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full p-2 text-[#1f2e2a] md:hidden" aria-label="Buka menu">
            <Menu size={21} />
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-[#dfe6dc] bg-[#f6f7f2] px-5 pb-5 pt-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white">{item.label}</Link>)}
              <Link href="/owner" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#718077] hover:bg-white">Owner preview</Link>
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
