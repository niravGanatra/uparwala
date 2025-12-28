import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Store,
    LogOut,
    Menu,
    X,
    UserCheck,
    Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const ManagerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Manager only has access to vendor management
    const menuGroups = [
        {
            title: 'Overview',
            items: [
                { path: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
            ]
        },
        {
            title: 'Vendor Management',
            items: [
                { path: '/manager/vendors', icon: Store, label: 'All Vendors' },
                { path: '/manager/vendor-applications', icon: UserCheck, label: 'Applications' },
            ]
        },
    ];

    const isActiveLink = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Top Bar */}
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-slate-700 rounded-lg"
                    >
                        {sidebarOpen ? <X /> : <Menu />}
                    </button>
                    <h1 className="text-xl font-bold">Manager Panel</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300">
                        {user?.username || 'Manager'}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-white hover:bg-slate-700"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <motion.div
                    initial={{ width: sidebarOpen ? 250 : 0 }}
                    animate={{ width: sidebarOpen ? 250 : 0 }}
                    className="bg-slate-800 text-white min-h-screen overflow-hidden"
                    style={{ flexShrink: 0 }}
                >
                    <nav className="p-4">
                        {menuGroups.map((group, index) => (
                            <div key={index} className="mb-6">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                                    {group.title}
                                </h3>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActiveLink(item.path)
                                                        ? 'bg-orange-600 text-white'
                                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span className="text-sm">{item.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </motion.div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ManagerLayout;
