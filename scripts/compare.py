from pathlib import Path
p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/NetWorth.tsx')
s=p.read_text()
s=s.replace('const idr = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.max(0, value));', 'const idr = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.max(0, value));\nconst signedIdr = (value: number) => `${value >= 0 ? "+" : "−"}${idr(Math.abs(value))}`;')
s=s.replace('const currentSnapshot = snapshots[month];', 'const currentSnapshot = snapshots[month];\n  const compareSnapshot = compareMonth ? snapshots[compareMonth] : undefined;\n  const compareDelta = compareSnapshot ? netWorth - compareSnapshot.netWorth : null;')
s=s.replace('<span className="rounded-xl bg-[#e8f2e3] px-3 py-2 text-xs font-bold text-[#58735e]">Snapshot tersimpan</span>', '<span className={`rounded-xl px-3 py-2 text-xs font-bold ${compareDelta === null ? "bg-[#f3f5f1] text-[#849187]" : compareDelta >= 0 ? "bg-[#e8f2e3] text-[#58735e]" : "bg-[#f9e9e1] text-[#b2694e]"}`}>{compareDelta === null ? "Pilih snapshot nyata" : `${signedIdr(compareDelta)} vs ${compareMonth}`}</span>')
p.write_text(s)
