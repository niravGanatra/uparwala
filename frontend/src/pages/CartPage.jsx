import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const CartPage = () => {
    const { cart, fetchCart, removeFromCart, loading, clearCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleRemove = async (itemId) => {
        await removeFromCart(itemId);
    };

    if (loading && !cart) {
        return (
            <div className="flex items-center justify-center py-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <motion.div
                className="container mx-auto px-4 py-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <ShoppingBag className="h-24 w-24 mx-auto text-slate-300 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    {cart.items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="p-4 flex gap-4">
                                    <div className="h-24 w-24 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.product.images && item.product.images.length > 0 ? (
                                            <img
                                                src={item.product.images[0].image}
                                                alt={item.product.name}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <h3 className="font-semibold text-lg">{item.product.name}</h3>
                                            <span className="font-bold">₹{item.product.price * item.quantity}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Sold by {item.product.vendor_name}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <span className="text-muted-foreground">Qty: {item.quantity}</span>
                                                <span className="text-muted-foreground">×</span>
                                                <span className="text-muted-foreground">₹{item.product.price}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRemove(item.id)}
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal ({cart.items.length} items)</span>
                                <span>₹{calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{calculateTotal().toFixed(2)}</span>
                            </div>
                            <Button
                                className="w-full mt-4"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                Proceed to Checkout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Link to="/products">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CartPage;
