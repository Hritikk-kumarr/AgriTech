import { useState } from 'react';
export default function BlockchainBadge({ hash }) {
  const [tip, setTip] = useState(false);
  if (!hash) return null;
  return (
    <span style={{ position:'relative', display:'inline-block' }}
      onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
      <span style={{ background:'var(--g50)', color:'var(--g800)', border:'1px solid var(--g200)', borderRadius:'6px', padding:'.2rem .5rem', fontSize:'.72rem', fontFamily:'monospace', cursor:'pointer' }}>
        ⛓ {hash.slice(0,10)}…
      </span>
      {tip && (
        <span style={{ position:'absolute', bottom:'120%', left:0, background:'#1f2937', color:'white', padding:'.5rem .75rem', borderRadius:'8px', fontSize:'.7rem', fontFamily:'monospace', whiteSpace:'nowrap', zIndex:10, wordBreak:'break-all', maxWidth:'280px', whiteSpace:'normal', lineHeight:1.4 }}>
          {hash}
        </span>
      )}
    </span>
  );
}
