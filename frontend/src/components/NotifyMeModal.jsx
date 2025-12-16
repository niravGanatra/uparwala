import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import api from '../services/api';

const NotifyMeModal = ({ product, isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email && !phone) {
            toast.error('Please provide either email or phone number');
            return;
        }

        setLoading(true);
        try {
            await api.post('/products/stock-notifications/', {
                product_id: product.id,
                email: email.trim(),
                phone: phone.trim()
            });

            toast.success('You will be notified when this product is back in stock!');
            onClose();
            setEmail('');
            setPhone('');
        } catch (error) {
            console.error('Failed to register notification:', error);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to register. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Notify Me When Available
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Enter your contact details and we'll notify you when <span className="font-medium">{product.name}</span> is back in stock.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">OR</span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <p className="text-xs text-gray-500">
                            * Provide at least one contact method. We'll use it only to notify you about this product.
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Notify Me'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default NotifyMeModal;
