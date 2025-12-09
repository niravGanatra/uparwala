import { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, Store, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [topSellers, setTopSellers] = useState([]);
    const [categoryGrowth, setCategoryGrowth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [metricsRes, sellersRes, categoryRes] = await Promise.all([
                api.get('/analytics/admin/platform-metrics/'),
                api.get('/analytics/admin/top-sellers/', { params: { limit: 10 } }),
                api.get('/analytics/admin/category-growth/')
            ]);

            setMetrics(metricsRes.data);
            setTopSellers(sellersRes.data);
            setCategoryGrowth(categoryRes.data);
        } catch (error) {
            console.error('Failed to fetch admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                {/* Platform Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-8 h-8 opacity-80" />
                        </div>
                        <p className="text-sm opacity-90">Total Revenue</p>
                        <p className="text-2xl font-bold">
                            ₹{(metrics?.total_revenue / 1000000).toFixed(2)}M
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingBag className="w-8 h-8 opacity-80" />
                        </div>
                        <p className="text-sm opacity-90">Total Orders</p>
                        <p className="text-2xl font-bold">{metrics?.total_orders?.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-8 h-8 opacity-80" />
                        </div>
                        <p className="text-sm opacity-90">Total Users</p>
                        <p className="text-2xl font-bold">{metrics?.total_users?.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Store className="w-8 h-8 opacity-80" />
                        </div>
                        <p className="text-sm opacity-90">Active Vendors</p>
                        <p className="text-2xl font-bold">{metrics?.total_vendors}</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 opacity-80" />
                        </div>
                        <p className="text-sm opacity-90">Today's Revenue</p>
                        <p className="text-2xl font-bold">
                            ₹{(metrics?.today_revenue / 1000).toFixed(1)}K
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingBag className="w-8 h-8 opacity-80" />
                        </div>
                        <p className="text-sm opacity-90">Today's Orders</p>
                        <p className="text-2xl font-bold">{metrics?.today_orders}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Sellers */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Award className="w-6 h-6 text-yellow-500" />
                            Top Performing Vendors
                        </h2>
                        <div className="space-y-3">
                            {topSellers.map((seller, index) => (
                                <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                    index === 2 ? 'bg-orange-600' :
                                                        'bg-blue-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{seller.store_name}</p>
                                            <p className="text-sm text-gray-600">{seller.total_orders} orders</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">
                                            ₹{(seller.total_revenue / 1000).toFixed(1)}K
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Growth */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Category Performance</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={categoryGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total_sold" fill="#3B82F6" name="Units Sold" />
                                <Bar dataKey="total_products" fill="#10B981" name="Products" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
