import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// List of public endpoints that don't need authentication
const PUBLIC_ENDPOINTS = [
    '/homepage/',
    '/products/',
    '/products/categories/',
    '/products/search/',
    '/products/featured/',
    '/auth/token/refresh/',
];

// Check if URL is a public endpoint
const isPublicEndpoint = (url) => {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Critical: Send cookies with requests
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    timeout: 15000, // 15 second timeout for Railway cold starts
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Bearer token (for Google Auth and regular JWT Flow)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        // Only attach token if it exists AND this is not a public endpoint
        // This prevents 401s on public endpoints due to expired tokens
        if (token && !isPublicEndpoint(config.url)) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for 401 (Refresh Token)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh for public endpoints - they shouldn't need auth
        if (isPublicEndpoint(originalRequest?.url)) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh token (Backend reads httpOnly refresh cookie)
                // Use dj-rest-auth refresh endpoint which reads cookies
                await axios.post(`${API_URL}/auth/token/refresh/`, {}, { withCredentials: true });
                // If successful, retry original request
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Session expired:', refreshError);
                // Clear expired tokens from localStorage to prevent further 401s
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // Session expired / No Refresh Token
                // We do NOT redirect globally, because guests might trigger 401s on protected endpoints
                // components should handle the error or ProtectedRoute should handle access.
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
