import { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, Award } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const SectionsManager = () => {
    const [hosting, setHosting] = useState([]);
    const [premium, setPremium] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const [hostRes, premRes] = await Promise.all([
                api.get('/homepage/hosting/'),
                api.get('/homepage/premium/')
            ]);
            setHosting(hostRes.data);
            setPremium(premRes.data);
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Hosting Essentials */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Layout className="w-5 h-5 text-purple-500" />
                        Hosting Essentials
                    </h3>
                    <button className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {hosting.map((item) => (
                        <div key={item.id} className="p-4 border rounded hover:bg-gray-50">
                            <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded mb-2" />
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{item.category_name}</p>
                            <div className="mt-2 flex justify-end">
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {hosting.length === 0 && <p className="col-span-4 text-center text-gray-500 py-4">No items in Hosting Essentials</p>}
                </div>
            </div>

            {/* Premium Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        Premium Collections
                    </h3>
                    <button className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700">
                        <Plus className="w-4 h-4" /> Add Collection
                    </button>
                </div>

                <div className="space-y-4">
                    {premium.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded hover:bg-gray-50">
                            <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded" />
                            <div className="flex-1">
                                <h4 className="font-medium text-lg">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.description}</p>
                                <p className="text-xs text-orange-600 mt-1">{item.cta_text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {premium.length === 0 && <p className="text-center text-gray-500 py-4">No premium collections</p>}
                </div>
            </div>
        </div>
    );
};

export default SectionsManager;
