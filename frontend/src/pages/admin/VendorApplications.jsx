import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, CheckCircle, XCircle, Clock, Store, Mail, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/modal';

const VendorApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    useEffect(() => {
        filterApplications();
    }, [searchQuery, applications]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/users/admin/vendor-applications/?status=${statusFilter}`);
            setApplications(response.data);
            setFilteredApplications(response.data);
        } catch (error) {
            console.error('Failed to fetch vendor applications:', error);
            toast.error('Failed to load vendor applications');
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        if (!searchQuery) {
            setFilteredApplications(applications);
            return;
        }

        const filtered = applications.filter(app =>
            app.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredApplications(filtered);
    };

    const handleApprove = async (vendorId) => {
        try {
            await api.post(`/users/admin/vendors/${vendorId}/approve/`);
            toast.success('Vendor approved successfully!');
            fetchApplications();
            setShowDetailsModal(false);
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
            await api.post(`/users/admin/vendors/${selectedVendor.id}/reject/`, {
                reason: rejectionReason
            });
            toast.success('Vendor application rejected');
            setShowRejectModal(false);
            setRejectionReason('');
            fetchApplications();
            setShowDetailsModal(false);
        } catch (error) {
            console.error('Failed to reject vendor:', error);
            toast.error('Failed to reject vendor');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Pending' },
            approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Rejected' }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}>
                <Icon className="h-3 w-3" />
                {badge.text}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Vendor Applications</h1>
                        <p className="text-sm md:text-base text-slate-600 mt-1">Review and manage vendor applications</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by name, business, or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                <Button
                                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('pending')}
                                >
                                    Pending
                                </Button>
                                <Button
                                    variant={statusFilter === 'approved' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('approved')}
                                >
                                    Approved
                                </Button>
                                <Button
                                    variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('rejected')}
                                >
                                    Rejected
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Store className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No {statusFilter} applications found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredApplications.map((vendor, idx) => (
                            <motion.div
                                key={vendor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                                        <Store className="h-6 w-6 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{vendor.business_name || vendor.username}</h3>
                                                        <p className="text-sm text-slate-500">@{vendor.username}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="h-4 w-4" />
                                                        {vendor.business_email || vendor.email}
                                                    </div>
                                                    {vendor.business_phone && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone className="h-4 w-4" />
                                                            {vendor.business_phone}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(vendor.vendor_status)}
                                                    </div>
                                                </div>

                                                {vendor.vendor_application_date && (
                                                    <p className="text-xs text-slate-400 mt-2">
                                                        Applied: {new Date(vendor.vendor_application_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedVendor(vendor);
                                                        setShowDetailsModal(true);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                                {vendor.vendor_status === 'pending' && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleApprove(vendor.id)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => {
                                                                setSelectedVendor(vendor);
                                                                setShowRejectModal(true);
                                                            }}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Vendor Details Modal */}
                {showDetailsModal && selectedVendor && (
                    <Modal
                        isOpen={showDetailsModal}
                        onClose={() => setShowDetailsModal(false)}
                        title="Vendor Application Details"
                    >
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 mb-2">Business Information</h4>
                                <div className="space-y-2">
                                    <p><strong>Business Name:</strong> {selectedVendor.business_name}</p>
                                    <p><strong>Email:</strong> {selectedVendor.business_email}</p>
                                    <p><strong>Phone:</strong> {selectedVendor.business_phone}</p>
                                    <p><strong>Address:</strong> {selectedVendor.business_address}</p>
                                    {selectedVendor.tax_number && (
                                        <p><strong>Tax Number:</strong> {selectedVendor.tax_number}</p>
                                    )}
                                </div>
                            </div>

                            {selectedVendor.store_description && (
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Store Description</h4>
                                    <p className="text-sm text-slate-600">{selectedVendor.store_description}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 mb-2">Account Information</h4>
                                <div className="space-y-2">
                                    <p><strong>Username:</strong> {selectedVendor.username}</p>
                                    <p><strong>Email:</strong> {selectedVendor.email}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedVendor.vendor_status)}</p>
                                </div>
                            </div>

                            {selectedVendor.vendor_status === 'rejected' && selectedVendor.vendor_rejection_reason && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-sm text-red-700 mb-2">Rejection Reason</h4>
                                    <p className="text-sm text-red-600">{selectedVendor.vendor_rejection_reason}</p>
                                </div>
                            )}

                            {selectedVendor.vendor_status === 'pending' && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        onClick={() => handleApprove(selectedVendor.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Vendor
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setShowRejectModal(true);
                                        }}
                                        className="flex-1"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}

                {/* Rejection Modal */}
                {showRejectModal && (
                    <Modal
                        isOpen={showRejectModal}
                        onClose={() => {
                            setShowRejectModal(false);
                            setRejectionReason('');
                        }}
                        title="Reject Vendor Application"
                    >
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Please provide a reason for rejecting this vendor application. This will be visible to the vendor.
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                className="w-full p-3 border rounded-lg min-h-[120px]"
                                required
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleReject}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    Confirm Rejection
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default VendorApplications;
