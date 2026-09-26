from pathlib import Path
p=Path('/home/ubuntu/petakaya-financial-wellness/client/src/pages/NetWorth.tsx')
s=p.read_text()
s=s.replace('const maxChart = Math.max(...savedChartValues, 1);', 'const maxChart = Math.max(...savedChartValues, 1);\n  const linePoints = chartValues.map((value, index) => { const x = chartValues.length <= 1 ? 50 : (index / (chartValues.length - 1)) * 100; const y = value === null ? 100 : 92 - (value / maxChart) * 78; return `${x},${y}`; }).join(" ");')
s=s.replace('<div className="mt-9 flex h-[180px] items-end gap-2 border-b border-[#dce9dc]">{chartBars}</div>', '<div className="mt-9 h-[180px] border-b border-[#dce9dc]"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible"><polyline points={linePoints} fill="none" stroke="#79559a" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{chartValues.map((value, index) => value === null ? null : <circle key={index} cx={chartValues.length <= 1 ? 50 : (index / (chartValues.length - 1)) * 100} cy={92 - (value / maxChart) * 78} r="1.8" fill="#ffb38f" vectorEffect="non-scaling-stroke" />)}</svg></div>')
s=s.replace('Grafik hanya menampilkan snapshot yang benar-benar tersimpan.', 'Grafik hanya menampilkan snapshot yang benar-benar tersimpan.')
p.write_text(s)
