import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorApprovals = () => {
    const [vendors, setVendors] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchVendors();
        fetchStats();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/vendors/pending/');
            setVendors(response.data.vendors || []);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
            toast.error('Failed to load vendor applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/vendors/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleApprove = async (vendorId, storeName) => {
        if (!window.confirm(`Are you sure you want to approve "${storeName}"?`)) {
            return;
        }

        try {
            await api.post(`/vendors/${vendorId}/approve/`);
            toast.success(`${storeName} approved successfully!`);
            fetchVendors();
            fetchStats();
        } catch (error) {
            console.error('Failed to approve vendor:', error);
            toast.error('Failed to approve vendor');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await api.post(`/vendors/${selectedVendor.id}/reject/`, {
                reason: rejectionReason
            });
            toast.success(`${selectedVendor.store_name} rejected`);
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedVendor(null);
            fetchVendors();
            fetchStats();
        } catch (error) {
            console.error('Failed to reject vendor:', error);
            toast.error('Failed to reject vendor');
        }
    };

    const handleDelete = async (vendorId, storeName) => {
        if (!window.confirm(`Are you sure you want to DELETE "${storeName}"? This action cannot be undone!`)) {
            return;
        }

        try {
            await api.delete(`/users/admin/vendor-applications/${vendorId}/delete/`);
            toast.success(`${storeName} deleted successfully!`);
            fetchVendors();
            fetchStats();
        } catch (error) {
            console.error('Failed to delete vendor:', error);
            toast.error('Failed to delete vendor');
        }
    };

    const openRejectModal = (vendor) => {
        setSelectedVendor(vendor);
        setShowRejectModal(true);
        setRejectionReason('');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Approvals</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Review and manage vendor applications</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Vendors List */}
                <Card className="border-2 border-slate-200">
                    <CardHeader>
                        <CardTitle>Pending Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Loading applications...</p>
                            </div>
                        ) : vendors.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">No pending applications</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {vendors.map(vendor => (
                                    <div key={vendor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{vendor.store_name}</h3>
                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{vendor.user_email}</span>
                                                    </div>
                                                    {vendor.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{vendor.phone}</span>
                                                        </div>
                                                    )}
                                                    {vendor.city && vendor.state && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{vendor.city}, {vendor.state}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {vendor.store_description && (
                                                    <p className="mt-2 text-sm text-gray-700">{vendor.store_description}</p>
                                                )}
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Applied on: {new Date(vendor.created_at).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApprove(vendor.id, vendor.store_name)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => openRejectModal(vendor)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(vendor.id, vendor.store_name)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Reject Vendor Application</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for rejecting "{selectedVendor?.store_name}"
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full border rounded-md p-2 min-h-[100px] mb-4"
                                placeholder="Enter rejection reason..."
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setSelectedVendor(null);
                                        setRejectionReason('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                >
                                    Reject Vendor
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorApprovals;
