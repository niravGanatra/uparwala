import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, Package, DollarSign, ShoppingCart, Users, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorAnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            // Use existing vendor stats endpoint instead of non-existent analytics endpoints
            const response = await api.get('/vendors/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                    <Card className="border-2 border-slate-200">
                        <CardContent className="p-12 text-center">
                            <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                Unable to Load Analytics
                            </h3>
                            <p className="text-slate-500">
                                Please try again later or contact support.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
                        <p className="text-sm md:text-base text-slate-600">Track your sales performance and insights</p>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-2 border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {formatCurrency(stats.revenue?.total)}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatCurrency(stats.revenue?.pending)} pending
                                        </p>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-green-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Orders</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {stats.orders?.total || 0}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {stats.orders?.pending || 0} pending
                                        </p>
                                    </div>
                                    <ShoppingCart className="h-12 w-12 text-blue-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Products</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {stats.products?.total || 0}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {stats.products?.active || 0} active
                                        </p>
                                    </div>
                                    <Package className="h-12 w-12 text-purple-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Customers</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {stats.customers?.total || 0}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Total unique customers
                                        </p>
                                    </div>
                                    <Users className="h-12 w-12 text-orange-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Wallet Balance Card */}
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-4 rounded-xl bg-green-200">
                                        <DollarSign className="h-7 w-7 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Wallet Balance</p>
                                        <h3 className="text-3xl font-bold text-green-900">
                                            {formatCurrency(stats.wallet?.balance)}
                                        </h3>
                                    </div>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <CardTitle>Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-slate-600">
                                <TrendingUp className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg font-medium mb-2">Your Store Analytics</p>
                                <p className="text-sm text-slate-500">
                                    View detailed performance metrics from the Dashboard and Orders pages.
                                    Advanced analytics with charts coming soon!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VendorAnalyticsDashboard;
