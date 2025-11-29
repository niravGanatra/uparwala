import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireVendor = false, requireAdmin = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireVendor && !user.is_vendor) {
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && !user.is_staff && !user.is_superuser) {
        return <Navigate to="/" replace />;
    }

    return children;
};
