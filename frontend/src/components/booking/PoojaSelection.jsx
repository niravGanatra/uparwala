import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { servicesAPI } from '../../services/servicesService';
import SpiritualLoader from '../SpiritualLoader';
import { Sparkles, IndianRupee, ArrowRight } from 'lucide-react';

const PoojaCard = ({ pooja, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(pooja)}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm cursor-pointer flex flex-col items-center text-center group transition-all duration-300 relative overflow-hidden"
        >
            {/* Decorative Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Icon Circle */}
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <Sparkles className="w-10 h-10 text-orange-500" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-slate-800 mb-2 font-serif group-hover:text-orange-700 transition-colors">
                {pooja.name}
            </h3>

            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {pooja.description}
            </p>

            {/* Price Tag */}
            <div className="mt-auto flex items-center gap-1 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <span>Starting from</span>
                <span className="font-bold text-slate-900 flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {parseFloat(pooja.base_price).toLocaleString('en-IN')}
                </span>
            </div>
        </motion.div>
    );
};

const MOCK_POOJAS = [
    { id: 1, name: 'Satyanarayan Puja', description: 'For prosperity and well-being of the family.', base_price: '2100' },
    { id: 2, name: 'Griha Pravesh', description: 'House warming ceremony for new beginnings.', base_price: '5100' },
    { id: 3, name: 'Ganesh Puja', description: 'Remove obstacles and ensure success.', base_price: '1100' },
    { id: 4, name: 'Lakshmi Puja', description: 'Worship of Goddess Lakshmi for wealth.', base_price: '3100' },
];

const PoojaSelection = () => {
    const { selectPooja } = useBooking();
    const [poojas, setPoojas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoojas = async () => {
            try {
                const response = await servicesAPI.getAll();
                setPoojas(response.data || []);
            } catch (error) {
                console.error("Failed to fetch poojas, using mock data", error);
                setPoojas(MOCK_POOJAS);
            } finally {
                setLoading(false);
            }
        };
        fetchPoojas();
    }, []);

    if (loading) return <div className="py-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-serif text-slate-900">Select a Divine Service</h2>
                <p className="text-slate-500">Choose the perfect ritual for your spiritual needs</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {poojas.map((pooja) => (
                    <PoojaCard
                        key={pooja.id}
                        pooja={pooja}
                        onClick={selectPooja}
                    />
                ))}
            </div>
        </div>
    );
};

export default PoojaSelection;
