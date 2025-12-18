import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // Separate state for form inputs - this is key!
    const [categoryName, setCategoryName] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const [categoryParent, setCategoryParent] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [categoryCommission, setCategoryCommission] = useState('5.00');
    const [showInMenu, setShowInMenu] = useState(true);

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
        setCategoryName('');
        setCategorySlug('');
        setCategoryParent('');
        setCategoryDescription('');
        setCategoryCommission('5.00');
        setShowInMenu(true);
        setEditingCategory(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name || '');
        setCategorySlug(category.slug || '');
        setCategoryParent(category.parent || '');
        setCategoryDescription(category.description || '');
        setCategoryCommission(category.commission_rate || '5.00');
        setShowInMenu(category.show_in_menu !== undefined ? category.show_in_menu : true);
        setIsEditModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products/manage/categories/', {
                name: categoryName,
                slug: categorySlug,
                parent: categoryParent,
                description: categoryDescription,
                commission_rate: categoryCommission,
                show_in_menu: showInMenu
            });
            toast.success('Category added successfully!');
            handleCloseModals();
            fetchCategories();
        } catch (error) {
            console.error('Failed to add category:', error);
            toast.error(error.response?.data?.name?.[0] || 'Failed to add category');
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/products/manage/categories/${editingCategory.id}/`, {
                name: categoryName,
                slug: categorySlug,
                parent: categoryParent,
                description: categoryDescription,
                commission_rate: categoryCommission,
                show_in_menu: showInMenu
            });
            toast.success('Category updated successfully!');
            handleCloseModals();
            fetchCategories();
        } catch (error) {
            console.error('Failed to update category:', error);
            toast.error('Failed to update category');
        }
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

    const handleNameChange = (e) => {
        const value = e.target.value;
        setCategoryName(value);
        // Auto-generate slug only for new categories (not when editing)
        if (!editingCategory) {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setCategorySlug(slug);
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
                    onClick={handleOpenAddModal}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Categories List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderTree className="h-5 w-5" />
                        Product Categories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No categories found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Category</th>
                                        <th className="text-left py-3 px-4">Slug</th>
                                        <th className="text-left py-3 px-4">Commission</th>
                                        <th className="text-right py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id} className="border-b hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{getCategoryHierarchy(category)}</div>
                                                {category.description && (
                                                    <div className="text-sm text-slate-500">{category.description}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">{category.slug}</td>
                                            <td className="py-3 px-4">{category.commission_rate}%</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenEditModal(category)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => confirmDelete(category)}
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
                onClose={handleCloseModals}
                title="Add New Category"
                size="lg"
            >
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Category Name *</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={handleNameChange}
                            required
                            placeholder="Enter category name"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Slug *</label>
                        <input
                            type="text"
                            value={categorySlug}
                            onChange={(e) => setCategorySlug(e.target.value)}
                            required
                            placeholder="category-slug"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Parent Category</label>
                        <select
                            value={categoryParent}
                            onChange={(e) => setCategoryParent(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">None (Top Level)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={categoryDescription}
                            onChange={(e) => setCategoryDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows={3}
                            placeholder="Category description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={categoryCommission}
                            onChange={(e) => setCategoryCommission(e.target.value)}
                            placeholder="5.00"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showInMenuAdd"
                            checked={showInMenu}
                            onChange={(e) => setShowInMenu(e.target.checked)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showInMenuAdd" className="text-sm font-medium cursor-pointer">
                            Show in navigation menu
                        </label>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModals}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                            Add Category
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Category Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                title="Edit Category"
                size="lg"
            >
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Category Name *</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                            placeholder="Enter category name"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Slug *</label>
                        <input
                            type="text"
                            value={categorySlug}
                            onChange={(e) => setCategorySlug(e.target.value)}
                            required
                            placeholder="category-slug"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Parent Category</label>
                        <select
                            value={categoryParent}
                            onChange={(e) => setCategoryParent(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">None (Top Level)</option>
                            {categories.filter(cat => cat.id !== editingCategory?.id).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={categoryDescription}
                            onChange={(e) => setCategoryDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows={3}
                            placeholder="Category description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={categoryCommission}
                            onChange={(e) => setCategoryCommission(e.target.value)}
                            placeholder="5.00"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showInMenuEdit"
                            checked={showInMenu}
                            onChange={(e) => setShowInMenu(e.target.checked)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showInMenuEdit" className="text-sm font-medium cursor-pointer">
                            Show in navigation menu
                        </label>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModals}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                            Update Category
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminCategories;
