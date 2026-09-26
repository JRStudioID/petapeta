from pathlib import Path
p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/Retirement.tsx')
s=p.read_text()
old='<div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#dce7d9] bg-white p-4 text-xs leading-5 text-[#718077]"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-[#829b86]" /> Belum ada data aset liquid. Setelah Premium aktif, angka ini mengikuti snapshot Tabungan dan Investasi milik pengguna.</div>'
new='<div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#dce7d9] bg-white p-4 text-xs leading-5 text-[#718077]"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-[#829b86]" /> {liquidAssets > 0 ? "Aset liquid tersinkron dari Net Worth Tracking. Perbarui snapshot jika ada perubahan." : "Belum ada data aset liquid. Setelah Premium aktif, angka ini mengikuti snapshot Tabungan dan Investasi milik pengguna."}</div>'
if old not in s: raise SystemExit('banner not found')
p.write_text(s.replace(old,new))
