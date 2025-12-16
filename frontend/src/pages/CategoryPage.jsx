
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ChevronDown, ShoppingCart, Heart, Star } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDiscount, setActiveDiscount] = useState(0); // Percentage
    const [promoBanner, setPromoBanner] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetch: Category products, Category details, and Active Banners
                // Note: We need a way to get ID from slug, or search products by category slug
                // Assuming /products/?category=slug works or we fetch category first

                // 1. Fetch Banners to check for promotions
                const bannersRes = await api.get('/homepage/promotions/');
                const activeBanners = bannersRes.data;

                // 2. Check if any banner links to this category
                const currentPath = `/category/${categorySlug}`;
                const matchingBanner = activeBanners.find(b =>
                    b.is_active && b.link_url && b.link_url.includes(categorySlug)
                );

                if (matchingBanner) {
                    setPromoBanner(matchingBanner);
                    // Extract discount percentage from text strings like "50% OFF", "Flat 20% Discount"
                    const match = matchingBanner.discount_text?.match(/(\d+)%/);
                    if (match) {
                        setActiveDiscount(parseInt(match[1]));
                    }
                } else {
                    setActiveDiscount(0);
                    setPromoBanner(null);
                }

                // 3. Fetch Products
                // We filter by category slug explicitly now that backend supports it
                const productsRes = await api.get(`/products/?category__slug=${categorySlug}`);
                setProducts(productsRes.data.results || productsRes.data);

                // 4. Fetch Category Details (Mock title if API endpoint not handy, but better to fetch)
                // If API doesn't support slug lookup directly, we might rely on the products' category field
                // For now user wants functionality, so we'll derive title from slug if needed
                setCategory({ name: categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') });

            } catch (error) {
                console.error("Error loading category page:", error);
                toast.error("Could not load products");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [categorySlug]);

    const calculatePrice = (originalPrice) => {
        if (!activeDiscount) return originalPrice;
        return originalPrice - (originalPrice * (activeDiscount / 100));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Promo Header from Banner if available */}
            {promoBanner && (
                <div
                    className="w-full h-48 md:h-64 bg-cover bg-center relative"
                    style={{
                        backgroundImage: promoBanner.background_image ? `url(${promoBanner.background_image})` : 'none',
                        backgroundColor: promoBanner.background_color || '#2563eb'
                    }}
                >
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">{promoBanner.title}</h1>
                        <p className="text-xl md:text-2xl font-medium text-yellow-300">
                            {promoBanner.discount_text} applied to all items!
                        </p>
                    </div>
                </div>
            )}

            {!promoBanner && (
                <div className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
                        <p className="mt-2 text-gray-500">Explore our latest collection</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No products found in this category.</h3>
                        <Link to="/products" className="text-primary-600 hover:text-primary-500 mt-4 inline-block">
                            Browse all products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
