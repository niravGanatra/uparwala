import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Filter, X, ShoppingBag, Star } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductListingPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (searchParams.get('search')) params.append('search', searchParams.get('search'));
            if (searchParams.get('category')) params.append('category', searchParams.get('category'));
            if (searchParams.get('minPrice')) params.append('min_price', searchParams.get('minPrice'));
            if (searchParams.get('maxPrice')) params.append('max_price', searchParams.get('maxPrice'));
            if (searchParams.get('sort')) params.append('ordering', searchParams.get('sort'));

            const response = await api.get(`/products/?${params.toString()}`);

            // Sort products: in-stock first, out-of-stock last
            const sortedProducts = response.data.sort((a, b) => {
                const aOutOfStock = a.stock_status === 'outofstock' || (a.stock !== undefined && a.stock === 0);
                const bOutOfStock = b.stock_status === 'outofstock' || (b.stock !== undefined && b.stock === 0);

                // In-stock items first, out-of-stock last
                if (aOutOfStock && !bOutOfStock) return 1; // a goes after b
                if (!aOutOfStock && bOutOfStock) return -1; // a goes before b
                return 0; // Keep original order for same stock status
            });

            setProducts(sortedProducts);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sortBy) params.set('sort', sortBy);
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('');
        setSearchParams({});
    };

    const hasActiveFilters = searchQuery || selectedCategory || minPrice || maxPrice || sortBy;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">All Products</h1>
                        <p className="text-slate-600">{products.length} products found</p>
                    </div>
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant="outline"
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl p-6 mb-8 shadow-lg"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Min Price</label>
                                <Input
                                    type="number"
                                    placeholder="₹0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Price</label>
                                <Input
                                    type="number"
                                    placeholder="₹10000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full md:w-64 px-3 py-2 border rounded-lg"
                            >
                                <option value="">Default</option>
                                <option value="price">Price: Low to High</option>
                                <option value="-price">Price: High to Low</option>
                                <option value="-created_at">Newest First</option>
                                <option value="name">Name: A to Z</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button onClick={applyFilters}>Apply Filters</Button>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {searchQuery && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-2">
                                Search: {searchQuery}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearchQuery(''); applyFilters(); }} />
                            </span>
                        )}
                        {selectedCategory && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                Category: {categories.find(c => c.id == selectedCategory)?.name}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => { setSelectedCategory(''); applyFilters(); }} />
                            </span>
                        )}
                        {(minPrice || maxPrice) && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                                Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => { setMinPrice(''); setMaxPrice(''); applyFilters(); }} />
                            </span>
                        )}
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-600">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg mb-2">No products found</p>
                        <p className="text-slate-400 mb-4">Try adjusting your filters</p>
                        {hasActiveFilters && (
                            <Button onClick={clearFilters}>Clear Filters</Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductListingPage;
