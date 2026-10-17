import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Download,
  Edit3,
  Loader2,
  LockKeyhole,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { loadHtml2Pdf } from "@/lib/pdf";

type Side = "asset" | "liability";
type NetworthItem = { id: string; category: string; label: string; amount: number };
type Snapshot = { totalAssets: number; totalLiabilities: number; netWorth: number; liquidAssets: number; savedAt: string };
const months = ["September 2026", "Agustus 2026", "Juli 2026", "Juni 2026", "Mei 2026", "April 2026", "Maret 2026", "Februari 2026", "Januari 2026", "Desember 2025", "November 2025", "Oktober 2025"];
const assetCategories = ["Tabungan", "Investasi", "Aset lainnya"];
const liabilityCategories = ["Kartu kredit", "Paylater", "Cicilan", "Pinjaman", "Kewajiban lainnya"];

const idr = (value: number) => {
  const isNegative = value < 0;
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return isNegative ? `−${formatted}` : formatted;
};

const signedIdr = (value: number) => {
  const isNegative = value < 0;
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return `${isNegative ? "−" : "+"}${formatted}`;
};

const groupedNumber = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.max(0, value));
const starterAssets: NetworthItem[] = [];
const starterLiabilities: NetworthItem[] = [];
const readDraft = () => { try { const parsed = JSON.parse(window.localStorage.getItem("petakaya_networth_preview") || "{}"); return { assets: Array.isArray(parsed.assets) ? parsed.assets as NetworthItem[] : starterAssets, liabilities: Array.isArray(parsed.liabilities) ? parsed.liabilities as NetworthItem[] : starterLiabilities }; } catch { return { assets: starterAssets, liabilities: starterLiabilities }; } };

