import { useState, useEffect } from 'react';
import { X, Fingerprint } from 'lucide-react';
export default function OTPModal({ transactionId, onVerify, onClose, loading }) {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(120);
  useEffect(() => { const t = setInterval(() => setCountdown(c => c > 0 ? c-1 : 0), 1000); return () => clearInterval(t); }, []);
  const mins = String(Math.floor(countdown/60)).padStart(2,'0');
  const secs = String(countdown%60).padStart(2,'0');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <div className="modal-title">Aadhaar OTP Verification</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{ textAlign:'center', padding:'1rem 0' }}>
          <Fingerprint size={48} color="var(--g600)" style={{ margin:'0 auto .75rem' }}/>
          <p style={{ color:'var(--muted)', marginBottom:'1.5rem', fontSize:'.9rem' }}>
            OTP sent to your registered mobile. Expires in{' '}
            <span style={{ color: countdown < 30 ? 'var(--red)' : 'var(--g700)', fontWeight:700 }}>{mins}:{secs}</span>
          </p>
          <input className="form-input otp-input" maxLength={6} placeholder="______"
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
            autoFocus/>
          <div style={{ fontSize:'.78rem', color:'var(--muted)', marginTop:'.5rem' }}>
            🎯 Demo OTP: <strong style={{ color:'var(--g700)' }}>123456</strong>
          </div>
        </div>
        <button className="btn btn-primary btn-full" style={{ marginTop:'1rem' }}
          onClick={() => onVerify(otp)} disabled={otp.length < 6 || loading || countdown === 0}>
          {loading ? <><span className="spinner spinner-white"/>&nbsp;Verifying…</> : 'Confirm Purchase'}
        </button>
      </div>
    </div>
  );
}
