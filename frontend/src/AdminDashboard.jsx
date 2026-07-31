import { useState, useEffect } from 'react';
import { ShieldAlert, AlertOctagon, BarChart3, TrendingDown, CheckCircle, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import BlockchainBadge from '../components/BlockchainBadge';
import { api } from '../api';

export default function AdminDashboard(){
  const [tab, setTab] = useState('overview');
  const [flags, setFlags] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [txs, setTxs] = useState([]);
  const [prevFlagCount, setPrevFlagCount] = useState(0);
  const [newAlert, setNewAlert] = useState(false);

  const load = async () => {
    try {
      const [f, r, d, s, t] = await Promise.all([
        api('/admin/flags'), api('/admin/stats'), api('/disputes'),
        api('/admin/season-summary'), api('/admin/transactions')
      ]);
      if (f.flags.length > prevFlagCount) setNewAlert(true);
      setPrevFlagCount(f.flags.length);
      setFlags(f.flags||[]); setRetailers(r.retailers||[]);
      setDisputes(d.disputes||[]); setSummary(s.summary);
      setTxs(t.transactions||[]);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { load(); const t = setInterval(load, 3000); return ()=>clearInterval(t); }, []);

  const resolveDispute = async (id, status, note) => {
    try { await api(`/disputes/${id}`, { method:'PATCH', body: JSON.stringify({ status, admin_note: note }) }); load(); }
    catch(e) { alert(e.message); }
  };

  return (
    <div className="page">
      <Header/>
      {newAlert && (
        <div style={{ background:'var(--red)', color:'white', padding:'.75rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', animation:'slideIn .3s ease' }}>
          <span>🚨 <strong>New fraud flag detected!</strong> A retailer declaration has been flagged for discrepancy.</span>
          <button onClick={()=>{ setNewAlert(false); setTab('flags'); }} style={{ background:'rgba(255,255,255,.2)', color:'white', border:'none', padding:'.4rem 1rem', borderRadius:'6px', cursor:'pointer', fontWeight:600 }}>View Alert →</button>
        </div>
      )}
      <main className="main">
        <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2rem' }}>
          <ShieldAlert size={28} color="var(--g700)"/>
          <div>
            <div className="page-title">Agriculture Department Admin</div>
            <div style={{ color:'var(--muted)', fontSize:'.9rem' }}>Real-time monitoring, fraud detection & retailer oversight</div>
          </div>
        </div>

        {summary && (
          <div className="stats-grid">
            {[
              { label:'Total Retailers', value: summary.total_retailers, sub:'registered', color:'var(--g700)' },
              { label:'Total Allotted', value: summary.total_allotted, sub:'bags this season', color:'var(--blue)' },
              { label:'Total Sold (OTP-Verified)', value: summary.total_sold, sub:'bags', color:'var(--g600)' },
              { label:'Active Fraud Flags', value: summary.total_flags, sub:'pending review', color: summary.total_flags>0?'var(--red)':'var(--g600)' },
            ].map(s=>(
              <div key={s.label} className="stat-card" style={{ borderLeft: s.label.includes('Fraud') && s.value>0?'3px solid var(--red)':'3px solid transparent' }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        <div className="tabs">
          {[['flags',`🚨 Fraud Alerts${flags.length>0?` (${flags.length})`:''}`,],['retailers','📊 All Retailers'],['txns','📋 Transactions'],['disputes','⚖️ Disputes']].map(([k,v])=>(
            <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</button>
          ))}
        </div>

        {tab==='flags' && (
          <div>
            {flags.length===0 ? (
              <div className="card" style={{ textAlign:'center', padding:'4rem' }}>
                <CheckCircle size={48} color="var(--g500)" style={{ margin:'0 auto 1rem' }}/>
                <h3 style={{ color:'var(--g700)', marginBottom:'.5rem' }}>All Clear</h3>
                <p style={{ color:'var(--muted)' }}>No retailer discrepancies detected. All declarations match verified POS records.</p>
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', justifyContent:'center', marginTop:'1rem', fontSize:'.82rem', color:'var(--muted)' }}>
                  <div className="live-dot"/> Live monitoring active
                </div>
              </div>
            ) : flags.map(flag=>(
              <div key={flag.id} className="flag-card flag-card-new animate-in">
                <div style={{ position:'absolute', top:0, right:0, background:'var(--red)', color:'white', padding:'.2rem .8rem', fontSize:'.72rem', fontWeight:700, borderRadius:'0 var(--r) 0 var(--r)', letterSpacing:'.5px' }}>⚠ ACTION REQUIRED</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', paddingTop:'.5rem' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'.25rem' }}>{flag.retailer_name}</div>
                    <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>{flag.location} • Flagged {new Date(flag.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'1rem', margin:'1.25rem 0', alignItems:'center' }}>
                  <div style={{ background:'var(--g50)', borderRadius:'var(--r)', padding:'1rem', textAlign:'center' }}>
                    <div style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase', fontWeight:600 }}>System Expected</div>
                    <div style={{ fontSize:'2rem', fontWeight:800, color:'var(--g700)' }}>{flag.expected_stock}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>bags</div>
                  </div>
                  <div style={{ fontSize:'1.5rem', color:'var(--red)', fontWeight:800 }}>≠</div>
                  <div style={{ background:'var(--red-light)', borderRadius:'var(--r)', padding:'1rem', textAlign:'center' }}>
                    <div style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase', fontWeight:600 }}>Retailer Declared</div>
                    <div style={{ fontSize:'2rem', fontWeight:800, color:'var(--red)' }}>{flag.declared_stock}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>bags</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.75rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                    <span className="badge badge-danger">Missing: {flag.discrepancy} bags</span>
                    <BlockchainBadge hash={flag.block_hash}/>
                  </div>
                  <div style={{ display:'flex', gap:'.5rem' }}>
                    <button className="btn btn-danger btn-sm">📋 Schedule Field Audit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='retailers' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Retailer</th><th>Location</th><th>Allotted</th><th>Remaining</th><th>Season</th></tr></thead>
              <tbody>
                {retailers.map((r,i)=>{
                  const pct = r.trust_score;
                  const col = pct>=80?'var(--g600)':pct>=60?'var(--gold)':'var(--red)';
                  return <tr key={r.id}>
                    <td style={{ color:'var(--muted)', fontSize:'.82rem' }}>{i+1}</td>
                    <td><strong>{r.name}</strong></td>
                    <td style={{ color:'var(--muted)', fontSize:'.85rem' }}>{r.location}</td>
                    <td>{r.allotted_quantity}</td>
                    <td><span style={{ fontWeight:600, color: r.current_stock<20?'var(--red)':'var(--text)' }}>{r.current_stock}</span></td>
                    <td><span className="badge badge-info">{r.season}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab==='txns' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Retailer</th><th>Farmer</th><th>Bags</th><th>Status</th><th>Blockchain</th></tr></thead>
              <tbody>
                {txs.map(t=>(
                  <tr key={t.id}>
                    <td style={{ fontSize:'.82rem' }}>{new Date(t.timestamp).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize:'.88rem' }}>{t.retailer_name}</td>
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

        {tab==='disputes' && (
          <div>
            {disputes.map(d=>(
              <div key={d.id} className="card" style={{ marginBottom:'1rem' }}>
                <div className="card-body">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.75rem', flexWrap:'wrap', gap:'.5rem' }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{d.subject}</div>
                      <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>By: {d.username} | {new Date(d.timestamp).toLocaleDateString('en-IN')}</div>
                    </div>
                    <span className={`badge ${d.status==='RESOLVED'?'badge-success':d.status==='UNDER_REVIEW'?'badge-warning':'badge-neutral'}`}>{d.status}</span>
                  </div>
                  <p style={{ fontSize:'.88rem', color:'var(--muted)', marginBottom:'1rem' }}>{d.description}</p>
                  {d.status!=='RESOLVED' && (
                    <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={()=>resolveDispute(d.id,'UNDER_REVIEW','Dispute under review by the Agriculture Department.')}>Mark Under Review</button>
                      <button className="btn btn-primary btn-sm" onClick={()=>resolveDispute(d.id,'RESOLVED','Issue has been reviewed and resolved.')}>Mark Resolved</button>
                    </div>
                  )}
                  {d.admin_note && <div style={{ marginTop:'.75rem', background:'var(--blue-light)', padding:'.5rem .75rem', borderRadius:'var(--r-sm)', fontSize:'.82rem', color:'#1e40af' }}>Admin Note: {d.admin_note}</div>}
                </div>
              </div>
            ))}
            {disputes.length===0 && <div style={{ textAlign:'center', padding:'3rem', color:'var(--muted)' }}>No disputes filed</div>}
          </div>
        )}
      </main>
    </div>
  );
}
