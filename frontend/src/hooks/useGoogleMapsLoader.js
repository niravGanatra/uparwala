/**
 * Hook to dynamically load Google Maps JavaScript API
 * Uses the VITE_GOOGLE_MAPS_KEY environment variable
 */
import { useState, useEffect } from 'react';

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

export const useGoogleMapsLoader = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        // Check if already loaded
        if (window.google && window.google.maps) {
            setIsLoaded(true);
            return;
        }

        // Check if script is already being loaded
        if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
            // Wait for existing script to load
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    setIsLoaded(true);
                    clearInterval(checkLoaded);
                }
            }, 100);
            return () => clearInterval(checkLoaded);
        }

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

        if (!apiKey) {
            console.warn('VITE_GOOGLE_MAPS_KEY not set. Google Places autocomplete will not work.');
            setLoadError('API key not configured');
            return;
        }

        // Create and append script
        const script = document.createElement('script');
        script.id = GOOGLE_MAPS_SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setIsLoaded(true);
        };

        script.onerror = () => {
            setLoadError('Failed to load Google Maps API');
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup not needed - we keep the script loaded
        };
    }, []);

    return { isLoaded, loadError };
};

export default useGoogleMapsLoader;
