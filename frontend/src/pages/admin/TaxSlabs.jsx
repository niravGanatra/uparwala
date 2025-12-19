import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TaxSlabs = () => {
    const [taxSlabs, setTaxSlabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTaxSlab, setSelectedTaxSlab] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchTaxSlabs();
    }, []);

    const fetchTaxSlabs = async () => {
        try {
            const response = await api.get('/products/manage/tax-slabs/');
            setTaxSlabs(response.data);
        } catch (error) {
            console.error('Failed to fetch tax slabs:', error);
            toast.error('Failed to load tax slabs');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            rate: '',
            description: '',
            is_active: true
        });
    };

    const handleAddTaxSlab = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products/manage/tax-slabs/', formData);
            toast.success('Tax slab added successfully!');
            setIsAddModalOpen(false);
            resetForm();
            fetchTaxSlabs();
        } catch (error) {
            console.error('Failed to add tax slab:', error);
            toast.error(error.response?.data?.detail || 'Failed to add tax slab');
        }
    };

    const handleEditTaxSlab = (taxSlab) => {
        setSelectedTaxSlab(taxSlab);
        setFormData({
            name: taxSlab.name,
            rate: taxSlab.rate,
            description: taxSlab.description || '',
            is_active: taxSlab.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateTaxSlab = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/manage/tax-slabs/${selectedTaxSlab.id}/`, formData);
            toast.success('Tax slab updated successfully!');
            setIsEditModalOpen(false);
            resetForm();
            setSelectedTaxSlab(null);
            fetchTaxSlabs();
        } catch (error) {
            console.error('Failed to update tax slab:', error);
            toast.error('Failed to update tax slab');
        }
    };

    const confirmDelete = (taxSlab) => {
        setSelectedTaxSlab(taxSlab);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteTaxSlab = async () => {
        try {
            await api.delete(`/products/manage/tax-slabs/${selectedTaxSlab.id}/`);
            toast.success('Tax slab deleted successfully!');
            setIsDeleteDialogOpen(false);
            setSelectedTaxSlab(null);
            fetchTaxSlabs();
        } catch (error) {
            console.error('Failed to delete tax slab:', error);
            toast.error('Failed to delete tax slab');
        }
    };

    const filteredTaxSlabs = taxSlabs.filter(slab =>
        slab.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Tax Slab Management</h1>
                            <p className="text-sm md:text-base text-slate-600">Manage GST tax slabs for products</p>
                        </div>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                            onClick={() => {
                                resetForm();
                                setIsAddModalOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tax Slab
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search tax slabs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-8 text-slate-500">Loading tax slabs...</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-900">Name</th>
                                                <th className="pb-3 font-semibold text-slate-900">Rate</th>
                                                <th className="pb-3 font-semibold text-slate-900">CGST</th>
                                                <th className="pb-3 font-semibold text-slate-900">SGST</th>
                                                <th className="pb-3 font-semibold text-slate-900">IGST</th>
                                                <th className="pb-3 font-semibold text-slate-900">Status</th>
                                                <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTaxSlabs.map((slab) => (
                                                <tr key={slab.id} className="border-b last:border-0">
                                                    <td className="py-4">
                                                        <div>
                                                            <p className="font-medium">{slab.name}</p>
                                                            {slab.description && (
                                                                <p className="text-sm text-slate-500">{slab.description}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-semibold">{slab.rate}%</td>
                                                    <td className="py-4">{slab.cgst_rate}%</td>
                                                    <td className="py-4">{slab.sgst_rate}%</td>
                                                    <td className="py-4">{slab.igst_rate}%</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${slab.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {slab.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditTaxSlab(slab)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => confirmDelete(slab)}
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

                    {/* Add Tax Slab Modal */}
                    <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Tax Slab" size="md">
                        <form onSubmit={handleAddTaxSlab} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., GST 18%"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tax Rate (%) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.rate}
                                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                    required
                                    placeholder="e.g., 18.00"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    CGST and SGST will be auto-calculated as half of this rate. IGST will equal the full rate.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows="3"
                                    placeholder="Optional description for this tax slab"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active_add"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active_add" className="text-sm">Active</label>
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Add Tax Slab</Button>
                            </div>
                        </form>
                    </Modal>

                    {/* Edit Tax Slab Modal */}
                    <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Tax Slab" size="md">
                        <form onSubmit={handleUpdateTaxSlab} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., GST 18%"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tax Rate (%) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.rate}
                                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                    required
                                    placeholder="e.g., 18.00"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    CGST and SGST will be auto-calculated as half of this rate. IGST will equal the full rate.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows="3"
                                    placeholder="Optional description for this tax slab"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active_edit"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active_edit" className="text-sm">Active</label>
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Update Tax Slab</Button>
                            </div>
                        </form>
                    </Modal>

                    {/* Delete Confirmation Dialog */}
                    <ConfirmDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={() => setIsDeleteDialogOpen(false)}
                        onConfirm={handleDeleteTaxSlab}
                        title="Delete Tax Slab"
                        message={`Are you sure you want to delete "${selectedTaxSlab?.name}"? This action cannot be undone.`}
                        confirmText="Delete"
                        confirmVariant="destructive"
                    />
                </div>
            </div>
        </div>
    );
};

export default TaxSlabs;
