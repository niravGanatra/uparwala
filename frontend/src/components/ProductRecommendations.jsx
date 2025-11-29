import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Star } from 'lucide-react';

const ProductRecommendations = ({ productId, type = 'similar' }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                let endpoint;
                if (type === 'similar' && productId) {
                    endpoint = `/products/${productId}/similar/`;
                } else if (type === 'personalized') {
                    endpoint = '/products/recommendations/';
                } else {
                    return;
                }

                const response = await api.get(endpoint);
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [productId, type]);

    if (loading || products.length === 0) return null;

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold mb-6">
                {type === 'similar' ? 'Similar Products' : 'Recommended for You'}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="group bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0].image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="p-3">
                            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600">
                                {product.name}
                            </h3>

                            <div className="flex items-center gap-1 mb-1">
                                <div className="flex text-yellow-400">
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                                <span className="text-xs text-gray-500">
                                    {product.average_rating} ({product.review_count})
                                </span>
                            </div>

                            <div className="font-bold text-gray-900">
                                ₹{product.price}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
