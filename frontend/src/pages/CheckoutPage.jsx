import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const CheckoutPage = () => {
    const { cart, fetchCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await api.post('/orders/orders/', {
                shipping_address: shippingAddress
            });

            toast.success('Order placed successfully!', {
                duration: 3000,
                position: 'bottom-right',
            });

            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('Checkout failed:', error);
            const errorMessage = error.response?.data?.error || 'Checkout failed. Please try again.';
            toast.error(errorMessage, {
                duration: 4000,
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <button
                onClick={() => navigate('/cart')}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
            </button>

            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Shipping Address Form */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Truck className="h-5 w-5 mr-2" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                                    <Input
                                        name="full_name"
                                        value={shippingAddress.full_name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                    <Input
                                        name="phone"
                                        value={shippingAddress.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                                <Input
                                    name="address_line1"
                                    value={shippingAddress.address_line1}
                                    onChange={handleInputChange}
                                    placeholder="House No., Street Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                                <Input
                                    name="address_line2"
                                    value={shippingAddress.address_line2}
                                    onChange={handleInputChange}
                                    placeholder="Apartment, Suite, etc. (optional)"
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">City *</label>
                                    <Input
                                        name="city"
                                        value={shippingAddress.city}
                                        onChange={handleInputChange}
                                        placeholder="Mumbai"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">State *</label>
                                    <Input
                                        name="state"
                                        value={shippingAddress.state}
                                        onChange={handleInputChange}
                                        placeholder="Maharashtra"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Postal Code *</label>
                                    <Input
                                        name="postal_code"
                                        value={shippingAddress.postal_code}
                                        onChange={handleInputChange}
                                        placeholder="400001"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Country</label>
                                <Input
                                    name="country"
                                    value={shippingAddress.country}
                                    onChange={handleInputChange}
                                    disabled
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
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-4 border rounded-lg bg-slate-50">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="payment"
                                        defaultChecked
                                        className="mr-3"
                                    />
                                    <label htmlFor="cod" className="flex-1 cursor-pointer">
                                        <div className="font-medium">Cash on Delivery</div>
                                        <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                                    </label>
                                </div>
                                <div className="flex items-center p-4 border rounded-lg opacity-50">
                                    <input
                                        type="radio"
                                        id="online"
                                        name="payment"
                                        disabled
                                        className="mr-3"
                                    />
                                    <label htmlFor="online" className="flex-1">
                                        <div className="font-medium">Online Payment</div>
                                        <div className="text-sm text-muted-foreground">Coming soon - Stripe/Razorpay</div>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div>
                    <Card className="sticky top-20">
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
                                className="w-full"
                                size="lg"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                By placing your order, you agree to our terms and conditions
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default CheckoutPage;
