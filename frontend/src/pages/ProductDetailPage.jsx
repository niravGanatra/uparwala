import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ShoppingCart, Heart, Bell } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import ProductReviews from '../components/ProductReviews';
import ProductRecommendations from '../components/ProductRecommendations';
import ProductQA from '../components/ProductQA';
import NotifyMeModal from '../components/NotifyMeModal';

import ImageGallery from '../components/ImageGallery';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const { user } = useAuth();
    const { addToCart, loading: cartLoading } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log('Fetching product details for slug:', slug);
                const response = await api.get(`/products/${slug}/`);
                console.log('Fetch response:', response);
                setProduct(response.data);
            } catch (error) {
                console.error('Failed to fetch product:', error);
                console.error('Error details:', error.response?.data);
                toast.error('Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    // Track product view
    useEffect(() => {
        if (product) {
            api.post(`/products/${product.id}/track-view/`)
                .catch(err => console.error('Failed to track view:', err));
        }
    }, [product]);

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        await addToCart(product.id, quantity);
    };

    if (loading) {
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

    if (!product) return <div className="text-center py-12">Product not found</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <motion.div
                className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-32 md:pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8 w-full">

                    {/* Product Images */}
                    <motion.div
                        className="space-y-4"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <ImageGallery images={product.images} productName={product.name} />
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        className="space-y-6"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                            <p className="text-base md:text-lg text-slate-600">
                                Sold by <span className="text-orange-600 font-medium">{product.vendor_name}</span>
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                {product.active_deal ? (
                                    <>
                                        <span className="text-3xl md:text-4xl font-bold text-red-600">
                                            ₹{product.active_deal.discounted_price}
                                        </span>
                                        <span className="text-lg md:text-xl text-slate-400 line-through">
                                            ₹{product.price}
                                        </span>
                                        <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                            {parseInt(product.active_deal.discount_percentage)}% OFF
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-3xl md:text-4xl font-bold text-slate-900">
                                        ₹{product.price}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <p className="text-slate-600 leading-relaxed text-base">
                                {product.description}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <h3 className="font-semibold mb-3 text-base">Quantity</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                {/* Quantity Controls - Mobile Optimized */}
                                <div className="flex items-center border-2 border-slate-300 rounded-lg overflow-hidden">
                                    <button
                                        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 transition-colors text-xl font-bold"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="px-6 md:px-8 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
                                    <button
                                        className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 transition-colors text-xl font-bold"
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm md:text-base text-slate-600 font-medium">
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>
                        </div>

                        {/* Pincode Checker - Mobile Optimized */}
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <h3 className="font-semibold mb-3 text-base">Delivery Availability</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Enter Pincode"
                                        className="flex h-14 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500"
                                        maxLength={6}
                                        id="pincode-input"
                                    />
                                    <p id="pincode-message" className="text-sm mt-2"></p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto sm:min-w-[100px]"
                                    onClick={async () => {
                                        const code = document.getElementById('pincode-input').value;
                                        const msgEl = document.getElementById('pincode-message');
                                        if (!code || code.length < 6) {
                                            toast.error("Please enter valid pincode");
                                            return;
                                        }
                                        try {
                                            const res = await api.get(`/products/${product.slug}/check-pincode/?pincode=${code}`);
                                            if (res.data.available) {
                                                msgEl.textContent = "✅ " + res.data.message;
                                                msgEl.className = "text-sm mt-2 text-green-600 font-medium";
                                            } else {
                                                msgEl.textContent = "❌ " + res.data.message;
                                                msgEl.className = "text-sm mt-2 text-red-600 font-medium";
                                            }
                                        } catch (err) {
                                            msgEl.textContent = "Error checking availability";
                                            msgEl.className = "text-sm mt-2 text-red-600";
                                        }
                                    }}
                                >
                                    Check
                                </Button>
                            </div>
                        </div>

                        {/* Action Buttons - Mobile Optimized */}
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Stock Status Check */}
                                {(product.stock_status === 'outofstock' || product.stock === 0) ? (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                                        onClick={() => setShowNotifyModal(true)}
                                    >
                                        <Bell className="mr-2 h-5 w-5" />
                                        Notify Me When Available
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            size="lg"
                                            className="w-full sm:flex-1"
                                            onClick={handleAddToCart}
                                            disabled={cartLoading}
                                        >
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            {cartLoading ? 'Adding...' : 'Add to Cart'}
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full sm:w-auto sm:min-w-[56px]"
                                            aria-label="Add to wishlist"
                                        >
                                            <Heart className="h-5 w-5" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium">{product.category_name}</span>
                                </div>
                                {product.sku && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">SKU</span>
                                        <span className="font-medium">{product.sku}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Product Reviews Section */}
                    <ProductReviews productId={product.id} />

                    {/* Product Q&A Section */}
                    <ProductQA productId={product?.id} />

                    {/* Recommendations */}
                    <ProductRecommendations currentProductid={product?.id} />

                    {/* Notify Me Modal */}
                    <NotifyMeModal
                        isOpen={showNotifyModal}
                        onClose={() => setShowNotifyModal(false)}
                        productId={product.id}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default ProductDetailPage;
