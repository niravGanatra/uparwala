import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, MapPin } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CODManager = () => {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPincode, setNewPincode] = useState('');

    useEffect(() => {
        fetchPincodes();
    }, []);

    const fetchPincodes = async () => {
        try {
            const response = await api.get('/orders/admin/cod-pincodes/');
            setPincodes(response.data);
        } catch (error) {
            toast.error('Failed to load pincodes');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPincode = async (e) => {
        e.preventDefault();
        if (!newPincode) return;

        try {
            const response = await api.post('/orders/admin/cod-pincodes/', {
                pincode: newPincode,
                is_active: true
            });
            setPincodes([response.data, ...pincodes]);
            setNewPincode('');
            toast.success('Pincode added');
        } catch (error) {
            toast.error('Failed to add pincode');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/orders/admin/cod-pincodes/${id}/`);
            setPincodes(pincodes.filter(p => p.id !== id));
            toast.success('Pincode deleted');
        } catch (error) {
            toast.error('Failed to delete pincode');
        }
    };

    const toggleStatus = async (pincode) => {
        try {
            const response = await api.patch(`/orders/admin/cod-pincodes/${pincode.id}/`, {
                is_active: !pincode.is_active
            });
            setPincodes(pincodes.map(p => p.id === pincode.id ? response.data : p));
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    COD Available Pincodes
                </h3>
                <form onSubmit={handleAddPincode} className="flex gap-2">
                    <input
                        type="text"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="Enter Pincode"
                        className="px-3 py-2 border rounded-md text-sm"
                        maxLength="6"
                    />
                    <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </form>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left">Pincode</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {pincodes.map((pin) => (
                            <tr key={pin.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{pin.pincode}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleStatus(pin)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${pin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {pin.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => handleDelete(pin.id)} className="text-red-600 hover:text-red-800">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pincodes.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                    No active COD pincodes found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CODManager;
