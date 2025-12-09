import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, ShoppingCart, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const VendorDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [orderStats, setOrderStats] = useState([]);
    const [period, setPeriod] = useState('month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [metricsRes, productsRes, revenueRes, statsRes] = await Promise.all([
                api.get('/analytics/vendor/sales/', { params: { period } }),
                api.get('/analytics/vendor/top-products/', { params: { limit: 10 } }),
                api.get('/analytics/vendor/revenue-chart/', { params: { period } }),
                api.get('/analytics/vendor/order-stats/')
            ]);

            setMetrics(metricsRes.data);
            setTopProducts(productsRes.data);
            setRevenueData(revenueRes.data);
            setOrderStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
                    <div className="flex gap-2">
                        {['today', 'week', 'month', 'year'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-lg capitalize ${period === p
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ₹{metrics?.total_revenue?.toLocaleString()}
                                </p>
                            </div>
                            <DollarSign className="w-10 h-10 text-blue-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Orders</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {metrics?.total_orders}
                                </p>
                            </div>
                            <ShoppingCart className="w-10 h-10 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Items Sold</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {metrics?.items_sold}
                                </p>
                            </div>
                            <Package className="w-10 h-10 text-purple-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Avg Order Value</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    ₹{metrics?.avg_order_value?.toFixed(0)}
                                </p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-orange-600 opacity-20" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6" />
                            Revenue Over Time
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Order Status</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStats}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {orderStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Product</th>
                                    <th className="px-4 py-3 text-right">Units Sold</th>
                                    <th className="px-4 py-3 text-right">Revenue</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {topProducts.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-500">#{index + 1}</span>
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {product.total_sold}
                                        </td>
                                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                            ₹{product.total_revenue?.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            ₹{product.price}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