function OfficialNetWorthPdfReport({
  month,
  totalAssets,
  totalLiabilities,
  netWorth,
  liquidAssets,
  assets,
  liabilities,
  snapshots,
  composition,
}: {
  month: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number;
  assets: NetworthItem[];
  liabilities: NetworthItem[];
  snapshots: Record<string, Snapshot>;
  composition: { category: string; amount: number }[];
}) {
  const clientName = localStorage.getItem("petakaya_lead_name") || "Pengguna Petakaya";
  const reportDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isNetWorthNegative = netWorth < 0;
  const liquidPercent = totalAssets > 0 ? Math.round((liquidAssets / totalAssets) * 100) : 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "794px",
        zIndex: -9999,
        opacity: 0.01,
        pointerEvents: "none",
      }}
    >
      <div
        id="petakaya-networth-pdf"
        style={{
          width: "794px",
          background: "#ffffff",
          color: "#1f2e2a",
          fontFamily: "'DM Sans', sans-serif, -apple-system, BlinkMacSystemFont",
        }}
      >
        {/* ==================== HALAMAN 1: POSISI BERSIH & RINCIAN ASET/KEWAJIBAN ==================== */}
        <div
          style={{
            width: "794px",
            minHeight: "1120px",
            maxHeight: "1120px",
            padding: "36px 44px",
            boxSizing: "border-box",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            pageBreakAfter: "always",
            breakAfter: "page",
          }}
        >
          <div>
            {/* Header / Kop */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #1f2e2a", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#1f2e2a", color: "#e5b85d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
                  ✦
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.03em", color: "#1f2e2a", lineHeight: 1 }}>
                    petakaya
                  </div>
                  <div style={{ fontSize: "10px", color: "#718077", marginTop: "3px" }}>
                    Laporan Posisi Bersih & Portofolio Finansial
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ display: "inline-block", background: "#edf4eb", border: "1px solid #c9d8c6", color: "#48624e", fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.12em", padding: "4px 10px", borderRadius: "999px" }}>
                  Snapshot {month}
                </span>
                <div style={{ fontSize: "11px", color: "#718077", marginTop: "4px" }}>
                  Dicetak: {reportDate}
                </div>
              </div>
            </div>

            {/* Client Metadata */}
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "10px", background: "#fafcf9", border: "1px solid #dce6da", borderRadius: "14px", padding: "10px 16px" }}>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#8a978e" }}>Nama Klien</div>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1f2e2a", marginTop: "2px" }}>{clientName}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#8a978e" }}>Periode Snapshot</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#1f2e2a", marginTop: "2px" }}>{month}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#8a978e" }}>Rasio Aset Likuid</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#486e58", marginTop: "2px" }}>{liquidPercent}% Likuid</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#8a978e" }}>Status Posisi</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: isNetWorthNegative ? "#bc6c4c" : "#3d7348", marginTop: "2px" }}>
                  {isNetWorthNegative ? "⚠️ Defisit Bersih" : "✓ Surplus Bersih"}
                </div>
              </div>
            </div>

            {/* Net Worth Summary Big Card */}
            <div style={{ marginTop: "14px", borderRadius: "20px", background: isNetWorthNegative ? "#2b1e1b" : "#1f2e2a", color: "#ffffff", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.12em", color: isNetWorthNegative ? "#ffb38f" : "#c3d9ba" }}>
                    Posisi Net Worth Bersih ({month})
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "-0.03em", lineHeight: "1.1", marginTop: "6px" }}>
                    {idr(netWorth)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "#b5c6b7" }}>Rumus Perhitungan:</div>
                  <div style={{ fontSize: "11px", fontWeight: "bold", color: "#ffffff", marginTop: "2px" }}>
                    Total Aset − Total Kewajiban
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#b5c6b7" }}>Total Aset Terdaftar</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#b9dfc4", marginTop: "2px" }}>{idr(totalAssets)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#b5c6b7" }}>Total Kewajiban / Hutang</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#ffb38f", marginTop: "2px" }}>{idr(totalLiabilities)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#b5c6b7" }}>Aset Likuid (Kas & Tabungan)</div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#ffffff", marginTop: "2px" }}>{idr(liquidAssets)}</div>
                </div>
              </div>
            </div>

            {/* Rincian Aset & Kewajiban */}
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Box Aset */}
              <div style={{ borderRadius: "16px", border: "1px solid #dce6da", background: "#fbfdfa", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #edf2eb", paddingBottom: "6px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#223d32" }}>Rincian Aset</div>
                  <div style={{ fontSize: "10px", fontWeight: "bold", color: "#486e58" }}>{assets.length} item</div>
                </div>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {assets.length === 0 ? (
                    <div style={{ fontSize: "11px", color: "#8a978e", fontStyle: "italic", padding: "8px 0" }}>Belum ada item aset dicatat.</div>
                  ) : (
                    assets.slice(0, 7).map(item => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", padding: "4px 0", borderBottom: "1px dashed #f0f4ef" }}>
                        <div>
                          <span style={{ fontWeight: "600", color: "#1f2e2a" }}>{item.label}</span>
                          <span style={{ fontSize: "9px", color: "#78907f", marginLeft: "6px" }}>({item.category})</span>
                        </div>
                        <div style={{ fontWeight: "bold", color: "#2d4c3a" }}>{idr(item.amount)}</div>
                      </div>
                    ))
                  )}
                  {assets.length > 7 && (
                    <div style={{ fontSize: "10px", color: "#78907f", textAlign: "right" }}>+{assets.length - 7} item lainnya...</div>
                  )}
                </div>
              </div>

              {/* Box Kewajiban */}
              <div style={{ borderRadius: "16px", border: "1px solid #eedad0", background: "#fffaf7", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f6e6dc", paddingBottom: "6px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#54382c" }}>Rincian Kewajiban / Hutang</div>
                  <div style={{ fontSize: "10px", fontWeight: "bold", color: "#bc6c4c" }}>{liabilities.length} item</div>
                </div>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {liabilities.length === 0 ? (
                    <div style={{ fontSize: "11px", color: "#8a978e", fontStyle: "italic", padding: "8px 0" }}>Bebas dari kewajiban / hutang tercatat.</div>
                  ) : (
                    liabilities.slice(0, 7).map(item => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", padding: "4px 0", borderBottom: "1px dashed #f6e9e1" }}>
                        <div>
                          <span style={{ fontWeight: "600", color: "#1f2e2a" }}>{item.label}</span>
                          <span style={{ fontSize: "9px", color: "#9c6046", marginLeft: "6px" }}>({item.category})</span>
                        </div>
                        <div style={{ fontWeight: "bold", color: "#bc6c4c" }}>{idr(item.amount)}</div>
                      </div>
                    ))
                  )}
                  {liabilities.length > 7 && (
                    <div style={{ fontSize: "10px", color: "#9c6046", textAlign: "right" }}>+{liabilities.length - 7} item lainnya...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Halaman 1 */}
          <div style={{ borderTop: "1px solid #dfe6dc", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#8a978e" }}>
            <span>Petakaya Financial Wellness · Dokumen Laporan Posisi Bersih & Portofolio</span>
            <span style={{ fontWeight: "bold", color: "#1f2e2a" }}>Halaman 1 dari 2</span>
          </div>
        </div>

        {/* ==================== HALAMAN 2: HISTORI REKAP 12 BULAN & ACTION PLAN ==================== */}
        <div
          style={{
            width: "794px",
            minHeight: "1120px",
            maxHeight: "1120px",
            padding: "36px 44px",
            boxSizing: "border-box",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            {/* Header Ringkas Halaman 2 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #dfe6dc", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2e2a" }}>petakaya</span>
                <span style={{ fontSize: "11px", color: "#718077" }}>· Rekap Snapshot & Histori Tren 12 Bulan ({clientName})</span>
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#bc6c4c" }}>
                Snapshot Periode: {month}
              </div>
            </div>

            {/* Rekap Tabel 12 Bulan */}
            <div style={{ marginTop: "14px", borderRadius: "16px", border: "1px solid #dce6da", background: "#ffffff", overflow: "hidden" }}>
              <div style={{ background: "#f4f7f1", padding: "8px 14px", borderBottom: "1px solid #dce6da", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "#4d6c54" }}>
                  Rekap Historis Bulan ke Bulan (12 Bulan Terakhir)
                </span>
                <span style={{ fontSize: "9px", color: "#78907f" }}>Nilai Tersimpan</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                <thead>
                  <tr style={{ background: "#fafcf9", borderBottom: "1px solid #edf1eb", textAlign: "left", color: "#78907f" }}>
                    <th style={{ padding: "6px 12px", fontWeight: "bold" }}>Bulan & Tahun</th>
                    <th style={{ padding: "6px 12px", fontWeight: "bold" }}>Total Aset</th>
                    <th style={{ padding: "6px 12px", fontWeight: "bold" }}>Total Hutang</th>
                    <th style={{ padding: "6px 12px", fontWeight: "bold" }}>Posisi Net Worth</th>
                    <th style={{ padding: "6px 12px", fontWeight: "bold" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((label, idx) => {
                    const snap = snapshots[label];
                    const isNeg = snap ? snap.netWorth < 0 : false;
                    return (
                      <tr key={label} style={{ borderBottom: idx === months.length - 1 ? "none" : "1px solid #f0f4ef", background: label === month ? "#f2f7f0" : "transparent" }}>
                        <td style={{ padding: "5px 12px", fontWeight: label === month ? "bold" : "600", color: "#1f2e2a" }}>
                          {label} {label === month && "★"}
                        </td>
                        <td style={{ padding: "5px 12px", color: "#486e58" }}>{snap ? idr(snap.totalAssets) : "—"}</td>
                        <td style={{ padding: "5px 12px", color: "#bc6c4c" }}>{snap ? idr(snap.totalLiabilities) : "—"}</td>
                        <td style={{ padding: "5px 12px", fontWeight: "bold", color: snap ? (isNeg ? "#bc6c4c" : "#2d4c3a") : "#8a978e" }}>
                          {snap ? idr(snap.netWorth) : "—"}
                        </td>
                        <td style={{ padding: "5px 12px", fontSize: "9px", fontWeight: "600", color: snap ? (isNeg ? "#bc6c4c" : "#3d7348") : "#8a978e" }}>
                          {snap ? (isNeg ? "Defisit" : "Surplus") : "Belum dicatat"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Panduan & Action Plan Baca Net Worth */}
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ borderRadius: "16px", border: "1px solid #cfe2d0", background: "#f4faf2", padding: "14px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "#486e58" }}>
                  💡 Cara Membaca Posisi Bersih
                </div>
                <p style={{ fontSize: "11px", lineHeight: "1.5", color: "#3a5646", marginTop: "6px", margin: "6px 0 0" }}>
                  Angka Net Worth adalah cermin posisi hari ini, bukan penentu harga diri. Ketika angka bernilai minus, fokus utama adalah memotong bunga hutang termahal dan mengamankan likuiditas minimum untuk kebutuhan mendesak.
                </p>
              </div>

              <div style={{ borderRadius: "16px", border: "1px solid #eedad0", background: "#fffaf7", padding: "14px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "#bc6c4c" }}>
                  🎯 Langkah Evaluasi Rutin
                </div>
                <p style={{ fontSize: "11px", lineHeight: "1.5", color: "#694c40", marginTop: "6px", margin: "6px 0 0" }}>
                  Cukup perbarui snapshot ini satu kali dalam sebulan pada tanggal yang sama. Konsistensi pencatatan sederhana jauh lebih berdampak daripada sistem rumit yang hanya dikerjakan sesekali.
                </p>
              </div>
            </div>

            {/* Rekomendasi Program & Bantuan Konsultasi */}
            <div style={{ marginTop: "14px", borderRadius: "18px", border: "1px solid #dce6da", background: "#f8faf6", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1f2e2a" }}>
                  Ingin Memperjelas Arah Finansial Anda?
                </div>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#bc6c4c" }}>
                  Konsultasi WhatsApp: 0822-9800-8889
                </div>
              </div>
              <p style={{ fontSize: "10px", lineHeight: "1.5", color: "#67756b", marginTop: "4px", margin: "4px 0 0" }}>
                Dapatkan pendampingan langsung melalui program Petakaya: <b>Net Worth Tracking Premium</b> (Rp168.000/tahun) untuk sistem monitoring otomatis, atau <b>1 on 1 Coaching Strategist</b> untuk pendampingan transformasi keluarga.
              </p>
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f6f8f5", borderRadius: "10px", border: "1px solid #e2e8df" }}>
              <p style={{ fontSize: "9px", lineHeight: "1.5", color: "#7a8a7d", margin: 0 }}>
                <b>Catatan Kepatuhan Finansial:</b> Laporan ini disusun secara otomatis berdasarkan pencatatan mandiri pengguna. Dokumen ini bertujuan untuk pemantauan pribadi dan evaluasi kebiasaan keuangan, bukan merupakan laporan audit perbankan resmi atau nasihat investasi berizin.
              </p>
            </div>
          </div>

          {/* Footer Halaman 2 */}
          <div style={{ borderTop: "1px solid #dfe6dc", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#8a978e" }}>
            <span>© 2026 Petakaya. Hak cipta dilindungi undang-undang. · www.petakaya.com</span>
            <span style={{ fontWeight: "bold", color: "#1f2e2a" }}>Halaman 2 dari 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NetWorth() {
  const [assets, setAssets] = useState<NetworthItem[]>(() => readDraft().assets);
  const [liabilities, setLiabilities] = useState<NetworthItem[]>(() => readDraft().liabilities);
  const [month, setMonth] = useState(months[0]);
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot>>(() => { try { return JSON.parse(window.localStorage.getItem("petakaya_snapshot_preview") || "{}"); } catch { return {}; } });
  const [saved, setSaved] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareMonth, setCompareMonth] = useState("");
  const [showEditor, setShowEditor] = useState<Side | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const liquidAssets = assets.filter(item => item.category === "Tabungan" || item.category === "Investasi").reduce((sum, item) => sum + item.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const currentSnapshot = snapshots[month];
  const compareSnapshot = compareMonth ? snapshots[compareMonth] : undefined;
  const compareDelta = compareSnapshot ? netWorth - compareSnapshot.netWorth : null;
  const composition = useMemo(() => assetCategories.map(category => ({ category, amount: assets.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0) })), [assets]);

  useEffect(() => { window.localStorage.setItem("petakaya_networth_preview", JSON.stringify({ assets, liabilities })); }, [assets, liabilities]);
  useEffect(() => { window.localStorage.setItem("petakaya_snapshot_preview", JSON.stringify(snapshots)); }, [snapshots]);

  const hasRealSnapshots = Object.keys(snapshots).length > 0;
  const displaySnapshots = snapshots;
  const chartValues = months.slice().reverse().map(label => displaySnapshots[label]?.netWorth ?? null);
  const savedChartValues = chartValues.filter((value): value is number => value !== null);

  // Robust domain calculation supporting negative net worth
  const rawMax = savedChartValues.length ? Math.max(...savedChartValues) : 0;
  const rawMin = savedChartValues.length ? Math.min(...savedChartValues) : 0;
  const domainMax = Math.max(0, rawMax);
  const domainMin = Math.min(0, rawMin);
  const totalSpan = (domainMax - domainMin) || 1;

  // Zero-line Y percentage from the top of the bar chart (0% to 100%)
  const zeroLineYPercent = (domainMax / totalSpan) * 100;

  // SVG Line Chart coordinates
  const zeroY_svg = 10 + (domainMax / totalSpan) * 80;
  const linePoints = chartValues.map((value, index) => {
    const x = chartValues.length <= 1 ? 50 : (index / (chartValues.length - 1)) * 100;
    if (value === null) return `${x},100`;
    const y = 10 + ((domainMax - value) / totalSpan) * 80;
    return `${x},${Math.max(5, Math.min(95, y))}`;
  }).join(" ");

  const chartLabels = ["Okt", "Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep"];

  const chartBars = chartValues.map((value, i) => {
    const monthKey = months[11 - i];
    if (value === null) {
      return <div key={monthKey} className="flex-1" />;
    }

    const isCurrentMonth = i === chartValues.length - 1;
    const isNegative = value < 0;

    // Height percentage of absolute value relative to totalSpan
    const barHeightPercent = Math.max(5, (Math.abs(value) / totalSpan) * 100);

    const barColor = isNegative
      ? isCurrentMonth
        ? "bg-[#bc6c4c] shadow-[0_0_14px_rgba(188,108,76,.35)]"
        : "bg-[#e29377]"
      : isCurrentMonth
      ? "bg-[#ffb38f] shadow-[0_0_16px_rgba(255,179,143,.28)]"
      : "bg-[#b9dfc4]";

    return (
      <div key={monthKey} className="group relative flex-1 h-full">
        <div
          className={`absolute left-0 right-0 transition-all duration-200 group-hover:brightness-110 ${
            isNegative ? "rounded-b-sm" : "rounded-t-sm"
          } ${barColor}`}
          style={
            isNegative
              ? {
                  top: `${zeroLineYPercent}%`,
                  height: `${barHeightPercent}%`,
                }
              : {
                  bottom: `${100 - zeroLineYPercent}%`,
                  height: `${barHeightPercent}%`,
                }
          }
        >
          {/* Tooltip */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 hidden whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] font-bold text-white shadow-lg z-30 group-hover:block ${
              isNegative ? "bg-[#8f3f24] top-full mt-1.5" : "bg-[#1f2e2a] -top-6"
            }`}
          >
            {idr(value)}
          </span>
        </div>
      </div>
    );
  });

  const updateItem = (side: Side, id: string, field: "label" | "amount" | "category", value: string) => {
    const setter = side === "asset" ? setAssets : setLiabilities;
    setter(items => items.map(item => item.id === id ? { ...item, [field]: field === "amount" ? Math.max(0, Number(value.replace(/\D/g, "")) || 0) : value } : item));
  };
  const removeItem = (side: Side, id: string) => (side === "asset" ? setAssets : setLiabilities)(items => items.filter(item => item.id !== id));
  const addItem = (side: Side, category: string, label: string) => {
    const newItem = { id: `${side}-${Date.now()}`, category, label: label || (side === "asset" ? "Aset baru" : "Kewajiban baru"), amount: 0 };
    (side === "asset" ? setAssets : setLiabilities)(items => [...items, newItem]);
    setShowEditor(null);
  };
  const saveSnapshot = () => {
    const snapshot = { totalAssets, totalLiabilities, netWorth, liquidAssets, savedAt: new Date().toISOString() };
    setSnapshots(prev => ({ ...prev, [month]: snapshot }));
    window.localStorage.setItem("petakaya_snapshot_preview", JSON.stringify({ ...snapshots, [month]: snapshot }));
    setSaved(true); window.setTimeout(() => setSaved(false), 2400);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    toast.info("Menyiapkan dokumen PDF Laporan Net Worth...");

    try {
      const html2pdf = await loadHtml2Pdf();
      const element = document.getElementById("petakaya-networth-pdf");

      if (!element || !html2pdf) {
        window.print();
        return;
      }

      const safeMonth = month.replace(/\s+/g, "_");
      const clientName = (localStorage.getItem("petakaya_lead_name") || "Pengguna")
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "_");

      const opt = {
        margin: 0,
        filename: `Laporan_NetWorth_${safeMonth}_${clientName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("Laporan Net Worth PDF berhasil diunduh ke perangkat Anda!");
    } catch (err) {
      console.error("Gagal export PDF NetWorth:", err);
      toast.error("Mengalihkan ke dialog cetak dokumen...");
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] bg-[#eef3eb] px-5 py-8 md:px-8 md:py-12">
      <OfficialNetWorthPdfReport
        month={month}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        netWorth={netWorth}
        liquidAssets={liquidAssets}
        assets={assets}
        liabilities={liabilities}
        snapshots={snapshots}
        composition={composition}
      />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Link href="/" className="mb-5 flex w-fit items-center gap-2 text-xs font-bold text-[#718077] hover:text-[#1f2e2a]">
              <ArrowLeft size={15} /> Beranda
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.17em] text-[#bc6c4c]">
              <Sparkles size={14} /> Peta finansial
            </div>
            <h1 className="mt-3 font-display text-[45px] leading-none tracking-[-.035em] md:text-[58px]">
              Net worth kamu.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#718077]">
              Mulai sederhana: pilih Tabungan atau Investasi, lalu tulis nama item seperti BCA, Emas, Saham, atau Crypto.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCompareOpen(!compareOpen)}
              className="flex items-center gap-2 rounded-full border border-[#d3dfd0] bg-white px-4 py-2.5 text-xs font-bold text-[#5f7164] hover:border-[#aebfae] transition shadow-sm"
            >
              <Scale size={15} /> Bandingkan periode
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 rounded-full border border-[#d3dfd0] bg-white px-4 py-2.5 text-xs font-bold text-[#79559a] hover:border-[#79559a] hover:bg-[#faf7fd] transition shadow-sm disabled:opacity-60"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Export laporan PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPaywall(true)}
              className="flex items-center gap-2 rounded-full bg-[#1f2e2a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#30443d] transition shadow-sm"
            >
              Simpan snapshot <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {compareOpen && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#d8e3d5] bg-white p-5 md:flex-row md:items-center md:justify-between animate-in fade-in duration-150">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#bc6c4c]">Bandingkan net worth</p>
              <p className="mt-1 text-sm text-[#718077]">Pilih hanya snapshot yang pernah kamu simpan untuk melihat perubahan nyata.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-[#edf3eb] px-3 py-2 text-xs font-bold">{month}</span>
              <ChevronRight size={14} className="text-[#9aaa9b]" />
              <select value={compareMonth} onChange={e => setCompareMonth(e.target.value)} className="rounded-xl border border-[#dce6da] bg-white px-3 py-2 text-xs font-bold outline-none">
                {Object.keys(snapshots).filter(label => label !== month).map(label => <option key={label}>{label}</option>)}
              </select>
              <span className={`rounded-xl px-3 py-2 text-xs font-bold ${compareDelta === null ? "bg-[#f3f5f1] text-[#849187]" : compareDelta >= 0 ? "bg-[#e8f2e3] text-[#58735e]" : "bg-[#f9e9e1] text-[#b2694e]"}`}>
                {compareDelta === null ? "Pilih snapshot nyata" : `${signedIdr(compareDelta)} vs ${compareMonth}`}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[24px] border border-[#dce9dc] bg-[#f9fcf8] p-6 text-[#29483b] md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#718b7a]">Posisi bersih · {month}</p>
                <p className={`mt-3 font-display text-[42px] tracking-[-.035em] md:text-[52px] ${netWorth < 0 ? "text-[#bc6c4c]" : "text-[#29483b]"}`}>
                  {idr(netWorth)}
                </p>
              </div>
              <div className="rounded-full bg-[#e2f2e4] px-3 py-1.5 text-[11px] font-bold text-[#5d8367]">
                {hasRealSnapshots ? `${Object.keys(snapshots).length} snapshot` : "Belum ada snapshot"}
              </div>
            </div>

            {savedChartValues.length ? (
              <>
                {/* Line Chart */}
                <div className="mt-9 h-[180px] border-b border-[#dce9dc]">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                    {/* Zero dashed line if negative values exist */}
                    {domainMin < 0 && (
                      <line
                        x1="0"
                        y1={zeroY_svg}
                        x2="100"
                        y2={zeroY_svg}
                        stroke="#bc6c4c"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                        opacity="0.5"
                      />
                    )}
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke="#79559a"
                      strokeWidth="1.8"
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {chartValues.map((value, index) =>
                      value === null ? null : (
                        <circle
                          key={index}
                          cx={chartValues.length <= 1 ? 50 : (index / (chartValues.length - 1)) * 100}
                          cy={Math.max(5, Math.min(95, 10 + ((domainMax - value) / totalSpan) * 80))}
                          r="2.2"
                          fill={value < 0 ? "#bc6c4c" : "#ffb38f"}
                          vectorEffect="non-scaling-stroke"
                        />
                      )
                    )}
                  </svg>
                </div>

                {/* Bar Chart with Proper Zero-Axis */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#78907f]">
                    <span>Grafik batang · tren nominal</span>
                    {domainMin < 0 && (
                      <span className="text-[#bc6c4c] font-bold">
                        Terdapat nilai defisit (hutang &gt; aset)
                      </span>
                    )}
                  </div>
                  <div className="relative h-[130px] border-b border-[#dce9dc]">
                    {/* Zero Baseline Line when mixed */}
                    {domainMin < 0 && domainMax > 0 && (
                      <div
                        className="absolute left-0 right-0 z-10 border-b border-dashed border-[#bc6c4c]/40 pointer-events-none"
                        style={{ top: `${zeroLineYPercent}%` }}
                      >
                        <span className="absolute left-0 -top-2.5 rounded bg-[#f9fcf8] px-1 text-[8px] font-bold text-[#bc6c4c]">
                          Garis 0
                        </span>
                      </div>
                    )}
                    <div className="relative flex h-full items-stretch gap-2">
                      {chartBars}
                    </div>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-12 gap-2 text-center text-[10px] font-bold text-[#78907f]">
                  {chartLabels.map(label => (
                    <span key={label}>{label}</span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-semibold text-[#6b8573]">
                  <span className="flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#b9dfc4] inline-block" /> Surplus (+Net Worth)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#e29377] inline-block" /> Defisit (−Hutang Bersih)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#ffb38f] inline-block" /> Bulan Terbaru
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-9 flex h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#cfe1d2] text-center">
                <div>
                  <p className="text-sm font-bold text-[#527563]">Belum ada data grafik</p>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-[#78907f]">
                    Simpan snapshot pertama untuk mulai melihat arah tren bulananmu.
                  </p>
                </div>
              </div>
            )}
            <p className="mt-4 text-[10px] text-[#78907f]">
              Grafik menampilkan skala proporsional surplus (ke atas) dan defisit (ke bawah dari garis nol).
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-[#dbe5d9] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#849187]">Total aset</p>
                <TrendingUp size={17} className="text-[#78977e]" />
              </div>
              <p className="mt-3 font-display text-3xl">{idr(totalAssets)}</p>
              <div className="mt-5 h-1.5 rounded-full bg-[#edf2ea]">
                <div
                  className="h-full rounded-full bg-[#94b694]"
                  style={{ width: `${Math.min(100, Math.max(5, (totalAssets / (totalAssets + totalLiabilities || 1)) * 100))}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#8a978e]">
                {assets.length} item · {composition.filter(item => item.amount > 0).length} kategori digunakan
              </p>
            </div>

            <div className="rounded-[24px] border border-[#dbe5d9] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#849187]">Total kewajiban</p>
                <ArrowDown size={17} className="text-[#bc6c4c]" />
              </div>
              <p className="mt-3 font-display text-3xl">{idr(totalLiabilities)}</p>
              <p className="mt-5 text-[11px] text-[#8a978e]">
                {liabilities.length} item yang sedang dicatat
              </p>
            </div>
          </div>
        </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2"><EntryCard title="Aset" subtitle="Tabungan · Investasi · Aset lainnya" items={assets} categories={assetCategories} side="asset" onUpdate={updateItem} onRemove={removeItem} onAdd={() => setShowEditor("asset")} /><EntryCard title="Kewajiban" subtitle="Kartu kredit · Paylater · Cicilan · Lainnya" items={liabilities} categories={liabilityCategories} side="liability" onUpdate={updateItem} onRemove={removeItem} onAdd={() => setShowEditor("liability")} /></div>
      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#d8e3d5] bg-white p-5 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><CalendarDays size={18} className="mt-0.5 text-[#738879]" /><div><p className="text-sm font-bold">Simpan posisi finansial</p><p className="mt-1 text-xs leading-5 text-[#849187]">Setiap periode menjadi snapshot tersendiri agar perubahan bulan ke bulan tetap terbaca.</p>{currentSnapshot && <p className="mt-2 text-[11px] font-semibold text-[#678269]">Snapshot {month} sudah tersimpan · {idr(currentSnapshot.netWorth)}</p>}</div></div><div className="flex flex-wrap items-center gap-3"><label className="text-xs font-semibold text-[#718077]">Periode data</label><select value={month} onChange={e => setMonth(e.target.value)} className="rounded-xl border border-[#dce6da] bg-[#fafcf9] px-3 py-2 text-xs font-bold outline-none">{months.map(item => <option key={item}>{item}</option>)}</select><button onClick={saveSnapshot} className="rounded-xl bg-[#bc6c4c] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#a95d40]">{saved ? "Snapshot tersimpan" : "Simpan perubahan"}</button></div></div>
      <div className="mt-6 rounded-[24px] border border-[#ead8cd] bg-[#fffaf7] p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#bc6c4c]">Rekap snapshot bulanan</p><h2 className="mt-2 font-display text-3xl">Progres yang bisa kamu lihat.</h2></div><CalendarDays className="text-[#bc6c4c]" size={22}/></div><div className="mt-5 overflow-x-auto rounded-2xl bg-white"><table className="w-full min-w-[620px] text-left text-xs"><thead className="border-b border-[#edf1eb] bg-[#f4f7f1] text-[10px] uppercase tracking-wider text-[#849187]"><tr><th className="px-4 py-3 font-bold">Bulan & Tahun</th><th className="px-4 py-3 font-bold">Aset</th><th className="px-4 py-3 font-bold">Hutang</th><th className="px-4 py-3 font-bold">Net Worth</th></tr></thead><tbody>{months.map(label => { const item = displaySnapshots[label]; return <tr key={label} className="border-b border-[#f0f3ee] last:border-0"><td className="px-4 py-3 font-semibold text-[#66776b]">{label}</td><td className="px-4 py-3 text-[#7b897f]">{item ? idr(item.totalAssets) : "Belum ada data"}</td><td className="px-4 py-3 text-[#7b897f]">{item ? idr(item.totalLiabilities) : "Belum ada data"}</td><td className="px-4 py-3 font-bold text-[#bc6c4c]">{item ? idr(item.netWorth) : "—"}</td></tr>; })}</tbody></table></div><p className="mt-4 text-xs text-[#8a7168]">Tabel hanya menampilkan snapshot nyata yang pernah kamu simpan. Pilih periode lalu simpan perubahan untuk mengisi barisnya.</p></div><div className="mt-5 grid gap-4 md:grid-cols-3"><MiniInsight label="Komposisi aset" value={totalAssets === 0 ? "Belum terbaca" : `${Math.round((composition[0].amount / Math.max(1, totalAssets)) * 100)}% tabungan`} text={totalAssets === 0 ? "Mulai dari satu rekening atau investasi yang paling mudah kamu verifikasi. Mengenali angka apa adanya adalah dasar untuk menentukan arah, bukan tanda bahwa kamu terlambat." : `Saat ini ${Math.round((liquidAssets / Math.max(1, totalAssets)) * 100)}% asetmu termasuk liquid. Gunakan pembacaan ini untuk memahami ruang aman sebelum mengejar tujuan baru; ini bukan penilaian baik atau buruk.`} /><MiniInsight label="Perubahan" value={Object.keys(snapshots).length > 1 ? "Bandingkan snapshot" : "Mulai snapshot pertama"} text={Object.keys(snapshots).length === 0 ? "Snapshot pertama menjadi titik acuan yang jujur. Setelah tersimpan, kamu dapat melihat apakah perubahan datang dari aset, kewajiban, atau keduanya." : `Ada ${Object.keys(snapshots).length} snapshot yang bisa dibaca. Bandingkan nominal dan arah trennya untuk menemukan pertanyaan yang tepat, bukan untuk menghakimi angka.`} /><MiniInsight label="Langkah kecil" value="Review 1× sebulan" text={totalAssets === 0 && totalLiabilities === 0 ? "Catat kondisi dasar, pilih satu tujuan 12 bulan, lalu review sebulan sekali. Jika butuh ruang refleksi yang lebih personal, gunakan sharing group atau kembali baca tujuan yang ingin kamu jaga." : `Fokus bulan ini: dokumentasikan satu perubahan terbesar dari ${idr(totalAssets)} aset dan ${idr(totalLiabilities)} kewajiban. Pilih satu tindakan yang realistis, lalu review kembali bulan depan.`} /></div><div className="mt-6 rounded-[24px] border border-[#d8e4d3] bg-[#f5faF2] p-6 md:p-7"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e4f0df] text-[#6b8a6d]"><Sparkles size={18} /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#bc6c4c]">Baca pelan-pelan</p><h2 className="mt-2 font-display text-3xl leading-tight text-[#29483b]">Arah yang jelas membuat langkah terasa lebih ringan.</h2><div className="mt-4 space-y-3 text-sm leading-6 text-[#718077]"><p>Angka di halaman ini bukan penentu nilai dirimu. Ini adalah peta kondisi hari ini—cara sederhana untuk melihat apa yang sudah kamu bangun, bagian mana yang masih terasa berat, dan tujuan apa yang ingin kamu jaga untuk masa depan.</p><p>Ketika kamu mulai mengenali pola, menyimpan snapshot, dan kembali melihatnya dengan tenang, keputusan kecil menjadi lebih mudah diulang. Tidak harus langsung sempurna. Satu langkah yang sesuai dengan kondisi nyata sering kali lebih berarti daripada rencana besar yang sulit dijalankan.</p><p>Mungkin suatu hari kamu ingin memiliki ruang yang lebih luas untuk memahami hubungan antara kondisi sekarang dan harapanmu ke depan. Untuk saat ini, cukup simpan kembali tujuan yang paling penting bagimu—karena setiap angka yang mulai kamu pahami sedang membantu membuat tujuan itu terasa lebih nyata.</p></div></div></div></div><p className="mt-5 flex items-center gap-2 text-xs text-[#829087]"><LockKeyhole size={13} /> Preview bisa dicoba tanpa login. Simpan histori personal dan fitur Premium memerlukan akun aktif.</p>
      {showEditor && <AddItemDialog side={showEditor} categories={showEditor === "asset" ? assetCategories : liabilityCategories} onClose={() => setShowEditor(null)} onAdd={addItem} />}
      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      </div>
    </div>
  );
}

function EntryCard({ title, subtitle, items, categories, side, onUpdate, onRemove, onAdd }: { title: string; subtitle: string; items: NetworthItem[]; categories: string[]; side: Side; onUpdate: (side: Side, id: string, field: "label" | "amount" | "category", value: string) => void; onRemove: (side: Side, id: string) => void; onAdd: () => void }) {
  return <div className="rounded-[24px] border border-[#dbe5d9] bg-white p-6 md:p-7"><div className="flex items-end justify-between"><div><h2 className="font-display text-3xl">{title}</h2><p className="mt-1 text-xs text-[#86938a]">{subtitle}</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${side === "asset" ? "bg-[#e8f1e5] text-[#637d67]" : "bg-[#f9e9e1] text-[#b2694e]"}`}>{items.length} item</span></div><div className="mt-6 space-y-3">{items.map(item => <div key={item.id} className="rounded-xl border border-[#edf1eb] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><select value={item.category} onChange={e => onUpdate(side, item.id, "category", e.target.value)} className="rounded-md bg-[#f0f5ed] px-2 py-1 text-[10px] font-bold text-[#657c69] outline-none">{categories.map(category => <option key={category}>{category}</option>)}</select><div className="mt-2 flex gap-2"><input value={item.label} onChange={e => onUpdate(side, item.id, "label", e.target.value)} className="w-full rounded-lg border border-transparent bg-transparent text-sm font-bold outline-none focus:border-[#dfe8dc] focus:bg-[#fafcf9]" placeholder="Nama item" /></div></div><button onClick={() => onRemove(side, item.id)} className="rounded-lg p-1.5 text-[#b4beb5] hover:bg-[#f9e9e1] hover:text-[#bc6c4c]" aria-label={`Hapus ${item.label}`}><Trash2 size={14} /></button></div><div className="relative mt-3"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#9aa79d]">Rp</span><input inputMode="numeric" value={groupedNumber(item.amount)} onChange={e => onUpdate(side, item.id, "amount", e.target.value)} className="w-full rounded-lg border border-[#e1e9df] bg-[#fafcf9] py-2 pl-9 pr-3 text-right text-xs font-bold outline-none focus:border-[#9fb59e]" /></div></div>)}</div><button onClick={onAdd} className="mt-5 flex items-center gap-2 text-xs font-bold text-[#7b8b7d] hover:text-[#1f2e2a]"><Plus size={14} /> Tambah {side === "asset" ? "aset" : "kewajiban"} custom</button></div>;
}

function AddItemDialog({ side, categories, onClose, onAdd }: { side: Side; categories: string[]; onClose: () => void; onAdd: (side: Side, category: string, label: string) => void }) {
  const [category, setCategory] = useState(categories[0]); const [label, setLabel] = useState("");
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2e2a]/45 px-5 backdrop-blur-sm"><div className="relative w-full max-w-md rounded-[24px] bg-[#f8fbf6] p-7 shadow-2xl"><button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-[#829087] hover:bg-[#e9f0e6]"><X size={17} /></button><p className="text-xs font-bold uppercase tracking-[.16em] text-[#bc6c4c]">Item custom</p><h2 className="mt-3 font-display text-3xl">Tambah {side === "asset" ? "aset" : "kewajiban"}</h2><p className="mt-2 text-xs leading-5 text-[#829087]">Pilih kategori sederhana lalu tulis nama spesifik seperti BCA, Crypto, atau KPR.</p><label className="mt-6 block text-xs font-bold text-[#65746a]">Kategori<select value={category} onChange={e => setCategory(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe8dc] bg-white px-3 py-3 text-sm outline-none">{categories.map(item => <option key={item}>{item}</option>)}</select></label><label className="mt-4 block text-xs font-bold text-[#65746a]">Nama item<input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder={side === "asset" ? "Contoh: BNI / Saham BBCA" : "Contoh: Kartu kredit BCA"} className="mt-2 w-full rounded-xl border border-[#dfe8dc] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#b5c0b6]" /></label><button onClick={() => onAdd(side, category, label)} className="mt-6 w-full rounded-full bg-[#bc6c4c] py-3.5 text-sm font-bold text-white hover:bg-[#a95d40]">Tambahkan item</button></div></div>;
}

function MiniInsight({ label, value, text }: { label: string; value: string; text: string }) { return <div className="rounded-2xl border border-[#dbe5d9] bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-[#bc6c4c]">{label}</p><p className="mt-2 text-sm font-bold">{value}</p><p className="mt-1 text-xs leading-5 text-[#829087]">{text}</p></div>; }
function Paywall({ onClose }: { onClose: () => void }) {
  const benefits = ["Snapshot bulanan tersimpan otomatis", "Perbandingan bulan & tahun", "Data tetap milikmu"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2e2a]/45 px-5 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[28px] border border-white/60 bg-[#f8fbf6] p-7 shadow-2xl md:p-9">
        <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-[#829087] hover:bg-[#e9f0e6]" aria-label="Tutup"><X size={17} /></button>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f2e2a] text-[#d9e8c8]"><LockKeyhole size={21} /></div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-[#bc6c4c]">Simpan perjalananmu</p>
        <h2 className="mt-3 font-display text-[37px] leading-[1.02] tracking-[-.03em]">Jangan biarkan progres ini hilang.</h2>
        <p className="mt-4 text-sm leading-6 text-[#718077]">Premium menyimpan snapshot personal, grafik 12 bulan, perbandingan tahun sebelumnya, dan insight bulananmu.</p>
        <div className="mt-6 space-y-3">
          {benefits.map(item => <div key={item} className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e2efdc] text-[#5c7c63]"><Check size={14} /></span>{item}</div>)}
        </div>
        <Link href="/pricing" onClick={onClose} className="mt-8 flex w-full items-center justify-center rounded-full bg-[#bc6c4c] py-3.5 text-sm font-bold text-white hover:bg-[#a95d40]">Lihat Premium</Link>
        <button onClick={onClose} className="mt-3 w-full py-2 text-xs font-bold text-[#839087]">Nanti saja</button>
      </div>
    </div>
  );
}
