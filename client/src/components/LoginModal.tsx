import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { AlertCircle, CheckCircle2, KeyRound, Lock, ShieldCheck, Sparkles, User, X } from "lucide-react";
import React, { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      setError(err.message || "Gagal masuk. Silakan coba lagi.");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Masukkan alamat email yang valid");
      return;
    }
    if (!name.trim()) {
      setError("Masukkan nama Anda");
      return;
    }
    setError("");
    loginMutation.mutate({ email, name, role });
  };

  const handleQuickLogin = (quickRole: "user" | "admin") => {
    setError("");
    if (quickRole === "admin") {
      loginMutation.mutate({
        email: "owner@petakaya.com",
        name: "Owner / Admin Petakaya",
        role: "admin",
      });
    } else {
      loginMutation.mutate({
        email: "user@petakaya.com",
        name: "Pengguna Petakaya",
        role: "user",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#dce6da] bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#87938a] hover:bg-[#f0f3ef] hover:text-[#1f2e2a]"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2e2a] text-white shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-[-.02em] text-[#1f2e2a]">Masuk ke Petakaya</h2>
            <p className="text-xs text-[#718077]">Akses fitur Net Worth, Goal Pensiun & Owner Dashboard</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#fdf2f0] p-3 text-xs font-semibold text-[#b24e33]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Access Presets */}
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9aa79d]">Masuk Cepat (Akses Langsung)</p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              disabled={loginMutation.isPending}
              onClick={() => handleQuickLogin("admin")}
              className="flex items-center gap-2.5 rounded-xl border border-[#f0dfd5] bg-[#fffaf7] p-3 text-left transition hover:border-[#bc6c4c] hover:shadow-sm disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f9e9e1] text-[#bc6c4c]">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1f2e2a]">Akses Admin/Owner</p>
                <p className="text-[10px] text-[#9a7b6d]">Semua Fitur + Workspace</p>
              </div>
            </button>

            <button
              type="button"
              disabled={loginMutation.isPending}
              onClick={() => handleQuickLogin("user")}
              className="flex items-center gap-2.5 rounded-xl border border-[#dce6da] bg-[#fafcf9] p-3 text-left transition hover:border-[#aebdae] hover:shadow-sm disabled:opacity-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3eb] text-[#5f7164]">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1f2e2a]">Akses User Biasa</p>
                <p className="text-[10px] text-[#718077]">Net Worth & Goal Pensiun</p>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e3ebe0]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9aa79d]">atau isi email Anda</span>
          <div className="h-px flex-1 bg-[#e3ebe0]" />
        </div>

        {/* Custom Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#4e5c54]">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="mt-1 w-full rounded-xl border border-[#dce6da] bg-[#fafcf9] px-3.5 py-2.5 text-xs outline-none focus:border-[#1f2e2a]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#4e5c54]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="mt-1 w-full rounded-xl border border-[#dce6da] bg-[#fafcf9] px-3.5 py-2.5 text-xs outline-none focus:border-[#1f2e2a]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#4e5c54]">Role Peran</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  role === "user" ? "border-[#1f2e2a] bg-[#1f2e2a] text-white" : "border-[#dce6da] bg-[#fafcf9] text-[#65736a]"
                }`}
              >
                User Biasa
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  role === "admin" ? "border-[#bc6c4c] bg-[#bc6c4c] text-white" : "border-[#dce6da] bg-[#fafcf9] text-[#65736a]"
                }`}
              >
                Admin / Owner
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f2e2a] py-3 text-xs font-bold text-white transition hover:bg-[#30443d] disabled:opacity-50"
          >
            {loginMutation.isPending ? "Memproses..." : "Masuk ke Akun"}
          </button>
        </form>

        {/* OAuth Portal Alternative */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => startLogin()}
            className="text-[11px] font-semibold text-[#87938a] hover:text-[#1f2e2a] hover:underline"
          >
            Gunakan Portal Single Sign-On (OAuth) →
          </button>
        </div>
      </div>
    </div>
  );
}
