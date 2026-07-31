import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('dap_user')); } catch { return null; } });
    const login = (token, userData) => { localStorage.setItem('dap_token', token); localStorage.setItem('dap_user', JSON.stringify(userData)); setUser(userData); };
    const logout = () => { localStorage.removeItem('dap_token'); localStorage.removeItem('dap_user'); setUser(null); };
    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
