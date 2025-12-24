import { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

const AnalyticsTracker = () => {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        const handleError = (event) => {
            trackEvent('error', {
                code: 'JS_ERROR',
                message: event.message,
                url: window.location.href,
                timestamp: new Date().toISOString()
            });
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, [trackEvent]);

    return null;
};

export default AnalyticsTracker;
