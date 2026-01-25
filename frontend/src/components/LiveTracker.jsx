import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Phone, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { bookingsAPI, createTrackingSocket } from '../services/servicesService';

/**
 * LiveTracker Component
 * 
 * Displays a map with real-time Pandit location tracking for customers.
 * Uses Leaflet for mapping and WebSocket for live location updates.
 * 
 * Props:
 * - bookingId: ID of the booking to track
 * - onClose: Callback when tracker is closed
 */
const LiveTracker = ({ bookingId, onClose }) => {
    const [booking, setBooking] = useState(null);
    const [panditLocation, setPanditLocation] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const wsRef = useRef(null);

    // Fetch booking details
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await bookingsAPI.getById(bookingId);
                setBooking(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch booking:', err);
                setError('Failed to load booking details');
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // Initialize map
    useEffect(() => {
        if (loading || !mapRef.current || mapInstanceRef.current) return;

        // Load Leaflet CSS dynamically
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS dynamically
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.body.appendChild(script);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [loading]);

    const initializeMap = useCallback(() => {
        if (!window.L || !mapRef.current) return;

        // Default center (India)
        const defaultCenter = [20.5937, 78.9629];

        // Initialize map
        mapInstanceRef.current = window.L.map(mapRef.current).setView(defaultCenter, 5);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Add destination marker (customer location) if we have coordinates
        // For now, we'll just show the pandit marker

    }, []);

    // Connect to WebSocket for live updates
    useEffect(() => {
        if (!bookingId || !booking || booking.status !== 'on_the_way') return;

        setConnectionStatus('connecting');

        wsRef.current = createTrackingSocket(bookingId, (data) => {
            if (data.type === 'connection_established') {
                setConnectionStatus('connected');
            } else if (data.type === 'location_update') {
                handleLocationUpdate(data.latitude, data.longitude);
            } else if (data.type === 'status_update') {
                // Refresh booking when status changes
                bookingsAPI.getById(bookingId).then(res => setBooking(res.data));
            }
        });

        wsRef.current.onclose = () => setConnectionStatus('disconnected');
        wsRef.current.onerror = () => setConnectionStatus('error');

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [bookingId, booking?.status]);

    const handleLocationUpdate = useCallback((lat, lng) => {
        setPanditLocation({ lat, lng });

        if (!mapInstanceRef.current || !window.L) return;

        const position = [parseFloat(lat), parseFloat(lng)];

        if (markerRef.current) {
            // Update existing marker position
            markerRef.current.setLatLng(position);
        } else {
            // Create new marker with custom icon
            const panditIcon = window.L.divIcon({
                className: 'pandit-marker',
                html: `
                    <div style="
                        background: linear-gradient(135deg, #f97316, #ea580c);
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
                        border: 3px solid white;
                        animation: pulse 2s infinite;
                    ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <style>
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                        }
                    </style>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
            });

            markerRef.current = window.L.marker(position, { icon: panditIcon })
                .addTo(mapInstanceRef.current);
        }

        // Center map on marker
        mapInstanceRef.current.setView(position, 15);

    }, []);

    const getStatusDisplay = () => {
        if (!booking) return null;

        const statusConfig = {
            on_the_way: {
                icon: Navigation,
                text: 'Pandit is on the way',
                color: 'text-orange-600 bg-orange-100'
            },
            in_progress: {
                icon: CheckCircle,
                text: 'Service in progress',
                color: 'text-green-600 bg-green-100'
            },
            completed: {
                icon: CheckCircle,
                text: 'Service completed',
                color: 'text-blue-600 bg-blue-100'
            },
        };

        const config = statusConfig[booking.status] || {
            icon: Clock,
            text: booking.status_display,
            color: 'text-gray-600 bg-gray-100'
        };

        const Icon = config.icon;

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color}`}>
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{config.text}</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading tracking...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-800 font-semibold">{error}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Live Tracking</h2>
                            <p className="text-orange-100 text-sm">Booking #{bookingId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="p-4 border-b flex items-center justify-between">
                    {getStatusDisplay()}

                    <div className="flex items-center gap-1 text-sm">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                                    'bg-red-500'
                            }`}></div>
                        <span className="text-gray-500 capitalize">{connectionStatus}</span>
                    </div>
                </div>

                {/* Map */}
                <div
                    ref={mapRef}
                    className="h-80 w-full bg-gray-100"
                    style={{ minHeight: '320px' }}
                >
                    {!panditLocation && booking?.status === 'on_the_way' && (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <Navigation className="w-12 h-12 mx-auto mb-2 animate-bounce" />
                                <p>Waiting for location updates...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pandit Info */}
                {booking && (
                    <div className="p-4 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{booking.pandit_name}</p>
                                <p className="text-sm text-gray-500">{booking.service_name}</p>
                            </div>
                            {booking.pandit_phone && (
                                <a
                                    href={`tel:${booking.pandit_phone}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call
                                </a>
                            )}
                        </div>

                        {/* OTP Display for Customer */}
                        {booking.status === 'on_the_way' && booking.otp_start && (
                            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                                <p className="text-sm text-orange-700">
                                    <strong>Start OTP:</strong> Share this with the Pandit when they arrive
                                </p>
                                <p className="text-3xl font-mono font-bold text-orange-600 mt-1">
                                    {booking.otp_start}
                                </p>
                            </div>
                        )}

                        {booking.status === 'in_progress' && booking.otp_end && (
                            <div className="mt-4 p-3 bg-green-100 rounded-lg">
                                <p className="text-sm text-green-700">
                                    <strong>End OTP:</strong> Share this when service is completed
                                </p>
                                <p className="text-3xl font-mono font-bold text-green-600 mt-1">
                                    {booking.otp_end}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTracker;
