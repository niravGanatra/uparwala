import api from './api';

export const login = async (username, password) => {
    // Detect if input is an email
    const isEmail = username.includes('@');

    // Construct payload based on input type to avoid validation errors
    const payload = {
        password,
        ...(isEmail ? { email: username } : { username: username })
    };

    // dj-rest-auth login endpoint
    const response = await api.post('/auth/login/', payload);
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/users/register/', userData);
    return response.data;
};

export const getCurrentUser = async () => {
    // Relies on HttpOnly cookie
    const response = await api.get('/users/me/');
    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/auth/logout/');
    } catch (e) {
        console.error('Logout failed:', e);
    }
    // No local storage to clear
};
