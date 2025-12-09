import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CancelItemModal = ({ item, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const maxQuantity = item.quantity - (item.cancelled_quantity || 0);
    const refundAmount = (item.price * quantity).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(`/orders/items/${item.id}/cancel/`, {
                quantity: parseInt(quantity),
                reason: reason.trim()
            });

            toast.success(`Successfully cancelled ${quantity} item(s). Refund: ₹${response.data.refund_amount}`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel item');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Cancel Item</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Item Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold">{item.product?.name || 'Product'}</h3>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>Price: ₹{item.price}</span>
                        <span>Available to cancel: {maxQuantity}</span>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-semibold">Cancellation Policy</p>
                        <p>Refund will be processed to your original payment method within 5-7 business days.</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Quantity Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Quantity to Cancel
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-20 text-center border rounded-lg py-2"
                                min="1"
                                max={maxQuantity}
                            />
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                className="w-10 h-10 border rounded-lg hover:bg-gray-100"
                                disabled={quantity >= maxQuantity}
                            >
                                +
                            </button>
                            <span className="text-sm text-gray-600">of {maxQuantity}</span>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Reason for Cancellation *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">Select a reason</option>
                            <option value="Changed my mind">Changed my mind</option>
                            <option value="Found better price">Found better price</option>
                            <option value="Ordered by mistake">Ordered by mistake</option>
                            <option value="Delivery taking too long">Delivery taking too long</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Refund Amount */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Refund Amount:</span>
                            <span className="text-2xl font-bold text-blue-600">₹{refundAmount}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={submitting}
                        >
                            Keep Item
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                            disabled={submitting}
                        >
                            {submitting ? 'Cancelling...' : 'Cancel Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CancelItemModal;
