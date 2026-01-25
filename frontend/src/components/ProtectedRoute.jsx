import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SpiritualLoader from './SpiritualLoader';

export const ProtectedRoute = ({
    children,
    requireVendor = false,
    requireAdmin = false,
    requireManager = false,
    requireProvider = false
}) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <SpiritualLoader fullScreen={true} message="Authenticating..." />;
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

    if (requireManager && !user.is_manager && !user.is_superuser) {
        return <Navigate to="/" replace />;
    }

    if (requireProvider && !user.is_provider) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};
