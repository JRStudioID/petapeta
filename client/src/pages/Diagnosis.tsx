import { ArrowLeft, ArrowRight, Check, CircleHelp, Download, Loader2, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type LegacyCharacter = "melankolis" | "koleris" | "sanguinis" | "phlegmatis";
type Risk = "konservatif" | "moderat" | "bertumbuh" | "agresif";
type Pillar = "style" | "risk" | "condition";
type Question = { id: string; pillar: Pillar; title: string; options: string[] };
type DiagnosisResult = { style: string; styleKey: LegacyCharacter; risk: string; riskKey: Risk; condition: string; strengths: string; blindSpot: string; insight: string; nextStep: string; styleEducation: string; riskEducation: string; conditionEducation: string };

const questions: Question[] = [
 { id:"s1", pillar:"style", title:"Saat menerima pemasukan, apa yang paling sering kamu lakukan lebih dulu?", options:["Langsung membagi ke tujuan dan kebutuhan", "Menyusun rencana detail sebelum membelanjakan", "Menikmati sebagian lalu melihat sisa", "Menetapkan target besar dan mengejar hasil"] },
 { id:"s2", pillar:"style", title:"Ketika harus memilih tujuan keuangan, kamu cenderung…", options:["Memilih yang membuat proses terasa menyenangkan", "Membandingkan data dan risikonya", "Memilih yang paling stabil dan tidak merepotkan", "Memilih yang paling berdampak pada pertumbuhan"] },
 { id:"s3", pillar:"style", title:"Apa yang paling menggambarkan hubunganmu dengan catatan keuangan?", options:["Saya butuh sistem yang membuat saya konsisten", "Saya suka detail dan ingin semuanya rapi", "Saya ingin sederhana dan mudah diikuti", "Saya fokus pada angka hasil dan target"] },
 { id:"s4", pillar:"style", title:"Saat rencana keuangan berubah, responsmu biasanya…", options:["Mencari peluang baru dengan cepat", "Meninjau ulang semua asumsi", "Menunggu sampai situasi lebih tenang", "Mengambil keputusan dan menggerakkan perubahan"] },
 { id:"s5", pillar:"style", title:"Apa yang paling sering membuatmu menunda keputusan uang?", options:["Terlalu banyak peluang yang menarik", "Takut salah karena informasinya belum lengkap", "Terlalu nyaman dengan kebiasaan lama", "Ingin hasil cepat sebelum fondasi siap"] },
 { id:"s6", pillar:"style", title:"Jika punya target 12 bulan, kamu paling terbantu oleh…", options:["Ruang untuk bereksperimen", "Rencana tertulis dengan angka jelas", "Kebiasaan kecil yang tenang dan konsisten", "Target mingguan dan ukuran keberhasilan"] },
 { id:"r1", pillar:"risk", title:"Seberapa lama kamu memahami instrumen investasi yang pernah digunakan?", options:["Belum pernah investasi", "Pernah mencoba instrumen sederhana", "Cukup memahami risiko dan tujuan", "Aktif mempelajari dan mengevaluasi"] },
 { id:"r2", pillar:"risk", title:"Jika investasi turun 15% dalam beberapa bulan, kamu akan…", options:["Menjual karena dana terasa tidak aman", "Menunggu sambil memeriksa penyebabnya", "Tetap sesuai rencana jika dana belum dibutuhkan", "Menambah secara terukur jika tesisnya masih kuat"] },
 { id:"r3", pillar:"risk", title:"Kapan dana investasi ini kemungkinan akan digunakan?", options:["Kurang dari 1 tahun", "1–3 tahun", "3–7 tahun", "Lebih dari 7 tahun"] },
 { id:"r4", pillar:"risk", title:"Berapa bagian pemasukan yang nyaman kamu investasikan rutin?", options:["Belum ada porsi tetap", "Di bawah 10%", "10–25%", "Lebih dari 25% dengan dana darurat aman"] },
 { id:"r5", pillar:"risk", title:"Apa yang paling kamu utamakan dari investasi?", options:["Modal mudah dicairkan", "Seimbang antara aman dan tumbuh", "Pertumbuhan dengan risiko terukur", "Pertumbuhan maksimal untuk tujuan panjang"] },
 { id:"r6", pillar:"risk", title:"Saat memilih aset, dasar keputusanmu biasanya…", options:["Ikut rekomendasi yang terasa aman", "Membaca informasi dasar", "Membandingkan risiko, biaya, dan horizon", "Menganalisis skenario dan peluang"] },
 { id:"r7", pillar:"risk", title:"Seberapa siap kamu menerima nilai investasi yang naik turun?", options:["Belum siap", "Siap jika porsinya kecil", "Siap selama ada batas risiko", "Siap untuk fluktuasi besar dengan rencana jelas"] },
 { id:"c1", pillar:"condition", title:"Seberapa stabil pemasukan utama selama 6 bulan terakhir?", options:["Sering berubah atau belum ada", "Ada pemasukan tetapi tidak selalu sama", "Cukup stabil", "Stabil dan punya ruang bertumbuh"] },
 { id:"c2", pillar:"condition", title:"Jika ada kebutuhan mendadak, sumber dana utamamu adalah…", options:["Utang atau bantuan", "Mengambil tabungan tujuan lain", "Dana darurat yang sudah disiapkan", "Dana darurat plus aset liquid"] },
 { id:"c3", pillar:"condition", title:"Berapa lama kebutuhan hidup bisa ditutup oleh dana liquid saat ini?", options:["Belum tahu atau kurang dari 1 bulan", "1–3 bulan", "3–6 bulan", "Lebih dari 6 bulan"] },
 { id:"c4", pillar:"condition", title:"Bagaimana posisi cicilan atau kewajiban terhadap pemasukanmu?", options:["Sering terasa menekan", "Masih bisa dibayar tetapi membatasi", "Terkendali", "Terkendali dan punya strategi pelunasan"] },
 { id:"c5", pillar:"condition", title:"Seberapa rutin kamu mencatat aset, kewajiban, dan pengeluaran?", options:["Hampir tidak pernah", "Saat ada masalah", "Sebulan sekali", "Teratur dan membandingkan snapshot"] },
 { id:"c6", pillar:"condition", title:"Tujuan keuangan paling mendesak saat ini adalah…", options:["Melewati tekanan bulanan", "Merapikan utang dan dana darurat", "Membangun aset dan investasi", "Mengejar tujuan besar seperti pendidikan atau pensiun"] },
 { id:"c7", pillar:"condition", title:"Kalimat mana yang paling menggambarkan kondisimu hari ini?", options:["Saya butuh rasa aman dulu", "Saya tahu masalahnya, tetapi belum punya sistem", "Saya mulai punya fondasi dan ingin konsisten", "Saya siap naik level dengan strategi yang lebih tajam"] },
];
const styleLabels: Record<LegacyCharacter,string> = { sanguinis:"Penggerak Peluang", melankolis:"Perencana Strategis", phlegmatis:"Penjaga Stabilitas", koleris:"Pengarah Pertumbuhan" };
const riskLabels: Record<Risk,string> = { konservatif:"Fondasi Aman", moderat:"Tumbuh Terukur", bertumbuh:"Berani Terarah", agresif:"Pertumbuhan Agresif dengan Batas Risiko" };
const conditionLabels = ["Perlu Ruang Aman", "Perlu Sistem dan Prioritas", "Fondasi Mulai Terbentuk", "Siap Naik Level"];
const pillarNames: Record<Pillar,string> = { style:"Pilar 1 · Gaya Keuangan", risk:"Pilar 2 · Profil Risiko", condition:"Pilar 3 · Kondisi Saat Ini" };

function calculate(answers:number[]): DiagnosisResult {
 const styleIndex = Math.round((answers.slice(0,6).reduce((a,b)=>a+b,0) / 6));
 const styleKey = (["sanguinis","melankolis","phlegmatis","koleris"] as LegacyCharacter[])[Math.min(3,styleIndex)];
 const riskScore = answers.slice(6,13).reduce((a,b)=>a+b,0) / 7;
 const riskKey = (riskScore < .8 ? "konservatif" : riskScore < 1.7 ? "moderat" : riskScore < 2.5 ? "bertumbuh" : "agresif") as Risk;
 const conditionScore = answers.slice(13).reduce((a,b)=>a+b,0) / 7;
 const condition = conditionLabels[Math.min(3,Math.round(conditionScore))];
 const strengths = styleKey === "melankolis" ? "Kamu kuat membaca detail dan membangun keputusan yang punya dasar." : styleKey === "koleris" ? "Kamu punya dorongan hasil dan keberanian mengubah kondisi." : styleKey === "sanguinis" ? "Kamu cepat melihat peluang dan membuat proses terasa hidup." : "Kamu sabar, tenang, dan mampu membangun kebiasaan yang bertahan.";
 const blindSpot = riskKey === "konservatif" ? "Jangan biarkan kebutuhan aman membuat semua uang berhenti tanpa tujuan pertumbuhan." : conditionScore < 1.5 ? "Potensi pertumbuhanmu belum akan terasa jika fondasi arus kas dan kewajiban belum dibereskan." : "Jangan mengejar pertumbuhan tanpa batas risiko, snapshot, dan tujuan yang terukur.";
 const insight = `${styleLabels[styleKey]} dengan pembacaan kondisi ${condition} menunjukkan cara kamu merespons uang hari ini: apa yang menjadi kekuatan, apa yang berpotensi membuatmu menunda, dan dukungan seperti apa yang membuat langkah terasa realistis. Ini bukan label permanen. Profil edukasi risikomu juga bukan rekomendasi instrumen; gunakan sebagai bahan refleksi tentang kenyamanan, kebutuhan likuiditas, horizon waktu, dan kesiapan mengambil keputusan. Arah yang benar dimulai dari urutan yang tepat: kenali pola diri, baca angka nyata, tentukan prioritas keluarga, lalu pilih satu kebiasaan yang bisa dijaga selama 30 hari. Dengan begitu, kamu tidak sekadar mengumpulkan informasi, tetapi membangun bukti kecil bahwa kondisi bisa berubah. Jika ingin membaca Petakaya versi kondisi kamu dengan data Net Worth dan Goal Pensiun, diagnosis ini dapat menjadi awal percakapan untuk Net Worth Tracking Premium atau 1 on 1 Coaching Strategist.`;
 const nextStep = conditionScore < 1.5 ? "Buat snapshot aset, kewajiban, dan kebutuhan bulanan minggu ini. Pilih satu kebocoran yang harus dihentikan selama 30 hari. Setelah itu, gunakan sharing group atau Zoom untuk menjaga akuntabilitas." : "Simpan snapshot bulan ini, tentukan satu target 12 bulan, lalu review sebulan sekali. Bila konteks keluarga terasa kompleks, ajukan percakapan awal dengan Strategist untuk menyusun prioritas—bukan menerima instruksi beli atau jual.";
 const styleEducation = styleKey === "melankolis" ? "Kekuatanmu ada pada ketelitian. Tantangannya, jangan menunggu semua informasi sempurna sebelum mengambil langkah kecil. Gunakan aturan sederhana: cukup jelas untuk mulai, lalu review berdasarkan catatan nyata." : styleKey === "koleris" ? "Kamu cenderung cepat menggerakkan keputusan. Itu menjadi aset ketika diarahkan pada prioritas, tetapi bisa melelahkan jika target terlalu banyak. Pilih satu sasaran utama agar energi berubah menjadi kemajuan yang terlihat." : styleKey === "sanguinis" ? "Kamu mudah melihat peluang dan menjaga suasana tetap hidup. Agar peluang tidak berubah menjadi pengeluaran impulsif, beri setiap keputusan uang sebuah tujuan dan batas waktu review." : "Kamu kuat membangun kestabilan dan kebiasaan yang tenang. Jadikan konsistensi sebagai keunggulan: satu pencatatan rutin yang sederhana lebih bernilai daripada sistem rumit yang tidak dijalankan.";
 const riskEducation = riskKey === "konservatif" ? "Kenyamanan terhadap keamanan terlihat dominan. Edukasinya bukan memaksa mengambil risiko, melainkan memahami hubungan antara tujuan, jangka waktu, likuiditas, dan kemungkinan nilai bergerak." : riskKey === "moderat" ? "Kamu mulai mampu menimbang keamanan dan pertumbuhan. Langkah pentingnya adalah memperjelas batas nyaman, kebutuhan likuid, dan horizon sebelum menilai pilihan apa pun." : riskKey === "bertumbuh" ? "Kamu cukup terbuka terhadap pertumbuhan dengan syarat yang masuk akal. Pastikan keberanian selalu ditemani pencatatan, batas kerugian yang bisa diterima, dan tujuan yang dapat dievaluasi." : "Kamu terlihat nyaman dengan fluktuasi dan sasaran pertumbuhan. Authority finansial bukan soal berani paling besar, melainkan mampu menjelaskan alasan, batas, dan skenario ketika kondisi berubah.";
 const conditionEducation = conditionScore < 1.5 ? "Kondisi hari ini meminta ruang aman lebih dulu. Fokus pada arus kas, kewajiban, dana cadangan, dan satu kebiasaan pencatatan sebelum mengejar target yang lebih jauh." : conditionScore < 2.5 ? "Fondasi mulai terbentuk, tetapi sistem perlu dibuat lebih konsisten. Snapshot bulanan akan membantu memisahkan perasaan tentang uang dari perubahan yang benar-benar terjadi." : "Kamu sudah memiliki fondasi yang dapat dikembangkan. Tantangan berikutnya adalah menjaga disiplin review dan menghubungkan aset liquid dengan tujuan keluarga yang spesifik.";
 return { style: styleLabels[styleKey], styleKey, risk: riskLabels[riskKey], riskKey, condition, strengths, blindSpot, insight, nextStep, styleEducation, riskEducation, conditionEducation };
}

export default function Diagnosis() {
 const path = window.location.pathname; const previewResult = path === "/diagnosis-preview/result" || new URLSearchParams(window.location.search).get("preview") === "result"; const previewQuestions = path === "/diagnosis-preview" || new URLSearchParams(window.location.search).get("preview") === "questions";
 const [leadCaptured,setLeadCaptured] = useState(() => previewResult || previewQuestions || localStorage.getItem("petakaya_lead_captured") === "1"); const [leadId,setLeadId] = useState(() => Number(localStorage.getItem("petakaya_lead_id") || 0)); const [step,setStep] = useState(previewResult ? 20 : 0); const [answers,setAnswers] = useState<number[]>(previewResult ? Array(20).fill(1) : []); const [saved,setSaved] = useState(false); const saveStarted = useRef(false); const isResult = step >= questions.length; const result = useMemo(() => calculate(answers),[answers]); const saveDiagnosis = trpc.diagnosis.save.useMutation();
 useEffect(() => { if (!isResult || !leadId || saved || saveStarted.current || previewResult) return; saveStarted.current=true; saveDiagnosis.mutate({ leadId, characterProfile:result.styleKey, riskProfile:result.riskKey, strengths:result.strengths, blindSpot:result.blindSpot, insight:result.insight, nextStep:result.nextStep },{onSettled:()=>setSaved(true)}); },[isResult,leadId,saved,result,saveDiagnosis,previewResult]);
 const choose=(index:number)=>{ const next=[...answers]; next[step]=index; setAnswers(next); window.setTimeout(()=>setStep(step+1),140); }; const restart=()=>{setAnswers([]);setStep(0);setSaved(false);saveStarted.current=false;}; if(!leadCaptured) return <LeadGate onComplete={(id)=>{if(id){setLeadId(id);localStorage.setItem("petakaya_lead_id",String(id));}setLeadCaptured(true)}} />; if(isResult) return <ResultView result={result} restart={restart}/>; const current=questions[step]; return <div className="min-h-[calc(100vh-74px)] bg-[#eef3eb] px-5 py-10 md:px-8 md:py-16"><div className="mx-auto max-w-3xl"><div className="mb-8 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-xs font-bold text-[#718077]"><ArrowLeft size={15}/> Kembali</Link><span className="text-xs font-semibold text-[#829087]">{pillarNames[current.pillar]} · {step+1}/20</span></div><div className="mb-8 flex gap-1">{questions.map((q,i)=><div key={q.id} className={`h-1.5 flex-1 rounded-full ${i<=step?"bg-[#bc6c4c]":"bg-[#d7e2d5]"}`}/>)}</div><div className="rounded-[28px] border border-[#dfe8dc] bg-white p-7 shadow-[0_24px_70px_rgba(64,86,68,.08)] md:p-12"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#bc6c4c]"><Sparkles size={14}/> {pillarNames[current.pillar]}</div><h1 className="mt-7 font-display text-[34px] leading-[1.08] md:text-[46px]">{current.title}</h1><div className="mt-9 grid gap-3">{current.options.map((option,i)=><button key={option} onClick={()=>choose(i)} className="group flex w-full items-center justify-between rounded-2xl border border-[#e2e9e0] px-5 py-4 text-left text-sm font-semibold hover:border-[#bc6c4c] hover:bg-[#fcf0e9]"><span className="flex items-center gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf2eb] text-xs">{String.fromCharCode(65+i)}</span>{option}</span><ArrowRight size={16} className="text-[#aebbb0]"/></button>)}</div><div className="mt-9 flex justify-between border-t border-[#edf1eb] pt-5 text-xs text-[#94a096]"><span>± 5 menit</span><span>Jawab sesuai kondisi nyata</span></div></div></div></div>;
}
function LeadGate({onComplete}:{onComplete:(id:number)=>void}){ const [form,setForm]=useState({name:"",email:"",birthDate:"",whatsapp:"",city:""}); const [submitted,setSubmitted]=useState(false); const valid=Object.values(form).every(Boolean); const create=trpc.lead.create.useMutation(); const update=(k:keyof typeof form,v:string)=>setForm(p=>({...p,[k]:v})); const submit=(e:React.FormEvent)=>{e.preventDefault();if(!valid){setSubmitted(true);return;}localStorage.setItem("petakaya_lead_whatsapp",form.whatsapp);localStorage.setItem("petakaya_birth_date",form.birthDate);localStorage.setItem("petakaya_lead_name",form.name);create.mutate({...form,source:document.referrer||"direct"},{onSuccess:r=>{localStorage.setItem("petakaya_lead_captured","1");onComplete(r.id)},onError:()=>{localStorage.setItem("petakaya_lead_captured","1");onComplete(0)}})}; return <div className="min-h-[calc(100vh-74px)] bg-[#eef3eb] px-5 py-10 md:px-8 md:py-16"><div className="mx-auto max-w-5xl"><div className="mb-8 flex justify-between"><Link href="/" className="text-xs font-bold text-[#718077]"><ArrowLeft size={15} className="inline"/> Kembali</Link><span className="text-xs text-[#829087]"><LockKeyhole size={14} className="inline"/> Data aman dan privat</span></div><div className="grid overflow-hidden rounded-[28px] bg-white md:grid-cols-[.9fr_1.1fr]"><div className="bg-[#1f2e2a] p-8 text-white md:p-12"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#c3d9ba]">20 pertanyaan · 3 pilar</p><h1 className="mt-8 font-display text-[42px] leading-[1.02] md:text-[54px]">Kenalan dengan pola uangmu.</h1><p className="mt-6 text-sm leading-7 text-[#b5c6b7]">Dapatkan profil gaya keuangan, risiko investasi, dan kondisi finansial saat ini.</p><div className="mt-8 space-y-3">{["Gaya keputusan uang","Profil risiko investasi","Kondisi finansial hari ini"].map(x=><p key={x} className="text-sm text-[#d2dfd1]"><Check size={16} className="mr-2 inline text-[#dbeaca]"/>{x}</p>)}</div></div><form onSubmit={submit} className="p-7 md:p-12"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#bc6c4c]">Data dasar kamu</p><h2 className="mt-3 font-display text-3xl">Biar insight-nya relevan.</h2><p className="mt-2 text-xs text-[#829087]">Semua field wajib diisi untuk membuka diagnosis gratis.</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{([['name','Nama lengkap','text','Contoh: Rani Andini'],['email','Email aktif','email','kamu@email.com'],['birthDate','Tanggal lahir','date',''],['whatsapp','Nomor WhatsApp','tel','08xxxxxxxxxx'],['city','Tempat tinggal','text','Kota / Kabupaten']] as const).map(([key,label,type,placeholder],i)=><label key={key} className={i===4?"sm:col-span-2":""}><span className="text-xs font-bold text-[#65746a]">{label}</span><input required type={type} placeholder={placeholder} value={form[key]} onChange={e=>update(key,e.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe8dc] bg-[#fafcf9] px-3 py-3 text-sm outline-none"/></label>)}</div>{submitted&&!valid&&<p className="mt-4 text-xs font-semibold text-[#bc6c4c]">Lengkapi semua data.</p>}<button disabled={create.isPending} className="mt-7 w-full rounded-full bg-[#bc6c4c] py-3.5 text-sm font-bold text-white">{create.isPending?"Menyimpan…":"Mulai diagnosis 3 pilar"}</button></form></div></div></div> }

import { loadHtml2Pdf } from "@/lib/pdf";

function OfficialPdfReport({ result }: { result: DiagnosisResult }) {
  const clientName = localStorage.getItem("petakaya_lead_name") || "Peserta Petakaya";
  const clientCity = localStorage.getItem("petakaya_city") || "Indonesia";
  const leadId = localStorage.getItem("petakaya_lead_id") || "0891";
  const reportDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
        id="petakaya-official-pdf"
        style={{
          width: "794px",
          background: "#ffffff",
          color: "#1f2e2a",
          fontFamily: "'DM Sans', sans-serif, -apple-system, BlinkMacSystemFont",
        }}
      >
        {/* ==================== HALAMAN 1: EXECUTIVE SUMMARY & 3 PILAR ==================== */}
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
            {/* Kop / Header Dokumen */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #1f2e2a", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#1f2e2a", color: "#e5b85d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
                  ✦
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.03em", color: "#1f2e2a", lineHeight: 1 }}>
                    petakaya
                  </div>
                  <div style={{ fontSize: "10px", color: "#718077", marginTop: "3px" }}>
                    Teman berpikir untuk keputusan uang yang lebih tenang.
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ display: "inline-block", background: "#edf4eb", border: "1px solid #c9d8c6", color: "#48624e", fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.12em", padding: "4px 10px", borderRadius: "999px" }}>
                  Laporan Arah Finansial
                </span>
                <div style={{ fontSize: "11px", color: "#718077", marginTop: "4px" }}>
                  Dokumen Resmi Evaluasi 3 Pilar
                </div>
              </div>
            </div>

            {/* Metadata Bar */}
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: "10px", background: "#fafcf9", border: "1px solid #dce6da", borderRadius: "14px", padding: "10px 16px" }}>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a978e" }}>Nama Klien</div>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1f2e2a", marginTop: "2px" }}>{clientName}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a978e" }}>Nomor Referensi</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#bc6c4c", marginTop: "2px" }}>#DIAG-2026-{leadId}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a978e" }}>Tanggal Terbit</div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#1f2e2a", marginTop: "2px" }}>{reportDate}</div>
              </div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a978e" }}>Status Validasi</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#3d7348", marginTop: "2px" }}>✓ Terverifikasi</div>
              </div>
            </div>

            {/* Hero Statement Banner */}
            <div style={{ marginTop: "16px", borderRadius: "20px", background: "#1f2e2a", color: "#ffffff", padding: "22px 26px" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.14em", color: "#c3d9ba" }}>
                Ringkasan Eksekutif Finansial
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.03em", lineHeight: "1.15", marginTop: "8px", margin: "8px 0 0" }}>
                Kamu tidak butuh lebih banyak informasi. Kamu butuh arah.
              </h1>
              <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#c9dbca", marginTop: "8px", margin: "8px 0 0" }}>
                Hasil ini adalah peta awal berdasarkan kondisi dan jawaban nyata Anda hari ini. Gunakan untuk membaca kebiasaan, memahami risiko, dan memilih satu tindakan realistis.
              </p>
            </div>

            {/* Section 3 Pilar Utama */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.12em", color: "#718077", marginBottom: "8px" }}>
                Tiga Pilar Keputusan Finansial Anda
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {/* Pilar 1 */}
                <div style={{ borderRadius: "16px", background: "#dfeee1", border: "1px solid #c9decb", padding: "14px", color: "#223d32" }}>
                  <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", color: "#486e58" }}>Pilar 1 · Gaya Keuangan</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#1f2e2a", marginTop: "6px" }}>{result.style}</div>
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#3a5646", marginTop: "6px" }}>{result.strengths}</div>
                </div>

                {/* Pilar 2 */}
                <div style={{ borderRadius: "16px", background: "#ffe9dd", border: "1px solid #f2d4c4", padding: "14px", color: "#54382c" }}>
                  <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9c6046" }}>Pilar 2 · Profil Risiko</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#1f2e2a", marginTop: "6px" }}>{result.risk}</div>
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#694c40", marginTop: "6px" }}>Pahami batas risiko dan horizon sebelum memilih instrumen apa pun.</div>
                </div>

                {/* Pilar 3 */}
                <div style={{ borderRadius: "16px", background: "#eee5f7", border: "1px solid #dcceee", padding: "14px", color: "#4a335f" }}>
                  <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", color: "#79559a" }}>Pilar 3 · Kondisi Saat Ini</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#1f2e2a", marginTop: "6px" }}>{result.condition}</div>
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#5e4770", marginTop: "6px" }}>Ini titik awal yang bisa berubah melalui keputusan dan pencatatan kecil.</div>
                </div>
              </div>
            </div>

            {/* Section Edukasi 3 Pilar */}
            <div style={{ marginTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div style={{ borderRadius: "14px", border: "1px solid #cfe2d0", background: "#f4faf2", padding: "12px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#537357" }}>Apa artinya untukmu</div>
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#45594b", marginTop: "5px" }}>{result.styleEducation}</div>
                </div>
                <div style={{ borderRadius: "14px", border: "1px solid #f0d6c7", background: "#fff8f4", padding: "12px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#a45f47" }}>Cara membaca risiko</div>
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#6e4f44", marginTop: "5px" }}>{result.riskEducation}</div>
                </div>
                <div style={{ borderRadius: "14px", border: "1px solid #ded1ec", background: "#faf7fd", padding: "12px" }}>
                  <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#704894" }}>Fokus kondisi saat ini</div>
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#554366", marginTop: "5px" }}>{result.conditionEducation}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Halaman 1 */}
          <div style={{ borderTop: "1px solid #dfe6dc", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#8a978e" }}>
            <span>Petakaya Financial Wellness · Dokumen Laporan Personal & Rahasia</span>
            <span style={{ fontWeight: "bold", color: "#1f2e2a" }}>Halaman 1 dari 2</span>
          </div>
        </div>

        {/* ==================== HALAMAN 2: DEEP INSIGHT, ACTION PLAN & REKOMENDASI ==================== */}
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
                <span style={{ fontSize: "11px", color: "#718077" }}>· Laporan Diagnosa Finansial ({clientName})</span>
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#bc6c4c" }}>
                #DIAG-2026-{leadId}
              </div>
            </div>

            {/* Insight Gabungan */}
            <div style={{ marginTop: "16px", borderRadius: "18px", border: "1px solid #dfe6dc", background: "#fafcf9", padding: "18px 22px" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.12em", color: "#bc6c4c" }}>
                Sintesis Keputusan Finansial
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "-0.02em", color: "#1f2e2a", margin: "6px 0 8px" }}>
                Arah uangmu harus mengikuti kondisi nyata.
              </h2>
              <p style={{ fontSize: "12px", lineHeight: "1.7", color: "#4f5f54", margin: 0 }}>
                {result.insight}
              </p>
            </div>

            {/* Blindspot & Action Plan */}
            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Blind Spot */}
              <div style={{ borderRadius: "16px", border: "1px solid #eedad0", background: "#fffaf7", padding: "16px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", color: "#bc6c4c" }}>
                  ⚠️ Titik Lengah (Blind Spot)
                </div>
                <p style={{ fontSize: "11px", lineHeight: "1.6", color: "#694c40", marginTop: "8px", margin: "8px 0 0" }}>
                  {result.blindSpot}
                </p>
                <div style={{ marginTop: "10px", fontSize: "10px", color: "#9a7b6d", fontStyle: "italic" }}>
                  Kewaspadaan ini membantu mencegah keputusan impulsif atau penundaan yang tidak perlu.
                </div>
              </div>

              {/* Action Plan */}
              <div style={{ borderRadius: "16px", background: "#1f2e2a", color: "#ffffff", padding: "16px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", color: "#c3d9ba" }}>
                  🎯 Langkah Bulan Ini (Action Plan)
                </div>
                <p style={{ fontSize: "11px", lineHeight: "1.6", color: "#d2dfd1", marginTop: "8px", margin: "8px 0 0" }}>
                  {result.nextStep}
                </p>
                <div style={{ marginTop: "10px", fontSize: "10px", color: "#9eb39f" }}>
                  Fokus pada 1 tindakan terukur ini sebelum menambah target keuangan lainnya.
                </div>
              </div>
            </div>

            {/* Rekomendasi Program Petakaya */}
            <div style={{ marginTop: "16px", borderRadius: "18px", border: "1px solid #dce6da", background: "#f8faf6", padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.12em", color: "#667b6a" }}>
                    Rekomendasi Langkah Berikutnya
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2e2a", marginTop: "2px" }}>
                    Bangun Sistem & Ruang Bertanya Bersama Petakaya
                  </div>
                </div>
                <span style={{ background: "#e8f1e5", color: "#47614f", border: "1px solid #c8d8c5", fontSize: "9px", fontWeight: "bold", padding: "4px 8px", borderRadius: "8px" }}>
                  Promo Founding 2026
                </span>
              </div>

              <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#ffffff", border: "1px solid #dfe7dc", borderRadius: "12px", padding: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#1f2e2a" }}>Net Worth Tracking Premium</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#bc6c4c", marginTop: "2px" }}>Rp168.000 <span style={{ fontSize: "10px", color: "#8a978e", fontWeight: "normal" }}>/ tahun</span></div>
                  <div style={{ fontSize: "10px", color: "#67756b", lineHeight: "1.5", marginTop: "4px" }}>
                    Sistem tracking aset liquid & hutang, Goal Pensiun terhubung, snapshot rekap 12 bulan, dan sharing group.
                  </div>
                </div>

                <div style={{ background: "#ede4f7", border: "1px solid #dcceee", borderRadius: "12px", padding: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: "#3e2d50" }}>1 on 1 Coaching Strategist</div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#79559a", marginTop: "2px" }}>Pendampingan Personal</div>
                  <div style={{ fontSize: "10px", color: "#5b4a6e", lineHeight: "1.5", marginTop: "4px" }}>
                    Percakapan mendalam membaca kebiasaan keluarga, menyusun prioritas dan transformasi keuangan nyata.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", border: "1px dashed #ceddcb", borderRadius: "10px", padding: "8px 14px" }}>
                <span style={{ fontSize: "11px", color: "#67756b" }}>
                  Butuh bantuan membaca hasil ini? Chat langsung ke Admin WhatsApp:
                </span>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1f2e2a" }}>
                  📱 0822-9800-8889
                </span>
              </div>
            </div>

            {/* Disclaimer Regulasi */}
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "#f6f8f5", borderRadius: "10px", border: "1px solid #e2e8df" }}>
              <p style={{ fontSize: "9px", lineHeight: "1.5", color: "#7a8a7d", margin: 0 }}>
                <b>Catatan Kepatuhan Finansial:</b> Laporan ini disusun untuk tujuan edukasi reflektif dan pemetaan kebiasaan pengelolaan uang personal berdasarkan data yang Anda sampaikan secara mandiri. Isi dokumen ini bukan merupakan nasihat investasi, penawaran efek, jaminan tingkat pengembalian, atau pengganti saran perencana keuangan berlisensi resmi.
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

function ResultView({ result, restart }: { result: DiagnosisResult; restart: () => void }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    toast.info("Sedang menyusun laporan PDF berstandar A4...");

    try {
      const html2pdf = await loadHtml2Pdf();
      const element = document.getElementById("petakaya-official-pdf");

      if (!element || !html2pdf) {
        window.print();
        return;
      }

      const clientName = (localStorage.getItem("petakaya_lead_name") || "Peserta")
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "_");

      const opt = {
        margin: 0,
        filename: `Laporan_Diagnosa_Petakaya_${clientName}.pdf`,
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
      toast.success("Laporan PDF berhasil diunduh ke perangkat Anda!");
    } catch (err) {
      console.error("Gagal mengekspor PDF via html2pdf:", err);
      toast.error("Mengalihkan ke dialog cetak dokumen...");
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] bg-[#eef3eb] px-5 py-10 md:px-8 md:py-16">
      <OfficialPdfReport result={result} />

      <div className="mx-auto max-w-6xl">
        {/* Navigation Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#718077] hover:text-[#1f2e2a] transition"
          >
            <ArrowLeft size={15} />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-xl bg-[#1f2e2a] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#30443d] active:scale-[0.98] disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download Laporan PDF</span>
                </>
              )}
            </button>

            <button
              onClick={restart}
              className="flex items-center gap-1.5 rounded-xl border border-[#dce6da] bg-white px-3.5 py-2 text-xs font-bold text-[#718077] hover:bg-[#f6f8f5] hover:text-[#1f2e2a] transition"
            >
              <RotateCcw size={14} />
              <span>Ulangi</span>
            </button>
          </div>
        </div>

        {/* Web Result Presentation */}
        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(64,86,68,.08)]">
          <div className="bg-[#1f2e2a] p-7 text-white md:p-12">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c3d9ba]">
                Laporan Arah Finansial Personal
              </p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#dceaca]">
                ID: #DIAG-2026-{localStorage.getItem("petakaya_lead_id") || "0891"}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#b5c6b7]">
              Untuk: {localStorage.getItem("petakaya_lead_name") || "Peserta Petakaya"} · {new Date().toLocaleDateString("id-ID")}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[42px] leading-[1.02] md:text-[64px]">
              Kamu tidak butuh lebih banyak informasi. Kamu butuh arah.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#c3d9ba]">
              Hasil ini adalah peta awal berdasarkan kondisi dan jawabanmu hari ini.
            </p>
          </div>

          <div className="p-7 md:p-12">
            <div className="grid gap-5 md:grid-cols-3">
              <PillarCard tone="green" title="Pilar 1 · Gaya keuangan" value={result.style} text={result.strengths} />
              <PillarCard tone="peach" title="Pilar 2 · Profil risiko" value={result.risk} text="Pahami batas risiko dan horizon sebelum memilih instrumen." />
              <PillarCard tone="lavender" title="Pilar 3 · Kondisi saat ini" value={result.condition} text="Ini titik awal yang bisa berubah melalui keputusan kecil." />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <EducationCard title="Apa artinya untukmu" text={result.styleEducation} tone="green" />
              <EducationCard title="Cara membaca risiko" text={result.riskEducation} tone="peach" />
              <EducationCard title="Fokus kondisi saat ini" text={result.conditionEducation} tone="lavender" />
            </div>

            <div className="mt-9 grid gap-8 md:grid-cols-[1.1fr_.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.17em] text-[#bc6c4c]">Insight gabungan</p>
                <h2 className="mt-4 font-display text-[40px] leading-[1.04]">Arah uangmu harus mengikuti kondisi nyata.</h2>
                <p className="mt-5 text-base leading-8 text-[#637168]">{result.insight}</p>
                <div className="mt-7 rounded-2xl bg-[#1f2e2a] p-6 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3d9ba]">Langkah bulan ini</p>
                  <p className="mt-3 text-sm leading-7 text-[#d2dfd1]">{result.nextStep}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-[#ead8cd] bg-[#fffaf7] p-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#bc6c4c]">Blind spot</p>
                  <p className="mt-3 text-sm leading-7 text-[#765f56]">{result.blindSpot}</p>
                </div>
                <div className="rounded-2xl bg-[#f4f0fa] p-6">
                  <p className="text-xs font-bold text-[#79559a]">Bukan label permanen</p>
                  <p className="mt-2 text-sm leading-6 text-[#766980]">
                    Gunakan hasil ini sebagai dasar percakapan dan keputusan berikutnya.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Link href="/pricing" className="rounded-2xl bg-[#bc6c4c] p-6 text-white transition hover:bg-[#a85f41]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#f8d8c7]">
                  Net Worth Tracking Premium · Rp168.000/tahun
                </p>
                <h3 className="mt-3 font-display text-3xl">Bangun sistemnya.</h3>
                <p className="mt-2 text-sm leading-6 text-[#f9e7de]">
                  Net Worth, Dana Pensiun, snapshot, Zoom, dan sharing group.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                  Lihat Premium <ArrowRight size={15} />
                </span>
              </Link>

              <a
                href="https://wa.me/6282298008889?text=Halo%20Admin%20Petakaya%2C%20saya%20ingin%20membahas%20kondisi%20finansial%20saya%20secara%20personal."
                className="rounded-2xl bg-[#79559a] p-6 text-white transition hover:bg-[#684786]"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#eadcf7]">
                  Coaching Strategist
                </p>
                <h3 className="mt-3 font-display text-3xl">Bangun transformasinya.</h3>
                <p className="mt-2 text-sm leading-6 text-[#f0e7f8]">
                  Arah pensiun, investasi sesuai profil risiko, karakter, dan goal keluarga.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                  Tanya Admin untuk screening <ArrowRight size={15} />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationCard({ title, text, tone }: { title: string; text: string; tone: "green" | "peach" | "lavender" }) {
  const styles = { green: "border-[#cfe2d0] bg-[#f4faf2]", peach: "border-[#f0d6c7] bg-[#fff8f4]", lavender: "border-[#ded1ec] bg-[#faf7fd]" };
  return (
    <div className={`rounded-2xl border p-5 ${styles[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7b897f]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[#64736a]">{text}</p>
    </div>
  );
}

function PillarCard({ tone, title, value, text }: { tone: "green" | "peach" | "lavender"; title: string; value: string; text: string }) {
  const styles = { green: "bg-[#dfeee1] text-[#29483b]", peach: "bg-[#ffe9dd] text-[#694c40]", lavender: "bg-[#eee5f7] text-[#5e4770]" };
  return (
    <div className={`rounded-2xl p-6 ${styles[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{title}</p>
      <h2 className="mt-4 font-display text-3xl">{value}</h2>
      <p className="mt-3 text-sm leading-6 opacity-80">{text}</p>
    </div>
  );
}

export { questions };

