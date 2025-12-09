import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import api from '../services/api';

const BrandFilter = ({ selectedBrands, onChange }) => {
    const [brands, setBrands] = useState([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const response = await api.get('/products/brands/');
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        }
    };

    const handleBrandToggle = (brandSlug) => {
        const newSelected = selectedBrands.includes(brandSlug)
            ? selectedBrands.filter(b => b !== brandSlug)
            : [...selectedBrands, brandSlug];
        onChange(newSelected);
    };

    const displayedBrands = showAll ? brands : brands.slice(0, 8);

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Brands
            </h3>

            <div className="space-y-2">
                {displayedBrands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.slug)}
                            onChange={() => handleBrandToggle(brand.slug)}
                            className="rounded"
                        />
                        <div className="flex items-center gap-2 flex-1">
                            {brand.logo && (
                                <img src={brand.logo} alt={brand.name} className="w-6 h-6 object-contain" />
                            )}
                            <span className="text-sm">{brand.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">({brand.product_count})</span>
                    </label>
                ))}
            </div>

            {brands.length > 8 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                >
                    {showAll ? 'Show Less' : `Show All (${brands.length})`}
                </button>
            )}
        </div>
    );
};

export default BrandFilter;
