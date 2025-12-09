import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import api from '../services/api';

const RecentlyViewed = ({ limit = 10 }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentlyViewed();
    }, []);

    const fetchRecentlyViewed = async () => {
        try {
            const response = await api.get(`/products/recently-viewed/?limit=${limit}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch recently viewed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || products.length === 0) return null;

    return (
        <div className="recently-viewed my-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="border rounded-lg p-3 hover:shadow-lg transition-shadow"
                    >
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0].image}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded mb-2"
                            />
                        ) : (
                            <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                            </div>
                        )}
                        <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                        <p className="text-lg font-bold text-blue-600 mt-1">
                            ₹{product.price}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
