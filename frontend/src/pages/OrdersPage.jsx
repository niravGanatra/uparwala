import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';
import { Package, CheckCircle, Truck, Home, Clock, ChevronRight, RotateCcw, RefreshCw } from 'lucide-react';
import SpiritualLoader from '../components/SpiritualLoader';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/orders/');
                setOrders(response.data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Order status steps for progress bar
    const statusSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

    const getStatusIndex = (status) => {
        const index = statusSteps.indexOf(status);
        return index >= 0 ? index : 0;
    };

    const getProgressPercentage = (status) => {
        if (status === 'CANCELLED' || status === 'FAILED' || status === 'REFUNDED') return 0;
        const index = getStatusIndex(status);
        return ((index + 1) / statusSteps.length) * 100;
    };

    // Check if return/exchange is available (within 7 days of delivery)
    const canReturnOrExchange = (order) => {
        if (order.status !== 'DELIVERED' || !order.delivered_at) return false;

        const deliveredDate = new Date(order.delivered_at);
        const now = new Date();
        const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));

        return daysSinceDelivery <= 7;
    };

    // Check if any item in order is returnable/exchangeable
    const hasReturnableItems = (order) => {
        return order.items?.some(item => item.product?.is_returnable);
    };

    const hasExchangeableItems = (order) => {
        return order.items?.some(item => item.product?.is_exchangeable);
    };

    const getDaysRemaining = (order) => {
        if (!order.delivered_at) return 0;
        const deliveredDate = new Date(order.delivered_at);
        const now = new Date();
        const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
        return Math.max(0, 7 - daysSinceDelivery);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'REFUNDED': return 'bg-purple-100 text-purple-800';
            case 'SHIPPED': return 'bg-blue-100 text-blue-800';
            case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <SpiritualLoader message="Loading your orders..." />;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Order History</h1>
            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card
                            key={order.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/orders/${order.id}`)}
                        >
                            {/* Order Header */}
                            <CardHeader className="bg-gray-50 border-b py-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            Order #{String(order.id).padStart(6, '0')}
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="font-bold text-lg">₹{Number(order.total_amount).toFixed(2)}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6">
                                {/* Progress Bar - Only for non-cancelled orders */}
                                {!['CANCELLED', 'FAILED', 'REFUNDED'].includes(order.status) && (
                                    <div className="mb-6">
                                        {/* Progress Track */}
                                        <div className="relative">
                                            <div className="h-1 bg-gray-200 rounded-full">
                                                <div
                                                    className="h-1 bg-blue-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${getProgressPercentage(order.status)}%` }}
                                                />
                                            </div>

                                            {/* Status Steps */}
                                            <div className="flex justify-between mt-3">
                                                {[
                                                    { status: 'PENDING', icon: Clock, label: 'Placed' },
                                                    { status: 'PROCESSING', icon: Package, label: 'Processing' },
                                                    { status: 'SHIPPED', icon: Truck, label: 'Shipped' },
                                                    { status: 'DELIVERED', icon: Home, label: 'Delivered' }
                                                ].map((step, idx) => {
                                                    const isCompleted = getStatusIndex(order.status) >= idx;
                                                    const isCurrent = order.status === step.status;
                                                    return (
                                                        <div key={step.status} className="flex flex-col items-center">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isCompleted
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 text-gray-400'
                                                                } ${isCurrent ? 'ring-2 ring-blue-300 ring-offset-2' : ''}`}>
                                                                {isCompleted ? (
                                                                    <CheckCircle className="w-4 h-4" />
                                                                ) : (
                                                                    <step.icon className="w-3.5 h-3.5" />
                                                                )}
                                                            </div>
                                                            <span className={`text-xs mt-1 hidden sm:block ${isCompleted ? 'text-blue-600 font-medium' : 'text-gray-400'
                                                                }`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items Preview */}
                                <div className="space-y-3">
                                    {order.items?.slice(0, 2).map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.product?.images && item.product.images.length > 0 ? (
                                                    <img
                                                        src={item.product.images[0].image}
                                                        alt={item.product.name}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Package className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{item.product?.name || 'Product'}</h4>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items?.length > 2 && (
                                        <p className="text-sm text-gray-500 pl-17">
                                            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>

                                {/* Return/Exchange Buttons */}
                                {canReturnOrExchange(order) && (hasReturnableItems(order) || hasExchangeableItems(order)) && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs text-gray-500">
                                                {getDaysRemaining(order)} days left for returns
                                            </span>
                                            <div className="flex gap-2 ml-auto" onClick={e => e.stopPropagation()}>
                                                {hasReturnableItems(order) && (
                                                    <Link
                                                        to={`/return-request?orderId=${order.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        Return
                                                    </Link>
                                                )}
                                                {hasExchangeableItems(order) && (
                                                    <Link
                                                        to={`/return-request?orderId=${order.id}&type=exchange`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                        Exchange
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
