import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Search, Store, Eye, MapPin, Phone, CreditCard, FileText, Globe, Info, Calendar, Trash2 } from 'lucide-react';
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
            const vendorUsers = response.data.filter(user => user.is_vendor);
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
        // Optimistic update
        setVendors(prevVendors =>
            prevVendors.map(v =>
                v.id === vendorId ? { ...v, is_active: !currentStatus } : v
            )
        );

        try {
            await api.patch(`/users/admin/users/${vendorId}/`, {
                is_active: !currentStatus
            });
            toast.success(`Vendor ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            fetchVendors();
        } catch (error) {
            toast.error('Failed to update vendor status');
            // Revert
            setVendors(prevVendors =>
                prevVendors.map(v =>
                    v.id === vendorId ? { ...v, is_active: currentStatus } : v
                )
            );
        }
    };

    const handleDeleteVendor = async (vendorId, storeName) => {
        if (!window.confirm(`Are you sure you want to DELETE "${storeName}"? This will permanently remove the vendor and all associated data. This action cannot be undone!`)) {
            return;
        }

        try {
            await api.delete(`/users/admin/vendor-applications/${vendorId}/delete/`);
            toast.success(`Vendor deleted successfully!`);
            fetchVendors();
        } catch (error) {
            console.error('Failed to delete vendor:', error);
            toast.error('Failed to delete vendor');
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.vendor_profile?.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getVerificationBadge = (status) => {
        const styles = {
            verified: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status || 'Pending'}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Vendor Management</h1>
                            <p className="text-sm md:text-base text-slate-600">Manage all vendors, verify documents, and track performance.</p>
                        </div>
                    </div>

                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by store name, username, or email..."
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
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-slate-50">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 font-semibold text-slate-900">Store Info</th>
                                                <th className="px-4 py-3 font-semibold text-slate-900">Contact</th>
                                                <th className="px-4 py-3 font-semibold text-slate-900">Location</th>
                                                <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                                                <th className="px-4 py-3 font-semibold text-slate-900 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredVendors.map((vendor) => {
                                                const profile = vendor.vendor_profile || {};
                                                return (
                                                    <tr key={vendor.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                                                    {profile.store_logo ? (
                                                                        <img src={profile.store_logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                                                                    ) : (
                                                                        <Store className="h-5 w-5 text-orange-600" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-slate-900">{profile.store_name || vendor.username}</div>
                                                                    <div className="text-xs text-slate-500">{vendor.email}</div>
                                                                    <div className="text-xs text-slate-400">ID: {vendor.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                                    <span>{profile.phone || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                                    <span className="text-xs text-slate-500">Since {vendor.date_joined ? new Date(vendor.date_joined).toLocaleDateString() : 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                                <span>{profile.city || 'N/A'}</span>
                                                            </div>
                                                            <div className="text-xs text-slate-500 pl-5">{profile.state}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col items-start gap-2">
                                                                {getVerificationBadge(profile.verification_status)}
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-2 h-2 rounded-full ${vendor.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                                    <span className="text-xs text-slate-600">{vendor.is_active ? 'Active' : 'Inactive'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleToggleStatus(vendor.id, vendor.is_active)}
                                                                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${vendor.is_active
                                                                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                                                                        : 'border-green-200 text-green-700 hover:bg-green-50'
                                                                        }`}
                                                                >
                                                                    {vendor.is_active ? 'Deactivate' : 'Activate'}
                                                                </button>
                                                                <Button variant="outline" size="sm" onClick={() => handleViewVendor(vendor)}>
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                <button
                                                                    onClick={() => handleDeleteVendor(vendor.id, vendor.vendor_profile?.store_name || vendor.username)}
                                                                    className="px-3 py-1.5 rounded text-xs font-medium border border-red-200 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enhanced View Vendor Modal */}
                    <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Vendor Profile Details">
                        {selectedVendor && (
                            <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2 pb-10">
                                {(() => {
                                    const p = selectedVendor.vendor_profile || {};
                                    return (
                                        <>
                                            {/* Header Section */}
                                            <div className="flex items-start gap-5 p-5 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 p-1 shadow-sm shrink-0">
                                                    {p.store_logo ? (
                                                        <img src={p.store_logo} alt="Logo" className="w-full h-full object-cover rounded" />
                                                    ) : (
                                                        <Store className="w-full h-full text-slate-300 p-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h2 className="text-xl font-bold text-slate-900">{p.store_name || selectedVendor.username}</h2>
                                                            <p className="text-slate-500 text-sm mt-1">{p.store_description || "No description provided."}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {getVerificationBadge(p.verification_status)}
                                                            <span className="text-xs text-slate-400">ID: {selectedVendor.id}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 mt-4 text-sm text-slate-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <Globe className="w-4 h-4" />
                                                            {p.store_slug || 'No slug'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                {/* Contact Information */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5 text-blue-500" /> Location & Contact
                                                    </h3>
                                                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm space-y-3 shadow-sm">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Phone:</span>
                                                            <span className="col-span-2 font-medium">{p.phone || 'N/A'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Email:</span>
                                                            <span className="col-span-2 font-medium">{selectedVendor.email}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Address:</span>
                                                            <span className="col-span-2 font-medium">{p.address || 'N/A'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Region:</span>
                                                            <span className="col-span-2 font-medium">
                                                                {[p.city, p.state, p.country, p.zip_code].filter(Boolean).join(', ')}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Shiprocket:</span>
                                                            <span className="col-span-2 text-xs font-mono bg-slate-100 px-2 py-0.5 rounded w-fit">
                                                                {p.shiprocket_pickup_location_name || 'Not Synced'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bank Details */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                        <CreditCard className="w-5 h-5 text-green-500" /> Banking & Finance
                                                    </h3>
                                                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm space-y-3 shadow-sm">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Bank Name:</span>
                                                            <span className="col-span-2 font-medium">{p.bank_name || 'N/A'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Account No:</span>
                                                            <span className="col-span-2 font-medium">{p.bank_account_number || 'N/A'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">IFSC Code:</span>
                                                            <span className="col-span-2 font-medium font-mono">{p.bank_ifsc_code || 'N/A'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className="text-slate-500">Holder:</span>
                                                            <span className="col-span-2 font-medium">{p.bank_account_holder_name || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Documents Section */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-purple-500" /> Documents & Licenses
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-slate-900">Cancelled Cheque</p>
                                                            <p className="text-xs text-slate-500">Banking verification</p>
                                                        </div>
                                                        {p.cancelled_cheque ? (
                                                            <a href={p.cancelled_cheque} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">View</a>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">Not Uploaded</span>
                                                        )}
                                                    </div>

                                                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-slate-900">Food License (FSSAI)</p>
                                                            <p className="text-xs text-slate-500">{p.food_license_number || 'No number provided'}</p>
                                                        </div>
                                                        {p.food_license_certificate ? (
                                                            <a href={p.food_license_certificate} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">View</a>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">Not Uploaded</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* System & SEO */}
                                            <div className="space-y-4 border-t pt-6">
                                                <details className="group">
                                                    <summary className="flex items-center cursor-pointer text-slate-600 hover:text-slate-900 font-medium list-none">
                                                        <Info className="w-4 h-4 mr-2" />
                                                        Additional System Information & SEO
                                                        <span className="ml-auto transition transform group-open:rotate-180">▼</span>
                                                    </summary>
                                                    <div className="mt-4 grid grid-cols-2 gap-6 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                                                        <div>
                                                            <p className="mb-1 font-semibold">SEO Settings</p>
                                                            <p>Title: {p.seo_title || '-'}</p>
                                                            <p>Desc: {p.seo_description || '-'}</p>
                                                            <p>Keywords: {p.seo_keywords || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 font-semibold">Timestamps</p>
                                                            <p>Joined: {new Date(selectedVendor.date_joined).toLocaleString()}</p>
                                                            <p>Last Login: {selectedVendor.last_login ? new Date(selectedVendor.last_login).toLocaleString() : 'Never'}</p>
                                                        </div>
                                                    </div>
                                                </details>
                                            </div>

                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default AdminVendors;
