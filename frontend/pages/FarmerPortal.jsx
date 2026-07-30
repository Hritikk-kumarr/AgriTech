import React, { useState } from 'react';
import { UserCheck, Sprout, ShoppingBag, Fingerprint } from 'lucide-react';

export default function FarmerPortal() {
  const [aadhaar, setAadhaar] = useState('');
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [retailerId, setRetailerId] = useState('2'); // Default to Retailer B (trap)
  const [bagsToBook, setBagsToBook] = useState(1);
  const [bookingState, setBookingState] = useState('IDLE'); // IDLE, OTP_SENT, VERIFIED
  const [transactionId, setTransactionId] = useState(null);
  const [otp, setOtp] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/farmers/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFarmerData(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (bagsToBook > farmerData.eligible_bags) {
      setError('Cannot book more than eligible bags.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/transactions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          retailer_id: parseInt(retailerId), 
          farmer_id: farmerData.farmer.id, 
          requested_bags: bagsToBook 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTransactionId(data.transaction_id);
      setBookingState('OTP_SENT');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/transactions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookingState('VERIFIED');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Farmer Booking Portal</h2>
      
      {!farmerData ? (
        <div className="card">
          <h3><UserCheck size={20} className="text-primary" /> Identity Verification</h3>
          <p>Please enter your 12-digit Aadhaar number to verify land records and eligibility.</p>
          <form onSubmit={handleLookup}>
            <div className="form-group">
              <label className="form-label">Aadhaar Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 000122223333" 
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                required
              />
            </div>
            {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Identity'}
            </button>
          </form>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Demo Tip: Try 000122223333 or 123412341234
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
            <div>
              <h3>Welcome, {farmerData.farmer.name}</h3>
              <p style={{ margin: 0 }}>Mobile: {farmerData.farmer.mobile}</p>
            </div>
            <button onClick={() => setFarmerData(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Not you?</button>
          </div>

          <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sprout className="text-primary" size={18}/> Land Record Details</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Total Land:</span>
              <strong>{farmerData.farmer.land_size_acres} Acres</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Khasra ID:</span>
              <strong>{farmerData.farmer.khasra_id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary-dark)' }}>
              <span>Eligible DAP Bags:</span>
              <strong style={{ fontSize: '1.2rem' }}>{farmerData.eligible_bags}</strong>
            </div>
          </div>

          {bookingState === 'IDLE' && (
            <div>
              <div className="form-group">
                <label className="form-label">Select Retailer (ID)</label>
                <input type="number" className="form-input" value={retailerId} onChange={(e) => setRetailerId(e.target.value)} />
                <small style={{ color: 'var(--color-text-muted)' }}>Demo: Retailer ID 2 is "Retailer B"</small>
              </div>
              <div className="form-group">
                <label className="form-label">Bags to Book</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="1" 
                  max={farmerData.eligible_bags}
                  value={bagsToBook} 
                  onChange={(e) => setBagsToBook(e.target.value)} 
                />
              </div>
              {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}
              <button onClick={handleBook} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <ShoppingBag size={18}/> {loading ? 'Processing...' : 'Book Slot'}
              </button>
            </div>
          )}

          {bookingState === 'OTP_SENT' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <Fingerprint size={48} className="text-primary" style={{ margin: '0 auto 1rem' }} />
              <h4>Aadhaar OTP Verification</h4>
              <p>An OTP has been sent to your registered mobile ending in ****{farmerData.farmer.mobile.slice(-4)}</p>
              
              <div className="form-group" style={{ maxWidth: '200px', margin: '1rem auto' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter 6-digit OTP" 
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <small style={{ color: 'var(--color-text-muted)' }}>Demo OTP: 123456</small>
              </div>
              {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}
              <button onClick={handleVerify} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                Verify & Confirm Purchase
              </button>
            </div>
          )}

          {bookingState === 'VERIFIED' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShoppingBag size={32} />
              </div>
              <h3 style={{ color: 'var(--color-success)' }}>Purchase Confirmed!</h3>
              <p>Your Aadhaar verification was successful. The retailer's stock has been updated automatically.</p>
              <button onClick={() => {setBookingState('IDLE'); setOtp(''); setTransactionId(null);}} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                Book Another Slot
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
