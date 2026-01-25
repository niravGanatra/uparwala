import api from './api';

// Services API endpoints for Pandit Booking & Tracking

// ============== Services ==============
export const servicesAPI = {
    // Get all active services
    getAll: () => api.get('/services/services/'),

    // Get single service by ID
    getById: (id) => api.get(`/services/services/${id}/`),

    // Create service (admin only)
    create: (data) => api.post('/services/services/', data),

    // Update service (admin only)
    update: (id, data) => api.put(`/services/services/${id}/`, data),

    // Delete service (admin only)
    delete: (id) => api.delete(`/services/services/${id}/`),
};

// ============== Pandit Profiles ==============
export const panditAPI = {
    // Get all verified pandits (public listing)
    getAll: (params) => api.get('/services/pandits/', { params }),

    // Get single pandit profile
    getById: (id) => api.get(`/services/pandits/${id}/`),

    // Get current user's pandit profile
    getMe: () => api.get('/services/pandits/me/'),

    // Register as pandit
    register: (data) => api.post('/services/pandits/register/', data),

    // Update pandit profile
    update: (id, data) => api.patch(`/services/pandits/${id}/`, data),

    // Search pandits by pincode and date
    search: (params) => api.get('/services/pandit/search/', { params }),

    // Get pandit dashboard data
    getDashboard: () => api.get('/services/pandit/dashboard/'),

    // Toggle availability (go online/offline)
    setAvailability: (data) => api.post('/services/pandit/availability/', data),

    // Get availability status
    getAvailability: () => api.get('/services/pandit/availability/'),
};

// ============== KYC Documents ==============
export const kycAPI = {
    // Get all documents for current pandit
    getAll: () => api.get('/services/kyc-documents/'),

    // Upload new document
    upload: (formData) => api.post('/services/kyc-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Delete document
    delete: (id) => api.delete(`/services/kyc-documents/${id}/`),
};

// ============== Bookings ==============
export const bookingsAPI = {
    // Get customer's bookings
    getMyBookings: () => api.get('/services/bookings/'),

    // Get pandit's bookings
    getPanditBookings: () => api.get('/services/bookings/', { params: { view_as: 'pandit' } }),

    // Get single booking details
    getById: (id) => api.get(`/services/bookings/${id}/`),

    // Create new booking
    create: (data) => api.post('/services/bookings/', data),

    // Accept booking (pandit)
    accept: (id) => api.post(`/services/bookings/${id}/accept/`),

    // Reject booking (pandit)
    reject: (id, reason) => api.post(`/services/bookings/${id}/reject/`, { reason }),

    // Start travel (pandit)
    startTravel: (id) => api.post(`/services/bookings/${id}/start-travel/`),

    // Verify start OTP (pandit)
    verifyStart: (id, otp) => api.post(`/services/bookings/${id}/verify-start/`, { otp }),

    // Verify complete OTP (pandit)
    verifyComplete: (id, otp) => api.post(`/services/bookings/${id}/verify-complete/`, { otp }),

    // Cancel booking
    cancel: (id, reason) => api.post(`/services/bookings/${id}/cancel/`, { reason }),
};

// ============== Reviews ==============
export const reviewsAPI = {
    // Create review for completed booking
    create: (data) => api.post('/services/reviews/', data),
};

// ============== WebSocket Helpers ==============
export const createTrackingSocket = (bookingId, onMessage) => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_URL || window.location.host;
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/tracking/${bookingId}/`);

    ws.onopen = () => {
        console.log('Tracking WebSocket connected');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('Tracking WebSocket disconnected');
    };

    return ws;
};

export const sendLocationUpdate = (ws, latitude, longitude) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'location_update',
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        }));
    }
};

export default {
    services: servicesAPI,
    pandit: panditAPI,
    kyc: kycAPI,
    bookings: bookingsAPI,
    reviews: reviewsAPI,
    createTrackingSocket,
    sendLocationUpdate,
};
