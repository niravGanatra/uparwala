import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import { useAnalytics } from '../hooks/useAnalytics';

const SearchBar = ({ onSearch, showFilters = true }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const { trackEvent } = useAnalytics();
    const [filters, setFilters] = useState({
        category: '',
        min_price: '',
        max_price: '',
        min_rating: '',
        in_stock: false,
        featured: false,
        sort: '-created_at'
    });
    const [filterOptions, setFilterOptions] = useState(null);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        if (query.length >= 2) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [query]);

    const fetchFilterOptions = async () => {
        try {
            const response = await api.get('/products/filter-options/');
            setFilterOptions(response.data);
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const response = await api.get(`/products/autocomplete/?q=${query}`);
            setSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        trackEvent('search', { query, results_count: 0 });
        onSearch({ q: query, ...filters });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onSearch({ q: query, ...newFilters });
    };

    const clearFilters = () => {
        const clearedFilters = {
            category: '',
            min_price: '',
            max_price: '',
            min_rating: '',
            in_stock: false,
            featured: false,
            sort: '-created_at'
        };
        setFilters(clearedFilters);
        onSearch({ q: query, ...clearedFilters });
    };

    return (
        <div className="relative">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Search for products..."
                        className="w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                            {suggestions.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => {
                                        window.location.href = `/products/${product.slug}`;
                                    }}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                >
                                    {product.image && (
                                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-gray-600">₹{product.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Search
                </button>

                {showFilters && (
                    <button
                        type="button"
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className="px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        Filters
                    </button>
                )}
            </form>

            {/* Filter Panel */}
            {showFilterPanel && showFilters && filterOptions && (
                <div className="mt-4 p-6 bg-white border rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Filters</h3>
                        <button
                            onClick={() => setShowFilterPanel(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">All Categories</option>
                                {filterOptions.categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Price Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.min_price}
                                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.max_price}
                                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Range: ₹{filterOptions.price_range.min} - ₹{filterOptions.price_range.max}
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                            <select
                                value={filters.min_rating}
                                onChange={(e) => handleFilterChange('min_rating', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">Any Rating</option>
                                {filterOptions.ratings.reverse().map((rating) => (
                                    <option key={rating} value={rating}>{rating}+ Stars</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="-created_at">Newest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="popularity">Most Popular</option>
                                <option value="name">Name: A to Z</option>
                            </select>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filters.in_stock}
                                    onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">In Stock Only</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filters.featured}
                                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Featured Products</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
