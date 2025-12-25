import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
        if (token) {
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
                // Auth Context will handle redirect if needed, or we explicitly redirect
                // But usually we just let the error propagate so AuthContext sees it.
                // However, for safety in SPA:
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
