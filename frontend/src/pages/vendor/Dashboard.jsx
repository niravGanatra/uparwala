import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign, ShoppingCart, Package, Users, AlertCircle, CheckCircle, XCircle, Clock, Wallet, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [vendorStatus, setVendorStatus] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendorStatus();
        fetchVendorStats();
    }, []);

    const fetchVendorStatus = async () => {
        try {
            const response = await api.get('/users/vendor/status/');
            setVendorStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch vendor status:', error);
        }
    };

    const fetchVendorStats = async () => {
        try {
            const response = await api.get('/vendors/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch vendor stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const statsCards = stats ? [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.revenue.total),
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100',
            subtitle: `${formatCurrency(stats.revenue.pending)} pending`
        },
        {
            title: 'Total Orders',
            value: stats.orders.total.toString(),
            icon: ShoppingCart,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            subtitle: `${stats.orders.pending} pending`
        },
        {
            title: 'Products',
            value: stats.products.total.toString(),
            icon: Package,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            subtitle: `${stats.products.active} active`
        },
        {
            title: 'Customers',
            value: stats.customers.total.toString(),
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            subtitle: 'Total unique'
        },
    ] : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const renderStatusBanner = () => {
        if (loading || !vendorStatus) return null;

        const status = vendorStatus.vendor_status;

        if (status === 'pending') {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg"
                >
                    <div className="flex items-start">
                        <Clock className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                Application Under Review
                            </h3>
                            <p className="text-yellow-700 mb-2">
                                Your vendor application is currently being reviewed by our admin team.
                                You will be notified once your application has been processed.
                            </p>
                            <p className="text-sm text-yellow-600">
                                Applied on: {new Date(vendorStatus.application_date).toLocaleDateString()}
                            </p>
                            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                                <p className="text-sm text-yellow-800 font-medium">
                                    ⚠️ You cannot add or sell products until your application is approved.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        if (status === 'rejected') {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-lg"
                >
                    <div className="flex items-start">
                        <XCircle className="h-6 w-6 text-red-600 mt-1 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                Application Rejected
                            </h3>
                            <p className="text-red-700 mb-3">
                                Unfortunately, your vendor application has been rejected.
                            </p>
                            {vendorStatus.rejection_reason && (
                                <div className="bg-red-100 p-4 rounded-lg mb-4">
                                    <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
                                    <p className="text-sm text-red-700">{vendorStatus.rejection_reason}</p>
                                </div>
                            )}
                            <p className="text-sm text-red-600">
                                Please contact support if you have questions or wish to reapply.
                            </p>
                        </div>
                    </div>
                </motion.div>
            );
        }

        if (status === 'approved') {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg"
                >
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                            <h3 className="text-sm font-semibold text-green-800">
                                Vendor Account Active
                            </h3>
                            <p className="text-xs text-green-700">
                                Approved on: {new Date(vendorStatus.approval_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    const renderInactiveBanner = () => {
        if (loading || !user) return null;

        // Check if user account is inactive
        if (user.is_active === false) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg"
                >
                    <div className="flex items-start">
                        <XCircle className="h-6 w-6 text-red-600 mt-1 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                Account Deactivated
                            </h3>
                            <p className="text-red-700 mb-3">
                                Your vendor account has been deactivated by the administrator.
                            </p>
                            <div className="bg-red-100 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-red-800 mb-2">⚠️ Important:</p>
                                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                                    <li>Your products are not visible on the website</li>
                                    <li>Customers cannot purchase from your store</li>
                                    <li>You cannot add or edit products</li>
                                    <li>Your store is hidden from search results</li>
                                </ul>
                            </div>
                            <p className="text-sm text-red-600 font-medium">
                                Please contact support to reactivate your account.
                            </p>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Status Banner */}
                    {renderStatusBanner()}

                    {/* Inactive Account Banner */}
                    {renderInactiveBanner()}

                    {/* Stats Grid - Only show if approved */}
                    {vendorStatus?.vendor_status === 'approved' && stats && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-full overflow-hidden">
                                {statsCards.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="min-w-0 max-w-full overflow-hidden"
                                    >
                                        <Card className="border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <CardContent className="p-5 md:p-6">
                                                <div className="flex items-center space-x-3 md:space-x-4">
                                                    <motion.div
                                                        className={`p-3 md:p-4 rounded-xl flex-shrink-0 ${stat.bg}`}
                                                        whileHover={{ rotate: 360 }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <stat.icon className={`h-6 w-6 md:h-7 md:w-7 ${stat.color}`} />
                                                    </motion.div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs md:text-sm font-medium text-slate-600">{stat.title}</p>
                                                        <motion.h3
                                                            className="text-xl md:text-2xl font-bold truncate"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                                                        >
                                                            {stat.value}
                                                        </motion.h3>
                                                        {stat.subtitle && (
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{stat.subtitle}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Wallet Balance Card */}
                            <motion.div variants={itemVariants}>
                                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-sm">
                                    <CardContent className="p-5 md:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 md:space-x-4">
                                                <div className="p-3 md:p-4 rounded-xl bg-orange-200 flex-shrink-0">
                                                    <Wallet className="h-6 w-6 md:h-7 md:w-7 text-orange-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm md:text-base font-medium text-orange-800">Wallet Balance</p>
                                                    <h3 className="text-2xl md:text-3xl font-bold text-orange-900 truncate">
                                                        {formatCurrency(stats.wallet.balance)}
                                                    </h3>
                                                </div>
                                            </div>
                                            <TrendingUp className="h-7 w-7 md:h-8 md:w-8 text-orange-400 flex-shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Recent Orders Placeholder */}
                            <motion.div variants={itemVariants}>
                                <Card className="border-2 border-slate-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg md:text-xl">Recent Orders</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-slate-600">
                                            {stats.orders.total === 0 ? (
                                                <p>No orders yet. Start selling to see orders here!</p>
                                            ) : (
                                                <p>View all orders in the Orders section.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    )}

                    {/* Pending/Rejected State - Show helpful message */}
                    {vendorStatus?.vendor_status !== 'approved' && (
                        <motion.div variants={itemVariants}>
                            <Card className="border-2 border-slate-200">
                                <CardContent className="p-8 md:p-12 text-center">
                                    <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2">
                                        Dashboard Access Restricted
                                    </h3>
                                    <p className="text-sm md:text-base text-slate-500">
                                        Full dashboard features will be available once your vendor application is approved.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default VendorDashboard;
