
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Tag, Edit } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CodesManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    // Data for selectors
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase_amount: '0',
        valid_from: '',
        valid_to: '',
        is_active: true,
        applicability_type: 'site_wide',
        specific_products: [],
        specific_categories: []
    });

    useEffect(() => {
        fetchCoupons();
        fetchMetadata();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/promotions/coupons/');
            setCoupons(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load coupons');
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/products/categories/'),
                api.get('/products/') // Note: This might be paginated, fetching first page. Ideal is a non-paginated 'select' endpoint.
            ]);
            setCategories(catRes.data);
            setProducts(prodRes.data.results || prodRes.data);
        } catch (error) {
            console.error("Failed to load metadata", error);
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await api.delete(`/promotions/coupons/${id}/`);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleToggleStatus = async (coupon) => {
        try {
            await api.patch(`/promotions/coupons/${coupon.id}/`, {
                is_active: !coupon.is_active
            });
            toast.success('Status updated');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleMultiSelectChange = (e, field) => {
        const options = e.target.options;
        const value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCoupon) {
                await api.put(`/promotions/coupons/${editingCoupon.id}/`, formData);
                toast.success('Coupon updated successfully');
            } else {
                await api.post('/promotions/coupons/', formData);
                toast.success('Coupon created successfully');
            }
            setShowModal(false);
            setEditingCoupon(null);
            fetchCoupons();
            setFormData({
                code: '',
                description: '',
                discount_type: 'percentage',
                discount_value: '',
                min_purchase_amount: '0',
                valid_from: '',
                valid_to: '',
                is_active: true,
                applicability_type: 'site_wide',
                specific_products: [],
                specific_categories: []
            });
        } catch (error) {
            console.error(error);
            toast.error(editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon');
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_purchase_amount: coupon.min_purchase_amount || '0',
            valid_from: coupon.valid_from?.slice(0, 16) || '',
            valid_to: coupon.valid_to?.slice(0, 16) || '',
            is_active: coupon.is_active,
            applicability_type: coupon.applicability_type,
            specific_products: coupon.specific_products || [],
            specific_categories: coupon.specific_categories || []
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Tag className="w-5 h-5" /> Coupon Codes
                    </h3>
                    <p className="text-sm text-gray-500">Manage discount codes and promotions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> Add Coupon
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-sm font-medium text-gray-500">
                            <th className="px-6 py-3">Code</th>
                            <th className="px-6 py-3">Discount</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Valid Until</th>
                            <th className="px-6 py-3">Usage</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {coupons.map(coupon => (
                            <tr key={coupon.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium font-mono text-blue-600">{coupon.code}</td>
                                <td className="px-6 py-4">
                                    {coupon.discount_type === 'percentage'
                                        ? `${coupon.discount_value}% OFF`
                                        : `₹${coupon.discount_value} OFF`
                                    }
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                    {coupon.applicability_type.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(coupon.valid_to).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {coupon.times_used} / {coupon.usage_limit || '∞'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleStatus(coupon)}
                                        className={`px-2 py-1 rounded text-xs transition-colors ${coupon.is_active
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => handleEdit(coupon)}
                                            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-8">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{editingCoupon ? 'Edit' : 'Create New'} Coupon</h2>
                            <button onClick={() => { setShowModal(false); setEditingCoupon(null); }}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border rounded px-3 py-2 font-mono uppercase"
                                    placeholder="e.g., SUMMER25"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="e.g., Summer Sale Discount"
                                    required
                                />
                            </div>

                            {/* Applicability Section */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Applicability</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={formData.applicability_type === 'site_wide'}
                                            onChange={() => setFormData({ ...formData, applicability_type: 'site_wide' })}
                                        /> Site Wide
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={formData.applicability_type === 'specific_products'}
                                            onChange={() => setFormData({ ...formData, applicability_type: 'specific_products' })}
                                        /> Specific Products (Discount applies to selected items only)
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={formData.applicability_type === 'specific_categories'}
                                            onChange={() => setFormData({ ...formData, applicability_type: 'specific_categories' })}
                                        /> Specific Categories
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={formData.applicability_type === 'new_user'}
                                            onChange={() => setFormData({ ...formData, applicability_type: 'new_user' })}
                                        /> New Users Only
                                    </label>
                                </div>
                            </div>

                            {formData.applicability_type === 'specific_products' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Products (Hold Ctrl/Cmd for multiple)</label>
                                    <select
                                        multiple
                                        className="w-full border rounded p-2 h-32"
                                        onChange={(e) => handleMultiSelectChange(e, 'specific_products')}
                                    >
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.applicability_type === 'specific_categories' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Categories (Hold Ctrl/Cmd for multiple)</label>
                                    <select
                                        multiple
                                        className="w-full border rounded p-2 h-32"
                                        onChange={(e) => handleMultiSelectChange(e, 'specific_categories')}
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}


                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Value</label>
                                    <input
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Valid From</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_from}
                                        onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Valid Until</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.valid_to}
                                        onChange={e => setFormData({ ...formData, valid_to: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Min. Order Value (₹)</label>
                                <input
                                    type="number"
                                    value={formData.min_purchase_amount}
                                    onChange={e => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowModal(false); setEditingCoupon(null); }} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingCoupon ? 'Update' : 'Create'} Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodesManager;
