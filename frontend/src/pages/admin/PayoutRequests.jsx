import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    DollarSign, CheckCircle, XCircle, Clock,
    Search, Filter, Eye, Download
} from 'lucide-react';

const PayoutRequests = () => {
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [adminNotes, setAdminNotes] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPayouts();
        fetchStats();
    }, [statusFilter, searchQuery]);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await api.get('/vendors/admin/payouts/', { params });
            setPayouts(response.data);
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
            toast.error('Failed to load payout requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/vendors/admin/payouts/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleApprove = async () => {
        if (!selectedPayout) return;

        try {
            await api.post(`/vendors/admin/payouts/${selectedPayout.id}/approve/`, {
                admin_notes: adminNotes,
                transaction_id: transactionId
            });

            toast.success('Payout approved successfully');
            setShowModal(false);
            resetForm();
            fetchPayouts();
            fetchStats();
        } catch (error) {
            console.error('Failed to approve payout:', error);
            toast.error(error.response?.data?.error || 'Failed to approve payout');
        }
    };

    const handleReject = async () => {
        if (!selectedPayout || !rejectionReason) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await api.post(`/vendors/admin/payouts/${selectedPayout.id}/reject/`, {
                rejection_reason: rejectionReason
            });

            toast.success('Payout rejected');
            setShowModal(false);
            resetForm();
            fetchPayouts();
            fetchStats();
        } catch (error) {
            console.error('Failed to reject payout:', error);
            toast.error(error.response?.data?.error || 'Failed to reject payout');
        }
    };

    const openModal = (payout, action) => {
        setSelectedPayout(payout);
        setModalAction(action);
        setShowModal(true);
    };

    const resetForm = () => {
        setAdminNotes('');
        setTransactionId('');
        setRejectionReason('');
        setSelectedPayout(null);
        setModalAction(null);
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Payout Requests</h1>
                <p className="text-gray-600 mt-1">Manage vendor payout requests</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.total_pending}</p>
                                <p className="text-sm text-gray-500 mt-1">₹{stats.pending_amount.toFixed(2)}</p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.total_approved}</p>
                                <p className="text-sm text-gray-500 mt-1">₹{stats.approved_amount.toFixed(2)}</p>
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
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ₹{(stats.pending_amount + stats.approved_amount).toFixed(2)}
                                </p>
                            </div>
                            <DollarSign className="w-12 h-12 text-blue-500 opacity-50" />
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
                            placeholder="Search by vendor name..."
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
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
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
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No payout requests found
                                    </td>
                                </tr>
                            ) : (
                                payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{payout.vendor_name}</div>
                                                <div className="text-sm text-gray-500">{payout.vendor_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-semibold text-gray-900">
                                                ₹{parseFloat(payout.requested_amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(payout.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(payout.requested_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {payout.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => openModal(payout, 'approve')}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(payout, 'reject')}
                                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => openModal(payout, 'view')}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
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

            {/* Modal */}
            {showModal && selectedPayout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                {modalAction === 'approve' && 'Approve Payout'}
                                {modalAction === 'reject' && 'Reject Payout'}
                                {modalAction === 'view' && 'Payout Details'}
                            </h2>

                            {/* Payout Details */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Vendor</p>
                                        <p className="font-medium">{selectedPayout.vendor_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount</p>
                                        <p className="font-medium text-lg">₹{parseFloat(selectedPayout.requested_amount).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        {getStatusBadge(selectedPayout.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Requested Date</p>
                                        <p className="font-medium">{new Date(selectedPayout.requested_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                {selectedPayout.bank_details && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">Bank Details</p>
                                        <pre className="bg-white p-3 rounded text-sm">
                                            {JSON.stringify(selectedPayout.bank_details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Approve Form */}
                            {modalAction === 'approve' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Transaction ID
                                        </label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="Enter transaction/reference ID"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Admin Notes (Optional)
                                        </label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="Add any notes..."
                                        />
                                    </div>
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
                                        placeholder="Explain why this payout is being rejected..."
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
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
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

export default PayoutRequests;
