import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../services/auth';
import SpiritualLoader from '../components/SpiritualLoader';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Always try to fetch user. Cookie will be sent if it exists.
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                // Expected if not logged in
                // console.log('User not logged in');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Handle BFCache (Back-Forward Cache) restoration
        // This fixes the issue where clicking "Back" after logout shows the user as logged in
        const handlePageShow = (event) => {
            if (event.persisted) {
                // Page was restored from cache, force re-check
                setLoading(true);
                initAuth();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    const login = async (username, password) => {
        // Backend key exchange (sets cookies)
        const data = await apiLogin(username, password);
        // data might contain tokens, but we ignore them and fetch user profile
        // forcing a profile fetch to verify the cookie was actually set
        const userData = await getCurrentUser();
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {loading ? <SpiritualLoader fullScreen={true} message="Initializing..." /> : children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
