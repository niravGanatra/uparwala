import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../../components/ui/button';
import { Star, CheckCircle, Languages, Award, ChevronLeft, ArrowRight } from 'lucide-react';

const MOCK_PANDITS = [
    {
        id: 101,
        name: "Acharya Ramesh Shastri",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh&gender=male",
        rating: 4.9,
        reviews: 215,
        experience: "15 Years",
        languages: ["Hindi", "Sanskrit", "Gujarati"],
        price: 2100,
        verified: true,
        specialization: "Vedic Rituals"
    },
    {
        id: 102,
        name: "Pandit Suresh Joshi",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh&gender=male",
        rating: 4.7,
        reviews: 184,
        experience: "12 Years",
        languages: ["Hindi", "Marathi"],
        price: 1800,
        verified: true,
        specialization: "Griha Pravesh"
    },
    {
        id: 103,
        name: "Shri Amit Trivedi",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit&gender=male",
        rating: 4.8,
        reviews: 92,
        experience: "8 Years",
        languages: ["Hindi", "English"],
        price: 1500,
        verified: true,
        specialization: "Modern Ceremonies"
    },
    {
        id: 104,
        name: "Acharya Vinod Kumar",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vinod&gender=male",
        rating: 5.0,
        reviews: 42,
        experience: "20 Years",
        languages: ["Sanskrit", "Hindi"],
        price: 3100,
        verified: true,
        specialization: "Maha Pujas"
    }
];

const FilterChip = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
    >
        {label}
    </button>
);

const PanditProfileCard = ({ pandit, onSelect }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow"
        >
            {/* Left: Image */}
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-100 p-0.5">
                    <img src={pandit.image} alt={pandit.name} className="w-full h-full rounded-full object-cover bg-slate-100" />
                </div>
                {pandit.verified && (
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-green-500 fill-white" />
                    </div>
                )}
            </div>

            {/* Middle: Details */}
            <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900">{pandit.name}</h3>

                <div className="flex items-center justify-center sm:justify-start gap-1 text-sm font-medium text-slate-700 mt-1">
                    <span className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs">
                        {pandit.rating} <Star className="w-3 h-3 ml-0.5 fill-current" />
                    </span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-slate-500 text-xs">{pandit.reviews} Poojas</span>
                </div>

                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        <span>{pandit.languages.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{pandit.experience} Exp</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col items-center sm:items-end justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 min-w-[120px]">
                <div className="text-center sm:text-right mb-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Dakshina</span>
                    <div className="text-xl font-bold text-slate-900">₹{pandit.price}</div>
                </div>
                <Button
                    onClick={() => onSelect(pandit)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-10 text-sm"
                >
                    Select
                </Button>
            </div>
        </motion.div>
    );
};

const PanditMarketplace = () => {
    const { bookingData, selectPandit, setStep } = useBooking();
    const [selectedLanguage, setSelectedLanguage] = useState('All');

    // Filter Logic (Simple implementation)
    const filteredPandits = selectedLanguage === 'All'
        ? MOCK_PANDITS
        : MOCK_PANDITS.filter(p => p.languages.includes(selectedLanguage));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep(1)} className="p-1 hover:bg-slate-100 rounded-full">
                    <ChevronLeft className="w-6 h-6 text-slate-500" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Available Pandits</h2>
                    <p className="text-sm text-slate-500">For {bookingData.pooja?.name || 'Selected Puja'}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {['All', 'Hindi', 'English', 'Sanskrit', 'Marathi', 'Gujarati'].map(lang => (
                    <FilterChip
                        key={lang}
                        label={lang}
                        active={selectedLanguage === lang}
                        onClick={() => setSelectedLanguage(lang)}
                    />
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredPandits.map(pandit => (
                    <PanditProfileCard
                        key={pandit.id}
                        pandit={pandit}
                        onSelect={selectPandit}
                    />
                ))}
            </div>

            {/* Fallback for empty list */}
            {filteredPandits.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    No pandits found with selected filters.
                </div>
            )}
        </div>
    );
};

export default PanditMarketplace;
