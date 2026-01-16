import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, CreditCard, Truck, User, Phone, MapPin, Building } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const CheckoutPage = () => {
    const { cart, fetchCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [shippingAddress, setShippingAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India'
    });

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        if (cart && (!cart.items || cart.items.length === 0)) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const handleInputChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const required = ['full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code'];
        for (let field of required) {
            if (!shippingAddress[field]) {
                toast.error(`Please fill in ${field.replace('_', ' ')}`);
                return false;
            }
        }
        // Check if pincode is serviceable
        if (!isServiceable) {
            toast.error('We do not deliver to this location. Please use a different address.');
            return false;
        }
        return true;
    };

    // Serviceability check state
    const [isServiceable, setIsServiceable] = useState(true);
    const [serviceabilityMessage, setServiceabilityMessage] = useState('');
    const [checkingServiceability, setCheckingServiceability] = useState(false);

    // Check serviceability when pincode changes
    useEffect(() => {
        const checkServiceability = async () => {
            const pincode = shippingAddress.postal_code;
            if (!pincode || pincode.length < 6) {
                setIsServiceable(true);
                setServiceabilityMessage('');
                return;
            }

            setCheckingServiceability(true);
            try {
                const response = await api.get(`/orders/serviceability/check/${pincode}/`);
                if (response.data.serviceable) {
                    setIsServiceable(true);
                    setServiceabilityMessage('✅ ' + response.data.message);
                } else {
                    setIsServiceable(false);
                    setServiceabilityMessage('❌ ' + response.data.message);
                }
            } catch (error) {
                console.error('Serviceability check failed:', error);
                setIsServiceable(false);
                setServiceabilityMessage('❌ Unable to verify delivery. Please try again.');
            } finally {
                setCheckingServiceability(false);
            }
        };

        // Debounce the check
        const timer = setTimeout(checkServiceability, 500);
        return () => clearTimeout(timer);
    }, [shippingAddress.postal_code]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // 1. Create the base order first
            const orderResponse = await api.post('/orders/orders/', {
                shipping_address: shippingAddress
            });

            const orderId = orderResponse.data.id;

            if (paymentMethod === 'cod') {
                // If COD, we are done
                toast.success('Order placed successfully!', {
                    duration: 3000,
                    position: 'bottom-right',
                });
                clearCart();
                navigate('/orders');
            } else if (paymentMethod === 'razorpay') {
                // 2. Load Razorpay SDK
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    return;
                }

                // 3. Create Razorpay Order
                const paymentOrderResponse = await api.post('/payments/create-order/', {
                    order_id: orderId,
                    amount: calculateTotal()
                });

                const { razorpay_order_id, amount, currency, key_id, payment_id } = paymentOrderResponse.data;

                // 4. Open Razorpay Modal
                const options = {
                    key: key_id,
                    amount: amount.toString(),
                    currency: currency,
                    name: "Uparwala",
                    description: "Payment for Order #" + orderId,
                    order_id: razorpay_order_id,
                    handler: async function (response) {
                        try {
                            // 5. Verify Payment
                            const verifyResponse = await api.post('/payments/verify/', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: orderId
                            });

                            if (verifyResponse.data.success) {
                                toast.success('Payment successful! Order placed.', {
                                    duration: 3000,
                                    position: 'bottom-right',
                                });
                                clearCart();
                                navigate('/orders');
                            }
                        } catch (error) {
                            console.error('Payment verification failed', error);
                            toast.error('Payment verification failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: shippingAddress.full_name,
                        contact: shippingAddress.phone,
                    },
                    theme: {
                        color: "#ea580c", // Orange-600 to match theme
                    },
                    modal: {
                        ondismiss: function () {
                            toast('Payment cancelled', { icon: '⚠️' });
                        }
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            }

        } catch (error) {
            console.error('Checkout failed:', error);
            const errorMessage = error.response?.data?.error || 'Checkout failed. Please try again.';
            toast.error(errorMessage, {
                duration: 4000,
                position: 'bottom-right',
            });
        } finally {
            // Only set loading false if it was a COD order or if payment initialization failed.
            // For Razorpay, we want to keep loading state or handle it differently while modal is open? 
            // Actually, once modal opens, we can stop loading.
            setLoading(false);
        }
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
            <motion.div
                className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-sm md:text-base text-slate-600 hover:text-orange-600 mb-6 min-h-[44px] transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Cart
                </button>

                <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-6 w-full max-w-full overflow-hidden">
                    {/* Shipping Address Form */}
                    <div className="lg:col-span-2 space-y-6 min-w-0 max-w-full overflow-hidden">
                        <Card className="border-2 border-slate-200 shadow-sm">
                            <CardHeader className="bg-white">
                                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                    <Truck className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                name="full_name"
                                                value={shippingAddress.full_name}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                name="phone"
                                                value={shippingAddress.phone}
                                                onChange={handleInputChange}
                                                placeholder="+91 9876543210"
                                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Address Line 1 <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            name="address_line1"
                                            value={shippingAddress.address_line1}
                                            onChange={handleInputChange}
                                            placeholder="House No., Street Name"
                                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            name="address_line2"
                                            value={shippingAddress.address_line2}
                                            onChange={handleInputChange}
                                            placeholder="Apartment, Suite, etc."
                                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">City <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                name="city"
                                                value={shippingAddress.city}
                                                onChange={handleInputChange}
                                                placeholder="Mumbai"
                                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">State <span className="text-red-500">*</span></label>
                                        <Input
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleInputChange}
                                            placeholder="Maharashtra"
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Pincode <span className="text-red-500">*</span></label>
                                        <Input
                                            name="postal_code"
                                            value={shippingAddress.postal_code}
                                            onChange={handleInputChange}
                                            placeholder="400001"
                                            maxLength={6}
                                            className={`bg-slate-50 border-slate-200 focus:bg-white transition-colors ${!isServiceable && shippingAddress.postal_code?.length >= 6 ? 'border-red-500' : ''}`}
                                        />
                                        {shippingAddress.postal_code?.length >= 6 && (
                                            <p className={`text-sm font-medium ${isServiceable ? 'text-green-600' : 'text-red-600'}`}>
                                                {checkingServiceability ? 'Checking...' : serviceabilityMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="hidden">
                                    {/* Country is typically fixed or hidden if domestic only */}
                                    <Input
                                        name="country"
                                        value={shippingAddress.country}
                                        readOnly
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-hidden">
                                <div className="space-y-4">
                                    <div className={`flex items-center p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all min-h-[68px] ${paymentMethod === 'cod' ? 'bg-orange-50 border-orange-500 shadow-sm' : 'border-slate-300 hover:border-orange-300'
                                        }`} onClick={() => setPaymentMethod('cod')}>
                                        <input
                                            type="radio"
                                            id="cod"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-4 w-5 h-5 accent-orange-600"
                                        />
                                        <label htmlFor="cod" className="flex-1 cursor-pointer">
                                            <div className="font-semibold text-base md:text-lg">Cash on Delivery</div>
                                            <div className="text-sm text-slate-600">Pay when you receive your order</div>
                                        </label>
                                    </div>
                                    <div className={`flex items-center p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all min-h-[68px] ${paymentMethod === 'razorpay' ? 'bg-orange-50 border-orange-500 shadow-sm' : 'border-slate-300 hover:border-orange-300'
                                        }`} onClick={() => setPaymentMethod('razorpay')}>
                                        <input
                                            type="radio"
                                            id="razorpay"
                                            name="payment"
                                            value="razorpay"
                                            checked={paymentMethod === 'razorpay'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-4 w-5 h-5 accent-orange-600"
                                        />
                                        <label htmlFor="razorpay" className="flex-1 cursor-pointer">
                                            <div className="font-semibold text-base md:text-lg">Online Payment</div>
                                            <div className="text-sm text-slate-600">Pay securely via Razorpay</div>
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="min-w-0 max-w-full overflow-hidden">
                        <Card className="border-2 border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <div className="flex-1">
                                                <div className="font-medium">{item.product.name}</div>
                                                <div className="text-muted-foreground">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-green-600 font-medium">Free</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    className={`w-full ${!isServiceable && shippingAddress.postal_code?.length >= 6 ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                                    size="lg"
                                    onClick={handlePlaceOrder}
                                    disabled={loading || checkingServiceability || (!isServiceable && shippingAddress.postal_code?.length >= 6)}
                                >
                                    {loading ? 'Processing...' : checkingServiceability ? 'Checking delivery...' : !isServiceable && shippingAddress.postal_code?.length >= 6 ? 'Delivery not available' : 'Place Order'}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground">
                                    By placing your order, you agree to our terms and conditions
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutPage;
