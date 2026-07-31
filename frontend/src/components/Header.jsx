import { Leaf, LogOut, Shield, User, Store, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleIcon = { admin: <Shield size={14} />, retailer: <Store size={14} />, farmer: <User size={14} /> };
const roleColor = { admin: '#dc2626', retailer: '#2563eb', farmer: '#16a34a' };

export default function Header() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const handleLogout = () => { logout(); nav('/'); };

    return (
        <header className="header">
            <div className="header-brand">
                <div className="header-brand-icon"><Leaf size={20} color="white" /></div>
                <span className="header-brand-name">DAP Portal</span>
            </div>
            <nav className="header-nav">
                <Link to="/public" className="btn btn-ghost btn-sm"><Globe size={15} /> Public View</Link>
                <Link to="/audit" className="btn btn-ghost btn-sm"><Shield size={15} /> Blockchain Audit</Link>
            </nav>
            <div className="header-user">
                {user ? (
                    <>
                        <div className="user-badge" style={{ color: roleColor[user.role] }}>
                            {roleIcon[user.role]} {user.username}
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}><LogOut size={15} /> Logout</button>
                    </>
                ) : (
                    <Link to="/" className="btn btn-primary btn-sm">Login</Link>
                )}
            </div>
        </header>
    );
}