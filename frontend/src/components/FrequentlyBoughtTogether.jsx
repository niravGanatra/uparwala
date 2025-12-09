import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FrequentlyBoughtTogether = ({ productId }) => {
    const [bundles, setBundles] = useState([]);
    const [selectedBundle, setSelectedBundle] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBundles();
    }, [productId]);

    const fetchBundles = async () => {
        try {
            const response = await api.get(`/products/${productId}/bundles/`);
            if (response.data.length > 0) {
                const bundle = response.data[0];
                setBundles(response.data);
                setSelectedBundle(bundle);

                // Select all products by default
                const selected = { [bundle.primary_product]: true };
                bundle.bundled_products_detail.forEach(p => {
                    selected[p.id] = true;
                });
                setSelectedProducts(selected);
            }
        } catch (error) {
            console.error('Failed to fetch bundles:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = (productId) => {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const calculateTotal = () => {
        if (!selectedBundle) return 0;

        let total = 0;
        if (selectedProducts[selectedBundle.primary_product]) {
            total += parseFloat(selectedBundle.primary_product_price || 0);
        }

        selectedBundle.bundled_products_detail.forEach(product => {
            if (selectedProducts[product.id]) {
                total += parseFloat(product.price);
            }
        });

        return total;
    };

    const addBundleToCart = async () => {
        try {
            await api.post('/products/bundles/add-to-cart/', {
                bundle_id: selectedBundle.id
            });
            toast.success('Bundle added to cart!');
        } catch (error) {
            toast.error('Failed to add bundle to cart');
        }
    };

    if (loading || bundles.length === 0) {
        return null;
    }

    const total = calculateTotal();
    const savings = selectedBundle.savings;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Frequently Bought Together
            </h2>

            <div className="space-y-4">
                {/* Bundle Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBundle.bundled_products_detail.map((product, index) => (
                        <div key={product.id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts[product.id] || false}
                                    onChange={() => toggleProduct(product.id)}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <img
                                        src={product.images?.[0]?.image || '/placeholder.png'}
                                        alt={product.name}
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                                    <p className="text-blue-600 font-bold mt-1">₹{product.price}</p>
                                    {product.average_rating > 0 && (
                                        <div className="flex items-center gap-1 mt-1 text-sm">
                                            <span className="text-yellow-500">★</span>
                                            <span>{product.average_rating}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pricing Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Total Price:</span>
                        <span className="text-lg font-semibold">₹{total.toFixed(2)}</span>
                    </div>
                    {savings > 0 && (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">Bundle Discount:</span>
                                <span className="text-green-600 font-semibold">-₹{savings.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-lg font-bold">Bundle Price:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    ₹{selectedBundle.bundle_price.toFixed(2)}
                                </span>
                            </div>
                            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                You save ₹{savings.toFixed(2)} with this bundle!
                            </div>
                        </>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={addBundleToCart}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg font-semibold"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Add Selected Items to Cart
                </button>
            </div>
        </div>
    );
};

export default FrequentlyBoughtTogether;
