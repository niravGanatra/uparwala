import { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, Award, Edit } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const SectionsManager = () => {
    const [hosting, setHosting] = useState([]);
    const [premium, setPremium] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]); // For category selector

    // Modals
    const [showHostingModal, setShowHostingModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [editingHosting, setEditingHosting] = useState(null);
    const [editingPremium, setEditingPremium] = useState(null);

    // Form Data
    const [hostingForm, setHostingForm] = useState({
        name: '',
        image: null,
        emoji: '',
        link_url: '',
        is_active: true
    });

    const [premiumForm, setPremiumForm] = useState({
        title: '',
        subtitle: '',
        image: null,
        icon: '',
        link_url: '',
        position: 'left',
        is_active: true
    });

    // Helper for URL selection
    const [linkType, setLinkType] = useState('category'); // 'category' or 'custom'

    // Helper for Image URLs
    const getImageUrl = (path) => {
        if (!path) return '/placeholder-image.png'; // Fallback
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    useEffect(() => {
        fetchSections();
        fetchCategories();
    }, []);

    const fetchSections = async () => {
        try {
            const [hostRes, premRes] = await Promise.all([
                api.get('/homepage/hosting/'),
                api.get('/homepage/premium/')
            ]);
            setHosting(hostRes.data);
            setPremium(premRes.data);
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to load categories");
        }
    };

    // --- Hosting Handlers ---
    const handleCreateHosting = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(hostingForm).forEach(key => {
            formData.append(key, hostingForm[key]);
        });

        try {
            if (editingHosting) {
                await api.put(`/homepage/hosting/${editingHosting.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Hosting item updated');
            } else {
                await api.post('/homepage/hosting/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Hosting item added');
            }
            setShowHostingModal(false);
            setEditingHosting(null);
            fetchSections();
            setHostingForm({ name: '', image: null, emoji: '', link_url: '', is_active: true });
        } catch (error) {
            toast.error(editingHosting ? 'Failed to update item' : 'Failed to add item');
        }
    };

    const handleEditHosting = (item) => {
        setEditingHosting(item);
        setHostingForm({
            name: item.name,
            image: null,
            emoji: item.emoji || '',
            link_url: item.link_url,
            is_active: item.is_active
        });
        setLinkType(item.link_url?.startsWith('/category') ? 'category' : 'custom');
        setShowHostingModal(true);
    };

    const handleDeleteHosting = async (id) => {
        if (!window.confirm("Delete this hosting item?")) return;
        try {
            await api.delete(`/homepage/hosting/${id}/`);
            toast.success('Item deleted');
            fetchSections();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    // --- Premium Handlers ---
    const handleCreatePremium = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(premiumForm).forEach(key => {
            formData.append(key, premiumForm[key]);
        });

        try {
            if (editingPremium) {
                await api.put(`/homepage/premium/${editingPremium.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Premium section updated');
            } else {
                await api.post('/homepage/premium/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Premium section added');
            }
            setShowPremiumModal(false);
            setEditingPremium(null);
            fetchSections();
            setPremiumForm({ title: '', subtitle: '', image: null, icon: '', link_url: '', position: 'left', is_active: true });
        } catch (error) {
            toast.error(editingPremium ? 'Failed to update section' : 'Failed to add section');
        }
    };

    const handleEditPremium = (item) => {
        setEditingPremium(item);
        setPremiumForm({
            title: item.title,
            subtitle: item.subtitle || '',
            image: null,
            icon: item.icon || '',
            link_url: item.link_url,
            position: item.position || 'left',
            is_active: item.is_active
        });
        setLinkType(item.link_url?.startsWith('/category') ? 'category' : 'custom');
        setShowPremiumModal(true);
    };

    const handleDeletePremium = async (id) => {
        if (!window.confirm("Delete this premium section?")) return;
        try {
            await api.delete(`/homepage/premium/${id}/`);
            toast.success('Section deleted');
            fetchSections();
        } catch (error) {
            toast.error('Failed to delete section');
        }
    };

    // --- Render Helpers ---
    const handleImageChange = (e, setForm, form) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
        }
    };

    // Category Selector Component Logic
    const renderLinkInput = (form, setForm) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium">Link Destination</label>
            <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="linkType"
                        checked={linkType === 'category'}
                        onChange={() => setLinkType('category')}
                    /> Category
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="linkType"
                        checked={linkType === 'custom'}
                        onChange={() => setLinkType('custom')}
                    /> Custom URL
                </label>
            </div>

            {linkType === 'category' ? (
                <select
                    className="w-full border rounded px-3 py-2"
                    onChange={(e) => {
                        const slug = e.target.value;
                        if (slug) setForm({ ...form, link_url: `/category/${slug}` });
                    }}
                >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                </select>
            ) : (
                <input
                    type="text"
                    value={form.link_url}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="/collection/summer-sale"
                />
            )}
            <p className="text-xs text-gray-500">Selected Path: {form.link_url}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Hosting Essentials */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Layout className="w-5 h-5 text-purple-500" />
                        Pooja Essentials
                    </h3>
                    <button
                        onClick={() => setShowHostingModal(true)}
                        className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {hosting.map((item) => (
                        <div key={item.id} className="p-4 border rounded hover:bg-gray-50">
                            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-32 object-cover rounded mb-2" />
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{item.emoji}</p>
                            <div className="mt-2 flex justify-end gap-1">
                                <button
                                    onClick={() => handleEditHosting(item)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteHosting(item.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {hosting.length === 0 && <p className="col-span-4 text-center text-gray-500 py-4">No items in Pooja Essentials</p>}
                </div>
            </div>

            {/* Premium Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        Premium Collections
                    </h3>
                    <button
                        onClick={() => setShowPremiumModal(true)}
                        className="flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> Add Collection
                    </button>
                </div>

                <div className="space-y-4">
                    {premium.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded hover:bg-gray-50">
                            <img src={getImageUrl(item.image)} alt={item.title} className="w-24 h-24 object-cover rounded" />
                            <div className="flex-1">
                                <h4 className="font-medium text-lg">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEditPremium(item)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeletePremium(item.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {premium.length === 0 && <p className="text-center text-gray-500 py-4">No premium collections</p>}
                </div>
            </div>

            {/* Hosting Modal */}
            {showHostingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b"><h2 className="text-xl font-bold">{editingHosting ? 'Edit' : 'Add'} Hosting Item</h2></div>
                        <form onSubmit={handleCreateHosting} className="p-6 space-y-4">
                            <input type="text" placeholder="Name" className="w-full border rounded px-3 py-2"
                                value={hostingForm.name} onChange={e => setHostingForm({ ...hostingForm, name: e.target.value })} required />
                            <input type="text" placeholder="Emoji (Optional)" className="w-full border rounded px-3 py-2"
                                value={hostingForm.emoji} onChange={e => setHostingForm({ ...hostingForm, emoji: e.target.value })} />

                            {renderLinkInput(hostingForm, setHostingForm)}

                            <div>
                                <label className="block text-sm mb-1">Image {editingHosting && '(Leave empty to keep current)'}</label>
                                <input type="file" onChange={e => handleImageChange(e, setHostingForm, hostingForm)} className="w-full" {...(!editingHosting && { required: true })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowHostingModal(false); setEditingHosting(null); }} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingHosting ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Premium Modal */}
            {showPremiumModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b"><h2 className="text-xl font-bold">{editingPremium ? 'Edit' : 'Add'} Premium Section</h2></div>
                        <form onSubmit={handleCreatePremium} className="p-6 space-y-4">
                            <input type="text" placeholder="Title" className="w-full border rounded px-3 py-2"
                                value={premiumForm.title} onChange={e => setPremiumForm({ ...premiumForm, title: e.target.value })} required />
                            <input type="text" placeholder="Subtitle" className="w-full border rounded px-3 py-2"
                                value={premiumForm.subtitle} onChange={e => setPremiumForm({ ...premiumForm, subtitle: e.target.value })} required />

                            {renderLinkInput(premiumForm, setPremiumForm)}

                            <select className="w-full border rounded px-3 py-2" value={premiumForm.position} onChange={e => setPremiumForm({ ...premiumForm, position: e.target.value })}>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>

                            <div>
                                <label className="block text-sm mb-1">Background Image {editingPremium && '(Leave empty to keep current)'}</label>
                                <input type="file" onChange={e => handleImageChange(e, setPremiumForm, premiumForm)} className="w-full" {...(!editingPremium && { required: true })} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowPremiumModal(false); setEditingPremium(null); }} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingPremium ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionsManager;
