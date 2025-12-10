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
        <section className="py-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-yellow-600" />
                    Recently Viewed
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            to={`/products/${product.slug}`}
                            className="block group"
                        >
                            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-yellow-400 hover:shadow-xl transition-all">
                                <div className="relative aspect-square bg-slate-50">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0].image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-slate-400">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium text-slate-900 mb-1 line-clamp-2 text-sm">
                                        {product.name}
                                    </h3>
                                    <p className="text-lg font-bold text-slate-900">
                                        ₹{product.price}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
