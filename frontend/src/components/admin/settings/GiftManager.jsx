import { useState, useEffect } from 'react';
import { Plus, Trash2, Gift } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const GiftManager = () => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newData, setNewData] = useState({ name: '', price: '', description: '', is_active: true });

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const response = await api.get('/orders/admin/gift-options/');
            setOptions(response.data);
        } catch (error) {
            toast.error('Failed to load gift options');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/orders/admin/gift-options/', newData);
            setOptions([response.data, ...options]);
            setShowForm(false);
            setNewData({ name: '', price: '', description: '', is_active: true });
            toast.success('Gift option added');
        } catch (error) {
            toast.error('Failed to add gift option');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/orders/admin/gift-options/${id}/`);
            setOptions(options.filter(o => o.id !== id));
            toast.success('Gift option deleted');
        } catch (error) {
            toast.error('Failed to delete gift option');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    Gift Wrapping Options
                </h3>
                <button onClick={() => setShowForm(!showForm)} className="bg-orange-600 text-white px-3 py-2 rounded-md hover:bg-orange-700 flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Option
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Option Name (e.g. Premium Paper)"
                            value={newData.name}
                            onChange={e => setNewData({ ...newData, name: e.target.value })}
                            className="px-3 py-2 border rounded"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            value={newData.price}
                            onChange={e => setNewData({ ...newData, price: e.target.value })}
                            className="px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <textarea
                        placeholder="Description"
                        value={newData.description}
                        onChange={e => setNewData({ ...newData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        rows="2"
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Save</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {options.map((opt) => (
                    <div key={opt.id} className="border rounded-lg p-4 flex justify-between items-start hover:shadow-sm bg-white">
                        <div>
                            <h4 className="font-medium">{opt.name}</h4>
                            <p className="text-lg font-bold text-orange-600">₹{opt.price}</p>
                            <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                        </div>
                        <button onClick={() => handleDelete(opt.id)} className="text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {options.length === 0 && <p className="col-span-3 text-center text-gray-500 py-8 border border-dashed rounded-lg">No gift options available</p>}
            </div>
        </div>
    );
};

export default GiftManager;
