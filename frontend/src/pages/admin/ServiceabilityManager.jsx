import { useState, useEffect } from 'react';
import { Search, Filter, Save, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';

const ServiceabilityManager = () => {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
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

            // Handle response with defaults for empty/malformed data
            const results = response.data?.results || [];
            const totalCount = response.data?.count || 0;

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

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search
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
                    <p className="text-slate-500">Manage delivery zones and COD availability</p>
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

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
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
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        Loading data...
                                    </td>
                                </tr>
                            ) : pincodes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No pincodes found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                pincodes.map((pin) => (
                                    <tr key={pin.id} className="hover:bg-slate-50/50 transition-colors">
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
        </div>
    );
};

export default ServiceabilityManager;
