import api from './api';

const promotionsService = {
    // Validate coupon code
    validateCoupon: async (code, cartTotal) => {
        const response = await api.post('/promotions/validate-coupon/', {
            code: code,
            cart_total: cartTotal
        });
        return response.data;
    },

    // Get available coupons for user
    getMyCoupons: async () => {
        const response = await api.get('/promotions/my-coupons/');
        return response.data;
    },

    // Get all coupons (admin)
    getAllCoupons: async () => {
        const response = await api.get('/promotions/coupons/');
        return response.data;
    }
};

export default promotionsService;
