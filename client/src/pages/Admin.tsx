import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Check, ChevronRight, Database, Download, FileText, LockKeyhole, Search, Users, WalletCards } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

type Lead = { id: string; name: string; email: string; whatsapp: string; city: string; status: string; character: string; risk: string; pdf: string; premiumClick: string; source: string; last: string };
type Customer = { customerId: string; leadId: string; name: string; email: string; started: string; expires: string; price: number; status: string; snapshots: number; zoom: number; group: string };
const leads: Lead[] = [{ id: "LD-1001", name: "Rani A.", email: "rani***@gmail.com", whatsapp: "0812****921", city: "Jakarta", status: "Selesai", character: "Melankolis", risk: "Moderat", pdf: "Sudah", premiumClick: "Ya", source: "Instagram", last: "2 menit lalu" }, { id: "LD-1002", name: "Dimas N.", email: "dimas***@icloud.com", whatsapp: "0813****118", city: "Bandung", status: "Selesai", character: "Koleris", risk: "Bertumbuh", pdf: "Sudah", premiumClick: "Belum", source: "TikTok", last: "18 menit lalu" }, { id: "LD-1003", name: "Maya F.", email: "maya***@outlook.com", whatsapp: "0857****334", city: "Surabaya", status: "Sedang mengerjakan", character: "—", risk: "—", pdf: "Belum", premiumClick: "Belum", source: "Landing page", last: "1 jam lalu" }, { id: "LD-1004", name: "Ari P.", email: "ari***@gmail.com", whatsapp: "0822****870", city: "Yogyakarta", status: "Selesai", character: "Phlegmatis", risk: "Konservatif", pdf: "Sudah", premiumClick: "Ya", source: "Referral", last: "3 jam lalu" }];
const customers: Customer[] = [{ customerId: "CU-2041", leadId: "LD-1001", name: "Rani A.", email: "rani***@gmail.com", started: "22 Sep 2026", expires: "21 Sep 2027", price: 168000, status: "Aktif", snapshots: 3, zoom: 1, group: "Sudah" }, { customerId: "CU-2040", leadId: "LD-0998", name: "Bagas R.", email: "bagas***@gmail.com", started: "20 Sep 2026", expires: "19 Sep 2027", price: 168000, status: "Aktif", snapshots: 5, zoom: 2, group: "Sudah" }, { customerId: "CU-2032", leadId: "LD-0977", name: "Nadia S.", email: "nadia***@gmail.com", started: "02 Sep 2026", expires: "01 Sep 2027", price: 750000, status: "Aktif", snapshots: 1, zoom: 0, group: "Belum" }];
const idr = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

type UserRow = { id: number; openId: string; name: string; email: string; loginMethod: string; role: "user" | "admin"; createdAt: string; lastSignedIn: string };
const mockUsers: UserRow[] = [
  { id: 1, openId: "owner-001", name: "Admin Utama", email: "owner@petakaya.com", loginMethod: "Google", role: "admin", createdAt: "01 Sep 2026", lastSignedIn: "Hari ini" },
  { id: 2, openId: "usr-102", name: "Rani Anggraini", email: "rani@gmail.com", loginMethod: "Google", role: "user", createdAt: "15 Sep 2026", lastSignedIn: "Kemarin" },
  { id: 3, openId: "usr-103", name: "Bagas Pratama", email: "bagas@gmail.com", loginMethod: "Apple", role: "user", createdAt: "20 Sep 2026", lastSignedIn: "3 jam lalu" }
];

