import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            const response = await api.get(`/orders/orders/${orderId}/tracking/`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order details');
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

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Order not found</h2>
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: CheckCircle },
        { key: 'processing', label: 'Processing', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Orders
                </button>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                            <p className="text-gray-600">
                                Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">₹{order.total_amount}</div>
                            <div className="text-sm text-gray-600">{order.payment_status}</div>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                        <div className="relative">
                            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                                <div
                                    className="h-1 bg-blue-600 transition-all"
                                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                                />
                            </div>
                            <div className="relative flex justify-between">
                                {statusSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = index <= currentStepIndex;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-sm mt-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Status History */}
                    {order.status_history && order.status_history.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Status History</h3>
                            <div className="space-y-2">
                                {order.status_history.map((history, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">
                                            {new Date(history.created_at).toLocaleString()}
                                        </span>
                                        <span className="font-medium">{history.status}</span>
                                        {history.notes && <span className="text-gray-600">- {history.notes}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Delivery Address
                    </h2>
                    {order.shipping_address_data && (
                        <div className="text-gray-700">
                            <p className="font-medium">{order.shipping_address_data.full_name}</p>
                            <p>{order.shipping_address_data.address_line1}</p>
                            {order.shipping_address_data.address_line2 && (
                                <p>{order.shipping_address_data.address_line2}</p>
                            )}
                            <p>
                                {order.shipping_address_data.city}, {order.shipping_address_data.state} - {order.shipping_address_data.pincode}
                            </p>
                            <p className="mt-2">Phone: {order.shipping_address_data.phone}</p>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{item.product.name}</h3>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">₹{item.price} each</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4">Price Details</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>₹{order.shipping_amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (GST)</span>
                            <span>₹{order.tax_amount?.toFixed(2)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{order.discount_amount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-blue-600">₹{order.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
