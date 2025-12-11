import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Package, Eye, Trash2, Ban, Plus, Edit, Upload } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);

    const [formData, setFormData] = useState({
        vendor: '',
        category: '',
        brand: '',
        name: '',
        slug: '',
        description: '',
        short_description: '',
        sku: '',
        regular_price: '',
        sale_price: '',
        stock: '',
        manage_stock: true,
        weight: '',
        featured: false,
        is_active: true
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchVendors();
        fetchBrands();
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

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await api.get('/vendors/');
            setVendors(response.data);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await api.get('/products/brands/');
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        }
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setFormData({
            vendor: product.vendor || '',
            category: product.category || '',
            brand: product.brand || '',
            name: product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            short_description: product.short_description || '',
            sku: product.sku || '',
            regular_price: product.regular_price || '',
            sale_price: product.sale_price || '',
            stock: product.stock || '',
            manage_stock: product.manage_stock !== undefined ? product.manage_stock : true,
            weight: product.weight || '',
            featured: product.featured || false,
            is_active: product.is_active !== undefined ? product.is_active : true
        });
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = async (productId, currentStatus) => {
        try {
            await api.patch(`/products/admin/${productId}/`, { is_active: !currentStatus });
            toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}!`);
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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };

    const resetForm = () => {
        setFormData({
            vendor: '',
            category: '',
            brand: '',
            name: '',
            slug: '',
            description: '',
            short_description: '',
            sku: '',
            regular_price: '',
            sale_price: '',
            stock: '',
            manage_stock: true,
            weight: '',
            featured: false,
            is_active: true
        });
        setImageFiles([]);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        const productData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== '' && formData[key] !== null) {
                productData.append(key, formData[key]);
            }
        });

        // Add images
        imageFiles.forEach((file, index) => {
            productData.append(`image_${index}`, file);
        });

        try {
            await api.post('/products/admin/', productData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Product added successfully!');
            setIsAddModalOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Failed to add product:', error);
            toast.error(error.response?.data?.name?.[0] || 'Failed to add product');
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        const productData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== '' && formData[key] !== null) {
                productData.append(key, formData[key]);
            }
        });

        // Add images if uploaded
        imageFiles.forEach((file, index) => {
            productData.append(`image_${index}`, file);
        });

        try {
            await api.patch(`/products/admin/${selectedProduct.id}/`, productData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Product updated successfully!');
            setIsEditModalOpen(false);
            resetForm();
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Failed to update product:', error);
            toast.error('Failed to update product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ProductForm = ({ onSubmit, submitText }) => (
        <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Vendor *</label>
                    <select
                        value={formData.vendor}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="">Select vendor</option>
                        {vendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>{vendor.store_name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Brand</label>
                    <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="">Select brand (optional)</option>
                        {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <Input
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Product SKU"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setFormData({ ...formData, name, slug });
                    }}
                    required
                    placeholder="Enter product name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    placeholder="product-slug"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Regular Price (₹) *</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={formData.regular_price}
                        onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                        required
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Sale Price (₹)</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Stock *</label>
                    <Input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                        placeholder="0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Short Description</label>
                <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                    placeholder="Brief product description"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="4"
                    placeholder="Detailed product description"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <Input
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="0.00"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-sm text-slate-600">
                            Click to upload images or drag and drop
                        </span>
                    </label>
                    {imageFiles.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                            {imageFiles.length} image(s) selected
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.manage_stock}
                        onChange={(e) => setFormData({ ...formData, manage_stock: e.target.checked })}
                    />
                    <span className="text-sm">Manage stock</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span className="text-sm">Featured product</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                </label>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                }}>
                    Cancel
                </Button>
                <Button type="submit">{submitText}</Button>
            </div>
        </form>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Product Management</h1>
                    <p className="text-slate-600">Manage all products across vendors</p>
                </div>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
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
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                                                        <Edit className="h-4 w-4" />
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

            {/* Add Product Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Product" size="xl">
                <ProductForm onSubmit={handleAddProduct} submitText="Add Product" />
            </Modal>

            {/* Edit Product Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Product" size="xl">
                <ProductForm onSubmit={handleUpdateProduct} submitText="Update Product" />
            </Modal>

            {/* View Product Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Product Details" size="lg">
                {selectedProduct && (
                    <div className="space-y-6">
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
