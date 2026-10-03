import { useAuth } from "@/_core/hooks/useAuth";
import LoginModal from "./LoginModal";
import { ArrowLeft, LockKeyhole, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { Link } from "wouter";
import React, { useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-74px)] items-center justify-center bg-[#f6f7f2] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f2e2a] text-white shadow-md animate-pulse">
            <Sparkles size={22} />
          </div>
          <p className="text-xs font-semibold text-[#718077]">Memeriksa akses akun...</p>
        </div>
      </div>
    );
  }

  // Case 1: Unauthenticated user trying to access protected features
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-74px)] items-center justify-center bg-[#f6f7f2] px-5 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-[#dce6da] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f9e9e1] text-[#bc6c4c]">
            <LockKeyhole size={28} />
          </div>

          <h2 className="mt-5 font-display text-2xl tracking-[-.02em] text-[#1f2e2a]">
            Silakan Masuk Terlebih Dahulu
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#718077]">
            Halaman ini membutuhkan akun terdaftar. Silakan masuk untuk mengakses kalkulator Net Worth, Goal Pensiun, dan fitur Premium Petakaya.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f2e2a] py-3.5 text-sm font-bold text-white transition hover:bg-[#30443d]"
            >
              <UserCheck size={18} /> Masuk / Daftar Akun
            </button>

            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce6da] bg-[#f6f7f2] py-3 text-xs font-bold text-[#65736a] hover:bg-[#eaeedd]"
            >
              <ArrowLeft size={15} /> Kembali ke Beranda
            </Link>
          </div>

          <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </div>
      </div>
    );
  }

  // Case 2: Authenticated regular user trying to access admin-only features (/owner)
  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="flex min-h-[calc(100vh-74px)] items-center justify-center bg-[#f6f7f2] px-5 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-[#f0d5ce] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fcece6] text-[#b24e33]">
            <ShieldAlert size={28} />
          </div>

          <h2 className="mt-5 font-display text-2xl tracking-[-.02em] text-[#1f2e2a]">
            Akses Khusus Owner
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#718077]">
            Maaf, akun Anda (<span className="font-semibold text-[#1f2e2a]">{user?.email || user?.name || "User"}</span>) terdaftar sebagai pengguna biasa. Workspace ini khusus untuk Owner & Admin Petakaya.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f2e2a] py-3 text-xs font-bold text-white hover:bg-[#30443d]"
            >
              <ArrowLeft size={15} /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authorized
  return <>{children}</>;
}
