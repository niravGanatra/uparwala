import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import 'react-quill/dist/quill.snow.css';
import {
    FileText, Plus, Edit, Trash2, Save, X, Eye, Globe, CheckCircle
} from 'lucide-react';

// Lazy load ReactQuill to prevent SSR/hydration issues
const ReactQuill = lazy(() => import('react-quill'));

const CMSPages = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPage, setEditingPage] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        meta_title: '',
        meta_description: '',
        is_published: false
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products/admin/cms-pages/');
            setPages(response.data);
        } catch (error) {
            console.error('Failed to fetch pages:', error);
            toast.error('Failed to load CMS pages');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingPage) {
                await api.patch(`/products/admin/cms-pages/${editingPage.id}/`, formData);
                toast.success('Page updated successfully');
            } else {
                await api.post('/products/admin/cms-pages/', formData);
                toast.success('Page created successfully');
            }

            closeModal();
            fetchPages();
        } catch (error) {
            console.error('Failed to save page:', error);
            toast.error(error.response?.data?.error || 'Failed to save page');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this page?')) {
            return;
        }

        try {
            await api.delete(`/products/admin/cms-pages/${id}/`);
            toast.success('Page deleted successfully');
            fetchPages();
        } catch (error) {
            console.error('Failed to delete page:', error);
            toast.error('Failed to delete page');
        }
    };

    const handleTogglePublish = async (page) => {
        try {
            await api.post(`/products/admin/cms-pages/${page.id}/publish/`, {
                is_published: !page.is_published
            });

            toast.success(`Page ${!page.is_published ? 'published' : 'unpublished'}`);
            fetchPages();
        } catch (error) {
            console.error('Failed to update publish status:', error);
            toast.error('Failed to update status');
        }
    };

    const openModal = (page = null) => {
        if (page) {
            setEditingPage(page);
            setFormData({
                title: page.title,
                slug: page.slug,
                content: page.content,
                meta_title: page.meta_title || '',
                meta_description: page.meta_description || '',
                is_published: page.is_published
            });
        } else {
            setEditingPage(null);
            setFormData({
                title: '',
                slug: '',
                content: '',
                meta_title: '',
                meta_description: '',
                is_published: false
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPage(null);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CMS Pages</h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">Manage static content pages</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        Create Page
                    </button>
                </div>

                {/* Pages List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : pages.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No pages found. Create your first page!
                                        </td>
                                    </tr>
                                ) : (
                                    pages.map((page) => (
                                        <tr key={page.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{page.title}</div>
                                                {page.meta_title && (
                                                    <div className="text-xs text-gray-500 mt-1">Meta: {page.meta_title}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                /{page.slug}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleTogglePublish(page)}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${page.is_published
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {page.is_published ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            Published
                                                        </>
                                                    ) : (
                                                        'Draft'
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(page.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="View Page"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(page)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(page.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">
                                        {editingPage ? 'Edit Page' : 'Create New Page'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Main Content */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Page Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Content
                                            </label>
                                            <div className="h-96 mb-12">
                                                <Suspense fallback={<div className="h-full bg-gray-100 rounded flex items-center justify-center text-gray-500">Loading editor...</div>}>
                                                    <ReactQuill
                                                        value={formData.content}
                                                        onChange={(content) => setFormData({ ...formData, content })}
                                                        modules={modules}
                                                        className="h-full"
                                                    />
                                                </Suspense>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Settings */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                SEO Settings
                                            </h3>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        URL Slug
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.slug}
                                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded text-sm"
                                                        placeholder="auto-generated"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Meta Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.meta_title}
                                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Meta Description
                                                    </label>
                                                    <textarea
                                                        value={formData.meta_description}
                                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                        rows="3"
                                                        className="w-full px-3 py-2 border rounded text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_published}
                                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                                    className="rounded text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="text-sm font-medium text-gray-900">Publish Page</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingPage ? 'Update Page' : 'Create Page'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CMSPages;
