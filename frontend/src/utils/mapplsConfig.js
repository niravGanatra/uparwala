/**
 * Mappls (MapmyIndia) SDK Configuration
 * Handles dynamic loading and initialization of Mappls APIs
 */

const MAPPLS_SCRIPT_ID = 'mappls-sdk-script';
const MAPPLS_PLUGINS_ID = 'mappls-plugins-script';

// Track initialization state
let isInitialized = false;
let initPromise = null;

/**
 * Get the Mappls API key from environment
 */
export const getMapplsKey = () => {
    return import.meta.env.VITE_MAPPLS_KEY || '';
};

/**
 * Dynamically load Mappls SDK scripts
 * @returns {Promise} Resolves when SDK is ready
 */
export const loadMapplsSDK = () => {
    if (isInitialized && window.mappls) {
        return Promise.resolve(window.mappls);
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = new Promise((resolve, reject) => {
        const apiKey = getMapplsKey();

        if (!apiKey) {
            console.warn('VITE_MAPPLS_KEY not set. Mappls features will not work.');
            reject(new Error('Mappls API key not configured'));
            return;
        }

        // Check if already loaded via index.html
        if (window.mappls) {
            isInitialized = true;
            resolve(window.mappls);
            return;
        }

        // Create callback for when SDK is ready
        window.initMapplsMap = () => {
            isInitialized = true;
            resolve(window.mappls);
        };

        // Load main SDK
        const existingScript = document.getElementById(MAPPLS_SCRIPT_ID);
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = MAPPLS_SCRIPT_ID;
            script.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0&callback=initMapplsMap`;
            script.async = true;
            script.onerror = () => reject(new Error('Failed to load Mappls SDK'));
            document.head.appendChild(script);

            // Load plugins after main SDK
            script.onload = () => {
                const pluginsScript = document.createElement('script');
                pluginsScript.id = MAPPLS_PLUGINS_ID;
                pluginsScript.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk_plugins?v=3.0`;
                pluginsScript.async = true;
                document.head.appendChild(pluginsScript);
            };
        }

        // Timeout after 10 seconds
        setTimeout(() => {
            if (!isInitialized) {
                reject(new Error('Mappls SDK load timeout'));
            }
        }, 10000);
    });

    return initPromise;
};

/**
 * Check if Mappls SDK is loaded and ready
 */
export const isMapplsReady = () => {
    return isInitialized && !!window.mappls;
};

/**
 * Normalize Mappls place data to our app's format
 * Adapter pattern: Mappls -> App format
 */
export const normalizePlaceData = (mapplsPlace) => {
    if (!mapplsPlace) return null;

    return {
        // Unique identifier
        placeId: mapplsPlace.eLoc || mapplsPlace.eloc || null,

        // Coordinates
        lat: parseFloat(mapplsPlace.latitude) || parseFloat(mapplsPlace.lat) || null,
        lng: parseFloat(mapplsPlace.longitude) || parseFloat(mapplsPlace.lng) || null,

        // Address components
        address: mapplsPlace.placeName || mapplsPlace.placeAddress || mapplsPlace.address || '',
        city: mapplsPlace.city || mapplsPlace.district || '',
        state: mapplsPlace.state || '',
        pincode: mapplsPlace.pincode || mapplsPlace.postalCode || '',

        // Full formatted address
        formattedAddress: [
            mapplsPlace.placeName,
            mapplsPlace.placeAddress,
            mapplsPlace.city,
            mapplsPlace.state,
            mapplsPlace.pincode
        ].filter(Boolean).join(', '),

        // Raw data for debugging
        _raw: mapplsPlace
    };
};

export default {
    loadMapplsSDK,
    getMapplsKey,
    isMapplsReady,
    normalizePlaceData
};
