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
        if (!user) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }
        await addToCart(product.id, 1);
        navigate('/checkout');
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
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden group h-[420px] flex flex-col">
                <Link to={`/products/${product.slug}`} className="flex flex-col h-full">
                    <div className="relative h-48 bg-gray-100 flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0].image}
                                alt={product.name}
                                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-60' : ''}`}
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
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-3 h-[3rem] leading-snug">
                            {product.name}
                        </h3>

                        <div className="flex items-baseline gap-2 mb-4 h-7">
                            <span className="text-lg font-bold text-gray-900">
                                ₹{finalPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                    ₹{originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto">
                            {isOutOfStock ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs border-orange-600 text-orange-600 hover:bg-orange-50"
                                    onClick={handleNotifyMe}
                                >
                                    <Bell className="w-3 h-3 mr-1" />
                                    Notify Me
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="sm"
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs"
                                        onClick={handleBuyNow}
                                        disabled={cartLoading}
                                    >
                                        Buy Now
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={handleAddToCart}
                                        disabled={cartLoading}
                                    >
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        Add to Cart
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
