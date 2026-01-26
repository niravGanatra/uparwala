import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { useLocation } from '../../context/LocationContext';
import { Button } from '../../components/ui/button';
import { Star, CheckCircle, Languages, Award, ChevronLeft, ArrowRight, MapPin } from 'lucide-react';
import api from '../../services/api';

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
    const name = pandit.user_display_name || pandit.user?.username || 'Pandit';
    const image = pandit.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&gender=male`;
    const languages = pandit.languages_spoken || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow"
        >
            {/* Left: Image */}
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-100 p-0.5">
                    <img src={image} alt={name} className="w-full h-full rounded-full object-cover bg-slate-100" />
                </div>
                {pandit.verification_status === 'verified' && (
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle className="w-5 h-5 text-green-500 fill-white" />
                    </div>
                )}
            </div>

            {/* Middle: Details */}
            <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900">{name}</h3>

                <div className="flex items-center justify-center sm:justify-start gap-1 text-sm font-medium text-slate-700 mt-1">
                    <span className="flex items-center bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs">
                        {pandit.average_rating || '5.0'} <Star className="w-3 h-3 ml-0.5 fill-current" />
                    </span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-slate-500 text-xs">{pandit.total_bookings_completed || 0} Poojas</span>
                    {pandit.distance_km && (
                        <>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-slate-500 text-xs">{pandit.distance_km} km away</span>
                        </>
                    )}
                </div>

                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-slate-500">
                    {languages.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            <span>{languages.join(", ")}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{pandit.years_experience || 0} Years Exp</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col items-center sm:items-end justify-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 min-w-[120px]">
                <div className="text-center sm:text-right mb-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Dakshina</span>
                    <div className="text-xl font-bold text-slate-900">₹{pandit.price || 1500}</div>
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
    const { location, hasLocation, openLocationModal } = useLocation();
    const [pandits, setPandits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('All');

    // Fetch pandits from API
    useEffect(() => {
        const fetchPandits = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                // Add service filter if pooja is selected
                if (bookingData.pooja?.id) {
                    params.append('service_id', bookingData.pooja.id);
                }

                // Add location filtering
                if (location?.lat && location?.lng) {
                    params.append('lat', location.lat);
                    params.append('lng', location.lng);
                } else if (location?.pincode) {
                    params.append('pincode', location.pincode);
                }

                // Include offline pandits for demo
                params.append('online_only', 'false');

                const response = await api.get(`/services/pandits/search/?${params.toString()}`);
                setPandits(response.data.results || []);
            } catch (error) {
                console.error('Failed to fetch pandits:', error);
                // Fallback to all verified pandits
                try {
                    const fallbackResponse = await api.get('/services/pandits/');
                    setPandits(fallbackResponse.data || []);
                } catch (e) {
                    setPandits([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPandits();
    }, [bookingData.pooja?.id, location?.lat, location?.lng, location?.pincode]);

    // Filter by language client-side
    const filteredPandits = selectedLanguage === 'All'
        ? pandits
        : pandits.filter(p => (p.languages_spoken || []).includes(selectedLanguage));

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

            {/* Location Notice */}
            {!hasLocation && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-orange-600" />
                        <p className="text-sm text-orange-800">Set your location to find nearby Pandits</p>
                    </div>
                    <Button
                        onClick={openLocationModal}
                        variant="outline"
                        className="text-orange-700 border-orange-300 hover:bg-orange-100"
                    >
                        Set Location
                    </Button>
                </div>
            )}

            {/* Location Badge (if set) */}
            {hasLocation && (
                <button
                    onClick={openLocationModal}
                    className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{location?.city || location?.pincode || 'Your Location'}</span>
                    <span className="text-orange-600 text-xs underline">Change</span>
                </button>
            )}

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

            {/* Loading State */}
            {loading && (
                <div className="text-center py-10 text-slate-400">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    Finding pandits near you...
                </div>
            )}

            {/* List */}
            {!loading && (
                <div className="space-y-4">
                    {filteredPandits.map(pandit => (
                        <PanditProfileCard
                            key={pandit.id}
                            pandit={pandit}
                            onSelect={selectPandit}
                        />
                    ))}
                </div>
            )}

            {/* Fallback for empty list */}
            {!loading && filteredPandits.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pandits found in your area.</p>
                    <p className="text-sm mt-1">Try changing your location or filters.</p>
                </div>
            )}
        </div>
    );
};

export default PanditMarketplace;

