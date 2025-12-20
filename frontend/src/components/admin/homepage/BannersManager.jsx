import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Image, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const BannersManager = () => {
    const [heroBanners, setHeroBanners] = useState([]);
    const [promoBanners, setPromoBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState([]);

    // UI States
    const [showHeroModal, setShowHeroModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [linkType, setLinkType] = useState('category'); // category | custom

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [heroRes, promoRes, catRes] = await Promise.all([
                api.get('/homepage/banners/'),
                api.get('/homepage/promotions/'),
                api.get('/products/categories/')
            ]);
            setHeroBanners(heroRes.data);
            setPromoBanners(promoRes.data);
            setCategories(catRes.data.results || catRes.data); // Handle potential pagination
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteBanner = async (type, id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            const endpoint = type === 'hero'
                ? `/homepage/banners/${id}/`
                : `/homepage/promotions/${id}/`;

            await api.delete(endpoint);
            toast.success('Banner deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete banner');
        }
    };

    const closeModal = () => {
        setShowHeroModal(false);
        setShowPromoModal(false);
        setEditingBanner(null);
        setSelectedFile(null);
        setLinkType('category');
    };

    const handleEditBanner = (banner, type) => {
        setEditingBanner({ ...banner, type });
        if (type === 'hero') {
            setShowHeroModal(true);
        } else {
            setShowPromoModal(true);
            setLinkType(banner.link_url?.startsWith('/category') ? 'category' : 'custom');
        }
    };

    const handleCreateBanner = async (e, type) => {
        e.preventDefault();
        try {
            const isEditing = !!editingBanner;
            const endpoint = type === 'hero'
                ? (isEditing ? `/homepage/banners/${editingBanner.id}/` : '/homepage/banners/')
                : (isEditing ? `/homepage/promotions/${editingBanner.id}/` : '/homepage/promotions/');

            const formData = new FormData(e.target);

            // Handle active checkbox explicitly
            if (!formData.has('is_active')) {
                formData.append('is_active', 'false');
            } else {
                formData.set('is_active', 'true');
            }

            if (selectedFile) {
                formData.append('background_image', selectedFile);
            }

            if (isEditing) {
                await api.put(endpoint, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Banner updated');
            } else {
                await api.post(endpoint, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Banner created');
            }

            closeModal();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(editingBanner ? 'Failed to update banner' : 'Failed to create banner');
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Banners Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Hero Sliders</h3>
                    <button
                        onClick={() => setShowHeroModal(true)}
                        className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> Add Slide
                    </button>
                </div>

                <div className="space-y-4">
                    {heroBanners.map((banner) => (
                        <div key={banner.id} className="flex items-center gap-4 p-4 border rounded hover:bg-gray-50">
                            {banner.background_image && (
                                <img src={banner.background_image} alt={banner.title} className="w-24 h-16 object-cover rounded" />
                            )}
                            <div className="flex-1">
                                <h4 className="font-medium">{banner.title}</h4>
                                <p className="text-sm text-gray-500">{banner.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                    {banner.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <button
                                    onClick={() => handleEditBanner(banner, 'hero')}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteBanner('hero', banner.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {heroBanners.length === 0 && <p className="text-center text-gray-500">No active sliders</p>}
                </div>
            </div>

            {/* Promotional Banners Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Promotional Banners</h3>
                    <button
                        onClick={() => setShowPromoModal(true)}
                        className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> Add Promotion
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {promoBanners.map((banner) => (
                        <div key={banner.id} className="p-4 border rounded hover:bg-gray-50">
                            {banner.background_image && (
                                <img src={banner.background_image} alt={banner.title} className="w-full h-32 object-cover rounded mb-2" />
                            )}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{banner.title}</h4>
                                    <p className="text-sm text-gray-500">{banner.discount_text}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditBanner(banner, 'promo')}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBanner('promo', banner.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {promoBanners.length === 0 && <p className="col-span-2 text-center text-gray-500 py-4">No promotional banners</p>}
                </div>
            </div>

            {/* Modals */}
            {(showHeroModal || showPromoModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">
                                {editingBanner
                                    ? (showHeroModal ? 'Edit Hero Slide' : 'Edit Promotion')
                                    : (showHeroModal ? 'Add Hero Slide' : 'Add Promotion')
                                }
                            </h2>
                            <button onClick={closeModal}><Plus className="w-5 h-5 rotate-45 text-gray-400" /></button>
                        </div>
                        <form onSubmit={(e) => handleCreateBanner(e, showHeroModal ? 'hero' : 'promo')} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input name="title" type="text" defaultValue={editingBanner?.title || ''} className="w-full border rounded px-3 py-2" required />
                            </div>

                            {showHeroModal && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                                    <input name="subtitle" type="text" defaultValue={editingBanner?.subtitle || ''} className="w-full border rounded px-3 py-2" />
                                </div>
                            )}

                            {showPromoModal && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Discount Text</label>
                                        <input name="discount_text" type="text" defaultValue={editingBanner?.discount_text || ''} placeholder="e.g. UPTO 50% OFF" className="w-full border rounded px-3 py-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Link Destination</label>
                                        <div className="flex gap-4 mb-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="link_type"
                                                    value="category"
                                                    checked={linkType === 'category'}
                                                    onChange={() => setLinkType('category')}
                                                />
                                                <span>Category</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="link_type"
                                                    value="custom"
                                                    checked={linkType === 'custom'}
                                                    onChange={() => setLinkType('custom')}
                                                />
                                                <span>Custom URL</span>
                                            </label>
                                        </div>

                                        {linkType === 'category' ? (
                                            <select
                                                name="link_url"
                                                defaultValue={editingBanner?.link_url || ''}
                                                className="w-full border rounded px-3 py-2"
                                                required
                                            >
                                                <option value="">Select a Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={`/category/${cat.slug}`}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                name="link_url"
                                                type="text"
                                                defaultValue={editingBanner?.link_url || ''}
                                                placeholder="/products/..."
                                                className="w-full border rounded px-3 py-2"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Position</label>
                                        <select name="position" defaultValue={editingBanner?.position || 'large_left'} className="w-full border rounded px-3 py-2">
                                            <option value="large_left">Large Left</option>
                                            <option value="large_right">Large Right</option>
                                            <option value="side">Side Banner</option>
                                            <option value="full_width">Full Width</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Background Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Background Color (Fallback)</label>
                                <input name="background_color" type="color" defaultValue={editingBanner?.background_color || '#eab308'} className="w-full h-10 border rounded px-1 py-1" />
                            </div>

                            <div className="flex items-center gap-2">
                                <input name="is_active" type="checkbox" defaultChecked={editingBanner?.is_active !== false} id="active_ch" className="w-4 h-4" />
                                <label htmlFor="active_ch">Active</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    {editingBanner ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannersManager;
