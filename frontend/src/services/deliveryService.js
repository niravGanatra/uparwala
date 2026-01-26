import api from './api';

export const deliveryService = {
    /**
     * Check estimated delivery date for a product to a specific pincode
     * @param {string} pincode - Destination pincode
     * @param {number|string} productId - Product ID
     * @returns {Promise<{estimated_date: string, days: number}>}
     */
    checkEstimate: async (pincode, productId) => {
        try {
            const response = await api.get(`/delhivery/check/`, {
                params: {
                    pincode,
                    product_id: productId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Delivery estimate check failed:', error);
            throw error;
        }
    }
};

export default deliveryService;
