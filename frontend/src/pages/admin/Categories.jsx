import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Move CategoryForm outside to prevent recreation on every render
// Wrap with React.memo to prevent unnecessary re-renders
const CategoryForm = React.memo(({ formData, setFormData, onSubmit, submitText, categories, selectedCategory }) => {
    const handleNameChange = useCallback((e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, name: value }));
    }, []); // setFormData is stable, no need to include

    const handleSlugChange = useCallback((e) => {
        setFormData(prev => ({ ...prev, slug: e.target.value }));
    }, []);

    const handleParentChange = useCallback((e) => {
        setFormData(prev => ({ ...prev, parent: e.target.value }));
    }, []);

    const handleDescriptionChange = useCallback((e) => {
        setFormData(prev => ({ ...prev, description: e.target.value }));
    }, []);

    const handleCommissionChange = useCallback((e) => {
        setFormData(prev => ({ ...prev, commission_rate: e.target.value }));
    }, []);

    const handleNameBlur = useCallback(() => {
        // Auto-generate slug only when leaving the field, and only for new categories
        if (!selectedCategory && formData.name && !formData.slug) {
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [selectedCategory, formData.name, formData.slug]);

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <Input
                    value={formData.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    required
                    placeholder="Enter category name"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <Input
                    value={formData.slug}
                    onChange={handleSlugChange}
                    required
                    placeholder="category-slug"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Parent Category</label>
                <select
                    value={formData.parent}
                    onChange={handleParentChange}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="">None (Top Level)</option>
                    {categories.filter(cat => cat.id !== selectedCategory?.id).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Category description"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={handleCommissionChange}
                    placeholder="5.00"
                />
            </div>

            <div className="flex gap-2 justify-end">
                <Button type="submit">{submitText}</Button>
            </div>
        </form>
    );
});

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parent: '',
        commission_rate: '5.00'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            parent: '',
            commission_rate: '5.00'
        });
    };

    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            parent: category.parent || '',
            commission_rate: category.commission_rate || '5.00'
        });
        setIsEditModalOpen(true);
    };

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteCategory = async () => {
        try {
            await api.delete(`/products/manage/categories/${categoryToDelete.id}/`);
            toast.success('Category deleted successfully!');
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products/manage/categories/', formData);
            toast.success('Category added successfully!');
            setIsAddModalOpen(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Failed to add category:', error);
            toast.error(error.response?.data?.name?.[0] || 'Failed to add category');
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/products/manage/categories/${selectedCategory.id}/`, formData);
            toast.success('Category updated successfully!');
            setIsEditModalOpen(false);
            resetForm();
            setSelectedCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Failed to update category:', error);
            toast.error('Failed to update category');
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryHierarchy = (category) => {
        if (!category.parent) return category.name;
        const parent = categories.find(c => c.id === category.parent);
        return parent ? `${parent.name} > ${category.name}` : category.name;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Category Management</h1>
                    <p className="text-slate-600">Manage product categories and commission rates</p>
                </div>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-slate-500">Loading categories...</p>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderTree className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg mb-2">No categories found</p>
                            <p className="text-slate-400 mb-4">Start by adding your first category</p>
                            <Button onClick={() => setIsAddModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="pb-3 font-semibold text-slate-900">Category</th>
                                        <th className="pb-3 font-semibold text-slate-900">Slug</th>
                                        <th className="pb-3 font-semibold text-slate-900">Hierarchy</th>
                                        <th className="pb-3 font-semibold text-slate-900">Commission Rate</th>
                                        <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="border-b last:border-0">
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <FolderTree className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium">{category.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-slate-600">{category.slug}</td>
                                            <td className="py-4 text-slate-600 text-sm">
                                                {getCategoryHierarchy(category)}
                                            </td>
                                            <td className="py-4">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                                                    {category.commission_rate}%
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => confirmDelete(category)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Category Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                }}
                title="Add New Category"
                size="lg"
            >
                <CategoryForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAddCategory}
                    submitText="Add Category"
                    categories={categories}
                    selectedCategory={null}
                />
            </Modal>

            {/* Edit Category Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                    setSelectedCategory(null);
                }}
                title="Edit Category"
                size="lg"
            >
                <CategoryForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleUpdateCategory}
                    submitText="Update Category"
                    categories={categories}
                    selectedCategory={selectedCategory}
                />
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
            />
        </div>
    );
};

export default AdminCategories;
