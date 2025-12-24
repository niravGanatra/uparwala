import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    TrendingUp, Users, ShoppingCart, DollarSign,
    Activity, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
    Search
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className={`p-2 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                <Icon size={20} />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
            </div>
        </div>
    </div>
);

const AnalyticsDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchMetrics();
    }, [days]);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/analytics/dashboard/?days=${days}`);
            setMetrics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!metrics) return <div>Failed to load data</div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
                    <p className="text-gray-500">Track your store's performance and health.</p>
                </div>
                <div className="flex space-x-2">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 3 Months</option>
                    </select>
                </div>
            </div>

            {/* Sales & Finance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue (GMV)"
                    value={`₹${metrics.sales.gmv}`}
                    subtext={`${metrics.sales.total_orders} Orders`}
                    icon={DollarSign}
                    trend="up"
                />
                <StatCard
                    title="Net Revenue"
                    value={`₹${metrics.sales.net_revenue}`}
                    subtext={`Avg Order: ₹${Number(metrics.sales.aov).toFixed(0)}`}
                    icon={TrendingUp}
                    trend="up"
                />
                <StatCard
                    title="Return Rate"
                    value={`${metrics.sales.return_rate}%`}
                    subtext="Of total orders"
                    icon={ArrowDownRight}
                    trend="down"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${metrics.funnel.conversion_rate}%`}
                    subtext={`${metrics.funnel.total_sessions} Sessions`}
                    icon={Activity}
                    trend="up"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funnel Health */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Funnel Health</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Activity className="text-indigo-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Add to Cart Rate</p>
                                    <p className="text-sm text-gray-500">Sessions with cart activity</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold">{metrics.funnel.add_to_cart_rate}%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <ShoppingCart className="text-orange-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Cart Abandonment</p>
                                    <p className="text-sm text-gray-500">Carts without purchase</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-orange-600">{metrics.funnel.cart_abandonment}%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Users className="text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Repeat Customer Rate</p>
                                    <p className="text-sm text-gray-500">Returning buyers</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{metrics.customer.repeat_rate}%</span>
                        </div>
                    </div>
                </div>

                {/* Technical Health */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Health</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-gray-500 text-sm">Avg Load Time</h3>
                            <p className="text-2xl font-bold mt-2">{metrics.technical.avg_load_time_ms}ms</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-gray-500 text-sm">Zero-Result Searches</h3>
                            <p className="text-2xl font-bold mt-2">{metrics.technical.zero_result_rate}%</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Errors</h3>
                        <div className="space-y-3">
                            {metrics.technical.recent_errors.length > 0 ? (
                                metrics.technical.recent_errors.map((error, idx) => (
                                    <div key={idx} className="flex items-start space-x-3 text-sm p-3 bg-red-50 text-red-700 rounded-md">
                                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block">{error.code || 'Unknown Error'}</span>
                                            <span className="break-all">{error.url}</span>
                                            <span className="block text-xs text-red-500 mt-1">
                                                {new Date(error.time).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No recent errors logged.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
