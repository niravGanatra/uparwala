import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Wallet, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const VendorLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="h-16 flex items-center justify-center border-b border-slate-800">
                    <span className="text-xl font-bold text-orange-500">Uparwala Vendor</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/vendor/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/vendor/products" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <Package className="h-5 w-5" />
                        <span>Products</span>
                    </Link>
                    <Link to="/vendor/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <ShoppingBag className="h-5 w-5" />
                        <span>Orders</span>
                    </Link>
                    <Link to="/vendor/wallet" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <Wallet className="h-5 w-5" />
                        <span>Wallet</span>
                    </Link>
                    <Link to="/vendor/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-center space-x-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6">
                    <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-slate-600">Welcome, Vendor</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div >
    );
};

export default VendorLayout;
