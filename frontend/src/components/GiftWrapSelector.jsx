import { useState, useEffect } from 'react';
import { Gift, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const GiftWrapSelector = ({ orderId, onSelect }) => {
    const [giftOptions, setGiftOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [giftMessage, setGiftMessage] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGiftOptions();

        // Load saved selection if no orderId (Cart mode)
        if (!orderId) {
            const savedGift = localStorage.getItem('checkout_gift_data');
            if (savedGift) {
                const parsed = JSON.parse(savedGift);
                // We need options loaded first to set the object correctly, 
                // but for now we can rely on ID matching when options load? 
                // Better: wait for options fetch or just set ID.
                // Let's rely on users re-selecting or matching ID after fetch.
                // Actually, let's just wait for options in the other effect or handle it here.
            }
        }
    }, [orderId]);

    const fetchGiftOptions = async () => {
        try {
            const response = await api.get('/orders/gift-options/');
            setGiftOptions(response.data);

            // Restore selection if in Cart mode
            if (!orderId) {
                const savedGift = localStorage.getItem('checkout_gift_data');
                if (savedGift) {
                    try {
                        const parsed = JSON.parse(savedGift);
                        const option = response.data.find(o => o.id === parsed.gift_option_id);
                        if (option) {
                            setSelectedOption(option);
                            setGiftMessage(parsed.gift_message || '');
                            setRecipientName(parsed.recipient_name || '');
                        }
                    } catch (e) {
                        console.error('Error parsing gift data:', e);
                        localStorage.removeItem('checkout_gift_data');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch gift options:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGift = async () => {
        if (!selectedOption) {
            toast.error('Please select a gift option');
            return;
        }

        if (orderId) {
            // Existing logic for existing order
            try {
                await api.post(`/orders/${orderId}/add-gift/`, {
                    gift_option_id: selectedOption.id,
                    gift_message: giftMessage,
                    recipient_name: recipientName
                });
                toast.success('Gift wrapping added!');
                if (onSelect) onSelect(selectedOption);
            } catch (error) {
                toast.error('Failed to add gift wrapping');
            }
        } else {
            // Cart mode: Save to local storage
            const giftData = {
                gift_option_id: selectedOption.id,
                gift_message: giftMessage,
                recipient_name: recipientName,
                price: selectedOption.price,
                name: selectedOption.name
            };
            localStorage.setItem('checkout_gift_data', JSON.stringify(giftData));
            toast.success('Gift wrapping applied to cart!');
            if (onSelect) onSelect(giftData);
        }
    };

    const handleRemoveGift = () => {
        setSelectedOption(null);
        setGiftMessage('');
        setRecipientName('');

        if (!orderId) {
            localStorage.removeItem('checkout_gift_data');
            toast.success('Gift wrapping removed');
            if (onSelect) onSelect(null);
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Gift className="w-6 h-6 text-pink-500" />
                Gift Wrapping
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {giftOptions.map(option => (
                    <div
                        key={option.id}
                        onClick={() => setSelectedOption(option)}
                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${selectedOption?.id === option.id
                            ? 'border-pink-500 bg-pink-50 shadow-sm'
                            : 'border-gray-200 hover:border-pink-200 hover:shadow-sm'
                            }`}
                    >
                        {option.image && (
                            <img
                                src={option.image}
                                alt={option.name}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                        )}
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-900">{option.name}</h4>
                                <p className="text-pink-600 font-bold mt-1">₹{option.price}</p>
                            </div>
                            {selectedOption?.id === option.id && (
                                <div className="bg-pink-500 rounded-full p-1">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{option.description}</p>
                    </div>
                ))}
            </div>

            {selectedOption && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Enter recipient's name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gift Message (Optional)
                        </label>
                        <textarea
                            value={giftMessage}
                            onChange={(e) => setGiftMessage(e.target.value)}
                            placeholder="Write a personal message..."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">
                                {giftMessage.length}/500 characters
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleAddGift}
                            className="flex-1 px-6 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-colors shadow-sm active:scale-[0.98]"
                        >
                            {orderId ? 'Add to Order' : 'Apply Gift Wrap'}
                        </button>
                        <button
                            onClick={handleRemoveGift}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftWrapSelector;

