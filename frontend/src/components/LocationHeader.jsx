import { MapPin, ChevronDown } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const LocationHeader = () => {
    const { location, openLocationModal, hasLocation } = useLocation();

    return (
        <button
            onClick={openLocationModal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors group"
        >
            <MapPin className={`w-4 h-4 ${hasLocation ? 'text-orange-600' : 'text-slate-400'}`} />
            <div className="text-left">
                {hasLocation ? (
                    <>
                        <p className="text-xs text-slate-500">Deliver to</p>
                        <p className="text-sm font-medium text-slate-800 max-w-[150px] truncate">
                            {location.city || location.pincode || 'Selected'}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-slate-600">Set Location</p>
                )}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
        </button>
    );
};

export default LocationHeader;
