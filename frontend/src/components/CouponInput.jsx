import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, X, AlertCircle, CheckCircle } from 'lucide-react';
import promotionsService from '../services/promotionsService';

const CouponInput = ({ cartTotal, onCouponApplied, onCouponRemoved }) => {
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await promotionsService.validateCoupon(couponCode.toUpperCase(), cartTotal);

            if (result.valid) {
                setAppliedCoupon({
                    code: result.coupon.code,
                    discount: result.discount_amount,
                    description: result.coupon.description
                });
                onCouponApplied(result.discount_amount, result.coupon.code);
                setCouponCode('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid coupon code');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        onCouponRemoved();
        setError('');
    };

    return (
        <div className="coupon-section">
            {!appliedCoupon ? (
                <div className="coupon-input-container">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                placeholder="Enter coupon code"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent uppercase"
                                disabled={loading}
                            />
                        </div>
                        <button
                            onClick={handleApplyCoupon}
                            disabled={loading || !couponCode.trim()}
                            className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mt-2 text-red-600 text-sm"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="applied-coupon bg-green-50 border border-green-200 rounded-lg p-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-green-800">{appliedCoupon.code}</span>
                                    <span className="text-sm text-green-600">applied</span>
                                </div>
                                <p className="text-sm text-gray-600">{appliedCoupon.description}</p>
                                <p className="text-sm font-semibold text-green-700 mt-1">
                                    You save ₹{appliedCoupon.discount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleRemoveCoupon}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove coupon"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CouponInput;
