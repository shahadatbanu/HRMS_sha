import axios from 'axios';

const API_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000') + '/api/designations';

export const getDesignations = async () => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    // Backend returns { success: boolean, data: Designation[] }
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    // Fallback for different response structure
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error fetching designations:', error);
    return [];
  }
};

export default {
  getDesignations,
};
