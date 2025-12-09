import { useState, useEffect } from 'react';
import { Package, Truck, MapPin, ExternalLink } from 'lucide-react';
import api from '../services/api';

const PackageList = ({ orderId }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, [orderId]);

    const fetchPackages = async () => {
        try {
            const response = await api.get(`/orders/${orderId}/packages/`);
            setPackages(response.data);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-gray-100 text-gray-800',
            'manifested': 'bg-blue-100 text-blue-800',
            'picked_up': 'bg-orange-100 text-orange-800',
            'in_transit': 'bg-purple-100 text-purple-800',
            'out_for_delivery': 'bg-indigo-100 text-indigo-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="text-center py-4">Loading packages...</div>;
    }

    if (packages.length === 0) {
        return null; // Don't show section if no packages
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Packages ({packages.length})
            </h2>

            <div className="space-y-4">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="border rounded-lg p-4">
                        {/* Package Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Package {pkg.package_number}</h3>
                                    <p className="text-sm text-gray-600">{pkg.total_items} items</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pkg.status)}`}>
                                {pkg.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        {/* Tracking Info */}
                        {pkg.awb_code && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Tracking Number</p>
                                        <p className="font-semibold">{pkg.awb_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Courier</p>
                                        <p className="font-semibold">{pkg.courier_name || 'Not Assigned'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Weight</p>
                                        <p className="font-semibold">{pkg.weight} kg</p>
                                    </div>
                                </div>
                                {pkg.tracking_url && (
                                    <a
                                        href={pkg.tracking_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Track Package
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Items in Package */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Items in this package:</p>
                            <div className="space-y-2">
                                {pkg.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.product_name}</span>
                                        <span className="text-gray-600">Qty: {item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackageList;
