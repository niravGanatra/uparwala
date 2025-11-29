import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Store,
    Settings,
    LogOut,
    Menu,
    X,
    DollarSign,
    CheckCircle,
    Percent,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/moderation', icon: CheckCircle, label: 'Moderation' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/admin/vendors', icon: Store, label: 'Vendors' },
        { path: '/admin/payouts', icon: DollarSign, label: 'Payouts' },
        { path: '/admin/commission', icon: Percent, label: 'Commission' },
        { path: '/admin/cms-pages', icon: FileText, label: 'CMS Pages' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 256 : 80 }}
                className="bg-slate-900 text-white fixed h-full z-50 transition-all duration-300"
            >
                <div className="p-4 flex items-center justify-between border-b border-slate-800">
                    {sidebarOpen && (
                        <h1 className="text-xl font-bold text-orange-500">Uparwala Admin</h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-slate-800 rounded-lg"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-orange-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full transition-colors"
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Top Bar */}
                <header className="bg-white border-b sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
                            <p className="text-sm text-slate-500">Welcome back, {user?.username}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-sm text-slate-600 hover:text-orange-600">
                                View Store
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
