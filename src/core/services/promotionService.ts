import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const promotionService = {
    // Get all promotions
    getPromotions: async () => {
        const response = await axios.get(`${BACKEND_URL}/api/promotions`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Get promotion by ID
    getPromotionById: async (id: string) => {
        const response = await axios.get(`${BACKEND_URL}/api/promotions/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Create new promotion
    createPromotion: async (promotionData: any) => {
        const response = await axios.post(`${BACKEND_URL}/api/promotions`, promotionData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Update promotion
    updatePromotion: async (id: string, promotionData: any) => {
        const response = await axios.put(`${BACKEND_URL}/api/promotions/${id}`, promotionData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Delete promotion
    deletePromotion: async (id: string, reason?: string) => {
        const response = await axios.delete(`${BACKEND_URL}/api/promotions/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            data: { reason }
        });
        return response.data;
    },

    // Upload promotion letter
    uploadPromotionLetter: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('promotionLetter', file);

        const response = await axios.post(`${BACKEND_URL}/api/promotions/${id}/upload-letter`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Download promotion letter
    downloadPromotionLetter: async (id: string) => {
        const response = await axios.get(`${BACKEND_URL}/api/promotions/${id}/download-letter`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob'
        });
        return response.data;
    }
};

export default promotionService;
