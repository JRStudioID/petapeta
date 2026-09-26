from pathlib import Path
p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/NetWorth.tsx')
s=p.read_text()
s=s.replace('<button onClick={() => setShowPaywall(true)} className="flex items-center gap-2 rounded-full bg-[#1f2e2a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#30443d]">Simpan snapshot <ArrowRight size={14} /></button>', '<button onClick={() => window.print()} className="flex items-center gap-2 rounded-full border border-[#d3dfd0] bg-white px-4 py-2.5 text-xs font-bold text-[#79559a]">Export laporan PDF</button><button onClick={() => setShowPaywall(true)} className="flex items-center gap-2 rounded-full bg-[#1f2e2a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#30443d]">Simpan snapshot <ArrowRight size={14} /></button>')
s=s.replace('text="Pastikan ada dana yang mudah dicairkan."', 'text={totalAssets === 0 ? "Belum ada aset yang dicatat. Mulai dari satu rekening atau investasi yang paling mudah kamu verifikasi." : "Baca apakah aset liquid cukup memberi ruang bernapas sebelum mengejar tujuan baru."}')
s=s.replace('text="Visual pembanding membantu melihat kebiasaan, bukan menghakimi angka."', 'text={Object.keys(snapshots).length === 0 ? "Snapshot pertama akan menjadi titik acuan yang jujur untuk membaca perubahan." : "Bandingkan periode nyata untuk melihat pola, bukan menghakimi angka."}')
s=s.replace('text="Konsistensi lebih penting dari angka sempurna."', 'text="Review sebulan sekali. Jika ingin membahas arah yang lebih personal, gunakan ruang sharing atau ajukan percakapan Strategist."')
p.write_text(s)
