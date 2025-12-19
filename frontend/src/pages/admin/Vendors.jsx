import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Search, Store, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/admin/users/');
            console.log('Fetched vendors:', response.data);
            const vendorUsers = response.data.filter(user => user.is_vendor);
            console.log('Filtered vendors:', vendorUsers);
            setVendors(vendorUsers);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleViewVendor = (vendor) => {
        setSelectedVendor(vendor);
        setIsViewModalOpen(true);
    };

    const handleToggleStatus = async (vendorId, currentStatus) => {
        console.log('Toggle clicked:', { vendorId, currentStatus, newStatus: !currentStatus });

        // Optimistic update
        setVendors(prevVendors =>
            prevVendors.map(v =>
                v.id === vendorId ? { ...v, is_active: !currentStatus } : v
            )
        );

        try {
            const response = await api.patch(`/users/admin/users/${vendorId}/`, {
                is_active: !currentStatus
            });
            console.log('API Response:', response.data);
            toast.success(`Vendor ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            // Refresh to ensure data consistency
            await fetchVendors();
        } catch (error) {
            console.error('Failed to update vendor status:', error);
            console.error('Error details:', error.response?.data);
            toast.error('Failed to update vendor status');
            // Revert optimistic update on error
            setVendors(prevVendors =>
                prevVendors.map(v =>
                    v.id === vendorId ? { ...v, is_active: currentStatus } : v
                )
            );
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Vendor Management</h1>
                            <p className="text-sm md:text-base text-slate-600">Manage all vendors in the marketplace</p>
                        </div>
                    </div>

                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search vendors..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-8 text-slate-500">Loading vendors...</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-900">Vendor</th>
                                                <th className="pb-3 font-semibold text-slate-900">Email</th>
                                                <th className="pb-3 font-semibold text-slate-900">Status</th>
                                                <th className="pb-3 font-semibold text-slate-900">Joined</th>
                                                <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredVendors.map((vendor) => (
                                                <tr key={vendor.id} className="border-b last:border-0">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                                <Store className="h-5 w-5 text-orange-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{vendor.username}</div>
                                                                <div className="text-sm text-slate-500">ID: {vendor.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">{vendor.email}</td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleToggleStatus(vendor.id, vendor.is_active)}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${vendor.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                                    }`}
                                                                role="switch"
                                                                aria-checked={vendor.is_active}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${vendor.is_active ? 'translate-x-6' : 'translate-x-1'
                                                                        }`}
                                                                />
                                                            </button>
                                                            <span className={`text-sm font-medium ${vendor.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                                                                {vendor.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        {vendor.date_joined ? new Date(vendor.date_joined).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-4">
                                                        <Button variant="ghost" size="sm" onClick={() => handleViewVendor(vendor)}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* View Vendor Modal */}
                    <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Vendor Details">
                        {selectedVendor && (
                            <div className="space-y-6">
                                {/* Vendor Info */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Store className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedVendor.username}</h3>
                                        <p className="text-slate-600">{selectedVendor.email}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">User ID</label>
                                        <p className="text-lg font-semibold">{selectedVendor.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Status</label>
                                        <p className="text-lg">
                                            <span className={`px-2 py-1 rounded-full text-xs ${selectedVendor.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {selectedVendor.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Joined Date</label>
                                        <p className="text-lg">
                                            {selectedVendor.date_joined ? new Date(selectedVendor.date_joined).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Last Login</label>
                                        <p className="text-lg">
                                            {selectedVendor.last_login ? new Date(selectedVendor.last_login).toLocaleDateString() : 'Never'}
                                        </p>
                                    </div>
                                </div>

                                {/* Roles */}
                                <div>
                                    <label className="text-sm font-medium text-slate-600 block mb-2">Roles & Permissions</label>
                                    <div className="flex gap-2">
                                        {selectedVendor.is_vendor && (
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Vendor</span>
                                        )}
                                        {selectedVendor.is_customer && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Customer</span>
                                        )}
                                        {selectedVendor.is_staff && (
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Admin</span>
                                        )}
                                    </div>
                                </div>

                                {/* Extended Vendor Profile Details */}
                                {selectedVendor.vendor_profile && (
                                    <div className="space-y-6 border-t border-slate-200 pt-6 mt-6">

                                        {/* Store Address */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Store className="h-5 w-5 text-gray-500" /> Store Address
                                            </h4>
                                            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 space-y-1">
                                                <p className="font-medium">{selectedVendor.vendor_profile.store_name}</p>
                                                <p>{selectedVendor.vendor_profile.address}</p>
                                                <p>{selectedVendor.vendor_profile.city}, {selectedVendor.vendor_profile.state} - {selectedVendor.vendor_profile.zip_code}</p>
                                                <p>{selectedVendor.vendor_profile.country}</p>
                                                <p className="mt-2 text-slate-500">Phone: {selectedVendor.vendor_profile.phone}</p>
                                            </div>
                                        </div>

                                        {/* Bank Details */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-3">Bank Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-3 rounded">
                                                    <label className="text-xs text-slate-500 uppercase font-bold">Bank Name</label>
                                                    <p className="font-medium">{selectedVendor.vendor_profile.bank_name || 'N/A'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded">
                                                    <label className="text-xs text-slate-500 uppercase font-bold">Account Number</label>
                                                    <p className="font-medium">{selectedVendor.vendor_profile.bank_account_number || 'N/A'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded">
                                                    <label className="text-xs text-slate-500 uppercase font-bold">IFSC Code</label>
                                                    <p className="font-medium">{selectedVendor.vendor_profile.bank_ifsc_code || 'N/A'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded">
                                                    <label className="text-xs text-slate-500 uppercase font-bold">Account Holder</label>
                                                    <p className="font-medium">{selectedVendor.vendor_profile.bank_account_holder_name || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-3">Documents</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedVendor.vendor_profile.cancelled_cheque ? (
                                                    <a
                                                        href={selectedVendor.vendor_profile.cancelled_cheque}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                                                    >
                                                        📄 Cancelled Cheque
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic text-sm">No Cancelled Cheque</span>
                                                )}

                                                {selectedVendor.vendor_profile.food_license_certificate ? (
                                                    <a
                                                        href={selectedVendor.vendor_profile.food_license_certificate}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                                                    >
                                                        📜 Food License
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic text-sm">No Food License</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default AdminVendors;
