import { createContext, useContext, useState, useEffect } from 'react';

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
            hasLocation: !!location && (!!location.pincode || (!!location.lat && !!location.lng))
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
