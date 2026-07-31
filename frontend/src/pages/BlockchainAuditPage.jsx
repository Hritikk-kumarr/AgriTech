import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../api';

export default function BlockchainAuditPage() {
  const [chain, setChain] = useState([]);
  const [verifyResult, setVerifyResult] = useState(null);
  const [lookup, setLookup] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api('/audit/chain').then(d=>setChain(d.chain||[])).catch(()=>{}); }, []);

  const verify = async () => {
    setLoading(true);
    try { setVerifyResult(await api('/audit/verify')); } catch(e) { console.error(e); }
    setLoading(false);
  };

  const lookupHash = async e => {
    e.preventDefault(); setLoading(true); setLookupResult(null);
    try { setLookupResult(await api(`/audit/block/${lookup}`)); }
    catch(err) { setLookupResult({ error: err.message }); }
    setLoading(false);
  };

  const eventColor = { TRANSACTION_VERIFIED:'var(--g600)', DECLARATION_SUBMITTED:'var(--blue)' };

  return (
    <div className="page">
      <Header/>
      <div style={{ background:'linear-gradient(135deg, #1e1b4b, #312e81)', color:'white', padding:'3rem 1.5rem', textAlign:'center' }}>
        <Shield size={40} style={{ margin:'0 auto 1rem' }}/>
        <h1 style={{ fontSize:'2rem', fontWeight:800, marginBottom:'.5rem' }}>Blockchain Audit Trail</h1>
        <p style={{ opacity:.8, maxWidth:560, margin:'0 auto' }}>
          Every transaction and declaration is permanently anchored as a tamper-proof block. No one — not even the system administrators — can alter these records.
        </p>
      </div>

      <main className="main">
        {/* Privacy Model Card */}
        <div className="card" style={{ marginBottom:'2rem', borderLeft:'4px solid #6366f1', background:'#f5f3ff' }}>
          <div className="card-body">
            <div style={{ fontWeight:700, color:'#4338ca', marginBottom:'.75rem', fontSize:'1rem' }}>🔐 Privacy Architecture</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'1rem', fontSize:'.88rem' }}>
              {[
                ['Aadhaar Storage','Never stored in plaintext — only a one-way SHA-256 hash is used. The original number cannot be recovered.'],
                ['Mobile Numbers','Only the last 4 digits are retained for display. Full number is not stored.'],
                ['Transaction Data','Hashed and anchored on-chain. Immutable — no admin can edit or delete.'],
                ['Audit Chain','Each block links to the previous via SHA-256, making tampering immediately detectable.'],
              ].map(([t,d])=>(
                <div key={t} style={{ padding:'1rem', background:'white', borderRadius:'var(--r)', border:'1px solid #e0e7ff' }}>
                  <div style={{ fontWeight:600, color:'#4338ca', marginBottom:'.35rem' }}>{t}</div>
                  <div style={{ color:'var(--muted)', lineHeight:1.5 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem' }}>
          {/* Chain Integrity Verifier */}
          <div className="card">
            <div className="card-header"><h3>⛓ Verify Chain Integrity</h3></div>
            <div className="card-body">
              <p style={{ color:'var(--muted)', fontSize:'.88rem', marginBottom:'1.5rem' }}>Recompute all block hashes and confirm the chain hasn't been tampered with.</p>
              <button className="btn btn-primary btn-full" onClick={verify} disabled={loading}>
                {loading?<><span className="spinner spinner-white"/>&nbsp;Verifying…</>:'Run Integrity Check'}
              </button>
              {verifyResult && (
                <div className={`alert ${verifyResult.valid?'alert-success':'alert-danger'}`} style={{ marginTop:'1rem' }}>
                  {verifyResult.valid ? (
                    <><CheckCircle size={16} style={{ verticalAlign:'middle', marginRight:'.4rem' }}/><strong>Chain Intact!</strong> All {verifyResult.totalBlocks} blocks verified.</>
                  ) : (
                    <><XCircle size={16} style={{ verticalAlign:'middle', marginRight:'.4rem' }}/><strong>Tamper Detected!</strong> Chain broken at block #{verifyResult.brokenAtBlock}: {verifyResult.reason}</>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hash Lookup */}
          <div className="card">
            <div className="card-header"><h3>🔍 Look Up a Block</h3></div>
            <div className="card-body">
              <p style={{ color:'var(--muted)', fontSize:'.88rem', marginBottom:'1rem' }}>Paste any block hash to see what event it represents.</p>
              <form onSubmit={lookupHash}>
                <div className="form-group">
                  <input className="form-input" placeholder="Paste full block hash (64 hex chars)" value={lookup} onChange={e=>setLookup(e.target.value)} style={{ fontFamily:'monospace', fontSize:'.8rem' }}/>
                </div>
                <button className="btn btn-secondary btn-full" type="submit" disabled={!lookup||loading}>
                  <Search size={15}/> Lookup
                </button>
              </form>
              {lookupResult && (
                <div style={{ marginTop:'1rem' }}>
                  {lookupResult.error ? <div className="alert alert-danger">{lookupResult.error}</div> : (
                    <div style={{ background:'#f9fafb', borderRadius:'var(--r)', padding:'1rem', fontFamily:'monospace', fontSize:'.78rem' }}>
                      <div><strong>Event:</strong> {lookupResult.block?.event_type}</div>
                      <div><strong>Block:</strong> #{lookupResult.block?.block_index}</div>
                      <div><strong>Time:</strong> {new Date(lookupResult.block?.timestamp).toLocaleString('en-IN')}</div>
                      <div style={{ marginTop:'.5rem', wordBreak:'break-all' }}><strong>Data:</strong><br/>{JSON.stringify(lookupResult.block?.event_data, null, 2)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Chain */}
        <div className="card">
          <div className="card-header">
            <h3>📦 Full Audit Chain ({chain.length} blocks)</h3>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.82rem', color:'var(--muted)' }}>
              <div className="live-dot"/> Append-only • Immutable
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead><tr><th>#</th><th>Event Type</th><th>Block Hash</th><th>Prev Hash</th><th>Timestamp</th></tr></thead>
              <tbody>
                {chain.length===0?<tr><td colSpan={5} style={{ textAlign:'center', color:'var(--muted)', padding:'2rem' }}>No blocks yet — transactions will appear here as they are created</td></tr>:
                chain.map(b=>(
                  <tr key={b.id}>
                    <td style={{ fontWeight:700, color:'#6366f1' }}>#{b.block_index}</td>
                    <td><span style={{ background: b.event_type==='TRANSACTION_VERIFIED'?'#dcfce7':'#eff6ff', color: eventColor[b.event_type]||'var(--muted)', padding:'.2rem .6rem', borderRadius:'20px', fontSize:'.75rem', fontWeight:600, whiteSpace:'nowrap' }}>{b.event_type}</span></td>
                    <td style={{ fontFamily:'monospace', fontSize:'.75rem', color:'var(--g700)' }}>{b.block_hash.slice(0,16)}…</td>
                    <td style={{ fontFamily:'monospace', fontSize:'.75rem', color:'var(--muted)' }}>{b.prev_hash.slice(0,16)}…</td>
                    <td style={{ fontSize:'.8rem', color:'var(--muted)', whiteSpace:'nowrap' }}>{new Date(b.timestamp).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
