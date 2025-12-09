import { Scale } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CompareButton = ({ product }) => {
    const addToComparison = async () => {
        try {
            await api.post('/products/compare/add/', { product_id: product.id });
            toast.success('Added to comparison');
        } catch (error) {
            if (error.response?.data?.error?.includes('Maximum')) {
                toast.error('Maximum 4 products can be compared');
            } else if (error.response?.data?.message?.includes('already')) {
                toast('Product already in comparison');
            } else {
                toast.error('Failed to add to comparison');
            }
        }
    };

    return (
        <button
            onClick={addToComparison}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            title="Add to comparison"
        >
            <Scale className="w-4 h-4" />
            Compare
        </button>
    );
};

export default CompareButton;
