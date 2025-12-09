import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Package, Eye, Trash2, Ban } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const handleToggleStatus = async (productId, currentStatus) => {
        try {
            await api.patch(`/products/admin/${productId}/`, { is_active: !currentStatus });
            toast.success(`Product ${!currentStatus ? 'activated' : 'blocked'}!`);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to update product status');
        }
    };

    const confirmDelete = (product) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteProduct = async () => {
        try {
            await api.delete(`/products/admin/${productToDelete.id}/`);
            toast.success('Product deleted successfully!');
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Product Management</h1>
                    <p className="text-slate-600">Manage all products across vendors</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-slate-500">Loading products...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="pb-3 font-semibold text-slate-900">Product</th>
                                        <th className="pb-3 font-semibold text-slate-900">Vendor</th>
                                        <th className="pb-3 font-semibold text-slate-900">Category</th>
                                        <th className="pb-3 font-semibold text-slate-900">Price</th>
                                        <th className="pb-3 font-semibold text-slate-900">Stock</th>
                                        <th className="pb-3 font-semibold text-slate-900">Status</th>
                                        <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="border-b last:border-0">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0].image}
                                                            alt={product.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4">{product.vendor_name}</td>
                                            <td className="py-4">{product.category_name}</td>
                                            <td className="py-4">₹{product.price}</td>
                                            <td className="py-4">{product.stock}</td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(product.id, product.is_active)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${product.is_active
                                                            ? 'bg-green-500 focus:ring-green-500'
                                                            : 'bg-gray-300 focus:ring-gray-400'
                                                        }`}
                                                    title={product.is_active ? 'Click to deactivate' : 'Click to activate'}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.is_active ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`ml-2 text-sm ${product.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(product.id, product.is_active)}
                                                        className={product.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => confirmDelete(product)}
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

            {/* View Product Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Product Details" size="lg">
                {selectedProduct && (
                    <div className="space-y-6">
                        {/* Images */}
                        <div>
                            <h3 className="font-semibold mb-3">Product Images</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                    selectedProduct.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img.image}
                                            alt={selectedProduct.name}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-4 bg-slate-100 rounded-lg p-8 text-center text-slate-400">
                                        No images available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Product Name</label>
                                <p className="text-lg font-semibold">{selectedProduct.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Vendor</label>
                                <p className="text-lg">{selectedProduct.vendor_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Category</label>
                                <p className="text-lg">{selectedProduct.category_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Price</label>
                                <p className="text-lg font-semibold text-orange-600">₹{selectedProduct.price}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Stock</label>
                                <p className="text-lg">{selectedProduct.stock} units</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Status</label>
                                <p className="text-lg">
                                    <span className={`px-2 py-1 rounded-full text-xs ${selectedProduct.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {selectedProduct.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-slate-600">Description</label>
                            <p className="mt-2 text-slate-700">{selectedProduct.description || 'No description available'}</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteProduct}
                title="Delete Product"
                message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
            />
        </div>
    );
};

export default AdminProducts;
