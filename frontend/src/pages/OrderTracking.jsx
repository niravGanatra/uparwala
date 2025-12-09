import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Package,
    MapPin,
    Clock,
    CheckCircle,
    Truck,
    Home,
    AlertCircle,
    ExternalLink,
    ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderTracking = () => {
    const { orderId } = useParams();
    const [loading, setLoading] = useState(true);
    const [tracking, setTracking] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTracking();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchTracking, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    const fetchTracking = async () => {
        try {
            const response = await api.get(`/orders/${orderId}/tracking-history/`);
            setTracking(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch tracking:', err);
            setError(err.response?.data?.error || 'Failed to load tracking information');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status, isLatest) => {
        const statusLower = status.toLowerCase();

        if (statusLower.includes('delivered')) {
            return <Home className={`w-5 h-5 ${isLatest ? 'text-green-500' : 'text-gray-400'}`} />;
        } else if (statusLower.includes('transit') || statusLower.includes('shipped')) {
            return <Truck className={`w-5 h-5 ${isLatest ? 'text-blue-500' : 'text-gray-400'}`} />;
        } else if (statusLower.includes('picked')) {
            return <Package className={`w-5 h-5 ${isLatest ? 'text-orange-500' : 'text-gray-400'}`} />;
        } else {
            return <CheckCircle className={`w-5 h-5 ${isLatest ? 'text-blue-500' : 'text-gray-400'}`} />;
        }
    };

    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();

        if (statusLower.includes('delivered')) {
            return 'bg-green-500';
        } else if (statusLower.includes('transit') || statusLower.includes('shipped')) {
            return 'bg-blue-500';
        } else if (statusLower.includes('picked')) {
            return 'bg-orange-500';
        } else {
            return 'bg-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tracking information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Tracking</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
                    <p className="text-gray-600 mt-1">Order #{tracking?.order_number}</p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                            <p className="font-bold text-lg">{tracking?.awb_code || 'Pending'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Courier</p>
                            <p className="font-bold text-lg">{tracking?.courier_name || 'Not Assigned'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Current Status</p>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(tracking?.current_status || 'Pending', true)}
                                <p className="font-bold text-lg">{tracking?.current_status || 'Pending'}</p>
                            </div>
                        </div>
                    </div>

                    {tracking?.tracking_url && (
                        <div className="mt-4 pt-4 border-t">
                            <a
                                href={tracking.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Track on Courier Website
                            </a>
                        </div>
                    )}
                </div>

                {/* Tracking Timeline */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        Tracking History
                    </h2>

                    {tracking?.tracking_events && tracking.tracking_events.length > 0 ? (
                        <div className="space-y-6">
                            {tracking.tracking_events.map((event, idx) => (
                                <div key={event.id} className="flex gap-4">
                                    {/* Timeline Icon */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0
                                                ? getStatusColor(event.status)
                                                : 'bg-gray-300'
                                            }`}>
                                            {getStatusIcon(event.status, idx === 0)}
                                        </div>
                                        {idx < tracking.tracking_events.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-300 my-2 flex-1" />
                                        )}
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 pb-8">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className={`font-semibold text-lg ${idx === 0 ? 'text-gray-900' : 'text-gray-600'
                                                    }`}>
                                                    {event.status}
                                                </p>
                                                <p className="text-gray-600 mt-1">{event.description}</p>

                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(event.timestamp).toLocaleString('en-IN', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            {idx === 0 && (
                                                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No tracking information available yet</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Tracking will be updated once your order is shipped
                            </p>
                        </div>
                    )}
                </div>

                {/* Auto-refresh indicator */}
                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>Tracking information updates automatically every 30 seconds</p>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
