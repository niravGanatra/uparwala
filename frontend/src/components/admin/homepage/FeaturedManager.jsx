import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Star, Clock } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const FeaturedManager = () => {
    const [categories, setCategories] = useState([]);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedContent();
    }, []);

    const fetchFeaturedContent = async () => {
        try {
            const [catRes, dealRes] = await Promise.all([
                api.get('/homepage/categories/'),
                api.get('/homepage/deals/')
            ]);
            setCategories(catRes.data);
            setDeals(dealRes.data);
        } catch (error) {
            toast.error('Failed to load featured content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Featured Categories */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Featured Categories
                    </h3>
                    <button className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="p-4 border rounded hover:bg-gray-50 text-center">
                            <img src={cat.image} alt={cat.category_name} className="w-16 h-16 object-cover rounded-full mx-auto mb-2" />
                            <h4 className="font-medium">{cat.category_name}</h4>
                            <div className="mt-2 flex justify-center gap-2">
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="col-span-4 text-center text-gray-500 py-4">No featured categories</p>}
                </div>
            </div>

            {/* Deals of the Day */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" />
                        Deals of the Day
                    </h3>
                    <button className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Add Deal
                    </button>
                </div>

                <div className="space-y-4">
                    {deals.map((deal) => (
                        <div key={deal.id} className="flex items-center gap-4 p-4 border rounded hover:bg-gray-50">
                            <img src={deal.image} alt={deal.title} className="w-20 h-20 object-cover rounded" />
                            <div className="flex-1">
                                <h4 className="font-medium">{deal.title}</h4>
                                <p className="text-sm text-gray-500">Expires: {new Date(deal.end_time).toLocaleString()}</p>
                                <div className="mt-1 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-orange-600">₹{deal.discount_price}</span>
                                    {deal.original_price && <span className="line-through text-gray-400">₹{deal.original_price}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {deals.length === 0 && <p className="text-center text-gray-500 py-4">No active deals</p>}
                </div>
            </div>
        </div>
    );
};

export default FeaturedManager;
