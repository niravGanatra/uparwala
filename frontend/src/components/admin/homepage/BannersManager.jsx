import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Image, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const BannersManager = () => {
    const [heroBanners, setHeroBanners] = useState([]);
    const [promoBanners, setPromoBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const [heroRes, promoRes] = await Promise.all([
                api.get('/homepage/banners/'),
                api.get('/homepage/promotions/')
            ]);
            setHeroBanners(heroRes.data);
            setPromoBanners(promoRes.data);
        } catch (error) {
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    // Generic handler for creating/updating/deleting banners would go here
    // For brevity in this initial setup, I'll focus on structure.
    // In a real implementation, we'd have forms for file upload.

    return (
        <div className="space-y-8">
            {/* Hero Banners Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Hero Sliders</h3>
                    <button className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Add Slide
                    </button>
                </div>

                <div className="space-y-4">
                    {heroBanners.map((banner) => (
                        <div key={banner.id} className="flex items-center gap-4 p-4 border rounded hover:bg-gray-50">
                            <img src={banner.desktop_image} alt={banner.title} className="w-24 h-16 object-cover rounded" />
                            <div className="flex-1">
                                <h4 className="font-medium">{banner.title}</h4>
                                <p className="text-sm text-gray-500">{banner.link}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                    {banner.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {heroBanners.length === 0 && <p className="text-center text-gray-500">No active sliders</p>}
                </div>
            </div>

            {/* Promotional Banners Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Promotional Banners</h3>
                    <button className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Add Promotion
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {promoBanners.map((banner) => (
                        <div key={banner.id} className="p-4 border rounded hover:bg-gray-50">
                            <img src={banner.image} alt={banner.alt_text} className="w-full h-32 object-cover rounded mb-2" />
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{banner.alt_text}</h4>
                                    <p className="text-sm text-gray-500">{banner.link}</p>
                                </div>
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {promoBanners.length === 0 && <p className="col-span-2 text-center text-gray-500 py-4">No promotional banners</p>}
                </div>
            </div>
        </div>
    );
};

export default BannersManager;
