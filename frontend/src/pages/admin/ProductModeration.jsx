import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    CheckCircle, XCircle, Clock, AlertCircle,
    Search, Eye, Package
} from 'lucide-react';

const ProductModeration = () => {
    const [moderations, setModerations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [changeRequest, setChangeRequest] = useState('');

    useEffect(() => {
        fetchModerations();
        fetchStats();
    }, [statusFilter, searchQuery]);

    const fetchModerations = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await api.get('/products/admin/moderation/', { params });
            setModerations(response.data);
        } catch (error) {
            console.error('Failed to fetch moderations:', error);
            toast.error('Failed to load moderation queue');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/products/admin/moderation/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleApprove = async () => {
        if (!selectedProduct) return;

        try {
            await api.post(`/products/admin/moderation/${selectedProduct.id}/approve/`, {
                notes: notes
            });

            toast.success('Product approved successfully');
            closeModal();
            fetchModerations();
            fetchStats();
        } catch (error) {
            console.error('Failed to approve product:', error);
            toast.error(error.response?.data?.error || 'Failed to approve product');
        }
    };

    const handleReject = async () => {
        if (!selectedProduct || !rejectionReason) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await api.post(`/products/admin/moderation/${selectedProduct.id}/reject/`, {
                rejection_reason: rejectionReason
            });

            toast.success('Product rejected');
            closeModal();
            fetchModerations();
            fetchStats();
        } catch (error) {
            console.error('Failed to reject product:', error);
            toast.error(error.response?.data?.error || 'Failed to reject product');
        }
    };

    const handleRequestChanges = async () => {
        if (!selectedProduct || !changeRequest) {
            toast.error('Please provide change request details');
            return;
        }

        try {
            await api.post(`/products/admin/moderation/${selectedProduct.id}/request-changes/`, {
                notes: changeRequest
            });

            toast.success('Changes requested');
            closeModal();
            fetchModerations();
            fetchStats();
        } catch (error) {
            console.error('Failed to request changes:', error);
            toast.error(error.response?.data?.error || 'Failed to request changes');
        }
    };

    const openModal = (moderation, action) => {
        setSelectedProduct(moderation);
        setModalAction(action);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setNotes('');
        setRejectionReason('');
        setChangeRequest('');
        setSelectedProduct(null);
        setModalAction(null);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            changes_requested: 'bg-blue-100 text-blue-800'
        };

        const labels = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            changes_requested: 'Changes Requested'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Product Moderation</h1>
                <p className="text-gray-600 mt-1">Review and approve vendor products</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending Review</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.total_pending}</p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.total_approved}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{stats.total_rejected}</p>
                            </div>
                            <XCircle className="w-12 h-12 text-red-500 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Changes Requested</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.total_changes_requested}</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-blue-500 opacity-50" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products or vendors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pending">Pending</option>
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="changes_requested">Changes Requested</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Loading...
                    </div>
                ) : moderations.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No products found</p>
                    </div>
                ) : (
                    moderations.map((moderation) => (
                        <motion.div
                            key={moderation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-lg line-clamp-2">{moderation.product_name}</h3>
                                    {getStatusBadge(moderation.status)}
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex justify-between">
                                        <span>Vendor:</span>
                                        <span className="font-medium">{moderation.vendor_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Category:</span>
                                        <span className="font-medium">{moderation.product_category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span className="font-medium">₹{parseFloat(moderation.product_price).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Submitted:</span>
                                        <span className="font-medium">{new Date(moderation.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {moderation.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(moderation, 'approve')}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => openModal(moderation, 'changes')}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            Request Changes
                                        </button>
                                        <button
                                            onClick={() => openModal(moderation, 'reject')}
                                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {moderation.status !== 'pending' && (
                                    <button
                                        onClick={() => openModal(moderation, 'view')}
                                        className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                {modalAction === 'approve' && 'Approve Product'}
                                {modalAction === 'reject' && 'Reject Product'}
                                {modalAction === 'changes' && 'Request Changes'}
                                {modalAction === 'view' && 'Product Details'}
                            </h2>

                            {/* Product Details */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Product</p>
                                        <p className="font-medium">{selectedProduct.product_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="font-medium">₹{parseFloat(selectedProduct.product_price).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Vendor</p>
                                        <p className="font-medium">{selectedProduct.vendor_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Category</p>
                                        <p className="font-medium">{selectedProduct.product_category}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        {getStatusBadge(selectedProduct.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Submitted</p>
                                        <p className="font-medium">{new Date(selectedProduct.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                {selectedProduct.notes && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-1">Notes</p>
                                        <p className="text-sm bg-white p-2 rounded">{selectedProduct.notes}</p>
                                    </div>
                                )}

                                {selectedProduct.rejection_reason && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                                        <p className="text-sm bg-white p-2 rounded text-red-600">{selectedProduct.rejection_reason}</p>
                                    </div>
                                )}
                            </div>

                            {/* Approve Form */}
                            {modalAction === 'approve' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="Add any approval notes..."
                                    />
                                </div>
                            )}

                            {/* Reject Form */}
                            {modalAction === 'reject' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rejection Reason *
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                        placeholder="Explain why this product is being rejected..."
                                        required
                                    />
                                </div>
                            )}

                            {/* Request Changes Form */}
                            {modalAction === 'changes' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Change Request Details *
                                    </label>
                                    <textarea
                                        value={changeRequest}
                                        onChange={(e) => setChangeRequest(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe what changes are needed..."
                                        required
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                                {modalAction === 'approve' && (
                                    <button
                                        onClick={handleApprove}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Confirm Approval
                                    </button>
                                )}
                                {modalAction === 'reject' && (
                                    <button
                                        onClick={handleReject}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Confirm Rejection
                                    </button>
                                )}
                                {modalAction === 'changes' && (
                                    <button
                                        onClick={handleRequestChanges}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Send Change Request
                                    </button>
                                )}
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    {modalAction === 'view' ? 'Close' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ProductModeration;
