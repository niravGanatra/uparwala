/**
 * MapplsAddressSearch - Address Autocomplete Component using Mappls SDK
 * Replaces Google Places Autocomplete
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { loadMapplsSDK, normalizePlaceData, getMapplsKey } from '../utils/mapplsConfig';

const MapplsAddressSearch = ({
    onSelect,
    placeholder = "Search for area, street name...",
    className = "",
    inputClassName = ""
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSDKReady, setIsSDKReady] = useState(false);
    const [error, setError] = useState(null);
    const debounceTimer = useRef(null);
    const inputRef = useRef(null);

    // Initialize Mappls SDK
    useEffect(() => {
        loadMapplsSDK()
            .then(() => {
                setIsSDKReady(true);
                setError(null);
            })
            .catch((err) => {
                console.error('Failed to load Mappls SDK:', err);
                setError('Map service unavailable');
            });
    }, []);

    // Debounced search function
    const searchPlaces = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 3 || !isSDKReady) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);

        try {
            // Use Mappls Autosuggest API
            const apiKey = getMapplsKey();
            const response = await fetch(
                `https://atlas.mappls.com/api/places/search/json?query=${encodeURIComponent(searchQuery)}&region=IND`,
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    }
                }
            );

            if (!response.ok) {
                // Fallback to alternative endpoint
                const altResponse = await fetch(
                    `https://apis.mappls.com/advancedmaps/v1/${apiKey}/autosuggest?query=${encodeURIComponent(searchQuery)}&location=22.7196,75.8577&bridge=true`
                );

                if (altResponse.ok) {
                    const data = await altResponse.json();
                    setSuggestions(data.suggestedLocations || []);
                } else {
                    setSuggestions([]);
                }
            } else {
                const data = await response.json();
                setSuggestions(data.suggestedLocations || data.results || []);
            }
        } catch (err) {
            console.error('Mappls search error:', err);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [isSDKReady]);

    // Handle input change with debounce
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce search by 300ms
        debounceTimer.current = setTimeout(() => {
            searchPlaces(value);
        }, 300);
    };

    // Handle suggestion selection
    const handleSelect = async (suggestion) => {
        const normalized = normalizePlaceData(suggestion);

        // If lat/lng not in suggestion, fetch details using eLoc
        if ((!normalized.lat || !normalized.lng) && normalized.placeId) {
            try {
                const apiKey = getMapplsKey();
                const detailsResponse = await fetch(
                    `https://apis.mappls.com/advancedmaps/v1/${apiKey}/place_detail?eLoc=${normalized.placeId}`
                );
                if (detailsResponse.ok) {
                    const details = await detailsResponse.json();
                    if (details.latitude && details.longitude) {
                        normalized.lat = parseFloat(details.latitude);
                        normalized.lng = parseFloat(details.longitude);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch place details:', err);
            }
        }

        setQuery(normalized.formattedAddress || normalized.address || suggestion.placeName || '');
        setSuggestions([]);

        if (onSelect) {
            onSelect(normalized);
        }
    };

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return (
        <div className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={error || placeholder}
                    disabled={!!error}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed ${inputClassName}`}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 animate-spin" />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.eLoc || suggestion.eloc || index}
                            onClick={() => handleSelect(suggestion)}
                            className="w-full p-3 text-left hover:bg-orange-50 border-b border-slate-100 last:border-b-0 flex items-start gap-3 transition-colors"
                        >
                            <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                    {suggestion.placeName || suggestion.place_name || suggestion.addressTokens?.houseNumber || 'Location'}
                                </p>
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                    {suggestion.placeAddress || suggestion.address ||
                                        [suggestion.city, suggestion.state].filter(Boolean).join(', ')}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {query.length >= 3 && !isLoading && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-slate-400 text-sm">
                    No locations found
                </div>
            )}
        </div>
    );
};

export default MapplsAddressSearch;
