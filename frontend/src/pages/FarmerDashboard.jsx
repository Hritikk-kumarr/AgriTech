import { useState, useEffect } from 'react';
import { Sprout, ShoppingBag, ClipboardList, CheckCircle, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import OTPModal from '../components/OTPModal';
import BlockchainBadge from '../components/BlockchainBadge';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('book');
  const [step, setStep] = useState(1);
  const [aadhaar, setAadhaar] = useState('');
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [myTxs, setMyTxs] = useState([]);
  const [form, setForm] = useState({ retailer_id:'', bags:1 });
  const [txId, setTxId] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/retailers').then(d=>setRetailers(d.retailers||[])).catch(()=>{});
    if (user?.profileId) {
      api('/farmers/me').then(d=>setMyProfile(d)).catch(()=>{});
      api('/farmers/me/transactions').then(d=>setMyTxs(d.transactions||[])).catch(()=>{});
    }
  }, []);

  const handleLookup = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = await api('/farmers/lookup', { method:'POST', body: JSON.stringify({ aadhaar }) });
      setFarmerInfo(data); setStep(2);
    } catch(err) { setError(err.message); }
    setLoading(false);
  };

  const handleBook = async () => {
    setLoading(true); setError('');
    try {
      const data = await api('/transactions/book', { method:'POST', body: JSON.stringify({ retailer_id: parseInt(form.retailer_id), requested_bags: parseInt(form.bags) }) });
      setTxId(data.transaction_id); setShowOTP(true);
    } catch(err) { setError(err.message); }
    setLoading(false);
  };

  const handleVerify = async (otp) => {
    setLoading(true); setError('');
    try {
      const data = await api('/transactions/verify', { method:'POST', body: JSON.stringify({ transaction_id: txId, otp }) });
      setShowOTP(false); setSuccess(data); setStep(4);
      api('/farmers/me/transactions').then(d=>setMyTxs(d.transactions||[])).catch(()=>{});
    } catch(err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="page">
      <Header/>
      <main className="main">
        <div className="page-title">🌾 Farmer Portal</div>
        <div className="page-sub">Book DAP fertilizer slots with Aadhaar-verified eligibility</div>

        <div className="tabs">
          {[['book','📋 Book Slot'],['history','🧾 My Purchases'],['profile','🌱 Land Record']].map(([k,v])=>(
            <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</button>
          ))}
        </div>

        {tab==='book' && (
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            {/* Steps indicator */}
            <div style={{ display:'flex', gap:'.5rem', marginBottom:'2rem' }}>
              {['Identity','Eligibility','Book Slot','Confirmed'].map((s,i)=>(
                <div key={s} style={{ flex:1, textAlign:'center' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', margin:'0 auto .4rem', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', fontWeight:700,
                    background: step>i+1?'var(--g600)': step===i+1?'var(--g700)':'#e5e7eb',
                    color: step>=i+1?'white':'var(--muted)', transition:'all .3s' }}>{step>i+1?'✓':i+1}</div>
                  <div style={{ fontSize:'.72rem', color: step===i+1?'var(--g700)':'var(--muted)', fontWeight: step===i+1?600:400 }}>{s}</div>
                </div>
              ))}
            </div>

            {step===1 && (
              <div className="card animate-in">
                <div className="card-body">
                  <h3 style={{ marginBottom:'.5rem' }}>Aadhaar Verification</h3>
                  <p style={{ color:'var(--muted)', fontSize:'.9rem', marginBottom:'1.5rem' }}>Enter your Aadhaar to fetch land records and check eligibility. Your Aadhaar is never stored — only a secure hash is used.</p>
                  <form onSubmit={handleLookup}>
                    <div className="form-group">
                      <label className="form-label">Aadhaar Number</label>
                      <input className="form-input" placeholder="Enter 12-digit Aadhaar" value={aadhaar}
                        onChange={e=>setAadhaar(e.target.value.replace(/\D/g,''))} maxLength={12} required/>
                      <div className="form-hint">Demo: <strong>123412341234</strong> or <strong>000122223333</strong></div>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading||aadhaar.length<12}>
                      {loading?<><span className="spinner spinner-white"/>&nbsp;Verifying…</>:<>Verify Identity <ChevronRight size={16}/></>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {step===2 && farmerInfo && (
              <div className="card animate-in">
                <div className="card-body">
                  <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1.25rem', color:'var(--g700)' }}>
                    <CheckCircle size={20}/><strong>Identity Verified</strong>
                  </div>
                  <div style={{ background:'var(--g50)', borderRadius:'var(--r)', padding:'1rem', marginBottom:'1.5rem' }}>
                    <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'.75rem' }}>🧑‍🌾 {farmerInfo.farmer.name}</div>
                    {[['Khasra/Survey ID', farmerInfo.farmer.khasra_id],['Land Size', `${farmerInfo.farmer.land_size_acres} Acres`],['Eligible Bags (1 per acre)', farmerInfo.eligible_bags]].map(([l,v])=>(
                      <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'.9rem', padding:'.35rem 0', borderBottom:'1px dashed var(--border)' }}>
                        <span style={{ color:'var(--muted)' }}>{l}</span>
                        <strong style={{ color: l.includes('Eligible')?'var(--g700)':undefined }}>{v}</strong>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary btn-full" onClick={()=>setStep(3)}>
                    Proceed to Booking <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            )}

            {step===3 && (
              <div className="card animate-in">
                <div className="card-body">
                  <h3 style={{ marginBottom:'1.5rem' }}>Book DAP Slot</h3>
                  <div className="form-group">
                    <label className="form-label">Select Retailer</label>
                    <select className="form-input" value={form.retailer_id} onChange={e=>setForm(f=>({...f,retailer_id:e.target.value}))}>
                      <option value="">— Choose nearby retailer —</option>
                      {retailers.map(r=>(
                        <option key={r.id} value={r.id}>{r.name} • {r.current_stock} bags • {r.pin_code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bags to Book (max {farmerInfo?.eligible_bags||'?'})</label>
                    <input type="number" className="form-input" min={1} max={farmerInfo?.eligible_bags||5}
                      value={form.bags} onChange={e=>setForm(f=>({...f,bags:e.target.value}))}/>
                    <div className="form-hint">Based on your land size of {farmerInfo?.farmer?.land_size_acres} acres</div>
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button className="btn btn-primary btn-full" onClick={handleBook} disabled={!form.retailer_id||loading}>
                    {loading?<><span className="spinner spinner-white"/>&nbsp;Processing…</>:<><ShoppingBag size={16}/> Confirm & Get OTP</>}
                  </button>
                </div>
              </div>
            )}

            {step===4 && success && (
              <div className="card animate-in" style={{ textAlign:'center' }}>
                <div className="card-body">
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                    <CheckCircle size={32} color="var(--g600)"/>
                  </div>
                  <h3 style={{ color:'var(--g700)', marginBottom:'.5rem' }}>Purchase Confirmed!</h3>
                  <p style={{ color:'var(--muted)', fontSize:'.9rem', marginBottom:'1.5rem' }}>Your transaction has been verified and anchored on the blockchain.</p>
                  <div style={{ background:'var(--g50)', borderRadius:'var(--r)', padding:'1rem', textAlign:'left', marginBottom:'1.5rem' }}>
                    <div style={{ fontSize:'.8rem', fontWeight:600, color:'var(--muted)', marginBottom:'.5rem', textTransform:'uppercase' }}>Blockchain Receipt</div>
                    <BlockchainBadge hash={success.block_hash}/>
                  </div>
                  <button className="btn btn-secondary btn-full" onClick={()=>{setStep(1);setFarmerInfo(null);setAadhaar('');setSuccess(null);setError('');}}>
                    Book Another Slot
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==='history' && (
          <div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Retailer</th><th>Bags</th><th>Status</th><th>Blockchain</th></tr></thead>
                <tbody>
                  {myTxs.length===0 ? (
                    <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--muted)', padding:'2rem' }}>No purchases yet</td></tr>
                  ) : myTxs.map(t=>(
                    <tr key={t.id}>
                      <td style={{ fontSize:'.82rem' }}>{new Date(t.timestamp).toLocaleDateString('en-IN')}</td>
                      <td>{t.retailer_name}</td>
                      <td><strong>{t.requested_bags}</strong></td>
                      <td><span className={`badge ${t.status==='VERIFIED'?'badge-success':'badge-warning'}`}>{t.status}</span></td>
                      <td><BlockchainBadge hash={t.block_hash}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='profile' && myProfile && (
          <div style={{ maxWidth:480 }}>
            <div className="card animate-in">
              <div className="card-body">
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>🧑‍🌾</div>
                  <div><div style={{ fontWeight:700, fontSize:'1.1rem' }}>{myProfile.farmer?.name}</div><div style={{ fontSize:'.82rem', color:'var(--muted)' }}>Registered Farmer</div></div>
                </div>
                {[['Khasra/Survey ID', myProfile.farmer?.khasra_id],['Land Size', `${myProfile.farmer?.land_size_acres} Acres`],['Mobile (last 4)', `****${myProfile.farmer?.mobile_last4}`],['Eligible Bags', myProfile.eligible_bags],].map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'.75rem 0', borderBottom:'1px solid var(--border)', fontSize:'.9rem' }}>
                    <span style={{ color:'var(--muted)' }}>{l}</span><strong>{v}</strong>
                  </div>
                ))}
                <div style={{ marginTop:'1rem', padding:'.75rem', background:'var(--g50)', borderRadius:'var(--r-sm)', fontSize:'.8rem', color:'var(--g800)' }}>
                  🔐 Your Aadhaar number is never stored. Only a one-way cryptographic hash is used for identity verification.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {showOTP && <OTPModal transactionId={txId} onVerify={handleVerify} onClose={()=>setShowOTP(false)} loading={loading}/>}
    </div>
  );
}
