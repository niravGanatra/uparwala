import { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, XCircle, Upload, Trash2, BarChart3, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';

const ServiceabilityManager = () => {
    const [activeTab, setActiveTab] = useState('hierarchy');
    const [locations, setLocations] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [expandedStates, setExpandedStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const [filterActive, setFilterActive] = useState('all');

    useEffect(() => {
        if (activeTab === 'pincodes') {
            fetchLocations();
        } else {
            fetchHierarchy();
        }
    }, [page, search, filterActive, activeTab]);

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
            toast.error('Failed to load serviceability data');
        } finally {
            setLoading(false);
        }
    };

    const fetchHierarchy = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/admin/serviceable-areas/hierarchy/');
            setHierarchy(response.data);
        } catch (error) {
            console.error('Failed to fetch hierarchy:', error);
            toast.error('Failed to load location hierarchy');
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
                timeout: 300000
            });
            toast.success(response.data.message);
            fetchStats();
            if (activeTab === 'hierarchy') fetchHierarchy();
            else fetchLocations();
        } catch (error) {
            console.error('CSV upload failed:', error);
            toast.error(error.response?.data?.error || 'Failed to upload CSV');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleStateExpand = (stateName) => {
        setExpandedStates(prev => ({ ...prev, [stateName]: !prev[stateName] }));
    };

    const handleToggleState = async (stateName, setActive) => {
        try {
            await api.post('/orders/admin/serviceable-areas/toggle_state/', { state: stateName, is_active: setActive });
            toast.success(`${setActive ? 'Enabled' : 'Disabled'} all pincodes in ${stateName}`);
            fetchHierarchy();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update state');
        }
    };

    const handleToggleCity = async (stateName, cityName, setActive) => {
        try {
            await api.post('/orders/admin/serviceable-areas/toggle_city/', { state: stateName, city: cityName, is_active: setActive });
            toast.success(`${setActive ? 'Enabled' : 'Disabled'} ${cityName}`);
            fetchHierarchy();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update city');
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
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected locations?`)) return;

        setDeleting(true);
        try {
            await api.post('/orders/admin/serviceable-areas/bulk_delete/', { ids: selectedIds });
            toast.success(`Deleted ${selectedIds.length} locations`);
            setSelectedIds([]);
            fetchLocations();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete locations');
        } finally {
            setDeleting(false);
        }
    };

    const toggleStatus = async (id, currentValue) => {
        const updatedList = locations.map(item => item.id === id ? { ...item, is_active: !currentValue } : item);
        setLocations(updatedList);

        try {
            await api.patch(`/orders/admin/serviceable-areas/${id}/`, { is_active: !currentValue });
            toast.success('Status updated');
            fetchStats();
        } catch (error) {
            toast.error('Failed to update');
            fetchLocations();
        }
    };

    const filteredHierarchy = search
        ? hierarchy.filter(s => s.state.toLowerCase().includes(search.toLowerCase()) || s.cities.some(c => c.city.toLowerCase().includes(search.toLowerCase())))
        : hierarchy;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Serviceability Manager</h1>
                    <p className="text-slate-500">Manage locations where you accept orders</p>
                </div>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                            <div className="p-2 bg-blue-100 rounded-lg"><BarChart3 className="h-5 w-5 text-blue-600" /></div>
                            <div>
                                <p className="text-sm text-slate-500">Total Pincodes</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.total?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                            <div>
                                <p className="text-sm text-slate-500">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div>
                            <div>
                                <p className="text-sm text-slate-500">Inactive</p>
                                <p className="text-2xl font-bold text-red-600">{stats.inactive?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg"><MapPin className="h-5 w-5 text-purple-600" /></div>
                            <div>
                                <p className="text-sm text-slate-500">Cities</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.city_count?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('hierarchy')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'hierarchy' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    By Location
                </button>
                <button
                    onClick={() => setActiveTab('pincodes')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'pincodes' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    By Pincode
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder={activeTab === 'hierarchy' ? "Search state or city..." : "Search pincode, city, state..."}
                        value={search}
                        onChange={handleSearch}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Hierarchy View */}
            {activeTab === 'hierarchy' && (
                <div className="space-y-3">
                    {loading ? (
                        <div className="bg-white p-8 rounded-xl text-center text-slate-500">Loading...</div>
                    ) : filteredHierarchy.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl text-center text-slate-500">
                            No locations found. Upload a CSV to get started.
                        </div>
                    ) : (
                        filteredHierarchy.map((stateData) => (
                            <div key={stateData.state} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                {/* State Header */}
                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50" onClick={() => toggleStateExpand(stateData.state)}>
                                    <div className="flex items-center gap-3">
                                        {expandedStates[stateData.state] ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                                        <span className="font-semibold text-slate-800">{stateData.state}</span>
                                        <span className="text-sm text-slate-500">{stateData.active}/{stateData.total} active • {stateData.cities?.length} cities</span>
                                    </div>
                                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                        <span className="text-xs text-slate-500">All</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={stateData.active === stateData.total && stateData.total > 0} onChange={() => handleToggleState(stateData.state, stateData.active !== stateData.total)} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Cities */}
                                {expandedStates[stateData.state] && (
                                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                                        {stateData.cities?.map((cityData) => (
                                            <div key={cityData.city} className="flex items-center justify-between px-6 py-3 pl-12 hover:bg-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-700">{cityData.city}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${cityData.active === cityData.total ? 'bg-green-100 text-green-700' : cityData.active === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {cityData.active}/{cityData.total}
                                                    </span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" checked={cityData.active === cityData.total && cityData.total > 0} onChange={() => handleToggleCity(stateData.state, cityData.city, cityData.active !== cityData.total)} />
                                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pincode Table View */}
            {activeTab === 'pincodes' && (
                <>
                    {selectedIds.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-orange-800">{selectedIds.length} selected</span>
                            <Button onClick={handleBulkDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white text-sm" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-4 w-10">
                                            <input type="checkbox" checked={selectedIds.length === locations.length && locations.length > 0} onChange={toggleSelectAll} className="w-5 h-5 accent-blue-600" />
                                        </th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">Pincode</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">Area</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700">City / State</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
                                    ) : locations.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No locations found.</td></tr>
                                    ) : (
                                        locations.map((loc) => (
                                            <tr key={loc.id} className="hover:bg-slate-50/50">
                                                <td className="px-4 py-4">
                                                    <input type="checkbox" checked={selectedIds.includes(loc.id)} onChange={() => toggleSelect(loc.id)} className="w-5 h-5 accent-blue-600" />
                                                </td>
                                                <td className="px-6 py-4 font-mono font-medium text-slate-700">{loc.pincode}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{loc.area || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800">{loc.city}</div>
                                                    <div className="text-sm text-slate-500">{loc.state}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(loc.id, loc.is_active)}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${loc.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                    >
                                                        {loc.is_active ? <><CheckCircle className="w-3 h-3 mr-1" /> Active</> : <><XCircle className="w-3 h-3 mr-1" /> Inactive</>}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* CSV Format Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">CSV Format Guide</h3>
                <p className="text-sm text-blue-700">
                    Columns: <code className="bg-blue-100 px-1 rounded">State</code>, <code className="bg-blue-100 px-1 rounded">City</code>, <code className="bg-blue-100 px-1 rounded">ZipCode/Pincode</code>, <code className="bg-blue-100 px-1 rounded">Area</code> (optional)
                </p>
            </div>
        </div>
    );
};

export default ServiceabilityManager;
