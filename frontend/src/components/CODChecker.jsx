import { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import api from '../services/api';

const CODChecker = ({ pincode, orderValue, onResult }) => {
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);

    const checkCOD = async (enteredPincode) => {
        const pin = enteredPincode || pincode;
        if (!pin) return;

        setChecking(true);
        try {
            const response = await api.get(`/orders/cod/check/${pin}/`, {
                params: { order_value: orderValue }
            });
            setResult(response.data);
            if (onResult) onResult(response.data);
        } catch (error) {
            setResult({
                available: false,
                message: 'Unable to check COD availability'
            });
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-3">Cash on Delivery</h3>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Enter Pincode"
                    className="flex-1 px-3 py-2 border rounded-md"
                    onChange={(e) => {
                        // If parent provided onPincodeChange, call it, else local handling could be added
                    }}
                    onBlur={(e) => checkCOD(e.target.value)}
                />
                <button
                    onClick={(e) => checkCOD(e.target.previousSibling.value)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800"
                    disabled={checking}
                >
                    Check
                </button>
            </div>

            {checking && (
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Checking availability...</span>
                </div>
            )}

            {result && !checking && (
                <div className={`flex items-start gap-2 p-3 rounded-lg ${result.available ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                    {result.available ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <p className={`font-medium ${result.available ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {result.message}
                        </p>
                        {result.available && result.city && (
                            <p className="text-sm text-gray-600 mt-1">
                                {result.city}, {result.state}
                            </p>
                        )}
                        {result.max_order_value && (
                            <p className="text-sm text-gray-600 mt-1">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Maximum order value: ₹{result.max_order_value}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CODChecker;
