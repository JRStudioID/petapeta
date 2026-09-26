from pathlib import Path
p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/NetWorth.tsx')
s=p.read_text()
old='const starterAssets: NetworthItem[] = [{ id: "a1", category: "Tabungan", label: "BCA", amount: 45000000 }, { id: "a2", category: "Investasi", label: "Emas", amount: 137500000 }, { id: "a3", category: "Aset lainnya", label: "Kendaraan", amount: 227700000 }];'
s=s.replace(old, 'const starterAssets: NetworthItem[] = [];')
old='const starterLiabilities: NetworthItem[] = [{ id: "l1", category: "Kartu kredit", label: "BCA Card", amount: 8200000 }, { id: "l2", category: "Pinjaman", label: "KPR / pinjaman lain", amount: 153300000 }];'
s=s.replace(old, 'const starterLiabilities: NetworthItem[] = [];')
p.write_text(s)

r=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/Retirement.tsx')
s=r.read_text().replace('Goal Goal Pensiunmu.', 'Goal Pensiunmu.').replace('} catch { return 182500000; } };', '} catch { return 0; } };')
r.write_text(s)
