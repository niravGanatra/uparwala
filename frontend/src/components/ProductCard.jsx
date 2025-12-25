import { ShoppingCart, Heart, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import NotifyMeModal from './NotifyMeModal';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const { user } = useAuth();
    const [showNotifyModal, setShowNotifyModal] = useState(false);

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

        // Check stock first
        if (isOutOfStock) {
            toast.error('This item is out of stock');
            return;
        }

        try {
            // Add to cart (works for both logged-in and guest users)
            const cartItem = await addToCart(product.id, 1);

            // Small delay to ensure cart state is updated
            await new Promise(resolve => setTimeout(resolve, 100));

            // Navigate to checkout with the selected item
            // If cartItem has an id, pass it; otherwise checkout will use full cart
            if (cartItem && cartItem.id) {
                navigate('/checkout', { state: { selectedItemIds: [cartItem.id] } });
            } else {
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

    // Calculate price (check for deals)
    const finalPrice = product.active_deal
        ? parseFloat(product.active_deal.discounted_price)
        : parseFloat(product.price);

    const originalPrice = parseFloat(product.price);
    const hasDiscount = product.active_deal && finalPrice < originalPrice;

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
                                {parseInt(product.active_deal.discount_percentage)}% OFF
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
