import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Home, Sparkles, Lamp, Sofa, Frame, Package, Search, Clock, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../services/api';
import homepageService from '../services/homepageService';
import RecentlyViewed from '../components/RecentlyViewed';
import ProductRecommendations from '../components/ProductRecommendations';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Homepage data from API
    const [homepageData, setHomepageData] = useState({
        hero_banner: null,
        promotional_banners: [],
        featured_categories: [],
        deals: [],
        hosting_essentials: [],
        premium_sections: [],
        category_promotions: []
    });

    useEffect(() => {
        fetchHomepageData();
        fetchProducts();
    }, []);

    const fetchHomepageData = async () => {
        try {
            setLoading(true);
            const data = await homepageService.getHomepageData();
            setHomepageData(data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch homepage data:', error);
            setError('Failed to load homepage content');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/');
            setProducts(response.data.slice(0, 8));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Icon mapping for featured categories
    const iconMap = {
        'frame': Frame,
        'package': Package,
        'sparkles': Sparkles,
        'sofa': Sofa,
        'home': Home,
        'lamp': Lamp
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-yellow-600" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={fetchHomepageData}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Banner - Mobile Optimized */}
            <section
                className="relative text-slate-900 overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-center"
                style={{
                    background: homepageData.hero_banner?.background_color || 'linear-gradient(to right, #facc15, #eab308, #f59e0b)'
                }}
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-6xl">❄️</div>
                    <div className="absolute top-20 right-20 text-6xl">🏠</div>
                    <div className="absolute bottom-10 left-1/4 text-6xl">❄️</div>
                    <div className="absolute bottom-20 right-1/3 text-6xl">🏠</div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-4 tracking-tight leading-tight">
                            {homepageData.hero_banner?.title || 'HO HO HOME SALE'}
                        </h1>
                        {homepageData.hero_banner?.subtitle && (
                            <p className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 md:mb-6">
                                {homepageData.hero_banner.subtitle}
                            </p>
                        )}

                        {/* Search Bar - Mobile Optimized */}
                        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-3 shadow-xl">
                                <div className="flex-1 flex items-center px-4 py-2 sm:py-0">
                                    <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 outline-none text-base text-slate-900 placeholder-slate-400"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto sm:px-8"
                                >
                                    Search
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* Category Grid - Mobile Optimized */}
            <section className="py-8 md:py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 md:mb-8">Shop by Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
                        {homepageData.featured_categories.map((category, idx) => {
                            const IconComponent = iconMap[category.icon] || Package;
                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Link
                                        to={category.link_url}
                                        className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group active:scale-95 min-h-[120px] sm:min-h-[140px]"
                                    >
                                        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6">
                                            {category.image ? (
                                                <img src={category.image} alt={category.name} className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
                                            ) : (
                                                <IconComponent className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-600 group-hover:text-yellow-700 transition-colors" />
                                            )}
                                        </div>
                                        <div className="p-2 sm:p-3 text-center">
                                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">{category.name}</h3>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Promotional Banners - Dynamic from API */}
            {homepageData.promotional_banners.length > 0 && (
                <section className="py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {homepageData.promotional_banners.map((banner, idx) => (
                                <div
                                    key={banner.id}
                                    className={`${banner.position === 'large_left' || banner.position === 'large_right' ? 'lg:col-span-2' : ''} rounded-2xl p-8 text-white relative overflow-hidden`}
                                    style={{ background: banner.background_color }}
                                >
                                    <div className="relative z-10">
                                        <h2 className="text-4xl font-bold mb-2">{banner.title}</h2>
                                        <p className="text-5xl font-black text-yellow-400 mb-4">{banner.discount_text}</p>
                                        <Link to={banner.link_url}>
                                            <Button className="bg-white text-slate-900 hover:bg-yellow-400">
                                                Shop Now
                                            </Button>
                                        </Link>
                                    </div>
                                    {banner.background_image && (
                                        <img src={banner.background_image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Hosting Essentials - Dynamic from API */}
            {homepageData.hosting_essentials.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-center mb-8">Hosting Essentials</h2>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {homepageData.hosting_essentials.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Link to={item.link_url} className="block group">
                                        <div className="bg-amber-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                                            <div className="aspect-square bg-white flex items-center justify-center text-6xl">
                                                {item.emoji || '🏠'}
                                            </div>
                                            <div className="bg-slate-900 text-white p-3 text-center">
                                                <h3 className="font-semibold">{item.name}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Deal of the Day - Dynamic from API */}
            {homepageData.deals.length > 0 && (
                <section className="py-12 bg-gradient-to-br from-yellow-50 to-amber-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                                    <Clock className="h-10 w-10 text-yellow-600" />
                                    Deal of the Day
                                </h2>
                                <p className="text-slate-600">Limited time offers - Grab them now!</p>
                            </div>
                            <Link to="/products">
                                <Button variant="outline" className="gap-2 border-yellow-600 text-yellow-700 hover:bg-yellow-600 hover:text-white">
                                    View All <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {homepageData.deals.map((deal, idx) => (
                                <motion.div
                                    key={deal.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Link to={`/products/${deal.product.slug}`} className="block group">
                                        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                                            <div className="relative aspect-square bg-slate-100">
                                                {deal.product.images && deal.product.images.length > 0 ? (
                                                    <img
                                                        src={deal.product.images[0].image}
                                                        alt={deal.product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag className="h-16 w-16 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                                                    -{deal.discount_percentage}%
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                                                    {deal.product.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl font-bold text-yellow-600">₹{deal.discounted_price}</span>
                                                    <span className="text-sm text-slate-400 line-through">₹{deal.product.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trending Products */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-4xl font-bold mb-2">Trending Products</h2>
                            <p className="text-slate-600 text-lg">Most popular items this week</p>
                        </div>
                        <Link to="/products">
                            <Button variant="outline" className="gap-2">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Quality Banners - Dynamic from API */}
            {homepageData.premium_sections.length > 0 && (
                <section className="py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {homepageData.premium_sections.map((section, idx) => {
                                const IconComponent = iconMap[section.icon] || Frame;
                                return (
                                    <div
                                        key={section.id}
                                        className="rounded-2xl p-8 flex items-center justify-between"
                                        style={{ background: section.background_color }}
                                    >
                                        <div>
                                            <h3 className="text-3xl font-bold mb-2">{section.title}</h3>
                                            <p className="text-xl font-semibold">{section.subtitle}</p>
                                            <Link to={section.link_url}>
                                                <Button className="mt-4 bg-white text-slate-900 hover:bg-yellow-400">
                                                    Shop Now
                                                </Button>
                                            </Link>
                                        </div>
                                        <IconComponent className="h-24 w-24 opacity-30" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Bottom Category Grid - Dynamic from API */}
            {homepageData.category_promotions.length > 0 && (
                <section className="py-12 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {homepageData.category_promotions.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Link to={item.link_url}>
                                        <div
                                            className="rounded-xl p-6 text-white min-h-[200px] flex flex-col justify-between hover:shadow-xl transition-all"
                                            style={{ background: item.background_color }}
                                        >
                                            <div>
                                                <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                                                <p className="text-lg font-semibold text-yellow-300">{item.discount_text}</p>
                                            </div>
                                            <Button size="sm" className="bg-white text-slate-900 hover:bg-yellow-400 w-fit">
                                                Shop Now
                                            </Button>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA */}
            <section className="py-16 bg-gradient-to-r from-yellow-500 to-amber-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            Transform Your Home Today
                        </h2>
                        <p className="text-xl text-slate-800 mb-8">
                            Discover thousands of products from local vendors
                        </p>
                        <div className="mt-8 flex gap-4 justify-center">
                            <Link to="/vendor/register">
                                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600">
                                    Become a Vendor
                                </Button>
                            </Link>
                            <Link to="/products">
                                <Button size="lg" variant="outline">
                                    Shop Now
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Personalized Recommendations */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ProductRecommendations type="personalized" />
                </div>
            </section>

            {/* Recently Viewed Products */}
            <RecentlyViewed limit={6} />
        </div>
    );
};

export default HomePage;
