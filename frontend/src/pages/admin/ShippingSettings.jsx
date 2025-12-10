import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    Truck, Plus, Edit2, Trash2, X, Check, Save, Package, Settings
} from 'lucide-react';

// Sub-component: Shipping Zones Manager
const ShippingZonesManager = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        states: '',
        base_rate: '',
        per_kg_rate: '',
        free_shipping_threshold: '',
        is_active: true
    });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const response = await api.get('/payments/shipping-zones/');
            setZones(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load shipping zones');
            setLoading(false);
        }
    };

    const handleEdit = (zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            states: zone.states.join(', '),
            base_rate: zone.base_rate,
            per_kg_rate: zone.per_kg_rate,
            free_shipping_threshold: zone.free_shipping_threshold || '',
            is_active: zone.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this zone?')) return;
        try {
            await api.delete(`/payments/shipping-zones/${id}/`);
            toast.success('Zone deleted');
            fetchZones();
        } catch (error) {
            toast.error('Failed to delete zone');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const statesList = formData.states.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
        const payload = {
            ...formData,
            states: statesList,
            free_shipping_threshold: formData.free_shipping_threshold || null
        };

        try {
            if (editingZone) {
                await api.put(`/payments/shipping-zones/${editingZone.id}/`, payload);
                toast.success('Zone updated');
            } else {
                await api.post('/payments/shipping-zones/', payload);
                toast.success('Zone created');
            }
            setShowModal(false);
            setEditingZone(null);
            fetchZones();
            setFormData({ name: '', states: '', base_rate: '', per_kg_rate: '', free_shipping_threshold: '', is_active: true });
        } catch (error) {
            toast.error('Failed to save zone');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold">Regional Shipping Rates</h2>
                    <p className="text-sm text-gray-500">Define custom rates based on states</p>
                </div>
                <button
                    onClick={() => {
                        setEditingZone(null);
                        setFormData({ name: '', states: '', base_rate: '', per_kg_rate: '', free_shipping_threshold: '', is_active: true });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> Add Zone
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-sm font-medium text-gray-500">
                            <th className="px-6 py-3">Zone Name</th>
                            <th className="px-6 py-3">States</th>
                            <th className="px-6 py-3">Base Rate</th>
                            <th className="px-6 py-3">Per Kg</th>
                            <th className="px-6 py-3">Free Limit</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {zones.map(zone => (
                            <tr key={zone.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{zone.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={zone.states.join(', ')}>{zone.states.join(', ')}</td>
                                <td className="px-6 py-4">₹{zone.base_rate}</td>
                                <td className="px-6 py-4">₹{zone.per_kg_rate}</td>
                                <td className="px-6 py-4">{zone.free_shipping_threshold ? `₹${zone.free_shipping_threshold}` : '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${zone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {zone.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(zone)} className="text-blue-600 hover:bg-blue-50 p-1 rounded mr-2"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(zone.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{editingZone ? 'Edit Zone' : 'Add New Zone'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">States (Codes)</label>
                                <input type="text" value={formData.states} onChange={e => setFormData({ ...formData, states: e.target.value })} className="w-full border rounded px-3 py-2" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Base Rate</label>
                                    <input type="number" value={formData.base_rate} onChange={e => setFormData({ ...formData, base_rate: e.target.value })} className="w-full border rounded px-3 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Per Kg</label>
                                    <input type="number" value={formData.per_kg_rate} onChange={e => setFormData({ ...formData, per_kg_rate: e.target.value })} className="w-full border rounded px-3 py-2" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Free Shipping Above</label>
                                <input type="number" value={formData.free_shipping_threshold} onChange={e => setFormData({ ...formData, free_shipping_threshold: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component: Shiprocket Manager
const ShiprocketManager = () => {
    const [config, setConfig] = useState({
        email: '',
        password: '',
        pickup_location: '',
        is_active: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get('/orders/manage/shiprocket-config/');
            if (response.data && response.data.email) {
                // Don't populate password
                setConfig({ ...response.data, password: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/orders/manage/shiprocket-config/', config);
            toast.success('Shiprocket configuration saved');
        } catch (error) {
            toast.error('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" /> Shiprocket API Configuration
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email / Username</label>
                        <input
                            type="email"
                            value={config.email}
                            onChange={e => setConfig({ ...config, email: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={config.password}
                            onChange={e => setConfig({ ...config, password: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            placeholder={config.id ? "Leave empty to keep unchanged" : ""}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Pickup Location ID / Name</label>
                    <input
                        type="text"
                        value={config.pickup_location}
                        onChange={e => setConfig({ ...config, pickup_location: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                        helperText="Exact name of pickup location in Shiprocket"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="sr_active"
                        checked={config.is_active}
                        onChange={e => setConfig({ ...config, is_active: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <label htmlFor="sr_active">Enable Shiprocket Integration</label>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
};

const ShippingSettings = () => {
    const [activeTab, setActiveTab] = useState('zones');

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck className="w-6 h-6" />
                        Shipping Settings
                    </h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
                <button
                    className={`pb-2 px-4 font-medium ${activeTab === 'zones' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('zones')}
                >
                    Shipping Zones
                </button>
                <button
                    className={`pb-2 px-4 font-medium ${activeTab === 'shiprocket' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('shiprocket')}
                >
                    Shiprocket Integration
                </button>
            </div>

            {activeTab === 'zones' ? <ShippingZonesManager /> : <ShiprocketManager />}
        </div>
    );
};

export default ShippingSettings;
