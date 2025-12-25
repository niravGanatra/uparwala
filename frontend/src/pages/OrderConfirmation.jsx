import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, MapPin, CreditCard, Home, Calendar, ChevronRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import SpiritualLoader from '../components/SpiritualLoader';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const isGuest = location.state?.isGuest || false;
    const guestEmail = location.state?.guestEmail || '';

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Convert to account state
    const [showCreateAccount, setShowCreateAccount] = useState(isGuest);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (order) {
            // Trigger confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [order]);

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
        return <SpiritualLoader message="Loading your order..." />;
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">We couldn't locate the order details you requested.</p>
                    <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const getEstimatedDelivery = () => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setCreatingAccount(true);

        try {
            await api.post('/users/convert-guest/', {
                email: guestEmail,
                password: password,
                order_id: orderId
            });

            toast.success('Account created successfully! You can now login.');
            setAccountCreated(true);
            setShowCreateAccount(false);
        } catch (error) {
            console.error('Failed to create account:', error);
            toast.error(error.response?.data?.error || 'Failed to create account');
        } finally {
            setCreatingAccount(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 lg:py-12">
            <div className="max-w-6xl mx-auto px-4 lg:px-8">
                {/* Success Header */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </motion.div>
                        <div className="absolute inset-0 rounded-full border-4 border-white shadow-sm"></div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                    <p className="text-lg text-gray-600 mb-4 max-w-xl mx-auto">
                        Thank you for shopping with us. We've sent a confirmation email to your registered address.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                        <span>Order #</span>
                        <span className="text-gray-900 font-bold">ORD-{String(order.id).padStart(6, '0')}</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Order Timeline */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tracking</h2>
                            <div className="relative px-2">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block"></div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 relative z-10">
                                    {[
                                        { icon: CheckCircle, label: 'Placed', active: true, date: new Date(order.created_at).toLocaleDateString() },
                                        { icon: Package, label: 'Processing', active: true, date: 'In Progress' },
                                        { icon: Truck, label: 'Shipped', active: false, date: 'Pending' },
                                        { icon: Home, label: 'Delivered', active: false, date: 'Est. 5 Days' }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${step.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <div className="md:text-center">
                                                <p className={`font-semibold ${step.active ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                                                <p className="text-xs text-gray-400">{step.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Estimated Delivery</h4>
                                    <p className="text-gray-600 mt-1 text-sm">
                                        Your order is expected to arrive by <span className="font-semibold text-blue-700">{getEstimatedDelivery()}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Items ({order.items?.length || 0})</h2>
                            <div className="space-y-6">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-start pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {/* Ideally display image if available in order API, fallback to icon */}
                                            <Package className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg">{item.product_name || item.product?.name || 'Product'}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                <span>Qty: {item.quantity}</span>
                                                <span>•</span>
                                                <span>Price: ₹{Number(item.price || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Address & Payment */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Price Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>₹{Number(order.shipping_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹{Number(order.tax_amount || 0).toFixed(2)}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Discount</span>
                                        <span>-₹{order.discount_amount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900 mt-2">
                                    <span>Total Paid</span>
                                    <span>₹{Number(order.total_amount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                Delivery Details
                            </h2>
                            {order.shipping_address_data && (
                                <div className="text-gray-600 text-sm space-y-2">
                                    <p className="font-bold text-gray-900 text-base">{order.shipping_address_data.full_name}</p>
                                    <p>{order.shipping_address_data.address_line1}</p>
                                    {order.shipping_address_data.address_line2 && <p>{order.shipping_address_data.address_line2}</p>}
                                    <p>{order.shipping_address_data.city}, {order.shipping_address_data.state} - {order.shipping_address_data.pincode}</p>
                                    <p className="pt-2 flex items-center gap-2">
                                        <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Phone</span>
                                        {order.shipping_address_data.phone}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                Payment Method
                            </h2>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">
                                    {order.payment_method === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                                </span>
                                <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                    order.payment_status === 'cod' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Convert to Account Section (Guest only) */}
                        {isGuest && showCreateAccount && !accountCreated && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <UserPlus className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Create an Account</h2>
                                        <p className="text-sm text-gray-500">Track your orders and faster checkout next time</p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateAccount} className="space-y-4">
                                    <div className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                                        <span className="font-medium">Email:</span> {guestEmail}
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create password (min 6 characters)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <input
                                        type="password"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={creatingAccount}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {creatingAccount ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-4 h-4" />
                                                    Create Account
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateAccount(false)}
                                            className="px-4 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            Skip
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {accountCreated && (
                            <div className="bg-green-50 rounded-2xl border border-green-100 p-6 text-center">
                                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                <h3 className="font-bold text-green-800">Account Created!</h3>
                                <p className="text-sm text-green-600">You can now <Link to="/login" className="underline font-medium">login</Link> to view your orders</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Link
                                to={isGuest && !accountCreated ? "/" : "/orders"}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-center font-medium transition-colors shadow-lg shadow-gray-200"
                            >
                                {isGuest && !accountCreated ? 'Continue Shopping' : 'View Order History'}
                            </Link>
                            <Link
                                to="/"
                                className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-center font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
