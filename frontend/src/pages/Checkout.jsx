import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    MapPin, CreditCard, ShoppingBag, ChevronRight,
    Plus, Check, Loader, Truck, Shield, Gift,
    User, Phone, Building
} from 'lucide-react';
import GiftWrapSelector from '../components/GiftWrapSelector';
import SpiritualLoader from '../components/SpiritualLoader';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const selectedItemIds = location.state?.selectedItemIds || [];
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true); // For initial page load
    const [processingPayment, setProcessingPayment] = useState(false);
    const [calculating, setCalculating] = useState(false); // Track specific calculation status
    const [calculationError, setCalculationError] = useState(null);

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

    const [codAvailable, setCodAvailable] = useState(true);
    const [codMessage, setCodMessage] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [customerNote, setCustomerNote] = useState('');
    const [policyAgreed, setPolicyAgreed] = useState(false);
    const [giftData, setGiftData] = useState(null);
    const [isAddressLocked, setIsAddressLocked] = useState(false);

    const setGiftOption = (option) => {
        setGiftData(option);
        if (option) {
            localStorage.setItem('checkout_gift_data', JSON.stringify(option));
        } else {
            localStorage.removeItem('checkout_gift_data');
        }
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!user) {
            toast.error('Please login to access checkout');
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        fetchAddresses();
        fetchCart();

        // Load gift data from local storage safely
        const savedGift = localStorage.getItem('checkout_gift_data');
        if (savedGift) {
            try {
                const parsed = JSON.parse(savedGift);
                setGiftData(parsed);
            } catch (e) {
                console.error('Failed to parse gift data:', e);
                localStorage.removeItem('checkout_gift_data');
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        // Trigger total calculation whenever address, gift options, or step changes
        // Now runs on Step 1 (Address) as well, immediately after selection
        if (selectedShippingAddress) {
            calculateTotals();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShippingAddress, giftData, addresses]);

    // Separate effect for COD check to ensure orderSummary is ready
    useEffect(() => {
        if (orderSummary && selectedShippingAddress && (step === 2 || step === 3)) {
            checkCodAvailability();
        }
    }, [orderSummary, selectedShippingAddress, step]);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/users/addresses/');
            // Handle pagination or direct list
            const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setAddresses(data);

            // Auto-select default address
            const defaultAddr = data.find(addr => addr.is_default);
            if (defaultAddr) {
                setSelectedShippingAddress(defaultAddr.id);
                setSelectedBillingAddress(defaultAddr.id);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            setAddresses([]);
        }
    };

    const fetchCart = async () => {
        try {
            const response = await api.get('/orders/cart/');
            const allItems = response.data?.items || [];

            // Filter items based on selection from cart page
            // If no selectedItemIds, use all items (backward compatibility)
            let filteredItems = allItems;

            if (selectedItemIds.length > 0) {
                const matchedItems = allItems.filter(item => selectedItemIds.includes(item.id));
                // If we found matches, use them; otherwise fall back to all items (Buy Now fallback)
                if (matchedItems.length > 0) {
                    filteredItems = matchedItems;
                }
                // If no matches found but we have items, use all items (Buy Now likely just added the item)
            }

            setCartItems(filteredItems);

            // Only redirect if cart is completely empty
            if (filteredItems.length === 0) {
                toast.error('Your cart is empty');
                navigate('/cart');
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            toast.error('Failed to load cart');
            setCartItems([]);
        } finally {
            setInitialLoading(false);
        }
    };

    const calculateTotals = async () => {
        if (!selectedShippingAddress) return;

        const address = addresses.find(a => a.id === selectedShippingAddress);
        if (!address) return;

        const stateCode = address.state_code || address.state;

        try {
            const payload = {
                state_code: stateCode
            };

            // Add selected item IDs for selective checkout
            if (selectedItemIds && selectedItemIds.length > 0) {
                payload.selected_item_ids = selectedItemIds;
            }

            // Add gift option if present
            if (giftData) {
                payload.gift_option_id = giftData.gift_option_id;
            }

            setCalculating(true);
            setCalculationError(null);

            const response = await api.post('/payments/calculate-totals/', payload);
            setOrderSummary(response.data);
        } catch (error) {
            console.error('Failed to calculate totals:', error);
            setCalculationError(error.response?.data?.error || 'Failed to calculate order totals. Please try again.');
            setOrderSummary(null);

            // More specific error messages

            // More specific error messages
            if (error.response?.status === 401) {
                toast.error('Please log in to continue');
                navigate('/login');
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Failed to calculate order totals');
            }
        } finally {
            setCalculating(false);
        }
    };

    const checkCodAvailability = async () => {
        if (!selectedShippingAddress || !orderSummary) {
            return;
        }

        const address = addresses.find(a => a.id === selectedShippingAddress);
        if (!address) return; // Guard against address disappearing

        const totalValue = orderSummary.total;

        try {
            const response = await api.get(`/orders/check-cod/?pincode=${address.pincode}&order_value=${totalValue}`);
            setCodAvailable(response.data.available);
            setCodMessage(response.data.message);

            // If COD selected but no longer available, switch to Online
            if (!response.data.available && paymentMethod === 'cod') {
                setPaymentMethod('razorpay');
                toast.error(`COD not available: ${response.data.message}`);
            }
        } catch (error) {
            console.error('COD check failed:', error);
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
            setIsAddressLocked(false); // Unlock form after adding
        } catch (error) {
            console.error('Failed to add address:', error);
            toast.error('Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const handlePincodeBlur = async (e) => {
        const pin = e.target.value;
        if (pin && pin.length === 6) {
            try {
                const response = await api.get(`/orders/pincode/details/${pin}/`);
                if (response.data) {
                    setAddressForm(prev => ({
                        ...prev,
                        city: response.data.city,
                        state: response.data.state,
                        state_code: response.data.state_code || prev.state_code
                    }));
                    setIsAddressLocked(true);
                    toast.success('City & State Auto-filled!');
                }
            } catch (error) {
                console.error('Auto-fill pcode failed:', error);
            }
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        // Validation for logged-in users
        if (!selectedShippingAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        if (!policyAgreed) {
            toast.error('Please agree to the Return & Refund Policy to continue');
            return;
        }

        setProcessingPayment(true);

        try {
            let payload = {
                payment_method: paymentMethod,
                shipping_address_id: selectedShippingAddress,
                billing_address_id: sameAsShipping ? selectedShippingAddress : selectedBillingAddress
            };

            // Include gift data
            if (giftData) {
                payload.gift_option_id = giftData.gift_option_id;
                payload.gift_message = giftData.gift_message;
                payload.recipient_name = giftData.recipient_name;
            }

            // Include customer note
            if (customerNote) {
                payload.customer_note = customerNote;
            }

            // Include selected item IDs for selective checkout
            if (selectedItemIds && selectedItemIds.length > 0) {
                payload.selected_item_ids = selectedItemIds;
            }

            const response = await api.post('/orders/checkout/', payload);

            if (paymentMethod === 'razorpay') {
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    toast.error('Razorpay SDK failed to load. Please check your connection.');
                    setProcessingPayment(false);
                    return;
                }

                // Initialize Razorpay
                const selectedAddress = addresses.find(a => a.id === selectedShippingAddress);
                const prefillData = {
                    name: selectedAddress?.full_name,
                    contact: selectedAddress?.phone,
                    email: user?.email
                };

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
                            const verifyResponse = await api.post('/payments/verify/', {
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                                order_id: response.data.order_id
                            });

                            console.log('Payment verification response:', verifyResponse.data);

                            toast.success('Payment successful!');
                            // Clear gift data
                            localStorage.removeItem('checkout_gift_data');
                            // Reset processing state before navigation
                            setProcessingPayment(false);
                            navigate(`/order-confirmation/${response.data.order_id}`);
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            console.error('Error response:', error.response?.data);
                            toast.error(error.response?.data?.error || 'Payment verification failed');
                            setProcessingPayment(false);
                        }
                    },
                    prefill: prefillData,
                    theme: {
                        color: '#3b82f6'
                    }
                };

                if (!window.Razorpay) {
                    toast.error('Razorpay SDK not found');
                    setProcessingPayment(false);
                    return;
                }

                const razorpay = new window.Razorpay(options);
                razorpay.open();

                razorpay.on('payment.failed', function (response) {
                    toast.error('Payment failed. Please try again.');
                    setProcessingPayment(false);
                });
            } else {
                // COD
                toast.success('Order placed successfully!');
                // Clear gift data
                localStorage.removeItem('checkout_gift_data');
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

    const getItemPrice = (item) => {
        if (!item || !item.product) {
            return { price: 0, original: 0, isDeal: false };
        }
        if (item.product.active_deal) {
            return {
                price: parseFloat(item.product.active_deal.discounted_price),
                original: parseFloat(item.product.price),
                isDeal: true
            };
        }
        return {
            price: parseFloat(item.product.price),
            original: null,
            isDeal: false
        };
    };

    const renderOrderSummary = () => {
        if (!orderSummary && !cartItems.length) return null;

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    Order Summary
                </h3>

                {/* Mini Cart Preview */}
                <div className="mb-6 max-h-60 overflow-y-auto space-y-3 custom-scrollbar">
                    {cartItems.map((item) => {
                        if (!item || !item.product) return null;
                        const priceInfo = getItemPrice(item);
                        return (
                            <div key={item.id} className="flex gap-3 text-sm">
                                <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.product.images?.[0]?.image ? (
                                        <img src={item.product.images[0].image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Qty: {item.quantity}</span>
                                        <span>₹{(priceInfo.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {orderSummary ? (
                    <div className="space-y-3 text-sm border-t pt-4">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{Number(orderSummary.subtotal).toFixed(2)}</span>
                        </div>
                        {orderSummary.discount_total > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Discount</span>
                                <span>-₹{Number(orderSummary.discount_total).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className={orderSummary.shipping.free_shipping ? 'text-green-600' : ''}>
                                {orderSummary.shipping.free_shipping ? 'FREE' : `₹${Number(orderSummary.shipping.total_shipping).toFixed(2)}`}
                            </span>
                        </div>
                        {/* Enhanced Tax Display */}
                        <div className="border-t pt-3 space-y-2">
                            <div className="flex justify-between text-gray-700 font-medium">
                                <span>Tax (GST)</span>
                                <span>₹{Number(orderSummary.tax_amount).toFixed(2)}</span>
                            </div>
                            {orderSummary.tax && (
                                <div className="ml-4 space-y-1 text-xs text-gray-500">
                                    {orderSummary.tax.type === 'intra_state' ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span>CGST</span>
                                                <span>₹{Number(orderSummary.tax.cgst).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>SGST</span>
                                                <span>₹{Number(orderSummary.tax.sgst).toFixed(2)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between">
                                            <span>IGST</span>
                                            <span>₹{Number(orderSummary.tax.igst).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {orderSummary.gift_wrapping_amount > 0 && (
                            <div className="flex justify-between text-pink-600">
                                <span className="flex items-center gap-1">
                                    <Gift className="w-3 h-3" />
                                    Gift Wrapping
                                </span>
                                <span>₹{Number(orderSummary.gift_wrapping_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-4 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>₹{Number(orderSummary.total).toFixed(2)}</span>
                        </div>
                    </div>
                ) : calculationError ? (
                    <div className="text-center py-6 text-sm bg-red-50 rounded-lg border border-red-100 p-4">
                        <div className="text-red-600 font-medium mb-2">
                            {calculationError}
                        </div>
                        <button
                            onClick={calculateTotals}
                            className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors"
                        >
                            Retry Calculation
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        {!selectedShippingAddress ? (
                            <>
                                <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                <p>Select a delivery address to view order details</p>
                            </>
                        ) : calculating ? (
                            <>
                                <Loader className="w-6 h-6 mx-auto mb-2 text-blue-500 animate-spin" />
                                <p>Calculating taxes and shipping...</p>
                            </>
                        ) : (
                            // Fallback: If for some reason auto-calc didn't fire or cleared (rare)
                            <div className="flex flex-col items-center">
                                <p className="mb-2 text-gray-400">Total will be updated...</p>
                                <button
                                    onClick={calculateTotals}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-xs underline"
                                >
                                    Calculate Total
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-xs text-green-700 font-medium">
                        Secure SSL Encryption
                    </p>
                </div>
            </div>
        );
    };

    const renderAddressStep = () => {
        // Show saved address selection
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Select Delivery Address</h2>
                    <button
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </button>
                </div>

                {showAddressForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        onSubmit={handleAddAddress}
                        className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4"
                    >
                        {/* ... Existing form inputs but styled better ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={addressForm.full_name}
                                        onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="House No., Street Name"
                                    value={addressForm.address_line1}
                                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span></label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Apartment, Suite, etc."
                                    value={addressForm.address_line2}
                                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Mumbai"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        className={`w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all ${isAddressLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        readOnly={isAddressLocked}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    placeholder="Maharashtra"
                                    value={addressForm.state}
                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                    className={`w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all ${isAddressLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    readOnly={isAddressLocked}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">State Code</label>
                                <input
                                    type="text"
                                    placeholder="DL"
                                    value={addressForm.state_code}
                                    onChange={(e) => setAddressForm({ ...addressForm, state_code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    maxLength={2}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Pincode</label>
                            <input
                                type="text"
                                placeholder="400001"
                                value={addressForm.pincode}
                                onChange={(e) => {
                                    setAddressForm({ ...addressForm, pincode: e.target.value });
                                    setIsAddressLocked(false);
                                }}
                                onBlur={handlePincodeBlur}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                required
                                maxLength={6}
                            />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" id="default" checked={addressForm.is_default} onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="default" className="text-sm text-gray-700 cursor-pointer">Set as default address</label>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                            <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700">
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            onClick={() => setSelectedShippingAddress(address.id)}
                            className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedShippingAddress === address.id
                                ? 'border-blue-600 bg-blue-50/50 shadow-md transform scale-[1.01]'
                                : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedShippingAddress === address.id ? 'border-blue-600' : 'border-gray-300'}`}>
                                    {selectedShippingAddress === address.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{address.full_name}</h3>
                                            {address.is_default && (
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Edit/Delete actions could go here */}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mt-2 leading-relaxed">
                                        {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                                        {address.city}, {address.state} - <span className="font-medium text-gray-900">{address.pincode}</span>
                                    </p>
                                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                                        <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Phone</span>
                                        {address.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {addresses.length === 0 && !showAddressForm && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">No saved addresses found</p>
                        <p className="text-sm text-gray-400">Add a new address to continue</p>
                    </div>
                )}

                <button
                    onClick={() => {
                        if (!selectedShippingAddress) {
                            toast.error('Please select a delivery address');
                            return;
                        }
                        setStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!selectedShippingAddress}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all mt-8"
                >
                    Continue to Payment
                </button>
            </div>
        );
    };

    const renderPaymentStep = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Select Payment Method</h2>

            <div className="space-y-4">
                <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between ${paymentMethod === 'razorpay'
                        ? 'border-blue-600 bg-blue-50/50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Pay Online</h3>
                            <p className="text-sm text-gray-500">Credit/Debit Card, UPI, NetBanking</p>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-blue-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                    </div>
                </div>

                <div
                    onClick={() => codAvailable && setPaymentMethod('cod')}
                    className={`p-5 border-2 rounded-xl transition-all duration-200 flex items-center justify-between ${paymentMethod === 'cod'
                        ? 'border-blue-600 bg-blue-50/50 shadow-md'
                        : !codAvailable
                            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-blue-200 cursor-pointer'
                        }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!codAvailable ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}>
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Cash on Delivery</h3>
                            <p className="text-sm text-gray-500">
                                {!codAvailable ? `Unavailable: ${codMessage}` : 'Pay nicely when you receive'}
                            </p>
                        </div>
                    </div>
                    {codAvailable && (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button onClick={() => setStep(1)} className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors">
                    Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg hover:shadow-blue-500/25 transition-all">
                    Review Order
                </button>
            </div>
        </div>
    );

    const renderReviewStep = () => {
        // Ensure addresses is loaded
        const selectedAddr = addresses.find(a => a.id === selectedShippingAddress) || {};

        return (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-800">Final Review</h2>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Shipping To
                        </h3>
                        {selectedShippingAddress && selectedAddr.id ? (
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-bold text-gray-900">{selectedAddr.full_name}</p>
                                <p>{selectedAddr.address_line1}</p>
                                {selectedAddr.address_line2 && <p>{selectedAddr.address_line2}</p>}
                                <p>{selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pincode}</p>
                                <p className="pt-2">Ph: {selectedAddr.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-red-500">Address not selected</p>
                        )}
                        <button onClick={() => setStep(1)} className="text-blue-600 text-xs font-semibold mt-3 hover:underline">Change</button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            Payment Method
                        </h3>
                        <p className="text-sm text-gray-700 font-medium">
                            {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                        </p>
                        <button onClick={() => setStep(2)} className="text-blue-600 text-xs font-semibold mt-3 hover:underline">Change</button>
                    </div>
                </div>

                {/* Gift Wrap Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-50 to-white px-6 py-4 border-b border-pink-100">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-pink-500" />
                            Add a Gift Wrap?
                        </h3>
                    </div>
                    <div className="p-6">
                        <GiftWrapSelector onSelect={setGiftOption} />
                    </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Instructions (Optional)</label>
                    <textarea
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder="Eg: Leave at security, call before arrival..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        rows="2"
                    />
                </div>


                {/* Policy Agreement Checkbox */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="policy-agree"
                            checked={policyAgreed}
                            onChange={(e) => setPolicyAgreed(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="policy-agree" className="text-sm text-slate-800">
                            I have read and agree to the <a href="/refund-policy" target="_blank" className="text-blue-600 underline font-semibold">Return, Cancellation & Refund Policy</a> and understand that most religious products are non-returnable and non-refundable.
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={() => setStep(2)}
                        className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium text-gray-700"
                        disabled={processingPayment}
                    >
                        Back
                    </button>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={processingPayment}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        {processingPayment ? (
                            <>
                                <Loader className="w-6 h-6 animate-spin" />
                                Processing Order...
                            </>
                        ) : (
                            <>
                                Place Order
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // Show loading state while fetching cart
    if (initialLoading) {
        return <SpiritualLoader message="Preparing checkout..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                {/* Stepper Header */}
                <div className="mb-10">
                    {renderStepIndicator()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                            {step === 1 && renderAddressStep()}
                            {step === 2 && renderPaymentStep()}
                            {step === 3 && renderReviewStep()}
                        </div>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8 hidden lg:block">
                        {renderOrderSummary()}
                    </div>
                </div>

                {/* Mobile Order Summary (Bottom Sheet or just below) */}
                <div className="lg:hidden mt-8">
                    {renderOrderSummary()}
                </div>
            </div>

            <style>{`
                .input-field {
                    @apply w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af; 
                }
            `}</style>
        </div>
    );
};

export default Checkout;
