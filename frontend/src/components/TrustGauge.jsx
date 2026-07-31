export default function TrustGauge({ score }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = circ * pct; const gap = circ - dash;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#dc2626';
  return (
    <div className="trust-ring-wrap">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"/>
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          transform="rotate(-90 48 48)" style={{ transition: 'stroke-dasharray .6s ease' }}/>
        <text x="48" y="48" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: '1.1rem', fontWeight: 800, fill: color }}>{score}</text>
      </svg>
      <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '-.25rem' }}>Trust Score</div>
    </div>
  );
}
