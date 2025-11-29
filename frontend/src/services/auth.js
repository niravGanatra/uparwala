import api from './api';

export const login = async (username, password) => {
    const response = await api.post('/users/login/', { username, password });
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/users/register/', userData);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/users/me/');
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};
