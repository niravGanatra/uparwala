import { ShoppingCart, Heart, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import NotifyMeModal from './NotifyMeModal';
import { useLocation } from '../context/LocationContext';
import deliveryService from '../services/deliveryService';
import { Truck } from 'lucide-react';
import ServiceabilityBanner from './ServiceabilityBanner';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const { user } = useAuth();
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    // Delivery Estimate
    const { location, isServiceable, hasLocation } = useLocation();
    const [deliveryEstimate, setDeliveryEstimate] = useState(null);
    const [deliveryFailed, setDeliveryFailed] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const checkDelivery = async () => {
            // Skip if not serviceable or no location
            if (!isServiceable || !hasLocation) {
                setDeliveryEstimate(null);
                setDeliveryFailed(false);
                return;
            }
            if (location?.pincode && product.id) {
                try {
                    const data = await deliveryService.checkEstimate(location.pincode, product.id);
                    if (isMounted) {
                        if (data.success) {
                            setDeliveryEstimate(data);
                            setDeliveryFailed(false);
                        } else {
                            // Delhivery says not deliverable
                            setDeliveryEstimate(null);
                            setDeliveryFailed(true);
                        }
                    }
                } catch (err) {
                    // API failed - treat as not deliverable
                    if (isMounted) {
                        setDeliveryEstimate(null);
                        setDeliveryFailed(true);
                    }
                }
            }
        };
        checkDelivery();
        return () => { isMounted = false; };
    }, [location?.pincode, product.id, isServiceable, hasLocation]);

    const isOutOfStock = product.stock_status === 'outofstock' || (product.stock !== undefined && product.stock === 0);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        await addToCart(product.id, 1);
    };

    const handleBuyNow = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Require login for Buy Now
        if (!user) {
            toast.error('Please login to continue');
            navigate('/login', { state: { from: `/products/${product.slug}` } });
            return;
        }

        // Check stock
        if (isOutOfStock) {
            toast.error('This item is out of stock');
            return;
        }

        try {
            // Add to cart and get the cart item
            const cartItem = await addToCart(product.id, 1);

            // Navigate to checkout with selected item
            // API returns cart_item_id, not id
            const itemId = cartItem?.cart_item_id || cartItem?.id;
            if (itemId) {
                navigate('/checkout', { state: { selectedItemIds: [itemId] } });
            } else {
                // Fallback: navigate to checkout without specific item selection
                navigate('/checkout');
            }
        } catch (error) {
            console.error('Buy Now failed:', error);
            toast.error('Failed to proceed to checkout');
        }
    };

    const handleNotifyMe = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowNotifyModal(true);
    };

    // Calculate price (check for deals AND sale prices)
    const regularPrice = parseFloat(product.regular_price || product.price);
    const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;

    // Priority: active_deal > sale_price > regular_price
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

    const originalPrice = regularPrice;

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden group h-[520px] flex flex-col">
                <Link to={`/products/${product.slug}`} className="flex flex-col h-full">
                    <div className="relative h-64 bg-white flex-shrink-0 p-4 flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0].image}
                                alt={product.name}
                                className={`max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-60' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                        {hasDiscount && (
                            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                {discountPercent}% OFF
                            </span>
                        )}
                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded">
                                    OUT OF STOCK
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                        {/* Vendor/Brand Name */}
                        {product.vendor_name && (
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                {product.vendor_name}
                            </p>
                        )}

                        {/* Product Name */}
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3 leading-tight">
                            {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-2xl font-bold text-red-600">
                                ₹{finalPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">
                                    ₹{originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Delivery Estimate or Serviceability Banner */}
                        {(!isServiceable || deliveryFailed) ? (
                            <ServiceabilityBanner variant="compact" forceShow={deliveryFailed} />
                        ) : deliveryEstimate && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1.5 rounded mb-3 w-fit">
                                <Truck className="w-3.5 h-3.5" />
                                <span>
                                    Get it by {new Date(deliveryEstimate.estimated_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        )}

                        {/* Dual Action Buttons - Vertically Stacked */}
                        <div className="mt-auto">
                            {isOutOfStock ? (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full text-sm font-semibold border-orange-600 text-orange-600 hover:bg-orange-50 uppercase tracking-wide"
                                    onClick={handleNotifyMe}
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    Notify Me
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full text-sm font-semibold border-slate-700 text-slate-700 hover:bg-slate-50 uppercase tracking-wide"
                                        onClick={handleAddToCart}
                                        disabled={cartLoading}
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold uppercase tracking-wide"
                                        onClick={handleBuyNow}
                                        disabled={cartLoading}
                                    >
                                        Buy Now
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Notify Me Modal */}
            <NotifyMeModal
                product={product}
                isOpen={showNotifyModal}
                onClose={() => setShowNotifyModal(false)}
            />
        </>
    );
};

export default ProductCard;
