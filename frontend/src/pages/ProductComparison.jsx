import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Plus, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProductComparison = () => {
    const navigate = useNavigate();
    const [comparison, setComparison] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComparison();
    }, []);

    const fetchComparison = async () => {
        try {
            const response = await api.get('/products/compare/details/');
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Failed to fetch comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeProduct = async (productId) => {
        try {
            await api.delete(`/products/compare/remove/${productId}/`);
            setProducts(products.filter(p => p.id !== productId));
            toast.success('Product removed from comparison');
        } catch (error) {
            toast.error('Failed to remove product');
        }
    };

    const addToCart = async (productId) => {
        try {
            await api.post('/orders/cart/add/', { product_id: productId, quantity: 1 });
            toast.success('Added to cart');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Product Comparison</h1>
                    <p className="text-gray-600 mb-8">No products to compare yet</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    // Get all unique attributes
    const allAttributes = {};
    products.forEach(product => {
        product.attributes?.forEach(attr => {
            if (!allAttributes[attr.name]) {
                allAttributes[attr.name] = {};
            }
            allAttributes[attr.name][product.id] = attr.value;
        });
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Compare Products</h1>
                    <button
                        onClick={() => navigate('/products')}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add More Products
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 text-left bg-gray-50 sticky left-0 z-10">Feature</th>
                                {products.map(product => (
                                    <th key={product.id} className="p-4 min-w-64">
                                        <div className="relative">
                                            <button
                                                onClick={() => removeProduct(product.id)}
                                                className="absolute top-0 right-0 text-gray-400 hover:text-red-600"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <img
                                                src={product.images?.[0]?.image || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-full h-48 object-cover rounded-lg mb-3"
                                            />
                                            <h3 className="font-semibold text-left">{product.name}</h3>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Price */}
                            <tr className="border-b">
                                <td className="p-4 font-medium bg-gray-50 sticky left-0">Price</td>
                                {products.map(product => (
                                    <td key={product.id} className="p-4">
                                        <div className="text-2xl font-bold text-blue-600">₹{product.price}</div>
                                        {product.regular_price > product.price && (
                                            <div className="text-sm text-gray-500 line-through">₹{product.regular_price}</div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Brand */}
                            <tr className="border-b">
                                <td className="p-4 font-medium bg-gray-50 sticky left-0">Brand</td>
                                {products.map(product => (
                                    <td key={product.id} className="p-4">{product.brand?.name || 'N/A'}</td>
                                ))}
                            </tr>

                            {/* Rating */}
                            <tr className="border-b">
                                <td className="p-4 font-medium bg-gray-50 sticky left-0">Rating</td>
                                {products.map(product => (
                                    <td key={product.id} className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-500">★</span>
                                            <span>{product.average_rating || 0}/5</span>
                                            <span className="text-sm text-gray-500">({product.review_count || 0})</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Stock */}
                            <tr className="border-b">
                                <td className="p-4 font-medium bg-gray-50 sticky left-0">Availability</td>
                                {products.map(product => (
                                    <td key={product.id} className="p-4">
                                        <span className={`px-2 py-1 rounded text-sm ${product.stock_status === 'instock'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Attributes */}
                            {Object.entries(allAttributes).map(([attrName, values]) => (
                                <tr key={attrName} className="border-b">
                                    <td className="p-4 font-medium bg-gray-50 sticky left-0">{attrName}</td>
                                    {products.map(product => (
                                        <td key={product.id} className="p-4">
                                            {values[product.id] || 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Actions */}
                            <tr>
                                <td className="p-4 font-medium bg-gray-50 sticky left-0">Actions</td>
                                {products.map(product => (
                                    <td key={product.id} className="p-4">
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => addToCart(product.id)}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => navigate(`/products/${product.slug}`)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                                            >
                                                View Details
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductComparison;
