import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Search, Eye, Package, XCircle } from 'lucide-react';
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/orders/orders/${orderId}/`, { status: newStatus });
            toast.success('Order status updated!');
            setIsViewModalOpen(false);
            fetchOrders();
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Management</h1>
                    <p className="text-slate-600">Manage all orders in the system</p>
                </div>
            </div>

            <Card>
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
                                        <th className="pb-3 font-semibold text-slate-900">Date</th>
                                        <th className="pb-3 font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
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

            {/* View Order Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Order #${selectedOrder?.id}`} size="lg">
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Customer</label>
                                <p className="text-lg font-semibold">{selectedOrder.user?.username}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Order Date</label>
                                <p className="text-lg">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Total Amount</label>
                                <p className="text-lg font-semibold text-orange-600">₹{selectedOrder.total_amount}</p>
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
                            <p className="text-slate-700 whitespace-pre-line">{selectedOrder.shipping_address}</p>
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
                                            <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                        <p className="font-semibold">₹{item.quantity * item.price}</p>
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
                                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
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
        </div>
    );
};

export default AdminOrders;
