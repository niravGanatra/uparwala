import { MapPin, AlertCircle } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

/**
 * ServiceabilityBanner - Shows when user's location is not serviceable
 * 
 * @param {string} variant - 'compact' for product cards, 'full' for detail pages
 */
const ServiceabilityBanner = ({ variant = 'compact' }) => {
    const { location, isServiceable, checkingServiceability, openLocationModal, hasLocation } = useLocation();

    // Don't show if checking, serviceable, or no location set
    if (checkingServiceability || isServiceable || !hasLocation) {
        return null;
    }

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1.5 rounded mb-3 w-fit">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Coming soon to your area</span>
            </div>
        );
    }

    // Full variant for detail pages
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                    <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-amber-800">
                        We will soon start operations in your region
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                        Delivery to <span className="font-medium">{location?.pincode}</span> is not available yet.
                        We're expanding rapidly and hope to serve you soon!
                    </p>
                    <button
                        onClick={openLocationModal}
                        className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
                    >
                        <MapPin className="w-4 h-4" />
                        Change Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceabilityBanner;
