import { useState, useEffect } from 'react';
import { Search, MapPin, Package, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import StockBar from '../components/StockBar';
import { api } from '../api';

export default function PublicPortal() {
  const [pin, setPin] = useState('');
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetch_ = async (p='') => {
    setLoading(true);
    try {
      const data = await api(`/retailers${p ? `?pin_code=${p}` : ''}`);
      setRetailers(data.retailers || []);
      setLastUpdate(new Date());
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch_(); const t = setInterval(() => fetch_(pin), 5000); return () => clearInterval(t); }, []);

  const handleSearch = e => { e.preventDefault(); fetch_(pin); };

  return (
    <div className="page">
      <Header/>
      <div style={{ background:'linear-gradient(135deg, var(--g800), var(--g600))', color:'white', padding:'3rem 1.5rem', textAlign:'center' }}>
        <h1 style={{ fontSize:'2rem', fontWeight:800, marginBottom:'.5rem' }}>🌾 Live DAP Stock Near You</h1>
        <p style={{ opacity:.85, marginBottom:'2rem', fontSize:'1rem' }}>Real-time availability from government-verified retailer POS transactions</p>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:'.75rem', maxWidth:480, margin:'0 auto' }}>
          <input className="form-input" placeholder="Enter PIN Code (e.g. 226001)" value={pin}
            onChange={e=>setPin(e.target.value)} style={{ flex:1, borderColor:'rgba(255,255,255,.3)', background:'rgba(255,255,255,.15)', color:'white' }}/>
          <button className="btn" type="submit" style={{ background:'white', color:'var(--g800)', fontWeight:600 }}>
            <Search size={16}/> Search
          </button>
        </form>
      </div>

      <main className="main">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            <div className="live-dot"/>
            <span style={{ fontSize:'.85rem', color:'var(--muted)' }}>
              Live • {retailers.length} retailers {pin ? `in PIN ${pin}` : 'across all areas'}
            </span>
          </div>
          {lastUpdate && <span style={{ fontSize:'.78rem', color:'var(--muted)' }}>Updated {lastUpdate.toLocaleTimeString()}</span>}
        </div>

        {loading && retailers.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem' }}><div className="spinner spinner-lg" style={{ margin:'0 auto' }}/></div>
        ) : (
          <div className="dash-grid">
            {retailers.map(r => (
              <div key={r.id} className="card animate-in">
                <div className="card-body">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.75rem' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'.2rem' }}>{r.name}</div>
                      <div style={{ fontSize:'.82rem', color:'var(--muted)', display:'flex', alignItems:'center', gap:'.3rem' }}>
                        <MapPin size={12}/> {r.location}
                      </div>
                    </div>
                    <span className={`badge ${r.current_stock === 0 ? 'badge-danger' : r.current_stock < 20 ? 'badge-warning' : 'badge-success'}`}>
                      {r.current_stock === 0 ? 'Out of Stock' : r.current_stock < 20 ? 'Low Stock' : 'Available'}
                    </span>
                  </div>
                  <div style={{ margin:'1rem 0' }}>
                    <StockBar current={r.current_stock} allotted={r.allotted_quantity}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem', color:'var(--muted)', paddingTop:'.75rem', borderTop:'1px solid var(--border)' }}>
                    <span>📍 PIN: {r.pin_code}</span>
                    <span style={{ fontWeight:700, color:'var(--g700)', fontSize:'1rem' }}>
                      <Package size={14} style={{ verticalAlign:'middle', marginRight:'.2rem' }}/>{r.current_stock} bags
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {retailers.length === 0 && !loading && (
          <div style={{ textAlign:'center', padding:'4rem', color:'var(--muted)' }}>
            <Package size={48} style={{ margin:'0 auto 1rem', opacity:.3 }}/>
            <p>No retailers found. Try a different PIN code.</p>
          </div>
        )}
        <div style={{ marginTop:'2rem', padding:'1rem', background:'var(--g50)', border:'1px solid var(--g200)', borderRadius:'var(--r)', fontSize:'.82rem', color:'var(--g800)', textAlign:'center' }}>
          ℹ️ Stock numbers reflect only <strong>OTP-verified government POS transactions</strong>. No unverified or black-market sales are included. Data refreshes every 5 seconds.
        </div>
      </main>
    </div>
  );
}
