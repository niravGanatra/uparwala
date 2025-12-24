import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

export const useAnalytics = () => {
    const location = useLocation();

    const getSessionId = () => {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    };

    const trackEvent = useCallback(async (eventType, data = {}) => {
        const sessionId = getSessionId();
        try {
            await api.post('/analytics/events/', {
                event_type: eventType,
                session_id: sessionId,
                url: window.location.href,
                data: data
            });
        } catch (err) {
            // Silently fail for analytics to not disrupt user experience
            console.error('Analytics Error:', err);
        }
    }, []);

    // Session Start & Page View Tracking
    useEffect(() => {
        // Track session start if new session
        if (!sessionStorage.getItem('analytics_session_id')) {
            trackEvent('session_start');
        }

        // Track Page View
        const startTime = performance.now();

        // We track the view immediately
        trackEvent('page_view');

        // Optional: Measure load time if valid (but on SPA nav it's effectively 0 usually)

    }, [location.pathname, trackEvent]);

    return { trackEvent };
};
