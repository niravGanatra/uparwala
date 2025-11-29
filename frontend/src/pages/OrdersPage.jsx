import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders/orders/');
                setOrders(response.data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="text-center py-12">Loading orders...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Order History</h1>
            {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No orders found.
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="bg-slate-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Placed on {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">₹{order.total_amount}</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden">
                                                    {item.product.images && item.product.images.length > 0 ? (
                                                        <img
                                                            src={item.product.images[0].image}
                                                            alt={item.product.name}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{item.product.name}</h4>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="font-medium">₹{item.price * item.quantity}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
