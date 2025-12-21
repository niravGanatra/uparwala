import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    Percent, Edit, Save, X, Search, Tag
} from 'lucide-react';

const CommissionSettings = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editRate, setEditRate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;

            const response = await api.get('/products/admin/commission/categories/', { params });
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setEditRate(category.commission_rate);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditRate('');
    };

    const handleSave = async (categoryId) => {
        if (!editRate || editRate < 0 || editRate > 100) {
            toast.error('Commission rate must be between 0 and 100');
            return;
        }

        try {
            await api.patch(`/products/admin/commission/categories/${categoryId}/`, {
                commission_rate: parseFloat(editRate)
            });

            toast.success('Commission rate updated successfully');
            setEditingId(null);
            setEditRate('');
            fetchCategories();
        } catch (error) {
            console.error('Failed to update commission:', error);
            toast.error(error.response?.data?.error || 'Failed to update commission');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Category Commission Settings</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Manage commission rates for product categories</p>
                </div>

                {/* Category Commission Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Tag className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-bold">Category Commission Rates</h2>
                            </div>
                            <div className="text-sm text-gray-600">
                                {categories.length} categories
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter') {
                                        fetchCategories();
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                            No categories found
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{category.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingId === category.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={editRate}
                                                            onChange={(e) => setEditRate(e.target.value)}
                                                            className="w-24 px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500"
                                                            autoFocus
                                                        />
                                                        <span className="text-gray-600">%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-semibold text-blue-600">
                                                        {category.commission_rate}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingId === category.id ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSave(category.id)}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-3 py-1 border rounded hover:bg-gray-50 text-sm flex items-center gap-1"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Info Footer */}
                    <div className="p-4 bg-blue-50 border-t">
                        <div className="flex items-start gap-2">
                            <Percent className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-gray-700">
                                <p className="font-medium">Commission Rate Range: 0% - 100%</p>
                                <p className="text-gray-600 mt-1">
                                    Commission rates are applied to all products within each category.
                                    The commission is calculated based on the product's sale price.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionSettings;
