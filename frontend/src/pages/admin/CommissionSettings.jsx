import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    DollarSign, Plus, Edit, Trash2, Save, X, Search
} from 'lucide-react';

const CommissionSettings = () => {
    const [globalCommission, setGlobalCommission] = useState(null);
    const [vendorCommissions, setVendorCommissions] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingGlobal, setEditingGlobal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form states
    const [globalRate, setGlobalRate] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [vendorRate, setVendorRate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchGlobalCommission();
        fetchVendorCommissions();
        fetchVendors();
    }, []);

    const fetchGlobalCommission = async () => {
        try {
            const response = await api.get('/products/admin/commission/global/');
            setGlobalCommission(response.data);
            setGlobalRate(response.data.commission_rate || '10');
        } catch (error) {
            console.error('Failed to fetch global commission:', error);
        }
    };

    const fetchVendorCommissions = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;

            const response = await api.get('/products/admin/commission/vendors/', { params });
            setVendorCommissions(response.data);
        } catch (error) {
            console.error('Failed to fetch vendor commissions:', error);
            toast.error('Failed to load vendor commissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await api.get('/vendors/admin/vendors/');
            setVendors(response.data);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        }
    };

    const handleUpdateGlobal = async () => {
        if (!globalRate || globalRate < 0 || globalRate > 100) {
            toast.error('Commission rate must be between 0 and 100');
            return;
        }

        try {
            await api.post('/products/admin/commission/global/', {
                commission_rate: parseFloat(globalRate)
            });

            toast.success('Global commission updated successfully');
            setEditingGlobal(false);
            fetchGlobalCommission();
        } catch (error) {
            console.error('Failed to update global commission:', error);
            toast.error(error.response?.data?.error || 'Failed to update commission');
        }
    };

    const handleAddVendorCommission = async () => {
        if (!selectedVendor || !vendorRate || vendorRate < 0 || vendorRate > 100) {
            toast.error('Please select a vendor and enter a valid commission rate');
            return;
        }

        try {
            await api.post('/products/admin/commission/vendors/create/', {
                vendor_id: selectedVendor,
                commission_rate: parseFloat(vendorRate)
            });

            toast.success('Vendor commission created successfully');
            setShowAddModal(false);
            setSelectedVendor('');
            setVendorRate('');
            fetchVendorCommissions();
        } catch (error) {
            console.error('Failed to create vendor commission:', error);
            toast.error(error.response?.data?.error || 'Failed to create commission');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/products/admin/commission/vendors/${id}/`, {
                is_active: !currentStatus
            });

            toast.success(`Commission ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchVendorCommissions();
        } catch (error) {
            console.error('Failed to toggle commission:', error);
            toast.error('Failed to update commission status');
        }
    };

    const handleDeleteCommission = async (id) => {
        if (!confirm('Are you sure you want to delete this commission setting?')) {
            return;
        }

        try {
            await api.delete(`/products/admin/commission/vendors/${id}/delete/`);
            toast.success('Commission deleted successfully');
            fetchVendorCommissions();
        } catch (error) {
            console.error('Failed to delete commission:', error);
            toast.error('Failed to delete commission');
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Commission Settings</h1>
                <p className="text-gray-600 mt-1">Manage global and vendor-specific commission rates</p>
            </div>

            {/* Global Commission Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-bold">Global Commission Rate</h2>
                            <p className="text-sm text-gray-600">Default rate for all vendors</p>
                        </div>
                    </div>
                    {!editingGlobal && (
                        <button
                            onClick={() => setEditingGlobal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>

                {editingGlobal ? (
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commission Rate (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={globalRate}
                                onChange={(e) => setGlobalRate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter commission rate"
                            />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleUpdateGlobal}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setEditingGlobal(false);
                                    setGlobalRate(globalCommission?.commission_rate || '10');
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">
                            {globalCommission?.commission_rate || '10'}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Applied to vendors without specific overrides
                        </p>
                    </div>
                )}
            </div>

            {/* Vendor-Specific Commissions */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Vendor-Specific Commissions</h2>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Override
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                fetchVendorCommissions();
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : vendorCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No vendor-specific commissions set
                                    </td>
                                </tr>
                            ) : (
                                vendorCommissions.map((commission) => (
                                    <tr key={commission.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{commission.vendor_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-semibold text-blue-600">
                                                {commission.commission_rate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(commission.id, commission.is_active)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${commission.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${commission.is_active ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className={`ml-2 text-sm ${commission.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                                                {commission.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(commission.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteCommission(commission.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Vendor Commission Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg max-w-md w-full p-6"
                    >
                        <h2 className="text-2xl font-bold mb-4">Add Vendor Commission</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Vendor *
                                </label>
                                <select
                                    value={selectedVendor}
                                    onChange={(e) => setSelectedVendor(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Choose a vendor...</option>
                                    {vendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.id}>
                                            {vendor.store_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Commission Rate (%) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={vendorRate}
                                    onChange={(e) => setVendorRate(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter commission rate"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleAddVendorCommission}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Create Commission
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedVendor('');
                                    setVendorRate('');
                                }}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CommissionSettings;
