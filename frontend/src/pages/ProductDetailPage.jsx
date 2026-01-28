import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ShoppingCart, Heart, Bell, RotateCcw, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import SpiritualLoader from '../components/SpiritualLoader';
import { useLocation } from '../context/LocationContext';
import deliveryService from '../services/deliveryService';
import ServiceabilityBanner from '../components/ServiceabilityBanner';

import ImageGallery from '../components/ImageGallery';

import { useAnalytics } from '../hooks/useAnalytics';

// Lazy load heavy components
const ProductReviews = lazy(() => import('../components/ProductReviews'));
const ProductRecommendations = lazy(() => import('../components/ProductRecommendations'));
const NotifyMeModal = lazy(() => import('../components/NotifyMeModal'));

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const { user } = useAuth();
    const { addToCart, loading: cartLoading } = useCart();
    const { trackEvent } = useAnalytics();

    // Delivery Estimate State
    const { location, isServiceable } = useLocation();
    const [pincode, setPincode] = useState('');
    const [deliveryEstimate, setDeliveryEstimate] = useState(null);
    const [deliveryError, setDeliveryError] = useState(null);
    const [checkingDelivery, setCheckingDelivery] = useState(false);

    // Auto-fill pincode from user location
    useEffect(() => {
        if (location?.pincode) {
            setPincode(location.pincode);
        }
    }, [location]);

    // Check delivery handler
    const checkDelivery = async () => {
        if (!pincode || pincode.length !== 6) return;

        setCheckingDelivery(true);
        setDeliveryError(null);
        setDeliveryEstimate(null);

        try {
            const data = await deliveryService.checkEstimate(pincode, product.id);
            if (data.success) {
                setDeliveryEstimate({
                    estimated_date: data.estimated_date,
                    days: data.days
                });
            } else {
                setDeliveryError(data.error || 'Delivery not available for this pincode');
            }
        } catch (error) {
            setDeliveryError('Could not fetch delivery estimate');
        } finally {
            setCheckingDelivery(false);
        }
    };

    // Auto-check on load if location exists and is serviceable
    useEffect(() => {
        if (product && location?.pincode && isServiceable) {
            checkDelivery();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product, location?.pincode, isServiceable]);

    useEffect(() => {
        // ... existing fetch logic ...
        const fetchProduct = async () => {
            try {
                // console.log('Fetching product details for slug:', slug);
                const response = await api.get(`/products/${slug}/`);
                // console.log('Fetch response:', response);
                setProduct(response.data);
            } catch (error) {
                console.error('Failed to fetch product:', error);
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
            // New Analytics System
            trackEvent('product_view', {
                product_id: product.id,
                price: product.price,
                category: product.category,
                name: product.name
            });

            // Old Logic (Keep for backward compatibility)
            api.post(`/products/${product.id}/track-view/`)
                .catch(err => console.error('Failed to track view:', err));
        }
    }, [product, trackEvent]);

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        // Track Add to Cart
        trackEvent('add_to_cart', {
            product_id: product.id,
            price: product.price,
            quantity: quantity,
            name: product.name
        });

        await addToCart(product.id, quantity);
    };

    if (loading) {
        return <SpiritualLoader size="md" />;
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
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8 w-full max-w-full overflow-hidden">

                    {/* Product Images */}
                    <motion.div
                        className="space-y-4 min-w-0 max-w-full overflow-hidden"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <ImageGallery images={product.images} productName={product.name} />
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        className="space-y-6 min-w-0 max-w-full overflow-hidden"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                            <p className="text-base md:text-lg text-slate-600 mb-3">
                                Sold by <span className="text-orange-600 font-medium">{product.vendor_name}</span>
                            </p>
                            {product.short_description && (
                                <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                                    {product.short_description}
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                {(() => {
                                    // Calculate prices - priority: active_deal > sale_price > regular_price
                                    const regularPrice = parseFloat(product.regular_price || product.price);
                                    const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;

                                    let finalPrice = regularPrice;
                                    let hasDiscount = false;
                                    let discountPercent = 0;

                                    if (product.active_deal) {
                                        finalPrice = parseFloat(product.active_deal.discounted_price);
                                        discountPercent = parseInt(product.active_deal.discount_percentage);
                                        hasDiscount = finalPrice < regularPrice;
                                    } else if (salePrice && salePrice < regularPrice) {
                                        finalPrice = salePrice;
                                        discountPercent = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
                                        hasDiscount = true;
                                    }

                                    return hasDiscount ? (
                                        <>
                                            <span className="text-3xl md:text-4xl font-bold text-red-600">
                                                ₹{finalPrice.toFixed(2)}
                                            </span>
                                            <span className="text-lg md:text-xl text-slate-400 line-through">
                                                ₹{regularPrice.toFixed(2)}
                                            </span>
                                            <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                                {discountPercent}% OFF
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl md:text-4xl font-bold text-slate-900">
                                            ₹{regularPrice.toFixed(2)}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3">Product Description</h3>
                            <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
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

                        {/* Delivery Estimate or Serviceability Banner */}
                        {!isServiceable ? (
                            <ServiceabilityBanner variant="full" />
                        ) : (
                            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
                                <h3 className="font-semibold mb-3 text-base">Delivery Estimate</h3>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Enter Pincode"
                                                className="flex h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition-all"
                                                maxLength={6}
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                            />
                                            {/* Auto-detected location indicator */}
                                            {location?.pincode && pincode === location.pincode && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                                    My Location
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="min-w-[100px]"
                                            onClick={checkDelivery}
                                            disabled={checkingDelivery || pincode.length !== 6}
                                        >
                                            {checkingDelivery ? 'Checking...' : 'Check'}
                                        </Button>
                                    </div>

                                    {/* Estimate Result */}
                                    {deliveryEstimate && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3"
                                        >
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-800">
                                                    Delivery by {new Date(deliveryEstimate.estimated_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </p>
                                                <p className="text-sm text-green-700">
                                                    Expected in {deliveryEstimate.days} days
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {deliveryError && (
                                        <p className="text-sm text-red-600 font-medium px-1">
                                            ❌ {deliveryError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Returns & Exchange */}
                        {(product.is_returnable || product.is_exchangeable) && (
                            <div className="flex gap-4">
                                {product.is_returnable && (
                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                        <RotateCcw className="h-5 w-5" />
                                        <span className="text-sm font-medium">Returnable</span>
                                    </div>
                                )}
                                {product.is_exchangeable && (
                                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                        <RefreshCw className="h-5 w-5" />
                                        <span className="text-sm font-medium">Exchangeable</span>
                                    </div>
                                )}
                            </div>
                        )}

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
                                            variant="default"
                                            className="w-full sm:flex-1 bg-orange-600 hover:bg-orange-700"
                                            onClick={async () => {
                                                if (!user) {
                                                    toast.error('Please login to buy');
                                                    navigate('/login');
                                                    return;
                                                }
                                                // Track Buy Now
                                                trackEvent('buy_now', {
                                                    product_id: product.id,
                                                    price: product.price,
                                                    quantity: quantity,
                                                    name: product.name
                                                });
                                                // Add to cart and navigate to checkout
                                                await addToCart(product.id, quantity);
                                                navigate('/checkout');
                                            }}
                                            disabled={cartLoading}
                                        >
                                            Buy Now
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
                    <Suspense fallback={<div className="h-40 flex items-center justify-center"><SpiritualLoader text="Loading reviews..." /></div>}>
                        <ProductReviews productId={product.id} />
                    </Suspense>


                    {/* Recommendations */}
                    <Suspense fallback={<div className="h-40 flex items-center justify-center"><SpiritualLoader text="Loading recommendations..." /></div>}>
                        <ProductRecommendations currentProductid={product?.id} />
                    </Suspense>

                    {/* Notify Me Modal */}
                    <Suspense fallback={null}>
                        <NotifyMeModal
                            isOpen={showNotifyModal}
                            onClose={() => setShowNotifyModal(false)}
                            productId={product.id}
                        />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductDetailPage;
