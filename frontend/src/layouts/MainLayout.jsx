import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, UserCircle, Package, Heart, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import api from '../services/api';
import Footer from '../components/Footer';

const MainLayout = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [categories, setCategories] = useState([]);
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide navbar on auth pages (login, register)
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

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
            // Sort by menu_order (lower numbers first)
            const sorted = filtered.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
            console.log('Filtered and sorted categories for menu:', sorted);
            setCategories(sorted);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col">
            {!isAuthPage && (
                <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <Link
                            to="/"
                            className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
                        >
                            Uparwala
                        </Link>


                        <nav className="hidden md:flex items-center space-x-4">
                            <Link to="/products" className="text-sm font-medium hover:text-orange-600 transition-colors whitespace-nowrap">All Products</Link>

                            {/* All Categories with show_in_menu = true */}
                            {categories.map(category => (
                                <Link
                                    key={category.id}
                                    to={`/category/${category.slug}`}
                                    className="text-sm font-medium hover:text-orange-600 transition-colors whitespace-nowrap"
                                >
                                    {category.name}
                                </Link>
                            ))}


                        </nav>


                        <div className="flex items-center space-x-4">
                            {user && (
                                <Link to="/wishlist">
                                    <Button variant="ghost" size="icon" title="Wishlist">
                                        <Heart className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}

                            {user && (
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
                            )}

                            {/* User Menu */}
                            <div className="relative">
                                {user ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="relative min-h-[44px] min-w-[44px]"
                                            aria-label="User menu"
                                        >
                                            <User className="h-5 w-5" />
                                        </Button>

                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <>
                                                    {/* Backdrop */}
                                                    <div
                                                        className="fixed inset-0 bg-black/50 z-40 md:bg-transparent"
                                                        onClick={() => setShowUserMenu(false)}
                                                    />

                                                    {/* Mobile: Full-screen modal, Desktop: Dropdown */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 20 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="fixed inset-x-0 bottom-0 md:absolute md:inset-auto md:right-0 md:left-auto md:top-full md:mt-2 md:w-80 md:min-w-[320px] bg-white md:rounded-xl shadow-2xl z-50 md:border-2 md:border-slate-200 rounded-t-3xl md:rounded-t-xl max-h-[80vh] md:max-h-none overflow-y-auto"
                                                    >
                                                        {/* Mobile: Close button at top */}
                                                        <div className="md:hidden sticky top-0 bg-white z-10 flex justify-center py-3 border-b border-slate-200">
                                                            <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                                                        </div>

                                                        {/* User Info Header */}
                                                        <div className="px-6 py-5 md:py-4 border-b-2 border-slate-100 bg-gradient-to-r from-orange-50 to-slate-50">
                                                            <p className="text-lg md:text-base font-bold md:font-semibold text-slate-900 truncate">{user.username}</p>
                                                            <p className="text-base md:text-sm text-slate-600 truncate mt-1">{user.email}</p>
                                                        </div>

                                                        {/* Menu Items */}
                                                        <div className="py-3 md:py-2">
                                                            <Link
                                                                to="/orders"
                                                                className="flex items-center px-6 py-4 md:py-3 text-lg md:text-base text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors min-h-[56px] md:min-h-[48px] active:bg-orange-100"
                                                                onClick={() => setShowUserMenu(false)}
                                                            >
                                                                <Package className="h-6 w-6 md:h-5 md:w-5 mr-4 md:mr-3 flex-shrink-0" />
                                                                <span className="font-semibold md:font-medium">My Orders</span>
                                                            </Link>

                                                            {(user.is_staff || user.is_superuser) && (
                                                                <Link
                                                                    to="/admin/dashboard"
                                                                    className="flex items-center px-6 py-4 md:py-3 text-lg md:text-base text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors min-h-[56px] md:min-h-[48px] active:bg-orange-100"
                                                                    onClick={() => setShowUserMenu(false)}
                                                                >
                                                                    <LayoutDashboard className="h-6 w-6 md:h-5 md:w-5 mr-4 md:mr-3 flex-shrink-0" />
                                                                    <span className="font-semibold md:font-medium">Admin Dashboard</span>
                                                                </Link>
                                                            )}

                                                            {user.is_vendor && (
                                                                <Link
                                                                    to="/vendor/dashboard"
                                                                    className="flex items-center px-6 py-4 md:py-3 text-lg md:text-base text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors min-h-[56px] md:min-h-[48px] active:bg-orange-100"
                                                                    onClick={() => setShowUserMenu(false)}
                                                                >
                                                                    <UserCircle className="h-6 w-6 md:h-5 md:w-5 mr-4 md:mr-3 flex-shrink-0" />
                                                                    <span className="font-semibold md:font-medium">Vendor Dashboard</span>
                                                                </Link>
                                                            )}

                                                            <button
                                                                onClick={handleLogout}
                                                                className="w-full flex items-center px-6 py-4 md:py-3 text-lg md:text-base font-bold md:font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors min-h-[56px] md:min-h-[48px] active:bg-red-100 border-t-2 border-slate-100 mt-2"
                                                            >
                                                                <LogOut className="h-6 w-6 md:h-5 md:w-5 mr-4 md:mr-3 flex-shrink-0" />
                                                                <span>Sign Out</span>
                                                            </button>
                                                        </div>

                                                        {/* Mobile: Safe area padding at bottom */}
                                                        <div className="md:hidden h-8"></div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <Link to="/login">
                                        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                                            Login
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setShowMobileMenu(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            {/* Mobile Navigation Menu */}
                            <AnimatePresence>
                                {showMobileMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 bg-black/50 z-50 md:hidden"
                                            onClick={() => setShowMobileMenu(false)}
                                        />
                                        <motion.div
                                            initial={{ x: '100%' }}
                                            animate={{ x: 0 }}
                                            exit={{ x: '100%' }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="fixed inset-y-0 right-0 w-[280px] bg-white shadow-2xl z-50 md:hidden flex flex-col"
                                        >
                                            <div className="p-4 border-b flex items-center justify-between">
                                                <span className="font-bold text-lg">Menu</span>
                                                <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </Button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto py-4">
                                                <nav className="flex flex-col space-y-1">
                                                    <Link
                                                        to="/"
                                                        className="px-6 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
                                                        onClick={() => setShowMobileMenu(false)}
                                                    >
                                                        Home
                                                    </Link>
                                                    <Link
                                                        to="/products"
                                                        className="px-6 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
                                                        onClick={() => setShowMobileMenu(false)}
                                                    >
                                                        All Products
                                                    </Link>

                                                    <div className="my-2 border-t border-slate-100 mx-6"></div>
                                                    <div className="px-6 py-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                                        Categories
                                                    </div>

                                                    {categories.map(category => (
                                                        <Link
                                                            key={category.id}
                                                            to={`/category/${category.slug}`}
                                                            className="px-6 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
                                                            onClick={() => setShowMobileMenu(false)}
                                                        >
                                                            {category.name}
                                                        </Link>
                                                    ))}

                                                    {user && user.is_vendor && (
                                                        <>
                                                            <div className="my-2 border-t border-slate-100 mx-6"></div>
                                                            <Link
                                                                to="/vendor/dashboard"
                                                                className="px-6 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
                                                                onClick={() => setShowMobileMenu(false)}
                                                            >
                                                                Vendor Dashboard
                                                            </Link>
                                                        </>
                                                    )}
                                                </nav>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
            )}

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
