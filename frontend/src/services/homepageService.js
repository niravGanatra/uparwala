import api from './api';

const homepageService = {
    // Get all homepage data in one request
    getHomepageData: async () => {
        const response = await api.get('/homepage/');
        return response.data;
    },

    // Individual endpoints (if needed)
    getHeroBanners: async () => {
        const response = await api.get('/homepage/banners/');
        return response.data;
    },

    getPromotionalBanners: async () => {
        const response = await api.get('/homepage/promotions/');
        return response.data;
    },

    getFeaturedCategories: async () => {
        const response = await api.get('/homepage/categories/');
        return response.data;
    },

    getDeals: async () => {
        const response = await api.get('/homepage/deals/');
        return response.data;
    },

    getHostingEssentials: async () => {
        const response = await api.get('/homepage/hosting/');
        return response.data;
    },

    getPremiumSections: async () => {
        const response = await api.get('/homepage/premium/');
        return response.data;
    },

    getCategoryPromotions: async () => {
        const response = await api.get('/homepage/category-promotions/');
        return response.data;
    },
};

export default homepageService;
