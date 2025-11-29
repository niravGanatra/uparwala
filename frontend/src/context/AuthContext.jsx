import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userData = await getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        const data = await apiLogin(username, password);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        const userData = await getCurrentUser();
        setUser(userData);
        return userData; // Return user data for redirect logic
    };

    const logout = () => {
        apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
