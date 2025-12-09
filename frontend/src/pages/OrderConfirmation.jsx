import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, MapPin, CreditCard, Download, Home } from 'lucide-react';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await api.get(`/orders/orders/${orderId}/`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                    <Link to="/" className="text-blue-600 hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const getEstimatedDelivery = () => {
        const date = new Date();
        date.setDate(date.getDate() + 5); // 5 days from now
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    try {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Success Header */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-white rounded-lg shadow-md p-8 mb-6 text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
                        <p className="text-gray-600 mb-4">
                            Thank you for your order. We've received your order and will process it soon.
                        </p>
                        <div className="inline-block bg-blue-50 px-6 py-3 rounded-lg">
                            <p className="text-sm text-gray-600">Order Number</p>
                            <p className="text-2xl font-bold text-blue-600">ORD-{String(order.id).padStart(6, '0')}</p>
                        </div>
                    </motion.div>

                    {/* Order Timeline */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-6">Order Status</h2>
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0"></div>
                            <div className="absolute top-5 left-0 h-1 bg-blue-600 z-0" style={{ width: '25%' }}></div>

                            {[
                                { icon: CheckCircle, label: 'Order Placed', active: true },
                                { icon: Package, label: 'Processing', active: false },
                                { icon: Truck, label: 'Shipped', active: false },
                                { icon: CheckCircle, label: 'Delivered', active: false }
                            ].map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <p className={`text-xs mt-2 ${step.active ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                        {step.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Estimated Delivery:</strong> {getEstimatedDelivery()}
                            </p>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
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
                        <h2 className="text-xl font-bold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.product?.name || 'Product'}</h3>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</p>
                                        <p className="text-sm text-gray-600">₹{Number(item.price || 0).toFixed(2)} each</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Price Details</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal</span>
                                <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Shipping</span>
                                <span>₹{Number(order.shipping_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Tax (GST)</span>
                                <span>₹{Number(order.tax_amount || 0).toFixed(2)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total Paid</span>
                                <span className="text-blue-600">₹{Number(order.total_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Information
                        </h2>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span>Payment Method</span>
                                <span className="font-medium">
                                    {order.payment_method === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment Status</span>
                                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' :
                                    order.payment_status === 'cod' ? 'text-orange-600' :
                                        'text-yellow-600'
                                    }`}>
                                    {order.payment_status === 'paid' ? 'Paid' :
                                        order.payment_status === 'cod' ? 'Cash on Delivery' :
                                            'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/orders"
                            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
                        >
                            View All Orders
                        </Link>
                        <Link
                            to="/"
                            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 text-center font-medium flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('OrderConfirmation render error:', error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Order</h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <Link to="/" className="text-blue-600 hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }
};

export default OrderConfirmation;
