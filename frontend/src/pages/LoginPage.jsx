import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Leaf, User, Store, Shield } from 'lucide-react';

const ROLES = [
    { id: 'farmer', label: 'Farmer', icon: <User size={16} />, hint: 'farmer_ramesh / demo123', path: '/farmer' },
    { id: 'retailer', label: 'Retailer', icon: <Store size={16} />, hint: 'retailer_a or retailer_b / demo123', path: '/retailer' },
    { id: 'admin', label: 'Admin', icon: <Shield size={16} />, hint: 'admin / demo123', path: '/admin' },
];

export default function LoginPage() {
    const { user, login } = useAuth();
    const [role, setRole] = useState('farmer');
    const [form, setRole] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (user) {
        const target = ROLES.find(r => r.id === user.role)?.path || '/public';
        return <Navigate to={target} replace />;
    }

    const handleLogin = async e => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username: form.username, password: form.password }) });
            login(data.token, { role: data.role, profileId: data.profileId, username: data.username });
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    const fillDemo = (username) => setForm({ username, password: 'demo123' });
    const activeRole = ROLES.find(r => r.id === role);

    return (
        <div className="login-page">
            <div className="login-hero">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '3rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Leaf size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>DAP Portal</div>
                            <div style={{ fontSize: '.85rem', opacity: .8 }}>Fair Distribution System</div>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
                        Transparent.<br />Fraud-Free.<br />For Farmers.
                    </h1>
                    <p style={{ opacity: .85, fontSize: '1rem', lineHeight: 1.7, maxWidth: 360 }}>
                        A privacy-first fertilizer distribution portal with blockchain-anchored audit trails. Every transaction is immutable and verifiable.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginTop: '2.5rem' }}>
                        {[
                            '🌾 Real-time stock transparency',
                            '🔐 Aadhaar data never stored in plaintext',
                            '⛓ Blockchain-anchored transactions',
                            '🚨 Automated fraud detection',
                        ].map(f => <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.9rem', opacity: .9 }}>{f}</div>)}
                    </div>
                </div>
            </div>

            <div className="login-formside">
                <div className="login-box animate-in">
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.25rem' }}>Welcome Back</div>
                        <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Sign in to your portal</div>
                    </div>

                    <div className="role-tabs">
                        {ROLES.map(r => (
                            <button key={r.id} className={`role-tab ${role === r.id ? 'active' : ''}`} onClick={() => setRole(r.id)}>
                                {r.icon} {r.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input className="form-input" placeholder={`e.g. ${activeRole.hint.split('/')[0].trim()}`}
                                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder="demo123"
                                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                        </div>
                        {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
                        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                            {loading ? <><span className="spinner spinner-white" />&nbsp;Signing in…</> : `Sign in as ${activeRole.label}`}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--g50)', borderRadius: 'var(--r)', border: '1px solid var(--g200)' }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--g800)', marginBottom: '.6rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Demo Credentials</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                            {[
                                { label: '🌾 Farmer', user: 'farmer_ramesh' },
                                { label: '🏪 Retailer A', user: 'retailer_a' },
                                { label: '🚨 Retailer B', user: 'retailer_b' },
                                { label: '🚨 Retailer B', user: 'retailer_b' },
                                { label: '🛡️ Admin', user: 'admin' },
                            ].map(c => (
                                <button key={c.user} onClick={() => fillDemo(c.user)}
                                    style={{ fontSize: '.78rem', padding: '.3rem .7rem', background: 'white', border: '1px solid var(--g300,#86efac)', borderRadius: '20px', cursor: 'pointer', transition: 'all .15s' }}
                                    onMouseEnter={e => e.target.style.background = 'var(--g100)'}
                                    onMouseLeave={e => e.target.style.background = 'white'}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.5rem' }}>Password for all: <strong>demo123</strong></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
