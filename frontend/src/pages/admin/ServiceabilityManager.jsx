import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Save, CheckCircle, XCircle, RefreshCw, Upload } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';

const ServiceabilityManager = () => {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [csvText, setCsvText] = useState('');
    const [pasting, setPasting] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filterServiceable, setFilterServiceable] = useState('all'); // all, active, inactive

    useEffect(() => {
        fetchPincodes();
    }, [page, search, filterServiceable]);

    const fetchPincodes = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = {
                page,
                search,
            };

            if (filterServiceable !== 'all') {
                params.is_serviceable = filterServiceable === 'active' ? 'True' : 'False';
            }

            const response = await api.get('/orders/admin/serviceability/', { params });

            // Handle both paginated and non-paginated responses  
            let results, totalCount;
            if (Array.isArray(response.data)) {
                // Non-paginated: API returns array directly
                results = response.data;
                totalCount = results.length;
            } else {
                // Paginated: {count, results}
                results = response.data?.results || [];
                totalCount = response.data?.count || 0;
            }

            setPincodes(results);
            setTotalPages(Math.max(1, Math.ceil(totalCount / 50))); // Ensure at least 1 page

        } catch (error) {
            console.error('Failed to fetch pincodes:', error);
            setPincodes([]); // Set empty array on error
            setTotalPages(1);
            toast.error('Failed to load serviceability data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (!search.trim()) {
            toast.error('Enter a pincode or city name to refresh');
            return;
        }

        setRefreshing(true);
        try {
            await api.post('/orders/admin/serviceability/refresh/', { search: search.trim() });
            toast.success('Data refreshed from data.gov.in!');
            fetchPincodes(); // Reload the list
        } catch (error) {
            console.error('Refresh failed:', error);
            toast.error('Failed to refresh data');
        } finally {
            setRefreshing(false);
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
            const response = await api.post('/orders/admin/serviceability/upload_csv/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(response.data.message);
            fetchPincodes(); // Reload the list
        } catch (error) {
            console.error('CSV upload failed:', error);
            toast.error('Failed to upload CSV');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset file input
            }
        }
    };

    const handlePasteCSV = async () => {
        if (!csvText.trim()) {
            toast.error('Please paste CSV data');
            return;
        }

        setPasting(true);
        try {
            const response = await api.post('/orders/admin/serviceability/paste_csv/', {
                csv_data: csvText
            });
            toast.success(response.data.message);
            setCsvText('');
            setShowPasteModal(false);
            fetchPincodes();
        } catch (error) {
            console.error('CSV paste failed:', error);
            toast.error(error.response?.data?.error || 'Failed to import CSV data');
        } finally {
            setPasting(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === pincodes.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pincodes.map(p => p.id));
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
            toast.error('No pincodes selected');
            return;
        }

        if (!window.confirm(`Delete ${selectedIds.length} selected pincodes?`)) {
            return;
        }

        setDeleting(true);
        try {
            await api.post('/orders/admin/serviceability/bulk_delete/', {
                ids: selectedIds
            });
            toast.success(`Deleted ${selectedIds.length} pincodes`);
            setSelectedIds([]);
            fetchPincodes();
        } catch (error) {
            console.error('Bulk delete failed:', error);
            toast.error('Failed to delete pincodes');
        } finally {
            setDeleting(false);
        }
    };

    const toggleStatus = async (id, field, currentValue) => {
        // Optimistic Update
        const updatedList = pincodes.map(item =>
            item.id === id ? { ...item, [field]: !currentValue } : item
        );
        setPincodes(updatedList);

        try {
            await api.patch(`/orders/admin/serviceability/${id}/`, {
                [field]: !currentValue
            });
            toast.success('Status updated');
        } catch (error) {
            // Revert on failure
            toast.error('Failed to update status');
            fetchPincodes();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Serviceability Manager</h1>
                    <p className="text-slate-500">Upload CSV, paste data, or search database</p>
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
                    <Button
                        onClick={() => setShowPasteModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Paste CSV
                    </Button>
                    <Button
                        onClick={handleBulkDelete}
                        disabled={deleting || selectedIds.length === 0}
                        className={`${selectedIds.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-300 cursor-not-allowed'} text-white transition-colors`}
                        title={selectedIds.length === 0 ? "Select items to delete" : "Delete selected items"}
                    >
                        <XCircle className={`h-4 w-4 mr-2 ${deleting ? 'animate-spin' : ''}`} />
                        {deleting ? 'Deleting...' : `Delete (${selectedIds.length})`}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Search pincode, city, state..."
                        value={search}
                        onChange={handleSearch}
                        className="pl-10"
                    />
                </div>

                <Button
                    onClick={handleRefresh}
                    disabled={refreshing || !search.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Fetching...' : 'Refresh from API'}
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Status:</span>
                    <select
                        className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={filterServiceable}
                        onChange={(e) => setFilterServiceable(e.target.value)}
                    >
                        <option value="all">All Locations</option>
                        <option value="active">Serviceable Only</option>
                        <option value="inactive">Non-Serviceable</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}


            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-sm font-semibold text-slate-700 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === pincodes.length && pincodes.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 accent-blue-600 cursor-pointer align-middle"
                                        style={{ appearance: 'auto', margin: 0 }}
                                    />
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Pincode</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">City / State</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Zone</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-center">Serviceable</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-center">COD Available</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Loading data...
                                    </td>
                                </tr>
                            ) : pincodes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No pincodes found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                pincodes.map((pin) => (
                                    <tr key={pin.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(pin.id)}
                                                onChange={() => toggleSelect(pin.id)}
                                                className="w-5 h-5 accent-blue-600 cursor-pointer align-middle"
                                                style={{ appearance: 'auto', margin: 0 }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-700">
                                            {pin.pincode}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{pin.city}</div>
                                            <div className="text-sm text-slate-500">{pin.state}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {pin.zone || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleStatus(pin.id, 'is_serviceable', pin.is_serviceable)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${pin.is_serviceable
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {pin.is_serviceable ? (
                                                    <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3 mr-1" /> Disabled</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={pin.is_cod_available}
                                                    disabled={!pin.is_serviceable}
                                                    onChange={() => toggleStatus(pin.id, 'is_cod_available', pin.is_cod_available)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                            </label>
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

            {/* CSV Paste Modal */}
            {showPasteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Paste CSV Data</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Paste your CSV data below (format: pincode,district,statename)
                        </p>
                        <textarea
                            value={csvText}
                            onChange={(e) => setCsvText(e.target.value)}
                            className="w-full h-64 border border-slate-300 rounded-lg p-3 font-mono text-sm"
                            placeholder="pincode,district,statename
110001,New Delhi,Delhi
400001,Mumbai,Maharashtra
..."
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                onClick={() => {
                                    setShowPasteModal(false);
                                    setCsvText('');
                                }}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePasteCSV}
                                disabled={pasting || !csvText.trim()}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {pasting ? 'Importing...' : 'Import'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceabilityManager;
