import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const VendorAnalyticsDashboard = () => {
    const [salesMetrics, setSalesMetrics] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueChart, setRevenueChart] = useState([]);
    const [orderStats, setOrderStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [metricsRes, productsRes, revenueRes, statsRes] = await Promise.all([
                api.get('/analytics/vendor/sales/'),
                api.get('/analytics/vendor/top-products/'),
                api.get('/analytics/vendor/revenue-chart/'),
                api.get('/analytics/vendor/order-stats/')
            ]);

            setSalesMetrics(metricsRes.data);
            setTopProducts(productsRes.data.products || []);
            setRevenueChart(revenueRes.data.chart_data || []);
            setOrderStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">Loading analytics...</p>
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
                    {salesMetrics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Total Revenue</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                ₹{(salesMetrics.total_revenue || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <DollarSign className="h-12 w-12 text-green-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Total Orders</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {salesMetrics.total_orders || 0}
                                            </p>
                                        </div>
                                        <ShoppingCart className="h-12 w-12 text-blue-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Products Sold</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {salesMetrics.total_products_sold || 0}
                                            </p>
                                        </div>
                                        <Package className="h-12 w-12 text-purple-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Avg Order Value</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                ₹{(salesMetrics.average_order_value || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <TrendingUp className="h-12 w-12 text-orange-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueChart.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenueChart}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            name="Revenue (₹)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center py-12 text-slate-500">No revenue data yet</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topProducts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-900">Product</th>
                                                <th className="pb-3 font-semibold text-slate-900">Sold</th>
                                                <th className="pb-3 font-semibold text-slate-900">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((product, index) => (
                                                <tr key={index} className="border-b last:border-0">
                                                    <td className="py-4">
                                                        <div className="font-medium text-slate-900">{product.name}</div>
                                                        <div className="text-sm text-slate-500">SKU: {product.sku || 'N/A'}</div>
                                                    </td>
                                                    <td className="py-4 font-semibold">{product.quantity_sold}</td>
                                                    <td className="py-4 font-semibold text-green-600">
                                                        ₹{(product.total_revenue || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center py-12 text-slate-500">No sales data yet</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Statistics */}
                    {orderStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        { status: 'Pending', count: orderStats.pending || 0 },
                                        { status: 'Processing', count: orderStats.processing || 0 },
                                        { status: 'Shipped', count: orderStats.shipped || 0 },
                                        { status: 'Delivered', count: orderStats.delivered || 0 },
                                        { status: 'Cancelled', count: orderStats.cancelled || 0 },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="status" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorAnalyticsDashboard;
