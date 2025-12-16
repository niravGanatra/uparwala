import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2, ArrowRight, ShoppingBag, CheckSquare, Square } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import CODChecker from '../components/CODChecker';
import GiftWrapSelector from '../components/GiftWrapSelector';

const CartPage = () => {
    const { cart, fetchCart, removeFromCart, loading, clearCart } = useCart();
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        fetchCart();
    }, []);

    // Auto-select all items when cart loads
    useEffect(() => {
        if (cart && cart.items) {
            setSelectedItems(cart.items.map(item => item.id));
        }
    }, [cart?.items?.length]);

    const calculateTotal = () => {
        if (!cart) return 0;
        // Calculate for selected items only
        return cart.items
            .filter(item => selectedItems.includes(item.id))
            .reduce((total, item) => {
                const price = item.product.active_deal
                    ? parseFloat(item.product.active_deal.discounted_price)
                    : parseFloat(item.product.price);
                return total + (price * item.quantity);
            }, 0);
    };

    // Helper to get item price details
    const getItemPrice = (item) => {
        if (item.product.active_deal) {
            return {
                price: parseFloat(item.product.active_deal.discounted_price),
                original: parseFloat(item.product.price),
                isDeal: true,
                discount: parseInt(item.product.active_deal.discount_percentage)
            };
        }
        return {
            price: parseFloat(item.product.price),
            original: null,
            isDeal: false,
            discount: 0
        };
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cart.items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.items.map(item => item.id));
        }
    };

    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleCheckout = async () => {
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to checkout');
            return;
        }

        // Navigate to checkout with selected item IDs
        navigate('/checkout', {
            state: { selectedItemIds: selectedItems }
        });
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

            {/* Select All */}
            <div className="flex items-center gap-3 mb-4 p-4 bg-slate-50 rounded-lg">
                <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-sm font-medium hover:text-orange-600 transition-colors"
                >
                    {selectedItems.length === cart.items.length ? (
                        <CheckSquare className="w-5 h-5 text-orange-600" />
                    ) : (
                        <Square className="w-5 h-5" />
                    )}
                    Select All ({selectedItems.length}/{cart.items.length} selected)
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    {cart.items.map((item, index) => {
                        const priceInfo = getItemPrice(item);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`relative overflow-hidden transition-all ${selectedItems.includes(item.id)
                                    ? 'ring-2 ring-orange-500 bg-orange-50/30'
                                    : 'opacity-60'
                                    }`}>
                                    {priceInfo.isDeal && (
                                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 z-10">
                                            DEAL APPLIED
                                        </div>
                                    )}
                                    <CardContent className="p-4 flex gap-4">
                                        {/* Selection Checkbox */}
                                        <button
                                            onClick={() => toggleItemSelection(item.id)}
                                            className="flex-shrink-0 self-start mt-2"
                                        >
                                            {selectedItems.includes(item.id) ? (
                                                <CheckSquare className="w-5 h-5 text-orange-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-400" />
                                            )}
                                        </button>
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
                                                <div className="text-right">
                                                    <span className="font-bold block">₹{(priceInfo.price * item.quantity).toFixed(2)}</span>
                                                    {priceInfo.isDeal && (
                                                        <span className="text-sm text-slate-400 line-through">₹{(priceInfo.original * item.quantity).toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Sold by {item.product.vendor_name}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                                                    <span className="text-muted-foreground">×</span>
                                                    <span className="font-medium">₹{priceInfo.price}</span>
                                                    {priceInfo.isDeal && (
                                                        <span className="text-red-600 font-bold ml-1">({priceInfo.discount}% OFF)</span>
                                                    )}
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
                        )
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal ({selectedItems.length} selected)</span>
                                <span>₹{calculateTotal().toFixed(2)}</span>
                            </div>

                            {(cart.discount_amount > 0 || (cart.subtotal - cart.total_amount) > 0) && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{(cart.discount_amount || (cart.subtotal - cart.total_amount)).toFixed(2)}</span>
                                </div>
                            )}

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
                                disabled={loading || selectedItems.length === 0}
                            >
                                Proceed to Checkout ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            {selectedItems.length === 0 && (
                                <p className="text-sm text-red-500 text-center mt-2">
                                    Please select at least one item
                                </p>
                            )}
                            <Link to="/products">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Phase 5: COD & Gift Wrapping */}
                    <div className="space-y-6">
                        <CODChecker />
                        <GiftWrapSelector
                            orderId={null} // Pass orderId if available, or handle in context
                            onUpdate={() => fetchCart()}
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CartPage;
