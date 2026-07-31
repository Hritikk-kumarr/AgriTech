export default function StockBar({ current, allotted }) {
  const pct = allotted > 0 ? Math.round((current / allotted) * 100) : 0;
  const color = pct > 50 ? 'var(--g500)' : pct > 20 ? 'var(--gold)' : 'var(--red)';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem', color:'var(--muted)', marginBottom:'.4rem' }}>
        <span>{current} bags remaining</span><span>{pct}%</span>
      </div>
      <div className="stock-bar-wrap">
        <div className="stock-bar-fill" style={{ width: `${pct}%`, background: color }}/>
      </div>
    </div>
  );
}
