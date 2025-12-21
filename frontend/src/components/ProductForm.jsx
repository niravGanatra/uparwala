import { Input } from './ui/input';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';

// Extracted ProductForm component to prevent re-creation on parent renders
const ProductForm = ({
    formData,
    setFormData,
    imageFiles,
    handleImageChange,
    vendors,
    categories,
    brands,
    taxSlabs,
    onSubmit,
    submitText,
    idPrefix = 'product_form' // Default prefix to prevent ID collisions
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">

            {/* 1. Basic Details Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2 mb-2">Basic Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Product Name *</label>
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
                    {/* Slug - Auto-generated but editable */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-slate-500">Slug (Auto-generated)</label>
                        <Input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            required
                            placeholder="product-slug"
                            className="bg-slate-100 text-slate-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Vendor *</label>
                        <select
                            value={formData.vendor}
                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>{vendor.store_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Brand</label>
                        <select
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                            <option value="">Select Brand (Optional)</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">SKU</label>
                        <Input
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Stock Keeping Unit"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5">Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="3"
                        placeholder="Detailed product description"
                        required
                    />
                </div>
            </div>

            {/* 2. Pricing & Inventory Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2 mb-2">Pricing & Inventory</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Regular Price (₹) *</label>
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
                        <label className="block text-sm font-medium mb-1.5 text-orange-600">Sale Price (₹)</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.sale_price}
                            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                            placeholder="0.00"
                            className="border-orange-200 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Stock Quantity *</label>
                        <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            required
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Checkboxes - Inventory & Type */}
                <div className="flex flex-wrap gap-4 pt-2">
                    <label htmlFor={`${idPrefix}_manage_stock`} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id={`${idPrefix}_manage_stock`}
                            type="checkbox"
                            checked={!!formData.manage_stock}
                            onChange={(e) => setFormData({ ...formData, manage_stock: e.target.checked })}
                            className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-sm">Manage Stock</span>
                    </label>
                    <label htmlFor={`${idPrefix}_featured`} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id={`${idPrefix}_featured`}
                            type="checkbox"
                            checked={!!formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-sm">Featured Product</span>
                    </label>
                    <label htmlFor={`${idPrefix}_is_active`} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id={`${idPrefix}_is_active`}
                            type="checkbox"
                            checked={!!formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-sm">Active</span>
                    </label>
                </div>
            </div>

            {/* 3. Shipping & Tax Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2 mb-2">Shipping & Tax</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1 block">Length (cm)</label>
                        <Input type="number" step="0.1" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block">Width (cm)</label>
                        <Input type="number" step="0.1" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block">Height (cm)</label>
                        <Input type="number" step="0.1" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block">Weight (kg) *</label>
                        <Input type="number" step="0.01" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Tax Slab</label>
                        <select
                            value={formData.tax_slab}
                            onChange={(e) => setFormData({ ...formData, tax_slab: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                            <option value="">Select Tax Slab</option>
                            {taxSlabs && taxSlabs.map(slab => (
                                <option key={slab.id} value={slab.id}>
                                    {slab.name} ({slab.rate}%)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Country of Origin</label>
                        <Input value={formData.manufacturing_country} onChange={e => setFormData({ ...formData, manufacturing_country: e.target.value })} placeholder="e.g. India" />
                    </div>
                </div>

                {/* Checkboxes - Policies */}
                <div className="flex flex-wrap gap-4 pt-1">
                    <label htmlFor={`${idPrefix}_is_returnable`} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id={`${idPrefix}_is_returnable`}
                            type="checkbox"
                            checked={!!formData.is_returnable}
                            onChange={(e) => setFormData({ ...formData, is_returnable: e.target.checked })}
                            className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-sm">Returnable</span>
                    </label>
                    <label htmlFor={`${idPrefix}_is_exchangeable`} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id={`${idPrefix}_is_exchangeable`}
                            type="checkbox"
                            checked={!!formData.is_exchangeable}
                            onChange={(e) => setFormData({ ...formData, is_exchangeable: e.target.checked })}
                            className="h-4 w-4 text-orange-600 border border-gray-300 rounded focus:ring-orange-500 accent-orange-600 cursor-pointer"
                        />
                        <span className="text-sm">Exchangeable</span>
                    </label>
                </div>
            </div>

            {/* 4. Media Section */}
            <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id={`${idPrefix}_image_upload`}
                    />
                    <label htmlFor={`${idPrefix}_image_upload`} className="cursor-pointer">
                        <span className="text-sm text-blue-600 font-medium hover:text-blue-700">
                            Click to upload images
                        </span>
                        <span className="text-sm text-slate-500"> or drag and drop</span>
                    </label>
                    {imageFiles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 justify-center">
                            {Array.from(imageFiles).map((file, idx) => (
                                <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center">
                                    {file.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white min-w-[150px]">
                    {submitText}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
