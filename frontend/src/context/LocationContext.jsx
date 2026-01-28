import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LocationContext = createContext(null);

const STORAGE_KEY = 'uparwala_location';

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => {
        // Try to restore from localStorage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to restore location from storage:', e);
        }
        return null;
    });

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Serviceability state
    const [isServiceable, setIsServiceable] = useState(true);
    const [checkingServiceability, setCheckingServiceability] = useState(false);
    const [serviceabilityMessage, setServiceabilityMessage] = useState('');

    // Check serviceability when location changes
    useEffect(() => {
        const checkServiceability = async () => {
            if (!location?.pincode || location.pincode.length !== 6) {
                setIsServiceable(true); // Assume serviceable if no pincode
                setServiceabilityMessage('');
                return;
            }

            setCheckingServiceability(true);
            try {
                const response = await api.get(`/orders/serviceability/check/${location.pincode}/`);
                if (response.data.serviceable) {
                    setIsServiceable(true);
                    setServiceabilityMessage('');
                } else {
                    setIsServiceable(false);
                    setServiceabilityMessage(response.data.message || 'We will soon start operations in your region.');
                }
            } catch (error) {
                console.error('Serviceability check failed:', error);
                setIsServiceable(true); // Fail open
                setServiceabilityMessage('');
            } finally {
                setCheckingServiceability(false);
            }
        };

        checkServiceability();
    }, [location?.pincode]);

    // Persist location to localStorage whenever it changes
    useEffect(() => {
        if (location) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
            } catch (e) {
                console.error('Failed to save location to storage:', e);
            }
        }
    }, [location]);

    const updateLocation = (newLocation) => {
        /**
         * newLocation: {
         *   lat: number | null,
         *   lng: number | null,
         *   pincode: string,
         *   address: string,
         *   city?: string,
         *   state?: string
         * }
         */
        setLocation(newLocation);
        setIsLocationModalOpen(false);
    };

    const clearLocation = () => {
        setLocation(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const openLocationModal = () => setIsLocationModalOpen(true);
    const closeLocationModal = () => setIsLocationModalOpen(false);

    return (
        <LocationContext.Provider value={{
            location,
            updateLocation,
            clearLocation,
            isLocationModalOpen,
            openLocationModal,
            closeLocationModal,
            hasLocation: !!location && (!!location.pincode || (!!location.lat && !!location.lng)),
            // Serviceability
            isServiceable,
            checkingServiceability,
            serviceabilityMessage
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
