import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Search, ChevronRight, Loader2 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useGoogleMapsLoader } from '../hooks/useGoogleMapsLoader';
import api from '../services/api';

const LocationPickerModal = () => {
    const { isLocationModalOpen, closeLocationModal, updateLocation } = useLocation();
    const { user } = useAuth();
    const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsError } = useGoogleMapsLoader();

    const [activeTab, setActiveTab] = useState('new');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Manual pincode input state
    const [pincode, setPincode] = useState('');
    const [pincodeError, setPincodeError] = useState('');

    // Google Places Autocomplete
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);

    // Fetch saved addresses for logged-in users
    useEffect(() => {
        if (user && isLocationModalOpen) {
            fetchSavedAddresses();
        }
    }, [user, isLocationModalOpen]);

    // Initialize Google Places services when API is loaded
    useEffect(() => {
        if (isGoogleMapsLoaded && window.google?.maps?.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            placesService.current = new window.google.maps.places.PlacesService(
                document.createElement('div')
            );
        }
    }, [isGoogleMapsLoaded, isLocationModalOpen]);

    const fetchSavedAddresses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/addresses/');
            setSavedAddresses(response.data || []);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavedAddressSelect = (address) => {
        updateLocation({
            lat: address.latitude ? parseFloat(address.latitude) : null,
            lng: address.longitude ? parseFloat(address.longitude) : null,
            pincode: address.pincode,
            address: `${address.address_line1}, ${address.city}`,
            city: address.city,
            state: address.state
        });
    };

    const handlePincodeSubmit = () => {
        // Validate 6-digit Indian pincode
        if (!/^\d{6}$/.test(pincode)) {
            setPincodeError('Please enter a valid 6-digit pincode');
            return;
        }
        setPincodeError('');
        updateLocation({
            lat: null,
            lng: null,
            pincode: pincode,
            address: `Pincode: ${pincode}`,
            city: null,
            state: null
        });
    };

    const handleSearchChange = async (query) => {
        setSearchQuery(query);
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        if (!autocompleteService.current) {
            console.warn('Google Places API not loaded');
            return;
        }

        setLoadingSuggestions(true);
        try {
            autocompleteService.current.getPlacePredictions(
                {
                    input: query,
                    componentRestrictions: { country: 'in' },
                    types: ['geocode']
                },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions);
                    } else {
                        setSuggestions([]);
                    }
                    setLoadingSuggestions(false);
                }
            );
        } catch (error) {
            console.error('Autocomplete error:', error);
            setLoadingSuggestions(false);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        if (!placesService.current) return;

        placesService.current.getDetails(
            {
                placeId: suggestion.place_id,
                fields: ['geometry', 'address_components', 'formatted_address']
            },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    // Extract pincode from address components
                    let pincode = '';
                    let city = '';
                    let state = '';

                    place.address_components?.forEach(component => {
                        if (component.types.includes('postal_code')) {
                            pincode = component.long_name;
                        }
                        if (component.types.includes('locality')) {
                            city = component.long_name;
                        }
                        if (component.types.includes('administrative_area_level_1')) {
                            state = component.long_name;
                        }
                    });

                    updateLocation({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        pincode: pincode,
                        address: place.formatted_address,
                        city: city,
                        state: state
                    });
                }
            }
        );
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocode to get address
                if (isGoogleMapsLoaded && window.google) {
                    try {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode(
                            { location: { lat: latitude, lng: longitude } },
                            (results, status) => {
                                if (status === 'OK' && results[0]) {
                                    let pincode = '';
                                    let city = '';
                                    let state = '';

                                    results[0].address_components?.forEach(component => {
                                        if (component.types.includes('postal_code')) {
                                            pincode = component.long_name;
                                        }
                                        if (component.types.includes('locality')) {
                                            city = component.long_name;
                                        }
                                        if (component.types.includes('administrative_area_level_1')) {
                                            state = component.long_name;
                                        }
                                    });

                                    updateLocation({
                                        lat: latitude,
                                        lng: longitude,
                                        pincode: pincode,
                                        address: results[0].formatted_address,
                                        city: city,
                                        state: state
                                    });
                                }
                                setLoading(false);
                            }
                        );
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        // Fallback: use coordinates without address
                        updateLocation({
                            lat: latitude,
                            lng: longitude,
                            pincode: '',
                            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                            city: null,
                            state: null
                        });
                        setLoading(false);
                    }
                } else {
                    // Fallback without geocoding
                    updateLocation({
                        lat: latitude,
                        lng: longitude,
                        pincode: '',
                        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                        city: null,
                        state: null
                    });
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please enter manually.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    if (!isLocationModalOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={closeLocationModal}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Choose Your Location</h2>
                            </div>
                            <button
                                onClick={closeLocationModal}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-orange-100 text-sm mt-2">
                            Find Pandits available in your area
                        </p>
                    </div>

                    {/* Tabs (only show if user is logged in) */}
                    {user && (
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'saved'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Saved Addresses
                            </button>
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'new'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                New Location
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-5 overflow-y-auto max-h-[50vh]">
                        {/* Saved Addresses Tab */}
                        {activeTab === 'saved' && user && (
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading...
                                    </div>
                                ) : savedAddresses.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No saved addresses yet</p>
                                    </div>
                                ) : (
                                    savedAddresses.map((address) => (
                                        <button
                                            key={address.id}
                                            onClick={() => handleSavedAddressSelect(address)}
                                            className="w-full p-4 text-left rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 group-hover:text-orange-700">
                                                        {address.full_name}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {address.address_line1}, {address.city} - {address.pincode}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500" />
                                            </div>
                                            {address.is_default && (
                                                <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                    Default
                                                </span>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* New Location Tab */}
                        {(activeTab === 'new' || !user) && (
                            <div className="space-y-5">
                                {/* Use Current Location Button */}
                                <button
                                    onClick={handleUseCurrentLocation}
                                    disabled={loading}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 transition-colors text-orange-700 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Navigation className="w-5 h-5" />
                                    )}
                                    <span className="font-medium">
                                        {loading ? 'Getting location...' : 'Use my current location'}
                                    </span>
                                </button>

                                <div className="relative flex items-center">
                                    <div className="flex-1 border-t border-slate-200" />
                                    <span className="px-3 text-sm text-slate-400">or</span>
                                    <div className="flex-1 border-t border-slate-200" />
                                </div>

                                {/* Search Box (Google Places) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Search for an area, street name...
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            placeholder={googleMapsError || "e.g. Andheri West, Mumbai"}
                                            disabled={!!googleMapsError}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        />
                                        {loadingSuggestions && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 animate-spin" />
                                        )}
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {suggestions.length > 0 && (
                                        <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                            {suggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion.place_id}
                                                    onClick={() => handleSuggestionSelect(suggestion)}
                                                    className="w-full p-3 text-left hover:bg-orange-50 border-b border-slate-100 last:border-b-0"
                                                >
                                                    <p className="text-sm text-slate-700">{suggestion.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative flex items-center">
                                    <div className="flex-1 border-t border-slate-200" />
                                    <span className="px-3 text-sm text-slate-400">or enter pincode</span>
                                    <div className="flex-1 border-t border-slate-200" />
                                </div>

                                {/* Manual Pincode Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Enter 6-digit Pincode
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={pincode}
                                            onChange={(e) => {
                                                setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                setPincodeError('');
                                            }}
                                            placeholder="e.g. 400001"
                                            maxLength={6}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                        />
                                        <button
                                            onClick={handlePincodeSubmit}
                                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {pincodeError && (
                                        <p className="mt-2 text-sm text-red-500">{pincodeError}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LocationPickerModal;
