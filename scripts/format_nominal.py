from pathlib import Path

p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/NetWorth.tsx')
s=p.read_text()
s=s.replace('const signedIdr = (value: number) => `${value >= 0 ? "+" : "−"}${idr(Math.abs(value))}`;', 'const signedIdr = (value: number) => `${value >= 0 ? "+" : "−"}${idr(Math.abs(value))}`;\nconst groupedNumber = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.max(0, value));')
s=s.replace('value={String(item.amount)} onChange={e => onUpdate(side, item.id, "amount", e.target.value)}', 'value={groupedNumber(item.amount)} onChange={e => onUpdate(side, item.id, "amount", e.target.value)}')
p.write_text(s)

p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/Retirement.tsx')
s=p.read_text()
s=s.replace('const idr = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)));', 'const idr = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)));\nconst groupedNumber = (value: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)));')
s=s.replace('value={String(value)} onChange={e => onChange(Number(e.target.value.replace(/\\D/g, "")) || 0)}', 'value={groupedNumber(value)} onChange={e => onChange(Number(e.target.value.replace(/\\D/g, "")) || 0)}')
s=s.replace('Wajib diisi agar target penarikan dapat dihitung.</p></div>; }', 'Wajib diisi agar target penarikan dapat dihitung. Gunakan titik sebagai pemisah ribuan.</p></div>; }')
p.write_text(s)
