import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    Truck, Plus, Edit2, Trash2, X, Check, Save, Package, Settings, Gift, DollarSign
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

// Sub-component: Global Shipping Settings (Free Shipping Threshold)
const GlobalShippingSettings = () => {
    const [settings, setSettings] = useState({
        free_shipping_threshold: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/payments/shipping-settings/');
            setSettings({
                free_shipping_threshold: response.data.free_shipping_threshold || ''
            });
        } catch (error) {
            console.error('Failed to load shipping settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/payments/shipping-settings/', {
                free_shipping_threshold: settings.free_shipping_threshold || null
            });
            toast.success('Shipping settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleClearThreshold = async () => {
        setSettings({ free_shipping_threshold: '' });
        setSaving(true);
        try {
            await api.put('/payments/shipping-settings/', {
                free_shipping_threshold: null
            });
            toast.success('Free shipping disabled - will always charge shipping');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    Free Shipping Configuration
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Set a minimum order amount for free shipping. Leave empty to always charge shipping.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Free Shipping Threshold (₹)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={settings.free_shipping_threshold}
                                onChange={e => setSettings({ free_shipping_threshold: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                placeholder="e.g. 2000 (leave empty to always charge)"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Orders above this amount will get free shipping. Set to empty to disable free shipping.
                        </p>
                    </div>

                    {/* Current Status */}
                    <div className={`p-4 rounded-lg ${settings.free_shipping_threshold ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            {settings.free_shipping_threshold ? (
                                <>
                                    <Check className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-800">Free shipping enabled</p>
                                        <p className="text-sm text-green-600">Orders above ₹{settings.free_shipping_threshold} get free shipping</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Truck className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-800">Always charge shipping</p>
                                        <p className="text-sm text-gray-600">Shipping fees apply to all orders</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                        {settings.free_shipping_threshold && (
                            <button
                                type="button"
                                onClick={handleClearThreshold}
                                disabled={saving}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Disable Free Shipping
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const ShippingSettings = () => {
    const [activeTab, setActiveTab] = useState('global');

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                            <Truck className="w-6 h-6" />
                            Shipping Settings
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b mb-6">
                    <button
                        className={`pb-2 px-4 font-medium ${activeTab === 'global' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('global')}
                    >
                        Global Settings
                    </button>
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

                {activeTab === 'global' && <GlobalShippingSettings />}
                {activeTab === 'zones' && <ShippingZonesManager />}
                {activeTab === 'shiprocket' && <ShiprocketManager />}
            </div>
        </div>
    );
};

export default ShippingSettings;
