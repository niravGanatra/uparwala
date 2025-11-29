import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Filter } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        payment_status: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/orders/orders/?${params.toString()}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            paid: 'text-green-600',
            pending: 'text-yellow-600',
            cod: 'text-orange-600',
            failed: 'text-red-600'
        };
        return colors[status] || 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5" />
                        <h2 className="font-semibold">Filters</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={filters.payment_status}
                            onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="cod">Cash on Delivery</option>
                            <option value="failed">Failed</option>
                        </select>

                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            placeholder="Start Date"
                        />

                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            placeholder="End Date"
                        />
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
                        <p className="text-gray-600 mb-6">
                            {Object.values(filters).some(v => v)
                                ? 'Try adjusting your filters'
                                : 'Start shopping to see your orders here!'
                            }
                        </p>
                        <Link
                            to="/products"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                                            <p className="text-sm text-gray-600">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                ₹{order.total_amount}
                                            </div>
                                            <div className={`text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                                {order.payment_status === 'paid' ? 'Paid' :
                                                    order.payment_status === 'cod' ? 'Cash on Delivery' :
                                                        order.payment_status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        {order.tracking_number && (
                                            <span className="text-sm text-gray-600">
                                                Tracking: {order.tracking_number}
                                            </span>
                                        )}
                                    </div>

                                    {/* Order Items */}
                                    <div className="border-t pt-4 mb-4">
                                        <div className="space-y-2">
                                            {order.items?.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{item.product.name}</div>
                                                        <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                                                    </div>
                                                    <div className="font-semibold">₹{item.price}</div>
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <div className="text-sm text-gray-600">
                                                    +{order.items.length - 3} more items
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
                                        >
                                            View Details
                                        </Link>
                                        {order.status === 'delivered' && (
                                            <Link
                                                to={`/orders/${order.id}/return`}
                                                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                                            >
                                                Request Return
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
