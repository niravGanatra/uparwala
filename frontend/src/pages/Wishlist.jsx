import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import SpiritualLoader from '../components/SpiritualLoader';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/products/wishlist/');
            setWishlist(response.data);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await api.delete(`/products/wishlist/${productId}/`);
            setWishlist(wishlist.filter(item => item.id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const moveToCart = async (productId) => {
        try {
            await api.post(`/products/wishlist/${productId}/move-to-cart/`);
            setWishlist(wishlist.filter(item => item.id !== productId));
            toast.success('Moved to cart');
        } catch (error) {
            toast.error('Failed to move to cart');
        }
    };

    if (loading) {
        return <SpiritualLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                    <h1 className="text-3xl font-bold">My Wishlist</h1>
                    <span className="text-gray-600">({wishlist.length} items)</span>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-600 mb-6">
                            Start adding products you love to your wishlist!
                        </p>
                        <Link
                            to="/products"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <Link to={`/products/${product.slug}`} className="block">
                                    <div className="relative">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                <Package className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                        {product.stock_status !== 'instock' && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl font-bold text-blue-600">
                                                ₹{product.price}
                                            </span>
                                            {product.sale_price && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    ₹{product.regular_price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-4 pb-4 flex gap-2">
                                    <button
                                        onClick={() => moveToCart(product.id)}
                                        disabled={product.stock_status !== 'instock'}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
