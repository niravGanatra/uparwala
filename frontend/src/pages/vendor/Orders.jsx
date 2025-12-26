import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { Search, Eye, Package, Printer, Download, Loader2, Truck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Action loading states
    const [actionLoading, setActionLoading] = useState({
        create: false,
        awb: false,
        label: false,
        pickup: false
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Fetch orders where vendor has items
            const response = await api.get('/orders/orders/');
            // Filter orders that contain items from this vendor
            const vendorOrders = response.data.filter(order =>
                order.items && order.items.length > 0
            );
            setOrders(vendorOrders);

            // If modal is open, update selected order
            if (selectedOrder) {
                const updated = vendorOrders.find(o => o.id === selectedOrder.id);
                if (updated) setSelectedOrder(updated);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    // --- Logistics Actions ---

    const handleCreateShipment = async (orderId) => {
        setActionLoading(prev => ({ ...prev, create: true }));
        try {
            await api.post(`/orders/${orderId}/create-shipment/`);
            toast.success('Shipment created successfully');
            fetchOrders();
        } catch (error) {
            console.error('Create shipment failed:', error);
            toast.error(error.response?.data?.error || 'Failed to create shipment');
        } finally {
            setActionLoading(prev => ({ ...prev, create: false }));
        }
    };

    const handleGenerateAWB = async (orderId) => {
        setActionLoading(prev => ({ ...prev, awb: true }));
        try {
            await api.post(`/orders/${orderId}/generate-awb/`);
            toast.success('AWB generated successfully');
            fetchOrders();
        } catch (error) {
            console.error('Generate AWB failed:', error);
            toast.error(error.response?.data?.error || 'Failed to generate AWB');
        } finally {
            setActionLoading(prev => ({ ...prev, awb: false }));
        }
    };

    const handleGenerateLabel = async (orderId) => {
        setActionLoading(prev => ({ ...prev, label: true }));
        try {
            const response = await api.post(`/orders/${orderId}/generate-label/`);
            if (response.data.label_url) {
                toast.success('Label generated');
                window.open(response.data.label_url, '_blank');
                fetchOrders();
            }
        } catch (error) {
            console.error('Generate label failed:', error);
            toast.error(error.response?.data?.error || 'Failed to generate label');
        } finally {
            setActionLoading(prev => ({ ...prev, label: false }));
        }
    };

    const handleSchedulePickup = async (orderId) => {
        setActionLoading(prev => ({ ...prev, pickup: true }));
        try {
            await api.post(`/orders/${orderId}/schedule-pickup/`);
            toast.success('Pickup scheduled successfully');
            fetchOrders();
        } catch (error) {
            console.error('Schedule pickup failed:', error);
            toast.error(error.response?.data?.error || 'Failed to schedule pickup');
        } finally {
            setActionLoading(prev => ({ ...prev, pickup: false }));
        }
    };


    const filteredOrders = orders.filter(order =>
        order.id?.toString().includes(searchTerm) ||
        order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'PROCESSING': 'bg-blue-100 text-blue-700',
            'SHIPPED': 'bg-purple-100 text-purple-700',
            'DELIVERED': 'bg-green-100 text-green-700',
            'CANCELLED': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">My Orders</h1>
                            <p className="text-sm md:text-base text-slate-600">View and manage orders for your products</p>
                        </div>
                    </div>

                    <Card className="border-2 border-slate-200">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search orders..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-center py-8 text-slate-500">Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 text-lg mb-2">No orders yet</p>
                                    <p className="text-slate-400">Orders containing your products will appear here</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left">
                                                <th className="pb-3 font-semibold text-slate-900">Order ID</th>
                                                <th className="pb-3 font-semibold text-slate-900">Customer</th>
                                                <th className="pb-3 font-semibold text-slate-900">Items</th>
                                                <th className="pb-3 font-semibold text-slate-900">Total</th>
                                                <th className="pb-3 font-semibold text-slate-900">Status</th>
                                                <th className="pb-3 font-semibold text-slate-900">Logistics</th>
                                                <th className="pb-3 font-semibold text-slate-900">Date</th>
                                                <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map((order) => {
                                                const shipment = order.shipment_details;
                                                return (
                                                    <tr key={order.id} className="border-b last:border-0">
                                                        <td className="py-4 font-medium">#{order.id}</td>
                                                        <td className="py-4">{order.user?.username || 'N/A'}</td>
                                                        <td className="py-4">{order.items?.length || 0} items</td>
                                                        <td className="py-4 font-semibold">₹{order.total_amount}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            {shipment ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-xs font-semibold text-blue-600">{shipment.current_status}</span>
                                                                    {shipment.awb_code && (
                                                                        <span className="font-mono text-xs bg-slate-100 px-1 rounded">
                                                                            {shipment.awb_code}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 text-sm">Not started</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4">
                                                            <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                                                                Manage
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* View/Manage Order Modal */}
                    <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Manage Order #${selectedOrder?.id}`} size="lg">
                        {selectedOrder && (
                            <div className="space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                    {/* ... existing order info ... */}
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Customer</label>
                                        <p className="text-lg font-semibold">{selectedOrder.user?.username}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Order Date</label>
                                        <p className="text-lg">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Logistics Management Section */}
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-800">
                                        <Truck className="h-5 w-5" />
                                        Logistics Management
                                    </h3>

                                    {!selectedOrder.shipment_details ? (
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-blue-600">No shipment created yet.</p>
                                            <Button
                                                onClick={() => handleCreateShipment(selectedOrder.id)}
                                                disabled={actionLoading.create}
                                            >
                                                {actionLoading.create && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Create Shipment
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Status Grid */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500">Status:</span>
                                                    <span className="ml-2 font-medium">{selectedOrder.shipment_details.current_status}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">AWB:</span>
                                                    <span className="ml-2 font-mono">{selectedOrder.shipment_details.awb_code || 'Pending'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Courier:</span>
                                                    <span className="ml-2">{selectedOrder.shipment_details.courier_name || '-'}</span>
                                                </div>
                                                {selectedOrder.shipment_details.pickup_scheduled && (
                                                    <div>
                                                        <span className="text-slate-500">Pickup Token:</span>
                                                        <span className="ml-2 font-mono">{selectedOrder.shipment_details.pickup_token}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
                                                {!selectedOrder.shipment_details.awb_code && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleGenerateAWB(selectedOrder.id)}
                                                        disabled={actionLoading.awb}
                                                    >
                                                        {actionLoading.awb && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Generate AWB
                                                    </Button>
                                                )}

                                                {selectedOrder.shipment_details.awb_code && (
                                                    <>
                                                        {selectedOrder.shipment_details.label_url ? (
                                                            <a href={selectedOrder.shipment_details.label_url} target="_blank" rel="noreferrer">
                                                                <Button size="sm" variant="outline" className="gap-2">
                                                                    <Download className="h-4 w-4" /> Download Label
                                                                </Button>
                                                            </a>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleGenerateLabel(selectedOrder.id)}
                                                                disabled={actionLoading.label}
                                                            >
                                                                {actionLoading.label && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Generate Label
                                                            </Button>
                                                        )}

                                                        {!selectedOrder.shipment_details.pickup_scheduled ? (
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => handleSchedulePickup(selectedOrder.id)}
                                                                disabled={actionLoading.pickup}
                                                            >
                                                                {actionLoading.pickup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                Schedule Pickup
                                                            </Button>
                                                        ) : (
                                                            <div className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center">
                                                                <Truck className="w-3 h-3 mr-1" /> Pickup Scheduled
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items List */}
                                <div>
                                    <h3 className="font-semibold mb-3">Order Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                                                <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.product?.name}</p>
                                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-sm">₹{item.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default VendorOrders;
