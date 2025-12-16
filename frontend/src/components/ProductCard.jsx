import { ShoppingCart, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCart();
    const { user } = useAuth();

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

    // Calculate price (check for deals)
    const finalPrice = product.active_deal
        ? parseFloat(product.active_deal.discounted_price)
        : parseFloat(product.price);

    const originalPrice = parseFloat(product.price);
    const hasDiscount = product.active_deal && finalPrice < originalPrice;

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden group">
            <Link to={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0].image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                </div>

                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-3">
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
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={handleAddToCart}
                            disabled={cartLoading || (product.stock && product.stock === 0)}
                        >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs"
                            onClick={handleBuyNow}
                            disabled={cartLoading || (product.stock && product.stock === 0)}
                        >
                            Buy Now
                        </Button>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
