import { useState, useEffect } from 'react';
import { Package, Truck, Tag, Calendar, Download, XCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ShipmentManager = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [shipments, setShipments] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingOrders();
        } else {
            fetchShipments();
        }
    }, [activeTab]);

    const fetchPendingOrders = async () => {
        setLoading(true);
        try {
            // Get orders that are paid but don't have shipments yet
            const response = await api.get('/orders/admin/orders/?status=PROCESSING');
            const orders = response.data.results || response.data;
            setPendingOrders(orders.filter(order =>
                order.payment_status === 'paid' && !order.shipments?.length
            ));
        } catch (error) {
            toast.error('Failed to load pending orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/shipments/');
            setShipments(response.data.results || response.data);
        } catch (error) {
            toast.error('Failed to load shipments');
        } finally {
            setLoading(false);
        }
    };

    const createShipment = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/create-shipment/`);
            toast.success('Shipment created successfully');
            fetchPendingOrders();
            fetchShipments();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create shipment');
        }
    };

    const generateAWB = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/generate-awb/`);
            toast.success('AWB generated successfully');
            fetchShipments();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to generate AWB');
        }
    };

    const generateLabel = async (orderId) => {
        try {
            const response = await api.post(`/orders/${orderId}/generate-label/`);
            if (response.data.label_url) {
                window.open(response.data.label_url, '_blank');
                toast.success('Label generated');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to generate label');
        }
    };

    const schedulePickup = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/schedule-pickup/`);
            toast.success('Pickup scheduled successfully');
            fetchShipments();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to schedule pickup');
        }
    };

    const cancelShipment = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this shipment?')) return;

        try {
            await api.post(`/orders/${orderId}/cancel-shipment/`);
            toast.success('Shipment cancelled');
            fetchShipments();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel shipment');
        }
    };

    const refreshTracking = async (orderId) => {
        try {
            await api.get(`/orders/${orderId}/tracking/`);
            toast.success('Tracking updated');
            fetchShipments();
        } catch (error) {
            toast.error('Failed to refresh tracking');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Pending Assignment': 'bg-yellow-100 text-yellow-800',
            'In Transit': 'bg-blue-100 text-blue-800',
            'Out for Delivery': 'bg-green-100 text-green-800',
            'Delivered': 'bg-green-600 text-white',
            'Cancelled': 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status || 'Unknown'}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipment Management</h1>
                <p className="text-gray-600">Manage Shiprocket shipments and tracking</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Package className="inline-block w-4 h-4 mr-2" />
                            Pending Orders ({pendingOrders.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Truck className="inline-block w-4 h-4 mr-2" />
                            Active Shipments ({shipments.filter(s => s.current_status !== 'Delivered' && s.current_status !== 'Cancelled').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <XCircle className="inline-block w-4 h-4 mr-2" />
                            Completed ({shipments.filter(s => s.current_status === 'Delivered' || s.current_status === 'Cancelled').length})
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* Pending Orders Tab */}
                            {activeTab === 'pending' && (
                                <div>
                                    {pendingOrders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-gray-600">No pending orders</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {pendingOrders.map((order) => (
                                                        <tr key={order.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                #{order.id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {order.shipping_address_data?.full_name || order.user?.username || 'N/A'}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {order.user?.email || order.shipping_address_data?.phone || ''}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                ₹{parseFloat(order.total_amount).toFixed(2)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    Paid
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                <button
                                                                    onClick={() => createShipment(order.id)}
                                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                                                                >
                                                                    Create Shipment
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Active/Completed Shipments Tab */}
                            {(activeTab === 'active' || activeTab === 'completed') && (
                                <div>
                                    {shipments.filter(s =>
                                        activeTab === 'active'
                                            ? (s.current_status !== 'Delivered' && s.current_status !== 'Cancelled')
                                            : (s.current_status === 'Delivered' || s.current_status === 'Cancelled')
                                    ).length === 0 ? (
                                        <div className="text-center py-12">
                                            <Truck className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-gray-600">No shipments found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {shipments
                                                .filter(s =>
                                                    activeTab === 'active'
                                                        ? (s.current_status !== 'Delivered' && s.current_status !== 'Cancelled')
                                                        : (s.current_status === 'Delivered' || s.current_status === 'Cancelled')
                                                )
                                                .map((shipment) => (
                                                    <div key={shipment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900">Order #{shipment.order}</h3>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Shiprocket Order ID: {shipment.shiprocket_order_id}
                                                                </p>
                                                            </div>
                                                            {getStatusBadge(shipment.current_status)}
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                            <div>
                                                                <p className="text-xs text-gray-500">AWB Code</p>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {shipment.awb_code || 'Not generated'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Courier</p>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {shipment.courier_name || 'Pending'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Pickup</p>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {shipment.pickup_scheduled ? 'Scheduled' : 'Not scheduled'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Pickup Token</p>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {shipment.pickup_token_number || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {activeTab === 'active' && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {!shipment.awb_code && (
                                                                    <button
                                                                        onClick={() => generateAWB(shipment.order)}
                                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Tag className="w-4 h-4 mr-2" />
                                                                        Generate AWB
                                                                    </button>
                                                                )}
                                                                {shipment.awb_code && !shipment.label_url && (
                                                                    <button
                                                                        onClick={() => generateLabel(shipment.order)}
                                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        Generate Label
                                                                    </button>
                                                                )}
                                                                {shipment.awb_code && !shipment.pickup_scheduled && (
                                                                    <button
                                                                        onClick={() => schedulePickup(shipment.order)}
                                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Calendar className="w-4 h-4 mr-2" />
                                                                        Schedule Pickup
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => refreshTracking(shipment.order)}
                                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                >
                                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                                    Refresh Tracking
                                                                </button>
                                                                {shipment.label_url && (
                                                                    <a
                                                                        href={shipment.label_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                                                                    >
                                                                        <Download className="w-4 h-4 mr-2" />
                                                                        View Label
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => cancelShipment(shipment.order)}
                                                                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-2" />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipmentManager;
