import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Eye, Package, XCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState({ orderId: null, newStatus: null });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/admin/orders/');
            setOrders(response.data);
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

    const confirmStatusUpdate = (orderId, newStatus) => {
        setStatusUpdate({ orderId, newStatus });
        setIsStatusDialogOpen(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await api.patch(`/orders/orders/${statusUpdate.orderId}/`, { status: statusUpdate.newStatus });
            toast.success('Order status updated!');

            // Re-fetch the updated order details
            const response = await api.get(`/orders/orders/${statusUpdate.orderId}/`);

            // Update the selected order in the modal
            if (selectedOrder && selectedOrder.id === statusUpdate.orderId) {
                setSelectedOrder(response.data);
            }

            // Update the order in the orders list
            setOrders(orders.map(order =>
                order.id === statusUpdate.orderId ? response.data : order
            ));

            setIsStatusDialogOpen(false);
            setStatusUpdate({ orderId: null, newStatus: null });
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const confirmCancelOrder = (order) => {
        setOrderToCancel(order);
        setIsCancelDialogOpen(true);
    };

    const handleCancelOrder = async () => {
        try {
            await api.patch(`/orders/orders/${orderToCancel.id}/`, { status: 'CANCELLED' });
            toast.success('Order cancelled successfully!');
            setIsCancelDialogOpen(false);
            setOrderToCancel(null);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to cancel order');
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id?.toString().includes(searchTerm) ||
        order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Split orders into active and delivered
    const activeOrders = filteredOrders.filter(order =>
        order.status !== 'DELIVERED' && order.status !== 'CANCELLED'
    );
    const deliveredOrders = filteredOrders.filter(order =>
        order.status === 'DELIVERED' || order.status === 'CANCELLED'
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

    const OrdersTable = ({ orders: tableOrders, title, icon: Icon }) => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {title}
                    <span className="text-sm font-normal text-slate-500">({tableOrders.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {tableOrders.length === 0 ? (
                    <p className="text-center py-8 text-slate-500">No orders found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="pb-3 font-semibold text-slate-900">Order ID</th>
                                    <th className="pb-3 font-semibold text-slate-900">Customer</th>
                                    <th className="pb-3 font-semibold text-slate-900">Email</th>
                                    <th className="pb-3 font-semibold text-slate-900">Items</th>
                                    <th className="pb-3 font-semibold text-slate-900">Total</th>
                                    <th className="pb-3 font-semibold text-slate-900">Status</th>
                                    <th className="pb-3 font-semibold text-slate-900">Date</th>
                                    <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableOrders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0">
                                        <td className="py-4 font-medium">#{order.id}</td>
                                        <td className="py-4">{order.user?.username || 'N/A'}</td>
                                        <td className="py-4 text-sm text-slate-600">{order.user?.email || 'N/A'}</td>
                                        <td className="py-4">{order.items?.length || 0} items</td>
                                        <td className="py-4 font-semibold">₹{Number(order.total_amount || 0).toFixed(2)}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => confirmCancelOrder(order)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full max-w-full overflow-hidden">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Order Management</h1>
                            <p className="text-sm md:text-base text-slate-600">Manage all orders in the system</p>
                        </div>
                    </div>

                    {/* Search */}
                    <Card className="border-2 border-slate-200">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by order ID, customer name, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <p className="text-center py-8 text-slate-500">Loading orders...</p>
                    ) : (
                        <>
                            {/* Active Orders Table */}
                            <OrdersTable
                                orders={activeOrders}
                                title="Active Orders"
                                icon={Package}
                            />

                            {/* Delivered Orders Table */}
                            <OrdersTable
                                orders={deliveredOrders}
                                title="Delivered & Cancelled Orders"
                                icon={CheckCircle2}
                            />
                        </>
                    )}

                    {/* View Order Modal */}
                    <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Order #${selectedOrder?.id}`} size="lg">
                        {selectedOrder && (
                            <div className="space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Customer</label>
                                        <p className="text-lg font-semibold">{selectedOrder.user?.username || 'N/A'}</p>
                                        <p className="text-sm text-slate-600">{selectedOrder.user?.email || ''}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Order Date</label>
                                        <p className="text-lg">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Total Amount</label>
                                        <p className="text-lg font-semibold text-orange-600">₹{Number(selectedOrder.total_amount || 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Current Status</label>
                                        <p className="text-lg">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                                    {selectedOrder.shipping_address_data && (
                                        <div className="text-slate-700">
                                            <p className="font-medium">{selectedOrder.shipping_address_data.full_name}</p>
                                            <p>{selectedOrder.shipping_address_data.address_line1}</p>
                                            {selectedOrder.shipping_address_data.address_line2 && (
                                                <p>{selectedOrder.shipping_address_data.address_line2}</p>
                                            )}
                                            <p>{selectedOrder.shipping_address_data.city}, {selectedOrder.shipping_address_data.state} - {selectedOrder.shipping_address_data.pincode}</p>
                                            <p className="mt-1">Phone: {selectedOrder.shipping_address_data.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="font-semibold mb-3">Order Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                                                {item.product?.images && item.product.images.length > 0 ? (
                                                    <img
                                                        src={item.product.images[0].image}
                                                        alt={item.product.name}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product?.name}</p>
                                                    <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}</p>
                                                </div>
                                                <p className="font-semibold">₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Update Status */}
                                <div>
                                    <h3 className="font-semibold mb-3">Update Order Status</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
                                            <Button
                                                key={status}
                                                size="sm"
                                                variant={selectedOrder.status === status ? 'default' : 'outline'}
                                                onClick={() => confirmStatusUpdate(selectedOrder.id, status)}
                                                disabled={selectedOrder.status === status}
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Cancel Order Confirmation Dialog */}
                    <ConfirmDialog
                        isOpen={isCancelDialogOpen}
                        onClose={() => setIsCancelDialogOpen(false)}
                        onConfirm={handleCancelOrder}
                        title="Cancel Order"
                        message={`Are you sure you want to cancel order #${orderToCancel?.id}? This action cannot be undone.`}
                        confirmText="Cancel Order"
                        confirmVariant="destructive"
                    />

                    {/* Status Update Confirmation Dialog */}
                    <ConfirmDialog
                        isOpen={isStatusDialogOpen}
                        onClose={() => {
                            setIsStatusDialogOpen(false);
                            setStatusUpdate({ orderId: null, newStatus: null });
                        }}
                        onConfirm={handleUpdateStatus}
                        title="Update Order Status"
                        message={`Are you sure you want to change the order status to "${statusUpdate.newStatus}"?`}
                        confirmText="Update Status"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
