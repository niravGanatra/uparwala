import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import api from '../services/api';
import ProductCard from './ProductCard';

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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;

