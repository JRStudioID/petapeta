from pathlib import Path
p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/Diagnosis.tsx')
s=p.read_text()
s=s.replace('<p className="text-xs font-bold uppercase tracking-[.18em] text-[#c3d9ba]">Laporan arah finansial personal</p>', '<p className="text-xs font-bold uppercase tracking-[.18em] text-[#c3d9ba]">Laporan arah finansial personal</p><p className="mt-2 text-xs text-[#b5c6b7]">Untuk: {localStorage.getItem("petakaya_lead_name") || "Peserta Petakaya"} · {new Date().toLocaleDateString("id-ID")}</p>')
s=s.replace('<span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Tanya Admin untuk screening <ArrowRight size={15}/></span></a></div></div></div></div>;', '<span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Tanya Admin untuk screening <ArrowRight size={15}/></span></a></div><p className="mt-8 text-center text-xs font-semibold text-[#829087]">Petakaya — Financial Wellness · Membaca kondisi, menyusun arah.</p></div></div></div></div>;')
p.write_text(s)

c=Path('/home/ubuntu/petakaya-financial-wellness/client/src/index.css')
s=c.read_text().replace('  @page { size: A4; margin: 16mm; }', '  @page { size: A4; margin: 12mm; }\n  .min-h-screen, [class*="min-h-[calc"] { max-height: 265mm !important; overflow: hidden !important; }')
c.write_text(s)
