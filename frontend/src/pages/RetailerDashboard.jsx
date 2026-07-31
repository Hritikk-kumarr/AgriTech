import { useState, useEffect } from 'react';
import { Camera, MapPin, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import StockBar from '../components/StockBar';
import BlockchainBadge from '../components/BlockchainBadge';
import { api } from '../api';

export default function RetailerDashboard() {
  const [tab, setTab] = useState('stock');
  const [retailer, setRetailer] = useState(null);
  const [totalSold, setTotalSold] = useState(0);
  const [txs, setTxs] = useState([]);
  const [decls, setDecls] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [form, setForm] = useState({ declared_stock:'' });
  const [dispute, setDispute] = useState({ subject:'', description:'' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api('/retailers/me').then(d=>{ setRetailer(d.retailer); setTotalSold(d.total_sold||0); }).catch(()=>{});
    api('/retailers/me/transactions').then(d=>setTxs(d.transactions||[])).catch(()=>{});
    api('/retailers/me/declarations').then(d=>setDecls(d.declarations||[])).catch(()=>{});
    api('/disputes').then(d=>setDisputes(d.disputes||[])).catch(()=>{});
  };

  useEffect(() => { load(); const t = setInterval(load, 3000); return ()=>clearInterval(t); }, []);

  const handleDeclare = async e => {
    e.preventDefault(); setLoading(true); setError(''); setResult(null);
    try {
      const data = await api('/retailers/me/declare', { method:'POST', body: JSON.stringify({ declared_stock: parseInt(form.declared_stock), photo_placeholder:'evidence_photo_mock.jpg', geo_tag:'28.6139,77.2090' }) });
      setResult(data); load();
    } catch(err) { setError(err.message); }
    setLoading(false);
  };

  const handleDispute = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api('/disputes', { method:'POST', body: JSON.stringify({ subject: dispute.subject, description: dispute.description }) });
      setDispute({ subject:'', description:'' }); load();
    } catch(err) { setError(err.message); }
    setLoading(false);
  };

  if (!retailer) return <div className="page"><Header/><div style={{ textAlign:'center', padding:'4rem' }}><div className="spinner spinner-lg" style={{ margin:'0 auto' }}/></div></div>;

  return (
    <div className="page">
      <Header/>
      <main className="main">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div className="page-title">🏪 {retailer.name}</div>
            <div style={{ color:'var(--muted)', fontSize:'.9rem' }}>License: {retailer.license_number} &nbsp;|&nbsp; Season: {retailer.season}</div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
          {[
            { label:'Allotted Quantity', value: retailer.allotted_quantity, unit:'bags', color:'var(--g800)' },
            { label:'Current Live Stock', value: retailer.current_stock, unit:'bags', color:'var(--g600)' },
            { label:'Total Verified Sold', value: totalSold, unit:'bags', color:'var(--blue)' },
          ].map(s=>(
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
              <div className="stat-sub">{s.unit}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:'1.5rem' }}><StockBar current={retailer.current_stock} allotted={retailer.allotted_quantity}/></div>
        <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'2rem', fontSize:'.82rem', color:'var(--muted)' }}>
          <div className="live-dot"/> Refreshing every 3 seconds — decrements instantly on each farmer OTP confirmation
        </div>

        <div className="tabs">
          {[['stock','📦 Stock'],['transactions','📋 Transactions'],['declare','📝 Declare Season End'],['disputes','⚖️ Disputes']].map(([k,v])=>(
            <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</button>
          ))}
        </div>

        {tab==='transactions' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Farmer ID</th><th>Bags</th><th>Status</th><th>Blockchain Hash</th></tr></thead>
              <tbody>
                {txs.length===0?<tr><td colSpan={5} style={{ textAlign:'center', color:'var(--muted)', padding:'2rem' }}>No transactions yet</td></tr>:
                txs.map(t=>(
                  <tr key={t.id}>
                    <td style={{ fontSize:'.82rem' }}>{new Date(t.timestamp).toLocaleString('en-IN')}</td>
                    <td style={{ color:'var(--muted)', fontFamily:'monospace', fontSize:'.82rem' }}>F-{t.farmer_id}</td>
                    <td><strong>{t.requested_bags}</strong></td>
                    <td><span className={`badge ${t.status==='VERIFIED'?'badge-success':t.status==='REJECTED'?'badge-danger':'badge-warning'}`}>{t.status}</span></td>
                    <td><BlockchainBadge hash={t.block_hash}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==='declare' && (
          <div style={{ maxWidth:560 }}>
            {decls.length>0 && decls[0].is_flagged===1 && !result && (
              <div className="alert alert-danger flag-card-new" style={{ marginBottom:'1.5rem' }}>
                <strong>⚠️ Previous Declaration Flagged!</strong> Your last stock declaration had a discrepancy. The Agriculture Department has been notified and a field audit may be scheduled.
              </div>
            )}
            {result ? (
              <div className={`card animate-in ${result.isFlagged?'':'card'}`}>
                <div className="card-body">
                  {result.isFlagged ? (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem' }}>
                        <AlertTriangle size={28} color="var(--red)"/>
                        <div>
                          <div style={{ fontWeight:700, color:'var(--red)', fontSize:'1.1rem' }}>Discrepancy Detected</div>
                          <div style={{ fontSize:'.85rem', color:'var(--muted)' }}>Flagged to Agriculture Department</div>
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                        {[['System Expected',result.expectedStock,'var(--g700)'],['You Declared',result.declaredStock,'var(--red)']].map(([l,v,c])=>(
                          <div key={l} style={{ background:'#f9fafb', borderRadius:'var(--r)', padding:'1rem', textAlign:'center' }}>
                            <div style={{ fontSize:'.78rem', color:'var(--muted)', marginBottom:'.25rem' }}>{l}</div>
                            <div style={{ fontSize:'1.8rem', fontWeight:800, color:c }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:'var(--red-light)', borderRadius:'var(--r-sm)', padding:'.75rem', fontSize:'.85rem', color:'var(--red-dark)', marginBottom:'1rem' }}>
                        Missing: <strong>{result.discrepancy} bags</strong> — This mismatch has been anchored on the blockchain and reported for field verification.
                      </div>
                      <BlockchainBadge hash={result.block_hash}/>
                    </>
                  ) : (
                    <div style={{ textAlign:'center' }}>
                      <CheckCircle size={40} color="var(--g600)" style={{ margin:'0 auto 1rem' }}/>
                      <div style={{ fontWeight:700, color:'var(--g700)', fontSize:'1.1rem' }}>Declaration Accepted</div>
                      <p style={{ color:'var(--muted)', fontSize:'.9rem', margin:'.5rem 0 1rem' }}>Your declared stock matches verified sales records.</p>
                      <BlockchainBadge hash={result.block_hash}/>
                    </div>
                  )}
                  <button className="btn btn-secondary btn-full" style={{ marginTop:'1rem' }} onClick={()=>setResult(null)}>Submit Another Declaration</button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h3 style={{ marginBottom:'.5rem' }}>Season-End Stock Declaration</h3>
                  <p style={{ color:'var(--muted)', fontSize:'.88rem', marginBottom:'1.5rem' }}>
                    Declare remaining (leftover + damaged) bags. The system will compare against verified POS sales. Any mismatch triggers a fraud flag.
                  </p>
                  <div style={{ background:'var(--g50)', borderRadius:'var(--r)', padding:'1rem', marginBottom:'1.5rem', fontSize:'.88rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.4rem' }}>
                      <span>Allotted:</span><strong>{retailer.allotted_quantity} bags</strong>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.4rem' }}>
                      <span>Verified Sold:</span><strong>{totalSold} bags</strong>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', color:'var(--g700)', fontWeight:700 }}>
                      <span>System Expected Remaining:</span><strong>{retailer.allotted_quantity - totalSold} bags</strong>
                    </div>
                  </div>
                  <form onSubmit={handleDeclare}>
                    <div className="form-group">
                      <label className="form-label">Actual Stock in Hand (bags)</label>
                      <input type="number" className="form-input" placeholder="Enter your count" min={0}
                        value={form.declared_stock} onChange={e=>setForm({declared_stock:e.target.value})} required/>
                      <div className="form-hint">🎯 Demo: Enter <strong>5</strong> to trigger fraud flag (expected is {retailer.allotted_quantity - totalSold})</div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Photo Evidence (Required in Production)</label>
                      <div style={{ border:'2px dashed var(--border)', borderRadius:'var(--r)', padding:'1.5rem', textAlign:'center', cursor:'pointer', background:'#fafafa' }}>
                        <Camera size={24} style={{ color:'var(--muted)', margin:'0 auto .5rem' }}/>
                        <div style={{ fontSize:'.85rem', color:'var(--muted)' }}>Click to upload photos of damaged/leftover stock</div>
                        <div style={{ fontSize:'.75rem', color:'var(--subtle)', marginTop:'.25rem' }}>(Mock placeholder — production would upload to secure storage)</div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Geo-Tag</label>
                      <input className="form-input" value="📍 28.6139°N, 77.2090°E (Auto-captured)" readOnly style={{ color:'var(--muted)', background:'#f9fafb' }}/>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                      {loading?<><span className="spinner spinner-white"/>&nbsp;Submitting…</>:'Submit Declaration'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==='disputes' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            <div className="card">
              <div className="card-header"><h3>Raise a Dispute</h3></div>
              <div className="card-body">
                <form onSubmit={handleDispute}>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-input" placeholder="e.g. Incorrect stock allotment" value={dispute.subject} onChange={e=>setDispute(d=>({...d,subject:e.target.value}))} required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={4} placeholder="Describe the issue in detail..." value={dispute.description} onChange={e=>setDispute(d=>({...d,description:e.target.value}))} required style={{ resize:'vertical' }}/>
                  </div>
                  <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                    <MessageSquare size={16}/> Submit Dispute
                  </button>
                </form>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom:'1rem' }}>My Disputes</h3>
              {disputes.map(d=>(
                <div key={d.id} className="card" style={{ marginBottom:'1rem' }}>
                  <div className="card-body">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.5rem' }}>
                      <strong style={{ fontSize:'.95rem' }}>{d.subject}</strong>
                      <span className={`badge ${d.status==='RESOLVED'?'badge-success':d.status==='UNDER_REVIEW'?'badge-warning':'badge-neutral'}`}>{d.status}</span>
                    </div>
                    <p style={{ fontSize:'.85rem', color:'var(--muted)', marginBottom: d.admin_note?'.5rem':0 }}>{d.description}</p>
                    {d.admin_note && <div style={{ background:'var(--blue-light)', padding:'.5rem .75rem', borderRadius:'var(--r-sm)', fontSize:'.82rem', color:'#1e40af' }}>Admin: {d.admin_note}</div>}
                  </div>
                </div>
              ))}
              {disputes.length===0 && <div style={{ color:'var(--muted)', fontSize:'.9rem' }}>No disputes filed</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
