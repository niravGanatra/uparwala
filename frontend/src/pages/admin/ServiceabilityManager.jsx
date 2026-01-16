import { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, XCircle, Upload, Trash2, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';

const ServiceabilityManager = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);

    // Filters
    const [filterActive, setFilterActive] = useState('all'); // all, active, inactive

    useEffect(() => {
        fetchLocations();
    }, [page, search, filterActive]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const params = { page, search };

            if (filterActive !== 'all') {
                params.is_active = filterActive === 'active' ? 'True' : 'False';
            }

            const response = await api.get('/orders/admin/serviceable-areas/', { params });

            let results, totalCount;
            if (Array.isArray(response.data)) {
                results = response.data;
                totalCount = results.length;
            } else {
                results = response.data?.results || [];
                totalCount = response.data?.count || 0;
            }

            setLocations(results);
            setTotalPages(Math.max(1, Math.ceil(totalCount / 50)));

        } catch (error) {
            console.error('Failed to fetch locations:', error);
            setLocations([]);
            setTotalPages(1);
            toast.error('Failed to load serviceability data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/orders/admin/serviceable-areas/stats/');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/orders/admin/serviceable-areas/upload_csv/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000 // 60 seconds for file uploads
            });
            toast.success(response.data.message);
            fetchLocations();
            fetchStats();
        } catch (error) {
            console.error('CSV upload failed:', error);
            toast.error(error.response?.data?.error || 'Failed to upload CSV');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === locations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(locations.map(p => p.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            toast.error('No locations selected');
            return;
        }

        if (!window.confirm(`Delete ${selectedIds.length} selected locations?`)) {
            return;
        }

        setDeleting(true);
        try {
            await api.post('/orders/admin/serviceable-areas/bulk_delete/', {
                ids: selectedIds
            });
            toast.success(`Deleted ${selectedIds.length} locations`);
            setSelectedIds([]);
            fetchLocations();
            fetchStats();
        } catch (error) {
            console.error('Bulk delete failed:', error);
            toast.error('Failed to delete locations');
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkToggle = async (setActive) => {
        if (selectedIds.length === 0) {
            toast.error('No locations selected');
            return;
        }

        try {
            await api.post('/orders/admin/serviceable-areas/bulk_toggle/', {
                ids: selectedIds,
                is_active: setActive
            });
            toast.success(`${setActive ? 'Enabled' : 'Disabled'} ${selectedIds.length} locations`);
            setSelectedIds([]);
            fetchLocations();
            fetchStats();
        } catch (error) {
            console.error('Bulk toggle failed:', error);
            toast.error('Failed to update locations');
        }
    };

    const toggleStatus = async (id, currentValue) => {
        // Optimistic Update
        const updatedList = locations.map(item =>
            item.id === id ? { ...item, is_active: !currentValue } : item
        );
        setLocations(updatedList);

        try {
            await api.patch(`/orders/admin/serviceable-areas/${id}/`, {
                is_active: !currentValue
            });
            toast.success('Status updated');
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
            fetchLocations();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Serviceability Manager</h1>
                    <p className="text-slate-500">Manage locations where you accept orders</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Upload className={`h-4 w-4 mr-2 ${uploading ? 'animate-spin' : ''}`} />
                        {uploading ? 'Uploading...' : 'Upload CSV'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Locations</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Inactive</p>
                                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div>
                            <p className="text-sm text-slate-500 mb-2">Top States</p>
                            <div className="flex flex-wrap gap-1">
                                {stats.by_state?.slice(0, 3).map((s, i) => (
                                    <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                                        {s.state}: {s.count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Search pincode, city, state, area..."
                        value={search}
                        onChange={handleSearch}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Status:</span>
                    <select
                        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                    >
                        <option value="all">All Locations</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-800">
                        {selectedIds.length} location(s) selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleBulkToggle(true)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                            size="sm"
                        >
                            <CheckCircle className="h-4 w-4 mr-1" /> Enable
                        </Button>
                        <Button
                            onClick={() => handleBulkToggle(false)}
                            className="bg-slate-600 hover:bg-slate-700 text-white text-sm"
                            size="sm"
                        >
                            <XCircle className="h-4 w-4 mr-1" /> Disable
                        </Button>
                        <Button
                            onClick={handleBulkDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm"
                            size="sm"
                        >
                            <Trash2 className={`h-4 w-4 mr-1 ${deleting ? 'animate-spin' : ''}`} />
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-sm font-semibold text-slate-700 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === locations.length && locations.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 accent-blue-600 cursor-pointer align-middle"
                                        style={{ appearance: 'auto', margin: 0 }}
                                    />
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Pincode</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Area</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">City / State</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        Loading data...
                                    </td>
                                </tr>
                            ) : locations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No locations found. Upload a CSV to get started.
                                    </td>
                                </tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(loc.id)}
                                                onChange={() => toggleSelect(loc.id)}
                                                className="w-5 h-5 accent-blue-600 cursor-pointer align-middle"
                                                style={{ appearance: 'auto', margin: 0 }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-700">
                                            {loc.pincode}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {loc.area || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{loc.city}</div>
                                            <div className="text-sm text-slate-500">{loc.state}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleStatus(loc.id, loc.is_active)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${loc.is_active
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {loc.is_active ? (
                                                    <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* CSV Format Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">CSV Format Guide</h3>
                <p className="text-sm text-blue-700">
                    Your CSV should contain columns for: <code className="bg-blue-100 px-1 rounded">State</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">City</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">ZipCode</code> (or Pincode),{' '}
                    and optionally <code className="bg-blue-100 px-1 rounded">Area</code> (or Locality).
                </p>
            </div>
        </div>
    );
};

export default ServiceabilityManager;
