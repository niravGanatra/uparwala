/**
 * PanditTrackingMap - Live tracking map using Mappls SDK
 * Shows user location, pandit location, and route between them
 */
import { useEffect, useRef, useState } from 'react';
import { loadMapplsSDK, getMapplsKey } from '../utils/mapplsConfig';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

const PanditTrackingMap = ({
    userLocation,      // { lat, lng }
    panditLocation,    // { lat, lng }
    containerClassName = "",
    height = "300px"
}) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({ user: null, pandit: null });
    const polylineRef = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize map
    useEffect(() => {
        let mounted = true;

        const initMap = async () => {
            try {
                await loadMapplsSDK();

                if (!mounted || !mapContainerRef.current) return;

                // Default center (India)
                const defaultCenter = { lat: 20.5937, lng: 78.9629 };
                const center = userLocation || panditLocation || defaultCenter;

                // Create map instance
                mapInstanceRef.current = new window.mappls.Map(mapContainerRef.current, {
                    center: [center.lat, center.lng],
                    zoom: 14,
                    zoomControl: true,
                    search: false,
                    location: false
                });

                mapInstanceRef.current.on('load', () => {
                    if (mounted) {
                        setIsLoading(false);
                        updateMarkers();
                    }
                });

            } catch (err) {
                console.error('Failed to initialize Mappls map:', err);
                if (mounted) {
                    setError('Map could not be loaded');
                    setIsLoading(false);
                }
            }
        };

        initMap();

        // Cleanup on unmount
        return () => {
            mounted = false;
            if (mapInstanceRef.current) {
                // Remove markers
                if (markersRef.current.user) {
                    markersRef.current.user.remove();
                }
                if (markersRef.current.pandit) {
                    markersRef.current.pandit.remove();
                }
                // Remove polyline
                if (polylineRef.current) {
                    polylineRef.current.remove();
                }
                // Remove map
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers when locations change
    const updateMarkers = () => {
        if (!mapInstanceRef.current || !window.mappls) return;

        const map = mapInstanceRef.current;

        // User marker (Home icon - blue)
        if (userLocation?.lat && userLocation?.lng) {
            if (markersRef.current.user) {
                markersRef.current.user.remove();
            }

            markersRef.current.user = new window.mappls.Marker({
                map: map,
                position: { lat: userLocation.lat, lng: userLocation.lng },
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#3B82F6" stroke="#fff" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    `),
                    width: 40,
                    height: 40
                },
                draggable: false
            });
        }

        // Pandit marker (Person icon - orange)
        if (panditLocation?.lat && panditLocation?.lng) {
            if (markersRef.current.pandit) {
                markersRef.current.pandit.remove();
            }

            markersRef.current.pandit = new window.mappls.Marker({
                map: map,
                position: { lat: panditLocation.lat, lng: panditLocation.lng },
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#EA580C" stroke="#fff" stroke-width="2">
                            <circle cx="12" cy="7" r="4"/>
                            <path d="M5.5 21a8.38 8.38 0 0 1 13 0"/>
                        </svg>
                    `),
                    width: 40,
                    height: 40
                },
                draggable: false
            });
        }

        // Draw polyline between user and pandit
        if (userLocation?.lat && userLocation?.lng && panditLocation?.lat && panditLocation?.lng) {
            if (polylineRef.current) {
                polylineRef.current.remove();
            }

            polylineRef.current = new window.mappls.Polyline({
                map: map,
                path: [
                    { lat: userLocation.lat, lng: userLocation.lng },
                    { lat: panditLocation.lat, lng: panditLocation.lng }
                ],
                strokeColor: '#EA580C',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                strokeStyle: 'dashed'
            });

            // Fit bounds to show both markers
            const bounds = new window.mappls.LatLngBounds();
            bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
            bounds.extend({ lat: panditLocation.lat, lng: panditLocation.lng });
            map.fitBounds(bounds, { padding: 50 });
        }
    };

    // Update markers when locations change
    useEffect(() => {
        if (!isLoading && mapInstanceRef.current) {
            updateMarkers();
        }
    }, [userLocation, panditLocation, isLoading]);

    return (
        <div className={`relative ${containerClassName}`} style={{ height }}>
            {/* Map Container */}
            <div
                ref={mapContainerRef}
                className="w-full h-full rounded-xl overflow-hidden"
                style={{ minHeight: height }}
            />

            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 bg-slate-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 bg-slate-100 rounded-xl flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Legend */}
            {!isLoading && !error && (userLocation || panditLocation) && (
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm text-xs space-y-1">
                    {userLocation && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-slate-600">Your Location</span>
                        </div>
                    )}
                    {panditLocation && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="text-slate-600">Pandit Location</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PanditTrackingMap;
