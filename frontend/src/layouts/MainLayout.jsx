import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, UserCircle, Package, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import api from '../services/api';

const MainLayout = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [categories, setCategories] = useState([]);
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            console.log('All categories:', response.data);
            // Only show parent categories that have show_in_menu = true (or undefined for old data)
            const filtered = response.data.filter(cat => {
                const isParent = !cat.parent;
                const showInMenu = cat.show_in_menu !== false; // true or undefined = show
                return isParent && showInMenu;
            });
            console.log('Filtered categories for menu:', filtered);
            setCategories(filtered);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
                        Uparwala
                    </Link>


                    <nav className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-sm font-medium hover:text-orange-600 transition-colors">Home</Link>
                        <Link to="/products" className="text-sm font-medium hover:text-orange-600 transition-colors">All Products</Link>

                        {/* All Categories with show_in_menu = true */}
                        {categories.map(category => (
                            <Link
                                key={category.id}
                                to={`/category/${category.slug}`}
                                className="text-sm font-medium hover:text-orange-600 transition-colors"
                            >
                                {category.name}
                            </Link>
                        ))}

                        {user && user.is_vendor && (
                            <Link to="/vendor/dashboard" className="text-sm font-medium hover:text-orange-600 transition-colors">Dashboard</Link>
                        )}
                    </nav>


                    <div className="flex items-center space-x-4">
                        <Link to="/wishlist">
                            <Button variant="ghost" size="icon" title="Wishlist">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </Link>

                        <Link to="/cart">
                            <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* User Menu */}
                        <div className="relative">
                            {user ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="relative"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <>
                                                {/* Backdrop */}
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setShowUserMenu(false)}
                                                />

                                                {/* Dropdown Menu */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 overflow-hidden"
                                                >
                                                    <div className="px-4 py-3 border-b bg-slate-50">
                                                        <p className="text-sm font-medium text-slate-900">{user.username}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>

                                                    <div className="py-1">
                                                        <Link
                                                            to="/orders"
                                                            className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                                            onClick={() => setShowUserMenu(false)}
                                                        >
                                                            <Package className="h-4 w-4 mr-3" />
                                                            My Orders
                                                        </Link>

                                                        {user.is_vendor && (
                                                            <Link
                                                                to="/vendor/dashboard"
                                                                className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                                                onClick={() => setShowUserMenu(false)}
                                                            >
                                                                <UserCircle className="h-4 w-4 mr-3" />
                                                                Vendor Dashboard
                                                            </Link>
                                                        )}

                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <LogOut className="h-4 w-4 mr-3" />
                                                            Sign Out
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <Link to="/login">
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t bg-slate-50 py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2025 Uparwala. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
