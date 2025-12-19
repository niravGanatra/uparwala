import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Critical: Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for 401 (Refresh Token)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh token (Backend reads httpOnly refresh cookie)
                await axios.post(`${API_URL}/users/token/refresh/`, {}, { withCredentials: true });
                // If successful, retry original request
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Session expired:', refreshError);
                // Auth Context will handle redirect if needed, or we explicitly redirect
                // But usually we just let the error propagate so AuthContext sees it.
                // However, for safety in SPA:
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
