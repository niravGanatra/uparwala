import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import './AdminLayout.css';
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
    FileText,
    UserCheck,
    FolderTree,
    Receipt,
    Columns
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

    // Group menu items for better organization
    const menuGroups = [
        {
            title: 'Overview',
            items: [
                { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            ]
        },
        {
            title: 'Management',
            items: [
                { path: '/admin/users', icon: Users, label: 'Users' },
                { path: '/admin/products', icon: Package, label: 'Products' },
                { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
                { path: '/admin/tax-slabs', icon: Receipt, label: 'Tax Slabs' },
                { path: '/admin/product-moderation', icon: CheckCircle, label: 'Moderation' },
                { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
            ]
        },
        {
            title: 'Vendors',
            items: [
                { path: '/admin/vendors', icon: Store, label: 'All Vendors' },
                { path: '/admin/vendor-approvals', icon: UserCheck, label: 'Approvals' },
                { path: '/admin/payout-requests', icon: DollarSign, label: 'Payouts' },
                { path: '/admin/commission-settings', icon: Percent, label: 'Commission' },
            ]
        },
        {
            title: 'Content',
            items: [
                { path: '/admin/homepage', icon: LayoutDashboard, label: 'Homepage' },
                { path: '/admin/cms-pages', icon: FileText, label: 'CMS Pages' },
            ]
        },
        {
            title: 'Settings',
            items: [
                { path: '/admin/settings', icon: Settings, label: 'Settings' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: sidebarOpen ? 280 : 80
                }}
                className={`bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white min-h-screen z-50 transition-all duration-300 shadow-xl
                    fixed md:static
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Header/Logo */}
                <div className="p-6 border-b border-slate-700/50">
                    {sidebarOpen ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                                    Uparwala
                                </h1>
                                <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors md:hidden"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-slate-800 rounded-lg mx-auto flex transition-colors hidden md:flex"
                        >
                            <Menu className="h-5 w-5 text-orange-500" />
                        </button>
                    )}
                </div>

                {/* Sidebar Content Container */}
                <div className="flex flex-col h-[calc(100vh-88px)]">
                    {/* Navigation */}
                    <nav className="sidebar-nav flex-1 p-4 space-y-6 overflow-y-auto">
                        {menuGroups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                {sidebarOpen && (
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                                        {group.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => {
                                                    if (window.innerWidth < 768) {
                                                        setSidebarOpen(false);
                                                    }
                                                }}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                                                    }`}
                                            >
                                                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'}`} />
                                                {sidebarOpen && (
                                                    <span className="font-medium text-sm">{item.label}</span>
                                                )}
                                                {isActive && sidebarOpen && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* User Profile & Logout - Always Visible */}
                    <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
                        {sidebarOpen ? (
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-800/50">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                                        <p className="text-xs text-slate-400">Administrator</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-200"
                                >
                                    <LogOut className="h-5 w-5 flex-shrink-0" />
                                    <span className="font-medium text-sm">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 flex flex-col items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 w-full md:w-auto">
                {/* Top Bar */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="ml-12 md:ml-0">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Admin Panel
                            </h2>
                            <p className="text-sm text-slate-500">Welcome back, {user?.username}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-orange-50"
                            >
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
