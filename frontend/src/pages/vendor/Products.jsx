import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Plus, Eye, Trash2, Ban, Package, Upload } from 'lucide-react';
import SpiritualLoader from '../../components/ui/spiritual-loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [taxSlabs, setTaxSlabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        short_description: '',
        sku: '',
        price: '',
        regular_price: '',
        sale_price: '',
        stock: '',
        category: '',
        brand: '',
        brand: '',
        is_active: true,
        is_returnable: false,
        is_exchangeable: false,
        // Dimensions
        length: '',
        width: '',
        height: '',
        weight: '',
        // Tax
        tax_status: 'taxable',
        tax_slab: '',
        tax_class: '',
        // Inventory
        manage_stock: true,
        stock_status: 'instock',
        backorders: 'no',
        low_stock_threshold: '',
        // Shipping
        shipping_class: '',
        // Type
        virtual: false,
        downloadable: false,
        // Extra
        manufacturing_country: '',
        whats_in_box: '',
        safety_instructions: '',
        handling_time: 2,
        expiry_date: '',
    });
    const [imageFiles, setImageFiles] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchTaxSlabs();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/vendor/my-products/');
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

    const fetchTaxSlabs = async () => {
        try {
            const response = await api.get('/products/manage/tax-slabs/');
            setTaxSlabs(response.data);
        } catch (error) {
            console.error('Failed to fetch tax slabs:', error);
        }
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const handleToggleStatus = async (productSlug, currentStatus) => {
        try {
            await api.patch(`/products/vendor/my-products/${productSlug}/`, { is_active: !currentStatus });
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
            await api.delete(`/products/vendor/my-products/${productToDelete.slug}/`);
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

    const handleAddProduct = async (e) => {
        e.preventDefault();

        const productData = new FormData();

        // Helper to append if value exists
        const appendIf = (key, value) => {
            if (value !== null && value !== undefined && value !== '') {
                productData.append(key, value);
            }
        };

        appendIf('name', formData.name);
        appendIf('description', formData.description);
        appendIf('short_description', formData.short_description);
        appendIf('sku', formData.sku);
        appendIf('regular_price', formData.regular_price);
        appendIf('sale_price', formData.sale_price);
        appendIf('stock', formData.stock);
        appendIf('category', formData.category);
        appendIf('brand', formData.brand);
        productData.append('is_active', formData.is_active);
        productData.append('is_returnable', formData.is_returnable);
        productData.append('is_exchangeable', formData.is_exchangeable);
        productData.append('manage_stock', formData.manage_stock);
        productData.append('virtual', formData.virtual);
        productData.append('downloadable', formData.downloadable);
        appendIf('tax_slab', formData.tax_slab);
        appendIf('tax_status', formData.tax_status);

        // Append new fields
        appendIf('length', formData.length);
        appendIf('width', formData.width);
        appendIf('height', formData.height);
        appendIf('weight', formData.weight);
        appendIf('tax_status', formData.tax_status);
        appendIf('tax_class', formData.tax_class);
        appendIf('stock_status', formData.stock_status);
        appendIf('backorders', formData.backorders);
        appendIf('low_stock_threshold', formData.low_stock_threshold);
        appendIf('shipping_class', formData.shipping_class);
        appendIf('manufacturing_country', formData.manufacturing_country);
        appendIf('whats_in_box', formData.whats_in_box);
        appendIf('safety_instructions', formData.safety_instructions);
        appendIf('handling_time', formData.handling_time);
        appendIf('expiry_date', formData.expiry_date);

        // Add images
        imageFiles.forEach((file, index) => {
            productData.append(`image_${index}`, file);
        });

        try {
            await api.post('/products/vendor/my-products/', productData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Product added successfully!');
            setIsAddModalOpen(false);
            setFormData({
                name: '', description: '', short_description: '', sku: '',
                price: '', regular_price: '', sale_price: '', stock: '',
                category: '', brand: '', is_active: true,
                is_returnable: false, is_exchangeable: false,
                length: '', width: '', height: '', weight: '',
                tax_status: 'taxable', tax_class: '',
                manage_stock: true, stock_status: 'instock', backorders: 'no', low_stock_threshold: '',
                shipping_class: '', virtual: false, downloadable: false,
                manufacturing_country: '', whats_in_box: '', safety_instructions: '',
                handling_time: 2, expiry_date: ''
            });
            setImageFiles([]);
            fetchProducts();
        } catch (error) {
            console.error('Failed to add product:', error);
            toast.error(error.response?.data?.name?.[0] || 'Failed to add product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">My Products</h1>
                            <p className="text-sm md:text-base text-slate-600">Manage your product inventory</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => window.location.href = '/vendor/bulk-upload'}>
                                <Upload className="h-4 w-4 mr-2" />
                                Bulk Upload
                            </Button>
                            <Button onClick={() => setIsAddModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </div>
                    </div>

                    <Card className="border-2 border-slate-200">
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
                                <div className="py-12 flex justify-center">
                                    <SpiritualLoader size="lg" />
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 text-lg mb-2">No products yet</p>
                                    <p className="text-slate-400 mb-4">Start by adding your first product</p>
                                    <div className="flex gap-3 justify-center">
                                        <Button variant="outline" onClick={() => window.location.href = '/vendor/bulk-upload'}>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Bulk Upload
                                        </Button>
                                        <Button onClick={() => setIsAddModalOpen(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Product
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-900">Product</th>
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
                                                    <td className="py-4">{product.category_name}</td>
                                                    <td className="py-4">₹{product.price}</td>
                                                    <td className="py-4">{product.stock}</td>
                                                    <td className="py-4">
                                                        <button
                                                            onClick={() => handleToggleStatus(product.slug, product.is_active)}
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
                                                                onClick={() => handleToggleStatus(product.slug, product.is_active)}
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

                    {/* Add Product Modal */}
                    <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Product" size="lg">
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Product Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium mb-2">SKU</label>
                                    <Input
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        placeholder="SKU"
                                    />
                                </div>
                            </div>

                            {/* Dimensions & Weight */}
                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">Shipping Dimensions</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="text-xs">Length (cm)</label>
                                        <Input type="number" step="0.01" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs">Width (cm)</label>
                                        <Input type="number" step="0.01" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs">Height (cm)</label>
                                        <Input type="number" step="0.01" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs">Weight (kg)</label>
                                        <Input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Inventory & Tax */}
                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tax Status</label>
                                    <select
                                        value={formData.tax_status}
                                        onChange={(e) => setFormData({ ...formData, tax_status: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="taxable">Taxable</option>
                                        <option value="shipping">Shipping only</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tax Slab</label>
                                    <select
                                        value={formData.tax_slab}
                                        onChange={(e) => setFormData({ ...formData, tax_slab: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        disabled={formData.tax_status === 'none'}
                                    >
                                        <option value="">Select Tax Slab</option>
                                        {taxSlabs.map(slab => (
                                            <option key={slab.id} value={slab.id}>
                                                {slab.name} ({slab.rate}%)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>

                                    <label className="block text-sm font-medium mb-2">Stock Status</label>
                                    <select
                                        value={formData.stock_status}
                                        onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="instock">In Stock</option>
                                        <option value="outofstock">Out of Stock</option>
                                        <option value="onbackorder">On Backorder</option>
                                    </select>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="border-t pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Country of Origin</label>
                                        <Input value={formData.manufacturing_country} onChange={e => setFormData({ ...formData, manufacturing_country: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Box Contents</label>
                                        <Input value={formData.whats_in_box} onChange={e => setFormData({ ...formData, whats_in_box: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Short Description</label>
                                    <textarea
                                        value={formData.short_description}
                                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows="4"
                                    placeholder="Enter product description"
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

                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        id="is-active"
                                        className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600"
                                    />
                                    <label htmlFor="is-active" className="text-sm">Active</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.manage_stock}
                                        onChange={(e) => setFormData({ ...formData, manage_stock: e.target.checked })}
                                        id="manage-stock"
                                        className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600"
                                    />
                                    <label htmlFor="manage-stock" className="text-sm">Manage Stock</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_returnable}
                                        onChange={(e) => setFormData({ ...formData, is_returnable: e.target.checked })}
                                        id="is-returnable"
                                        className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600"
                                    />
                                    <label htmlFor="is-returnable" className="text-sm">Returnable</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_exchangeable}
                                        onChange={(e) => setFormData({ ...formData, is_exchangeable: e.target.checked })}
                                        id="is-exchangeable"
                                        className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600"
                                    />
                                    <label htmlFor="is-exchangeable" className="text-sm">Exchangeable</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.virtual}
                                        onChange={(e) => setFormData({ ...formData, virtual: e.target.checked })}
                                        id="virtual"
                                        className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600"
                                    />
                                    <label htmlFor="virtual" className="text-sm">Virtual</label>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Add Product</Button>
                            </div>
                        </form>
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
            </div>
        </div>
    );
};

export default VendorProducts;
