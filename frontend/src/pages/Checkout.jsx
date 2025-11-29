import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    MapPin, CreditCard, ShoppingBag, ChevronRight,
    Plus, Check, Loader, Truck, Shield
} from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Data states
    const [addresses, setAddresses] = useState([]);
    const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [orderSummary, setOrderSummary] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    // Address form state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        address_type: 'shipping',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        state_code: '',
        pincode: '',
        is_default: false
    });

    useEffect(() => {
        fetchAddresses();
        fetchCart();
    }, []);

    useEffect(() => {
        if (selectedShippingAddress && (step === 2 || step === 3)) {
            calculateTotals();
        }
    }, [selectedShippingAddress, step]);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/users/addresses/');
            setAddresses(response.data);

            // Auto-select default address
            const defaultAddr = response.data.find(addr => addr.is_default);
            if (defaultAddr) {
                setSelectedShippingAddress(defaultAddr.id);
                setSelectedBillingAddress(defaultAddr.id);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        }
    };

    const fetchCart = async () => {
        try {
            const response = await api.get('/orders/cart/');
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            toast.error('Failed to load cart');
        }
    };

    const calculateTotals = async () => {
        if (!selectedShippingAddress) return;

        const address = addresses.find(a => a.id === selectedShippingAddress);
        if (!address) return;

        try {
            const response = await api.post('/payments/calculate-totals/', {
                state_code: address.state_code
            });
            setOrderSummary(response.data);
        } catch (error) {
            console.error('Failed to calculate totals:', error);
            toast.error('Failed to calculate order total');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/users/addresses/', addressForm);
            setAddresses([...addresses, response.data]);
            setSelectedShippingAddress(response.data.id);
            setShowAddressForm(false);
            toast.success('Address added successfully');

            // Reset form
            setAddressForm({
                address_type: 'shipping',
                full_name: '',
                phone: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                state_code: '',
                pincode: '',
                is_default: false
            });
        } catch (error) {
            console.error('Failed to add address:', error);
            toast.error('Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedShippingAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        setProcessingPayment(true);

        try {
            const response = await api.post('/orders/checkout/', {
                shipping_address_id: selectedShippingAddress,
                billing_address_id: sameAsShipping ? selectedShippingAddress : selectedBillingAddress,
                payment_method: paymentMethod
            });

            if (paymentMethod === 'razorpay') {
                // Initialize Razorpay
                const options = {
                    key: response.data.payment.razorpay_key_id,
                    amount: response.data.payment.amount,
                    currency: response.data.payment.currency,
                    name: 'Uparwala Marketplace',
                    description: `Order #${response.data.order_number}`,
                    order_id: response.data.payment.razorpay_order_id,
                    handler: async function (paymentResponse) {
                        // Verify payment
                        try {
                            await api.post('/payments/verify/', {
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                                order_id: response.data.order_id
                            });

                            toast.success('Payment successful!');
                            navigate(`/order-confirmation/${response.data.order_id}`);
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            toast.error('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: addresses.find(a => a.id === selectedShippingAddress)?.full_name,
                        contact: addresses.find(a => a.id === selectedShippingAddress)?.phone
                    },
                    theme: {
                        color: '#3b82f6'
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();

                razorpay.on('payment.failed', function (response) {
                    toast.error('Payment failed. Please try again.');
                    setProcessingPayment(false);
                });
            } else {
                // COD
                toast.success('Order placed successfully!');
                navigate(`/order-confirmation/${response.data.order_id}`);
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error(error.response?.data?.error || 'Checkout failed');
            setProcessingPayment(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[
                { num: 1, label: 'Address', icon: MapPin },
                { num: 2, label: 'Payment', icon: CreditCard },
                { num: 3, label: 'Review', icon: ShoppingBag }
            ].map((s, idx) => (
                <div key={s.num} className="flex items-center">
                    <div className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200'
                            }`}>
                            {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                        </div>
                        <span className="hidden md:block font-medium">{s.label}</span>
                    </div>
                    {idx < 2 && (
                        <ChevronRight className={`w-5 h-5 mx-4 ${step > s.num ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    const renderAddressStep = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Select Delivery Address</h2>
                <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Add New Address
                </button>
            </div>

            {showAddressForm && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleAddAddress}
                    className="bg-gray-50 p-6 rounded-lg space-y-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={addressForm.full_name}
                            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Address Line 1"
                        value={addressForm.address_line1}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={addressForm.address_line2}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="City"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="State"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="State Code (e.g., DL)"
                            value={addressForm.state_code}
                            onChange={(e) => setAddressForm({ ...addressForm, state_code: e.target.value.toUpperCase() })}
                            className="px-4 py-2 border rounded-lg"
                            maxLength={2}
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="default"
                            checked={addressForm.is_default}
                            onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="default" className="text-sm">Set as default address</label>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Address'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                    <div
                        key={address.id}
                        onClick={() => setSelectedShippingAddress(address.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedShippingAddress === address.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold">{address.full_name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {address.address_line1}
                                    {address.address_line2 && `, ${address.address_line2}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                                {address.is_default && (
                                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        Default
                                    </span>
                                )}
                            </div>
                            {selectedShippingAddress === address.id && (
                                <Check className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {addresses.length === 0 && !showAddressForm && (
                <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No addresses found. Please add a delivery address.</p>
                </div>
            )}

            <button
                onClick={() => {
                    if (!selectedShippingAddress) {
                        toast.error('Please select a delivery address');
                        return;
                    }
                    setStep(2);
                }}
                disabled={!selectedShippingAddress}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
                Continue to Payment
            </button>
        </div>
    );

    const renderPaymentStep = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Payment Method</h2>

            <div className="space-y-4">
                <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'razorpay'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                            <div>
                                <h3 className="font-semibold">Online Payment</h3>
                                <p className="text-sm text-gray-600">Pay securely with Razorpay</p>
                            </div>
                        </div>
                        {paymentMethod === 'razorpay' && <Check className="w-6 h-6 text-blue-600" />}
                    </div>
                </div>

                <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Truck className="w-6 h-6 text-green-600" />
                            <div>
                                <h3 className="font-semibold">Cash on Delivery</h3>
                                <p className="text-sm text-gray-600">Pay when you receive</p>
                            </div>
                        </div>
                        {paymentMethod === 'cod' && <Check className="w-6 h-6 text-blue-600" />}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    Review Order
                </button>
            </div>
        </div>
    );

    const renderReviewStep = () => {
        const selectedAddr = addresses.find(a => a.id === selectedShippingAddress);

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Review Your Order</h2>

                {/* Delivery Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Delivery Address
                    </h3>
                    {selectedAddr && (
                        <div className="text-sm text-gray-700">
                            <p className="font-medium">{selectedAddr.full_name}</p>
                            <p>{selectedAddr.address_line1}</p>
                            {selectedAddr.address_line2 && <p>{selectedAddr.address_line2}</p>}
                            <p>{selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pincode}</p>
                            <p>Phone: {selectedAddr.phone}</p>
                        </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Method
                    </h3>
                    <p className="text-sm text-gray-700">
                        {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                    </p>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Items ({cartItems.length})</h3>
                    <div className="space-y-2">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product.name} × {item.quantity}</span>
                                <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                {orderSummary && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Price Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className={orderSummary.shipping.free_shipping ? 'text-green-600' : ''}>
                                    {orderSummary.shipping.free_shipping ? 'FREE' : `₹${orderSummary.shipping.total_shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (GST)</span>
                                <span>₹{orderSummary.tax_amount.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{orderSummary.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">
                        Your payment information is secure and encrypted
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setStep(2)}
                        className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                        disabled={processingPayment}
                    >
                        Back
                    </button>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={processingPayment}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {processingPayment ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Place Order - ₹${orderSummary?.total.toFixed(2) || '0.00'}`
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {renderStepIndicator()}

                <div className="bg-white rounded-lg shadow-md p-6">
                    {step === 1 && renderAddressStep()}
                    {step === 2 && renderPaymentStep()}
                    {step === 3 && renderReviewStep()}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
