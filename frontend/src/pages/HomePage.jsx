import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Zap, Shield, Truck, Star, ArrowRight, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import api from '../services/api';

const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/');
            setProducts(response.data.slice(0, 8));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            setCategories(response.data.slice(0, 6));
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section - Immersive */}
            <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.h1
                            className="text-5xl md:text-7xl font-bold mb-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            Discover Amazing Products
                            <br />
                            <span className="text-yellow-300">From Local Vendors</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            Shop from thousands of products, support local businesses, and get the best deals
                        </motion.p>

                        {/* Search Bar - Interactive */}
                        <motion.form
                            onSubmit={handleSearch}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="max-w-2xl mx-auto mb-8"
                        >
                            <div className="flex gap-2 bg-white rounded-full p-2 shadow-2xl">
                                <div className="flex-1 flex items-center px-4">
                                    <Search className="h-5 w-5 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Search for products, categories, or vendors..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                                    />
                                </div>
                                <Button type="submit" className="rounded-full px-8 bg-orange-600 hover:bg-orange-700">
                                    Search
                                </Button>
                            </div>
                        </motion.form>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="flex flex-wrap justify-center gap-8 text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                <span>10,000+ Products</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                <span>500+ Vendors</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                <span>50,000+ Happy Customers</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section - Intuitive */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Fast Delivery', desc: 'Get your orders delivered quickly', color: 'orange' },
                            { icon: Shield, title: 'Secure Payment', desc: 'Your transactions are safe', color: 'blue' },
                            { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹500', color: 'green' }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-slate-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section - Interactive */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
                        <p className="text-slate-600 text-lg">Explore our wide range of categories</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category, idx) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                            >
                                <Link
                                    to={`/products?category=${category.id}`}
                                    className="block bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center hover:shadow-xl transition-all group"
                                >
                                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                        <ShoppingBag className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products - Immersive */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex justify-between items-center mb-12"
                    >
                        <div>
                            <h2 className="text-4xl font-bold mb-2">Trending Products</h2>
                            <p className="text-slate-600 text-lg">Discover what's popular right now</p>
                        </div>
                        <Link to="/products">
                            <Button variant="outline" className="gap-2">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -10 }}
                            >
                                <Link to={`/products/${product.slug}`} className="block group">
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
                                        <div className="relative overflow-hidden aspect-square bg-slate-100">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0].image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="h-16 w-16 text-slate-300" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                New
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-2">{product.vendor_name}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-orange-600">₹{product.price}</span>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <span className="text-sm font-semibold text-slate-700">4.5</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Interactive */}
            <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Shopping?</h2>
                        <p className="text-xl mb-8 text-orange-100">Join thousands of happy customers today</p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/products">
                                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8">
                                    Browse Products
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                                    Become a Vendor
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
