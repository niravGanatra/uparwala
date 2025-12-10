import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    FolderTree, Plus, Edit2, Trash2, X, Save
} from 'lucide-react';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Form State with Metadata
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        display_type: 'default',
        parent: '',
        commission_rate: 5.00
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/manage/categories/');
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load categories');
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            display_type: cat.display_type || 'default',
            parent: cat.parent || '',
            commission_rate: cat.commission_rate
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/products/manage/categories/${id}/`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            parent: formData.parent || null
        };

        try {
            if (editingCategory) {
                await api.put(`/products/manage/categories/${editingCategory.id}/`, payload);
                toast.success('Category updated');
            } else {
                await api.post('/products/manage/categories/', payload);
                toast.success('Category created');
            }
            setShowModal(false);
            setEditingCategory(null);
            fetchCategories();
            setFormData({ name: '', slug: '', description: '', display_type: 'default', parent: '', commission_rate: 5.00 });
        } catch (error) {
            console.error(error);
            toast.error('Operation failed');
        }
    };

    // Helper to generate slug
    const handleNameChange = (e) => {
        const val = e.target.value;
        if (!editingCategory) {
            const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            setFormData(prev => ({ ...prev, name: val, slug }));
        } else {
            setFormData(prev => ({ ...prev, name: val }));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FolderTree className="w-6 h-6" />
                        Product Categories
                    </h1>
                    <p className="text-gray-500">Manage hierarchy and display options</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', slug: '', description: '', display_type: 'default', parent: '', commission_rate: 5.00 });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-sm font-medium text-gray-500">
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Slug</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Display Type</th>
                            <th className="px-6 py-3">Parent</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{cat.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{cat.slug}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{cat.description}</td>
                                <td className="px-6 py-4 text-sm capitalize">{cat.display_type}</td>
                                <td className="px-6 py-4 text-sm">
                                    {cat.parent ? categories.find(c => c.id === cat.parent)?.name : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" required value={formData.name} onChange={handleNameChange} className="w-full border rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug</label>
                                    <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full border rounded px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded px-3 py-2"></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Parent Category</label>
                                    <select value={formData.parent} onChange={e => setFormData({ ...formData, parent: e.target.value })} className="w-full border rounded px-3 py-2">
                                        <option value="">None (Top Level)</option>
                                        {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Display Type</label>
                                    <select value={formData.display_type} onChange={e => setFormData({ ...formData, display_type: e.target.value })} className="w-full border rounded px-3 py-2">
                                        <option value="default">Default</option>
                                        <option value="products">Products</option>
                                        <option value="subcategories">Subcategories</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
                                <input type="number" step="0.01" min="2" max="10" value={formData.commission_rate} onChange={e => setFormData({ ...formData, commission_rate: e.target.value })} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