export default function Admin() {
  const [tab, setTab] = useState<"leads" | "premium" | "users">("leads");
  const [query, setQuery] = useState("");
  const liveLeads = trpc.admin.leads.useQuery(undefined, { retry: false });
  const liveCustomers = trpc.admin.premium.useQuery(undefined, { retry: false });
  const livePayments = trpc.admin.manualPayments.useQuery(undefined, { retry: false });
  const liveDaily = trpc.admin.dailyMetrics.useQuery(undefined, { retry: false });
  const liveUsers = trpc.admin.users.useQuery(undefined, { retry: false });

  const leadRows: Lead[] = liveLeads.data?.length ? liveLeads.data.map(row => ({ id: `LD-${row.id}`, name: row.name, email: row.email, whatsapp: row.whatsapp, city: row.city, status: row.status, character: "—", risk: "—", pdf: "Belum", premiumClick: "Belum", source: row.source || "direct", last: new Date(row.updatedAt).toLocaleDateString("id-ID") })) : leads;
  const customerRows: Customer[] = liveCustomers.data?.length ? liveCustomers.data.map(row => ({ customerId: `CU-${row.id}`, leadId: `LD-${row.leadId}`, name: "Premium customer", email: "—", started: new Date(row.startedAt).toLocaleDateString("id-ID"), expires: new Date(row.expiresAt).toLocaleDateString("id-ID"), price: row.purchasePrice, status: row.status, snapshots: 0, zoom: row.zoomAttended, group: row.groupJoined ? "Sudah" : "Belum" })) : customers;
  const userRows: UserRow[] = liveUsers.data?.length
    ? liveUsers.data.map(row => ({
        id: row.id,
        openId: row.openId,
        name: row.name || "User",
        email: row.email || "—",
        loginMethod: row.loginMethod || "OAuth",
        role: row.role as "user" | "admin",
        createdAt: new Date(row.createdAt).toLocaleDateString("id-ID"),
        lastSignedIn: new Date(row.lastSignedIn).toLocaleDateString("id-ID"),
      }))
    : mockUsers;

  const filteredLeads = useMemo(() => leadRows.filter(row => `${row.name} ${row.email} ${row.city}`.toLowerCase().includes(query.toLowerCase())), [query, liveLeads.data]);
  const filteredCustomers = useMemo(() => customerRows.filter(row => `${row.name} ${row.email}`.toLowerCase().includes(query.toLowerCase())), [query, liveCustomers.data]);
  const filteredUsers = useMemo(() => userRows.filter(row => `${row.name} ${row.email} ${row.role}`.toLowerCase().includes(query.toLowerCase())), [query, userRows]);

  const exportLeads = () => downloadCsv("leads_diagnosis.csv", leadRows.map(row => ({ lead_id: row.id, nama: row.name, email: row.email, whatsapp: row.whatsapp, tempat_tinggal: row.city, status_diagnosis: row.status, profil_karakter: row.character, profil_risiko: row.risk, pdf_download: row.pdf, klik_premium: row.premiumClick, sumber_traffic: row.source, terakhir_aktif: row.last })));
  const exportCustomers = () => downloadCsv("premium_customers.csv", customerRows.map(row => ({ customer_id: row.customerId, lead_id: row.leadId, nama: row.name, email: row.email, tanggal_mulai: row.started, tanggal_berakhir: row.expires, paket: "premium_2026", harga_pembelian: row.price, status: row.status, jumlah_snapshot: row.snapshots, kehadiran_zoom: row.zoom, sharing_group: row.group })));
  const exportUsers = () => downloadCsv("registered_users.csv", userRows.map(row => ({ user_id: row.id, name: row.name, email: row.email, login_method: row.loginMethod, role: row.role, created_at: row.createdAt, last_signed_in: row.lastSignedIn })));

  return <div className="min-h-[calc(100vh-74px)] bg-[#eef3eb] px-5 py-8 md:px-8 md:py-12"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Link href="/" className="mb-5 flex w-fit items-center gap-2 text-xs font-bold text-[#718077] hover:text-[#1f2e2a]"><ArrowDownRight size={15} /> Kembali ke public site</Link><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.17em] text-[#bc6c4c]"><Database size={14} /> Owner workspace</div><h1 className="mt-3 font-display text-[45px] leading-none tracking-[-.035em] md:text-[58px]">Petakaya, dari dalam.</h1><p className="mt-4 max-w-lg text-sm leading-6 text-[#718077]">Data live dari database utama saat owner login; preview fallback hanya dipakai ketika belum ada data.</p></div><div className="flex items-center gap-2 rounded-full border border-[#d3dfd0] bg-white px-4 py-2.5 text-xs font-bold text-[#5f7164]"><LockKeyhole size={14} /> Owner / admin aktif</div></div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Metric icon={Users} label="Total leads diagnosis" value="1.284" change="+18,2%" positive /><Metric icon={Activity} label="Diagnosis selesai" value="386" change="+12,6%" positive /><Metric icon={WalletCards} label="Premium aktif" value="142" change="+24,8%" positive /><Metric icon={BarChart3} label="Revenue September" value="Rp23,8 jt" change="+31,4%" positive /></div>
      <div className="mt-5 rounded-[24px] border border-[#dbe5d9] bg-white p-4 md:p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex flex-wrap rounded-xl bg-[#edf3eb] p-1"><button onClick={() => setTab("leads")} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === "leads" ? "bg-white text-[#1f2e2a] shadow-sm" : "text-[#7a8a7d]"}`}>Lead diagnosis</button><button onClick={() => setTab("premium")} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === "premium" ? "bg-white text-[#1f2e2a] shadow-sm" : "text-[#7a8a7d]"}`}>Premium customers</button><button onClick={() => setTab("users")} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === "users" ? "bg-white text-[#1f2e2a] shadow-sm" : "text-[#7a8a7d]"}`}>User terdaftar ({userRows.length})</button></div><div className="flex flex-wrap gap-2"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1ada4]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama, email, role" className="w-[220px] rounded-xl border border-[#dce6da] bg-[#fafcf9] py-2.5 pl-9 pr-3 text-xs outline-none" /></div><button onClick={tab === "leads" ? exportLeads : tab === "premium" ? exportCustomers : exportUsers} className="flex items-center gap-2 rounded-xl bg-[#1f2e2a] px-3.5 py-2.5 text-xs font-bold text-white hover:bg-[#30443d]"><Download size={14} /> Export {tab === "leads" ? "leads_diagnosis.csv" : tab === "premium" ? "premium_customers.csv" : "registered_users.csv"}</button></div></div></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-[#dbe5d9] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#bc6c4c]">Pembayaran manual</p><p className="mt-2 font-display text-2xl">{livePayments.data?.length ?? 0} request di database</p></div><span className="rounded-full bg-[#f9e9e1] px-3 py-1 text-[10px] font-bold text-[#a5654d]">BCA · WhatsApp</span></div><p className="mt-3 text-xs leading-5 text-[#829087]">Request masuk dari CTA Premium dan menunggu konfirmasi admin di rekening BCA.</p></div><div className="rounded-2xl border border-[#dbe5d9] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#bc6c4c]">Data harian</p><p className="mt-2 font-display text-2xl">{liveDaily.data?.length ?? 0} hari tercatat</p></div><span className="rounded-full bg-[#e8f1e5] px-3 py-1 text-[10px] font-bold text-[#678269]">Live database</span></div><p className="mt-3 text-xs leading-5 text-[#829087]">Traffic, lead, diagnosis selesai, klik Premium, customer, pending payment, dan revenue siap diekspor.</p></div></div>
      <PaymentQueue rows={livePayments.data || []} />
      {tab === "leads" ? <LeadTable rows={filteredLeads} /> : tab === "premium" ? <PremiumTable rows={filteredCustomers} /> : <UserTable rows={filteredUsers} />}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-[24px] border border-[#dbe5d9] bg-white p-6 md:p-7"><div className="flex items-center justify-between"><div><h2 className="font-display text-3xl">Pendapatan bulanan</h2><p className="mt-1 text-xs text-[#87938a]">Promo 2026 vs harga normal</p></div><span className="rounded-full bg-[#e8f1e5] px-3 py-1.5 text-[10px] font-bold text-[#678269]">+31,4% MoM</span></div><div className="mt-8 flex h-[170px] items-end gap-3 border-b border-[#edf1eb]">{[{ month: "Apr", value: 32 }, { month: "Mei", value: 48 }, { month: "Jun", value: 44 }, { month: "Jul", value: 63 }, { month: "Agu", value: 56 }, { month: "Sep", value: 92 }].map(item => <div key={item.month} className="flex flex-1 flex-col items-center gap-2"><div className="group relative w-full rounded-t-md bg-[#9ebc9f]" style={{ height: `${item.value}%` }}><span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[9px] font-bold text-[#6d816f] group-hover:block">{item.value}%</span></div><span className="text-[10px] font-semibold text-[#9aa79d]">{item.month}</span></div>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#f0f5ed] p-3"><p className="text-[10px] text-[#849187]">Bulan ini</p><p className="mt-1 text-sm font-bold">Rp23,8 jt</p></div><div className="rounded-xl bg-[#f9e9e1] p-3"><p className="text-[10px] text-[#849187]">Transaksi</p><p className="mt-1 text-sm font-bold">142</p></div><div className="rounded-xl bg-[#f0f5ed] p-3"><p className="text-[10px] text-[#849187]">ARPU</p><p className="mt-1 text-sm font-bold">Rp167,6 rb</p></div></div></div><div className="rounded-[24px] bg-[#1f2e2a] p-6 text-white md:p-7"><h2 className="font-display text-3xl">Funnel minggu ini</h2><p className="mt-1 text-xs text-[#aabdac]">Dari traffic ke Premium</p><div className="mt-8 space-y-5"><Funnel label="Landing page" value="1.284" width="100%" /><Funnel label="Isi data lead" value="742" width="58%" /><Funnel label="Selesai diagnosis" value="386" width="30%" /><Funnel label="Premium aktif" value="142" width="11%" /></div><div className="mt-8 rounded-xl bg-white/[.08] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#c3d9ba]">Insight owner</p><p className="mt-2 text-sm leading-6 text-[#c3cfc4]">Lead yang sudah download PDF memiliki peluang upgrade lebih tinggi. Follow-up edukasi 24 jam setelah export PDF.</p></div></div></div>
      <div className="mt-5 grid gap-4 md:grid-cols-4"><QuickAction icon={FileText} label="Export diagnosis_results.csv" onClick={() => downloadCsv("diagnosis_results.csv", leads.map(row => ({ lead_id: row.id, profil_karakter: row.character, profil_risiko: row.risk, pdf_download: row.pdf, insight: "Snapshot dan langkah kecil bulan ini" })))} /><QuickAction icon={Database} label="Export networth_snapshots.csv" onClick={() => downloadCsv("networth_snapshots.csv", customers.map(row => ({ customer_id: row.customerId, periode: "September 2026", total_aset: 410200000, total_kewajiban: 161500000, net_worth: 248700000, jumlah_snapshot: row.snapshots })))} /><QuickAction icon={BarChart3} label="Export premium_payments.csv" onClick={() => downloadCsv("premium_payments.csv", customers.map(row => ({ customer_id: row.customerId, paket: "premium_2026", harga: row.price, status: "paid", tanggal: row.started })))}/><QuickAction icon={Activity} label="Export daily_funnel.csv" onClick={() => downloadCsv("daily_funnel.csv", (liveDaily.data || []).map(row => ({ tanggal: row.metricDate, visitors: row.visitors, leads: row.leads, diagnosis_selesai: row.diagnosesCompleted, pdf_download: row.pdfDownloads, klik_premium: row.premiumClicks, premium_aktif: row.premiumCustomers, pending_payment: row.paymentsPending, revenue: row.revenue })))} /></div>
    </div></div>;
}

function UserTable({ rows }: { rows: UserRow[] }) {
  const utils = trpc.useUtils();
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
    },
  });

  return (
    <div className="mt-5 rounded-[24px] border border-[#dbe5d9] bg-white p-6 md:p-7">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl">Manajemen Pengguna Terdaftar</h2>
          <p className="mt-1 text-xs text-[#87938a]">Seluruh pengguna yang membuat akun via OAuth beserta kelola role admin.</p>
        </div>
        <span className="rounded-full bg-[#e8f1e5] px-3 py-1.5 text-[10px] font-bold text-[#678269]">{rows.length} akun terdaftar</span>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-[#edf1eb] text-[10px] font-bold uppercase tracking-wider text-[#9aa79d]">
              <th className="pb-3">Pengguna</th>
              <th className="pb-3">Metode Login</th>
              <th className="pb-3">Role Status</th>
              <th className="pb-3">Tanggal Terdaftar</th>
              <th className="pb-3">Terakhir Login</th>
              <th className="pb-3 text-right">Tindakan Role</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[#f0f3ef] text-xs">
                <td className="py-4">
                  <p className="font-bold">{row.name}</p>
                  <p className="mt-0.5 text-[10px] text-[#9aa79d]">{row.email}</p>
                </td>
                <td className="py-4 text-[#637167]">
                  <span className="rounded-md bg-[#f0f4ef] px-2 py-1 text-[10px] font-semibold">{row.loginMethod}</span>
                </td>
                <td className="py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      row.role === "admin" ? "bg-[#f9e9e1] text-[#bc6c4c]" : "bg-[#e5f0e2] text-[#678269]"
                    }`}
                  >
                    {row.role === "admin" ? "Admin / Owner" : "Regular User"}
                  </span>
                </td>
                <td className="py-4 text-[#87938a]">{row.createdAt}</td>
                <td className="py-4 text-[#87938a]">{row.lastSignedIn}</td>
                <td className="py-4 text-right">
                  <button
                    disabled={updateRole.isPending}
                    onClick={() => updateRole.mutate({ userId: row.id, role: row.role === "admin" ? "user" : "admin" })}
                    className="rounded-lg border border-[#dce6da] bg-[#fafcf9] px-3 py-1.5 text-[11px] font-bold text-[#1f2e2a] hover:bg-[#edf3eb] disabled:opacity-50"
                  >
                    {row.role === "admin" ? "Jadikan User Biasa" : "Promosikan ke Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadTable({ rows }: { rows: Lead[] }) { return <div className="mt-5 rounded-[24px] border border-[#dbe5d9] bg-white p-6 md:p-7"><div className="flex items-center justify-between"><div><h2 className="font-display text-3xl">Data lead diagnosis</h2><p className="mt-1 text-xs text-[#87938a]">Lead gratis tetap terpisah dari data Premium.</p></div><span className="rounded-full bg-[#f9e9e1] px-3 py-1.5 text-[10px] font-bold text-[#b2694e]">{rows.length} ditampilkan</span></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-[#edf1eb] text-[10px] font-bold uppercase tracking-wider text-[#9aa79d]"><th className="pb-3">Lead</th><th className="pb-3">Tahap</th><th className="pb-3">Karakter</th><th className="pb-3">Risiko</th><th className="pb-3">PDF</th><th className="pb-3">Sumber</th><th className="pb-3">Aktif</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-[#f0f3ef] text-xs"><td className="py-4"><p className="font-bold">{row.name} <span className="ml-1 text-[10px] font-medium text-[#a1ada4]">{row.id}</span></p><p className="mt-1 text-[10px] text-[#9aa79d]">{row.email} · {row.city}</p></td><td className="py-4"><span className="rounded-full bg-[#eef4eb] px-2.5 py-1 text-[10px] font-bold text-[#668069]">{row.status}</span></td><td className="py-4 font-semibold text-[#637167]">{row.character}</td><td className="py-4 text-[#637167]">{row.risk}</td><td className="py-4">{row.pdf === "Sudah" ? <Check size={15} className="text-[#6c906f]" /> : <span className="text-[#a5b0a7]">Belum</span>}</td><td className="py-4 text-[#87938a]">{row.source}</td><td className="py-4 text-[#87938a]">{row.last}</td></tr>)}</tbody></table></div></div>; }
function PremiumTable({ rows }: { rows: Customer[] }) { return <div className="mt-5 rounded-[24px] border border-[#dbe5d9] bg-white p-6 md:p-7"><div className="flex items-center justify-between"><div><h2 className="font-display text-3xl">Data pelanggan Premium</h2><p className="mt-1 text-xs text-[#87938a]">Terpisah dari lead diagnosis untuk layanan dan revenue.</p></div><span className="rounded-full bg-[#e8f1e5] px-3 py-1.5 text-[10px] font-bold text-[#678269]">{rows.length} ditampilkan</span></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-[#edf1eb] text-[10px] font-bold uppercase tracking-wider text-[#9aa79d]"><th className="pb-3">Customer</th><th className="pb-3">Paket & harga</th><th className="pb-3">Aktif sampai</th><th className="pb-3">Snapshot</th><th className="pb-3">Zoom</th><th className="pb-3">Group</th><th className="pb-3">Status</th></tr></thead><tbody>{rows.map(row => <tr key={row.customerId} className="border-b border-[#f0f3ef] text-xs"><td className="py-4"><p className="font-bold">{row.name} <span className="ml-1 text-[10px] font-medium text-[#a1ada4]">{row.customerId}</span></p><p className="mt-1 text-[10px] text-[#9aa79d]">{row.email} · asal {row.leadId}</p></td><td className="py-4"><p className="font-semibold">{idr(row.price)}</p><p className="mt-1 text-[10px] text-[#9aa79d]">Premium 2026</p></td><td className="py-4 text-[#637167]">{row.expires}</td><td className="py-4 font-bold text-[#637167]">{row.snapshots}×</td><td className="py-4 font-bold text-[#637167]">{row.zoom}×</td><td className="py-4 text-[#637167]">{row.group}</td><td className="py-4"><span className="rounded-full bg-[#e5f0e2] px-2.5 py-1 text-[10px] font-bold text-[#678269]">{row.status}</span></td></tr>)}</tbody></table></div></div>; }
function Metric({ icon: Icon, label, value, change, positive }: { icon: typeof Users; label: string; value: string; change: string; positive: boolean }) { return <div className="rounded-[20px] border border-[#dbe5d9] bg-white p-5"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3eb] text-[#66816c]"><Icon size={17} /></span><span className={`flex items-center gap-1 text-[10px] font-bold ${positive ? "text-[#648567]" : "text-[#bc6c4c]"}`}>{positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span></div><p className="mt-6 text-xs font-semibold text-[#89958c]">{label}</p><p className="mt-1 font-display text-3xl">{value}</p></div>; }
function Funnel({ label, value, width }: { label: string; value: string; width: string }) { return <div><div className="flex justify-between text-xs"><span className="text-[#b5c6b7]">{label}</span><span className="font-bold text-white">{value}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#cfe5bd]" style={{ width }} /></div></div>; }
function QuickAction({ icon: Icon, label, onClick }: { icon: typeof FileText; label: string; onClick: () => void }) { return <button onClick={onClick} className="flex items-center justify-between rounded-2xl border border-[#dbe5d9] bg-white p-5 text-left hover:border-[#adc0ae]"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf3eb] text-[#66816c]"><Icon size={16} /></span><span className="text-sm font-bold">{label}</span></span><ChevronRight size={16} className="text-[#9aaa9b]" /></button>; }
function PaymentQueue({ rows }: { rows: any[] }) { const utils = trpc.useUtils(); const confirm = trpc.admin.confirmPayment.useMutation({ onSuccess: () => { utils.admin.manualPayments.invalidate(); utils.admin.premium.invalidate(); } }); if (!rows.length) return null; return <div className="mt-5 rounded-[24px] border border-[#ead8cd] bg-[#fffaf7] p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-3xl">Antrean konfirmasi admin</h2><p className="mt-1 text-xs text-[#9a7b6d]">Konfirmasi setelah mutasi BCA dan chat WhatsApp diperiksa.</p></div><span className="rounded-full bg-[#f9e9e1] px-3 py-1.5 text-[10px] font-bold text-[#a5654d]">{rows.length} request</span></div><div className="mt-5 space-y-3">{rows.slice(0, 5).map(row => <div key={row.id} className="flex flex-col justify-between gap-3 rounded-xl border border-[#f0dfd5] bg-white p-4 md:flex-row md:items-center"><div><p className="text-sm font-bold">Lead #{row.leadId} · {idr(row.amount)}</p><p className="mt-1 text-[11px] text-[#9a7b6d]">{row.whatsapp} · {row.status}</p></div>{row.status !== "confirmed" && <button disabled={confirm.isPending} onClick={() => confirm.mutate({ id: row.id, leadId: row.leadId, amount: row.amount })} className="rounded-full bg-[#bc6c4c] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{confirm.isPending ? "Memproses..." : "Konfirmasi aktifkan"}</button>}</div>)}</div></div>; }
function downloadCsv(filename: string, rows: Record<string, string | number>[]) { if (!rows.length) return; const headers = Object.keys(rows[0]); const csv = [headers.join(","), ...rows.map(row => headers.map(key => csvEscape(row[key])).join(","))].join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
function csvEscape(value: string | number) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
