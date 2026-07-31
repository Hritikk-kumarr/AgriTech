import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PublicPortal from './pages/PublicPortal';
import FarmerDashboard from './pages/FarmerDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BlockchainAuditPage from './pages/BlockchainAuditPage';

const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (role && user.role !== role) {
        if (user.role === 'farmer') return <Navigate to="/farmer" replace />;
        if (user.role === 'retailer') return <Navigate to="/retailer" replace />;
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }
    return children;
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/public" element={<PublicPortal />} />
                    <Route path="/audit" element={<BlockchainAuditPage />} />
                    <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
                    <Route path="/retailer" element={<ProtectedRoute role="retailer"><RetailerDashboard /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}