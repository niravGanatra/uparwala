import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Package, ShoppingCart, Store, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalVendors: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Updated to match backend endpoints
            const [users, products, orders] = await Promise.all([
                api.get('/users/admin/stats/users/'),
                api.get('/users/admin/stats/products/'),
                api.get('/users/admin/stats/orders/')
            ]);

            setStats({
                totalUsers: users.data.total || 0,
                totalProducts: products.data.total || 0,
                totalOrders: orders.data.total || 0,
                totalVendors: users.data.vendors || 0,
                totalRevenue: orders.data.revenue || 0,
                pendingOrders: orders.data.pending || 0
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Total Vendors',
            value: stats.totalVendors,
            icon: Store,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: TrendingUp,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    if (loading) {
        return <div className="text-center py-12">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
                <p className="text-slate-600">Monitor your marketplace performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600 mb-1">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-slate-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                            <Icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">Recent orders will appear here</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">Top selling products will appear here</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
