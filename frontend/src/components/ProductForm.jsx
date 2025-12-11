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
    onSubmit,
    submitText
}) => {
    return (
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
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="4"
                    placeholder="Detailed product description"
                    required
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

            <div className="flex justify-end gap-2">
                <Button type="submit">{submitText}</Button>
            </div>
        </form>
    );
};

export default ProductForm;
