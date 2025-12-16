import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ShoppingCart, Heart } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import ProductReviews from '../components/ProductReviews';
import ProductRecommendations from '../components/ProductRecommendations';
import ProductQA from '../components/ProductQA';

import ImageGallery from '../components/ImageGallery';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
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
        <motion.div
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid md:grid-cols-2 gap-8">

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
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                        <p className="text-lg text-muted-foreground">
                            Sold by <span className="text-orange-600 font-medium">{product.vendor_name}</span>
                        </p>
                    </div>

                    <div className="flex items-baseline gap-4">
                        {product.active_deal ? (
                            <>
                                <span className="text-3xl font-bold text-red-600">
                                    ₹{product.active_deal.discounted_price}
                                </span>
                                <span className="text-xl text-slate-400 line-through">
                                    ₹{product.price}
                                </span>
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">
                                    {parseInt(product.active_deal.discount_percentage)}% OFF DEAL
                                </span>
                            </>
                        ) : (
                            <span className="text-3xl font-bold text-slate-900">
                                ₹{product.price}
                            </span>
                        )}
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded-md">
                            <button
                                className="px-3 py-2 hover:bg-slate-100 transition-colors"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <span className="px-4 font-medium">{quantity}</span>
                            <button
                                className="px-3 py-2 hover:bg-slate-100 transition-colors"
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            >
                                +
                            </button>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>

                    {/* Pincode Checker */}
                    <div className="border-t border-b py-4 my-4">
                        <h3 className="font-medium mb-2 text-sm">Delivery Availability</h3>
                        <div className="flex gap-2 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Enter Pincode"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    maxLength={6}
                                    id="pincode-input"
                                />
                                <p id="pincode-message" className="text-sm mt-1"></p>
                            </div>
                            <Button
                                variant="outline"
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
                                            msgEl.className = "text-sm mt-1 text-green-600 font-medium";
                                        } else {
                                            msgEl.textContent = "❌ " + res.data.message;
                                            msgEl.className = "text-sm mt-1 text-red-600 font-medium";
                                        }
                                    } catch (err) {
                                        msgEl.textContent = "Error checking availability";
                                        msgEl.className = "text-sm mt-1 text-red-600";
                                    }
                                }}
                            >
                                Check
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex gap-3">
                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || cartLoading}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {cartLoading ? 'Adding...' : 'Add to Cart'}
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                onClick={async () => {
                                    if (!user) {
                                        toast.error('Please login to continue');
                                        navigate('/login');
                                        return;
                                    }
                                    await addToCart(product.id, quantity);
                                    navigate('/checkout');
                                }}
                                disabled={product.stock === 0 || cartLoading}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {cartLoading ? 'Processing...' : 'Buy Now'}
                            </Button>
                        </div>
                        <Button size="lg" variant="outline">
                            <Heart className="h-5 w-5" />
                        </Button>
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
                <ProductQA productId={product.id} />

                {/* Similar Products */}
                <ProductRecommendations productId={product.id} type="similar" />
            </div>
        </motion.div>
    );
};

export default ProductDetailPage;
