import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Star, Clock, Edit } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const FeaturedManager = () => {
    const [categories, setCategories] = useState([]);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Metadata for selectors
    const [productCategories, setProductCategories] = useState([]);
    const [products, setProducts] = useState([]);

    // Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showDealModal, setShowDealModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingDeal, setEditingDeal] = useState(null);

    // Forms
    const [catForm, setCatForm] = useState({
        name: '',
        image: null,
        icon: '',
        link_url: '',
        priority: 0,
        is_active: true
    });

    const [dealForm, setDealForm] = useState({
        product_id: '',
        discount_percentage: '',
        start_date: '',
        end_date: '',
        priority: 0,
        is_active: true
    });

    // Helper for category linking
    const [linkType, setLinkType] = useState('category');

    // Helper for Image URLs
    const getImageUrl = (path) => {
        if (!path) return '/placeholder-image.png'; // Fallback
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    useEffect(() => {
        fetchFeaturedContent();
        fetchMetadata();
    }, []);

    const fetchFeaturedContent = async () => {
        try {
            const [catRes, dealRes] = await Promise.all([
                api.get('/homepage/categories/'),
                api.get('/homepage/deals/')
            ]);
            setCategories(catRes.data);
            setDeals(dealRes.data);
        } catch (error) {
            toast.error('Failed to load featured content');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/products/categories/'),
                api.get('/products/')
            ]);
            setProductCategories(catRes.data);
            setProducts(prodRes.data.results || prodRes.data);
        } catch (error) {
            console.error("Failed to fetch metadata");
        }
    }

    // --- Featured Category Handlers ---
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(catForm).forEach(key => formData.append(key, catForm[key]));

        try {
            if (editingCategory) {
                await api.put(`/homepage/categories/${editingCategory.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category updated');
            } else {
                await api.post('/homepage/categories/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category added');
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
            fetchFeaturedContent();
            setCatForm({ name: '', image: null, icon: '', link_url: '', priority: 0, is_active: true });
        } catch (error) {
            toast.error(editingCategory ? 'Failed to update category' : 'Failed to add category');
        }
    };

    const handleEditCategory = (cat) => {
        setEditingCategory(cat);
        setCatForm({
            name: cat.name,
            image: null,
            icon: cat.icon || '',
            link_url: cat.link_url,
            priority: cat.priority || 0,
            is_active: cat.is_active
        });
        setLinkType(cat.link_url?.startsWith('/category') ? 'category' : 'custom');
        setShowCategoryModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await api.delete(`/homepage/categories/${id}/`);
            fetchFeaturedContent();
            toast.success("Deleted");
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    // --- Deal Handlers ---
    const handleCreateDeal = async (e) => {
        e.preventDefault();
        try {
            if (editingDeal) {
                await api.put(`/homepage/deals/${editingDeal.id}/`, dealForm);
                toast.success('Deal updated');
            } else {
                await api.post('/homepage/deals/', dealForm);
                toast.success('Deal created');
            }
            setShowDealModal(false);
            setEditingDeal(null);
            fetchFeaturedContent();
            setDealForm({ product_id: '', discount_percentage: '', start_date: '', end_date: '', priority: 0, is_active: true });
        } catch (error) {
            toast.error(editingDeal ? 'Failed to update deal' : 'Failed to create deal');
        }
    };

    const handleEditDeal = (deal) => {
        setEditingDeal(deal);
        setDealForm({
            product_id: deal.product?.id || '',
            discount_percentage: deal.discount_percentage,
            start_date: deal.start_date,
            end_date: deal.end_date,
            priority: deal.priority || 0,
            is_active: deal.is_active
        });
        setShowDealModal(true);
    };

    const handleDeleteDeal = async (id) => {
        if (!window.confirm("Delete this deal?")) return;
        try {
            await api.delete(`/homepage/deals/${id}/`);
            fetchFeaturedContent();
            toast.success("Deleted");
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    // --- Render Helpers ---
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setCatForm({ ...catForm, image: e.target.files[0] });
        }
    };

    const renderLinkInput = () => (
        <div className="space-y-2">
            <label className="block text-sm font-medium">Link Destination</label>
            <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={linkType === 'category'} onChange={() => setLinkType('category')} /> Category
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={linkType === 'custom'} onChange={() => setLinkType('custom')} /> Custom URL
                </label>
            </div>

            {linkType === 'category' ? (
                <select
                    className="w-full border rounded px-3 py-2"
                    onChange={(e) => {
                        const slug = e.target.value;
                        if (slug) {
                            const selectedCat = productCategories.find(c => c.slug === slug);
                            setCatForm({
                                ...catForm,
                                link_url: `/category/${slug}`,
                                name: catForm.name || (selectedCat ? selectedCat.name : '')
                            });
                        }
                    }}
                >
                    <option value="">Select Category...</option>
                    {productCategories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    value={catForm.link_url}
                    onChange={(e) => setCatForm({ ...catForm, link_url: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="/collection/summer-sale"
                />
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Featured Categories */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Featured Categories
                    </h3>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="p-4 border rounded hover:bg-gray-50 text-center relative max-h-[250px] overflow-hidden">
                            <img src={getImageUrl(cat.image)} alt={cat.name} className="w-16 h-16 object-cover rounded-full mx-auto mb-2" />
                            <h4 className="font-medium text-sm">{cat.name}</h4>
                            <div className="mt-2 flex justify-center gap-2">
                                <button
                                    onClick={() => handleEditCategory(cat)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="col-span-4 text-center text-gray-500 py-4">No featured categories</p>}
                </div>
            </div>

            {/* Deals of the Day */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" />
                        Deals of the Day
                    </h3>
                    <button
                        onClick={() => setShowDealModal(true)}
                        className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> Add Deal
                    </button>
                </div>

                <div className="space-y-4">
                    {deals.map((deal) => (
                        <div key={deal.id} className="flex items-center gap-4 p-4 border rounded hover:bg-gray-50">
                            {/* Corrected Image Handling using product nested object */}
                            <img
                                src={getImageUrl(deal.product?.images?.[0]?.image)}
                                alt={deal.product?.name || "Deal"}
                                className="w-20 h-20 object-cover rounded"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                            />
                            <div className="flex-1">
                                <h4 className="font-medium">{deal.product?.name || `Deal ${deal.id}`}</h4>
                                <p className="text-sm text-gray-500">Discount: {deal.discount_percentage}%</p>
                                <p className="text-sm text-gray-500">Expires: {new Date(deal.end_date).toLocaleDateString()}</p>
                                <div className="mt-1 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-orange-600">₹{deal.discounted_price}</span>
                                    {deal.product?.price && <span className="line-through text-gray-400">₹{deal.product.price}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEditDeal(deal)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteDeal(deal.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {deals.length === 0 && <p className="text-center text-gray-500 py-4">No active deals</p>}
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b"><h2 className="text-xl font-bold">{editingCategory ? 'Edit' : 'Add'} Featured Category</h2></div>
                        <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                            <input type="text" placeholder="Display Name" className="w-full border rounded px-3 py-2"
                                value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                            <input type="text" placeholder="Icon (e.g. 'star') - Optional" className="w-full border rounded px-3 py-2"
                                value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} />

                            {renderLinkInput()}

                            <div>
                                <label className="block text-sm mb-1">Image {editingCategory && '(Leave empty to keep current)'}</label>
                                <input type="file" onChange={handleImageChange} className="w-full" {... (!editingCategory && { required: true })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); }} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingCategory ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deal Modal */}
            {showDealModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b"><h2 className="text-xl font-bold">{editingDeal ? 'Edit' : 'Add'} Deal of the Day</h2></div>
                        <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Product</label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={dealForm.product_id}
                                    onChange={e => setDealForm({ ...dealForm, product_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Discount %</label>
                                <input
                                    type="number" min="0" max="100"
                                    className="w-full border rounded px-3 py-2"
                                    value={dealForm.discount_percentage}
                                    onChange={e => setDealForm({ ...dealForm, discount_percentage: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded px-3 py-2"
                                        value={dealForm.start_date}
                                        onChange={e => setDealForm({ ...dealForm, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded px-3 py-2"
                                        value={dealForm.end_date}
                                        onChange={e => setDealForm({ ...dealForm, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowDealModal(false); setEditingDeal(null); }} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingDeal ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeaturedManager;
