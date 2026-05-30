// ===== Charts ດ້ວຍ Pure SVG (ບໍ່ຕ້ອງ install library) =====

// 1. Bar Chart
export function BarChart({ data, title, color = '#3b82f6' }) {
  if (!data || data.length === 0) return <EmptyChart title={title} />;

  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {title && <h3 className="font-bold text-gray-800 mb-4">{title}</h3>}
      <div className="relative" style={{ height: '220px' }}>
        <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Y-axis grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y * 1.7 + 10} x2="400" y2={y * 1.7 + 10}
              stroke="#f3f4f6" strokeWidth="1" />
          ))}
          {/* Bars */}
          {data.map((d, i) => {
            const h = (d.value / max) * 170;
            const x = i * (400 / data.length) + (400 / data.length) * 0.15;
            const w = (400 / data.length) * 0.7;
            const y = 180 - h;
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} fill={color} rx="3" opacity="0.9">
                  <title>{`${d.label}: ${d.value}`}</title>
                </rect>
                <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="600">
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
        {/* X-axis labels */}
        <div className="flex mt-2" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-xs text-gray-500 text-center truncate px-1" title={d.label}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Pie/Donut Chart
export function DonutChart({ data, title, size = 180 }) {
  if (!data || data.length === 0) return <EmptyChart title={title} />;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <EmptyChart title={title} />;

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const radius = size / 2;
  const innerRadius = radius * 0.6;
  const cx = radius;
  const cy = radius;

  let cumulativeAngle = -Math.PI / 2; // ເລີ່ມຈາກເທິງ

  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + Math.cos(cumulativeAngle) * radius;
    const y1 = cy + Math.sin(cumulativeAngle) * radius;
    const x2 = cx + Math.cos(cumulativeAngle + angle) * radius;
    const y2 = cy + Math.sin(cumulativeAngle + angle) * radius;
    const x3 = cx + Math.cos(cumulativeAngle + angle) * innerRadius;
    const y3 = cy + Math.sin(cumulativeAngle + angle) * innerRadius;
    const x4 = cx + Math.cos(cumulativeAngle) * innerRadius;
    const y4 = cy + Math.sin(cumulativeAngle) * innerRadius;
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    const color = colors[i % colors.length];
    cumulativeAngle += angle;
    return { path, color, label: d.label, value: d.value, percent: ((d.value / total) * 100).toFixed(1) };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {title && <h3 className="font-bold text-gray-800 mb-4">{title}</h3>}
      <div className="flex items-center gap-6 flex-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} opacity="0.9">
              <title>{`${s.label}: ${s.value} (${s.percent}%)`}</title>
            </path>
          ))}
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#374151">
            {total}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#9ca3af">
            ທັງໝົດ
          </text>
        </svg>
        <div className="flex-1 space-y-2 min-w-[120px]">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-gray-700 font-medium truncate">{s.label}</span>
              <span className="text-gray-500">{s.value} ({s.percent}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Stat Card with mini chart
export function StatCard({ label, value, color = 'blue', icon, change }) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs ${c.text} font-semibold uppercase tracking-wide`}>{label}</span>
        {icon && <div className={`${c.text}`}>{icon}</div>}
      </div>
      <div className={`text-3xl font-extrabold ${c.text}`}>{value}</div>
      {change != null && (
        <div className={`text-xs mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% ຈາກອາທິດກ່ອນ
        </div>
      )}
    </div>
  );
}

// 4. Line Chart (Time series)
export function LineChart({ data, title, color = '#2563eb' }) {
  if (!data || data.length === 0) return <EmptyChart title={title} />;

  const max = Math.max(...data.map(d => d.value), 1);
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 35 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // ສ້າງ points
  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * innerW,
    y: padding.top + innerH - (d.value / max) * innerH,
    label: d.label,
    value: d.value,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {title && <h3 className="font-bold text-gray-800 mb-4">{title}</h3>}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = padding.top + innerH * p;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                  stroke="#f3f4f6" strokeWidth="1" />
                <text x={padding.left - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                  {Math.round(max * (1 - p))}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill={color} opacity="0.1" />

          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2">
                <title>{`${p.label}: ${p.value}`}</title>
              </circle>
            </g>
          ))}

          {/* X-axis labels (ສະແດງສະເພາະ ບາງຈຸດ ຖ້າເຍີຍ) */}
          {points.map((p, i) => {
            const showEvery = Math.ceil(points.length / 8);
            if (i % showEvery !== 0 && i !== points.length - 1) return null;
            return (
              <text key={i} x={p.x} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b7280">
                {p.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function EmptyChart({ title }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {title && <h3 className="font-bold text-gray-800 mb-4">{title}</h3>}
      <div className="text-center py-10 text-gray-400 text-sm">ຍັງບໍ່ມີຂໍ້ມູນ</div>
    </div>
  );
}
