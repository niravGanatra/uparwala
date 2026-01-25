import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Power, MapPin, Clock, Calendar, User, Phone,
    CheckCircle, XCircle, Navigation, Star, FileText,
    AlertCircle, RefreshCw
} from 'lucide-react';
import { panditAPI, bookingsAPI, createTrackingSocket, sendLocationUpdate } from '../../services/servicesService';
import toast from 'react-hot-toast';

const PanditDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [todayBookings, setTodayBookings] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [activeBookingId, setActiveBookingId] = useState(null);

    const wsRef = useRef(null);
    const locationWatchIdRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
        return () => {
            // Cleanup
            if (wsRef.current) wsRef.current.close();
            if (locationWatchIdRef.current) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
            }
        };
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [dashboardRes, availabilityRes] = await Promise.all([
                panditAPI.getDashboard(),
                panditAPI.getAvailability()
            ]);

            setProfile(dashboardRes.data.profile);
            setStats(dashboardRes.data.stats);
            setPendingBookings(dashboardRes.data.pending_bookings);
            setTodayBookings(dashboardRes.data.today_bookings);
            setIsOnline(availabilityRes.data.is_online);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        setActionLoading('availability');
        try {
            const newStatus = !isOnline;

            if (newStatus && navigator.geolocation) {
                // Get current location when going online
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        await panditAPI.setAvailability({
                            is_online: true,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                        setIsOnline(true);
                        toast.success('You are now online!');
                    },
                    async (error) => {
                        console.error('Geolocation error:', error);
                        await panditAPI.setAvailability({ is_online: true });
                        setIsOnline(true);
                        toast.success('You are now online!');
                    }
                );
            } else {
                await panditAPI.setAvailability({ is_online: false });
                setIsOnline(false);
                toast.success('You are now offline');
            }
        } catch (error) {
            console.error('Failed to toggle availability:', error);
            toast.error(error.response?.data?.detail || 'Failed to update availability');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAccept = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await bookingsAPI.accept(bookingId);
            toast.success('Booking accepted!');
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to accept booking:', error);
            toast.error(error.response?.data?.detail || 'Failed to accept booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (bookingId) => {
        const reason = prompt('Reason for rejection (optional):');
        setActionLoading(bookingId);
        try {
            await bookingsAPI.reject(bookingId, reason || '');
            toast.success('Booking rejected');
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to reject booking:', error);
            toast.error(error.response?.data?.detail || 'Failed to reject booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStartTravel = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            const response = await bookingsAPI.startTravel(bookingId);
            toast.success('Travel started! Live tracking is now active.');
            setActiveBookingId(bookingId);

            // Start tracking location
            startLocationTracking(bookingId);

            fetchDashboardData();
        } catch (error) {
            console.error('Failed to start travel:', error);
            toast.error(error.response?.data?.detail || 'Failed to start travel');
        } finally {
            setActionLoading(null);
        }
    };

    const startLocationTracking = useCallback((bookingId) => {
        // Connect to WebSocket
        wsRef.current = createTrackingSocket(bookingId, (data) => {
            console.log('WebSocket message:', data);
        });

        // Start watching location
        if (navigator.geolocation) {
            locationWatchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    sendLocationUpdate(
                        wsRef.current,
                        position.coords.latitude,
                        position.coords.longitude
                    );
                },
                (error) => console.error('Geolocation error:', error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }
            );
        }
    }, []);

    const handleVerifyOTP = async (bookingId, type) => {
        const otp = prompt(`Enter ${type === 'start' ? 'Start' : 'End'} OTP from customer:`);
        if (!otp) return;

        setActionLoading(bookingId);
        try {
            if (type === 'start') {
                await bookingsAPI.verifyStart(bookingId, otp);
                toast.success('Service started successfully!');
            } else {
                await bookingsAPI.verifyComplete(bookingId, otp);
                toast.success('Service completed successfully!');

                // Stop location tracking
                if (wsRef.current) wsRef.current.close();
                if (locationWatchIdRef.current) {
                    navigator.geolocation.clearWatch(locationWatchIdRef.current);
                }
                setActiveBookingId(null);
            }
            fetchDashboardData();
        } catch (error) {
            console.error('OTP verification failed:', error);
            toast.error(error.response?.data?.detail || 'Invalid OTP');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Pandit Profile Found</h2>
                    <p className="text-gray-600 mb-4">Register as a Pandit to access this dashboard.</p>
                    <a
                        href="/pandit/register"
                        className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                    >
                        Register as Pandit
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header with Availability Toggle */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {profile.profile_photo ? (
                                <img
                                    src={profile.profile_photo}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-4 border-orange-200"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center">
                                    <User className="w-8 h-8 text-orange-600" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {profile.user_name}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>{profile.average_rating?.toFixed(1) || '0.0'}</span>
                                    <span className="text-gray-300">|</span>
                                    <span>{profile.total_reviews} reviews</span>
                                    <span className="text-gray-300">|</span>
                                    <span>{profile.total_bookings_completed} bookings</span>
                                </div>
                                <div className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${profile.verification_status === 'verified'
                                        ? 'bg-green-100 text-green-700'
                                        : profile.verification_status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {profile.verification_status === 'verified' ? (
                                        <CheckCircle className="w-3 h-3" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3" />
                                    )}
                                    {profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
                                </div>
                            </div>
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchDashboardData}
                                className="p-2 text-gray-500 hover:text-orange-600 transition"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>

                            <button
                                onClick={toggleAvailability}
                                disabled={actionLoading === 'availability' || profile.verification_status !== 'verified'}
                                className={`
                                    flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all
                                    ${isOnline
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }
                                    ${profile.verification_status !== 'verified' ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${actionLoading === 'availability' ? 'opacity-75' : ''}
                                `}
                            >
                                <Power className={`w-5 h-5 ${isOnline ? 'animate-pulse' : ''}`} />
                                <span>{isOnline ? 'Online' : 'Offline'}</span>
                                {actionLoading === 'availability' && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {profile.verification_status !== 'verified' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                            <AlertCircle className="w-4 h-4 inline mr-2" />
                            Your profile is pending verification. You cannot go online until verified.
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600">{stats?.new_requests || 0}</div>
                        <div className="text-sm text-gray-500">New Requests</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats?.accepted || 0}</div>
                        <div className="text-sm text-gray-500">Accepted</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats?.in_progress || 0}</div>
                        <div className="text-sm text-gray-500">In Progress</div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats?.completed || 0}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </div>
                </div>

                {/* Pending Booking Requests */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        New Booking Requests
                    </h2>

                    {pendingBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No pending booking requests</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingBookings.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onAccept={() => handleAccept(booking.id)}
                                    onReject={() => handleReject(booking.id)}
                                    loading={actionLoading === booking.id}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Today's Bookings */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        Today's Bookings
                    </h2>

                    {todayBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No bookings scheduled for today</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todayBookings.map((booking) => (
                                <ActiveBookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onStartTravel={() => handleStartTravel(booking.id)}
                                    onVerifyStart={() => handleVerifyOTP(booking.id, 'start')}
                                    onVerifyComplete={() => handleVerifyOTP(booking.id, 'complete')}
                                    loading={actionLoading === booking.id}
                                    isActive={activeBookingId === booking.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Booking Card Component for Pending Requests
const BookingCard = ({ booking, onAccept, onReject, loading }) => (
    <div className="border border-orange-100 rounded-xl p-4 hover:shadow-md transition">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">{booking.service_name}</span>
                    <span className="text-orange-600 font-bold">₹{booking.total_amount}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {booking.customer_name}
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {booking.customer_phone}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.booking_date}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.booking_time}
                    </div>
                </div>
                <div className="mt-2 flex items-start gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{booking.address}, {booking.pincode}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onReject}
                    disabled={loading}
                    className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                >
                    <XCircle className="w-4 h-4" />
                    Reject
                </button>
                <button
                    onClick={onAccept}
                    disabled={loading}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                    Accept
                </button>
            </div>
        </div>
    </div>
);

// Active Booking Card for Today's Bookings
const ActiveBookingCard = ({ booking, onStartTravel, onVerifyStart, onVerifyComplete, loading, isActive }) => {
    const getStatusColor = (status) => {
        const colors = {
            accepted: 'bg-blue-100 text-blue-700',
            confirmed: 'bg-purple-100 text-purple-700',
            on_the_way: 'bg-orange-100 text-orange-700',
            in_progress: 'bg-green-100 text-green-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getActions = () => {
        switch (booking.status) {
            case 'accepted':
            case 'confirmed':
                return (
                    <button
                        onClick={onStartTravel}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50 shadow-lg"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Navigation className="w-4 h-4" />
                        )}
                        Start Travel
                    </button>
                );
            case 'on_the_way':
                return (
                    <button
                        onClick={onVerifyStart}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                        Verify Start OTP
                    </button>
                );
            case 'in_progress':
                return (
                    <button
                        onClick={onVerifyComplete}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                    >
                        Complete Service
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`border rounded-xl p-4 transition ${isActive ? 'border-orange-400 shadow-lg shadow-orange-100' : 'border-gray-100 hover:shadow-md'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">{booking.service_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status_display}
                        </span>
                        {isActive && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Live Tracking
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {booking.customer_name}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.booking_time}
                        </div>
                    </div>
                    <div className="mt-2 flex items-start gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{booking.address}, {booking.pincode}</span>
                    </div>
                </div>

                <div className="flex items-center">
                    {getActions()}
                </div>
            </div>
        </div>
    );
};

export default PanditDashboard;
