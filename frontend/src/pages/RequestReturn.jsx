import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const RequestReturn = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        order_item: '',
        reason: 'defective',
        description: '',
        quantity: 1
    });

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/orders/${orderId}/`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.post('/orders/returns/', {
                order: parseInt(orderId),
                ...formData,
                order_item: parseInt(formData.order_item),
                quantity: parseInt(formData.quantity)
            });
            toast.success('Return request submitted successfully');
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit return request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Order not found</h2>
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const returnReasons = [
        { value: 'defective', label: 'Defective/Damaged' },
        { value: 'wrong_item', label: 'Wrong Item Sent' },
        { value: 'not_as_described', label: 'Not as Described' },
        { value: 'quality_issue', label: 'Quality Issue' },
        { value: 'changed_mind', label: 'Changed Mind' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <button
                    onClick={() => navigate(`/orders/${orderId}`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Order Details
                </button>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-6">Request Return</h1>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h2 className="font-semibold mb-2">Order #{order.id}</h2>
                        <p className="text-sm text-gray-600">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Select Item */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Select Item to Return *
                            </label>
                            <select
                                value={formData.order_item}
                                onChange={(e) => setFormData({ ...formData, order_item: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            >
                                <option value="">Choose an item...</option>
                                {order.items?.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.product.name} (Qty: {item.quantity}) - ₹{item.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity */}
                        {formData.order_item && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Quantity to Return *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={order.items?.find(i => i.id === parseInt(formData.order_item))?.quantity || 1}
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Reason for Return *
                            </label>
                            <select
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            >
                                {returnReasons.map((reason) => (
                                    <option key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                                rows="5"
                                placeholder="Please provide details about why you're returning this item..."
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Provide as much detail as possible to help us process your return faster.
                            </p>
                        </div>

                        {/* Return Policy Notice */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Return Policy</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Returns must be requested within 7 days of delivery</li>
                                <li>• Items must be unused and in original packaging</li>
                                <li>• Refund will be processed after item inspection</li>
                                <li>• Return shipping may be charged based on reason</li>
                            </ul>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Return Request'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/orders/${orderId}`)}
                                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestReturn;
