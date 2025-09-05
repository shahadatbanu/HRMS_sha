import axios from 'axios';

const API_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000') + '/api/designations';

export const getDesignations = async () => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  // Backend returns { success: boolean, data: Designation[] }
  // Fallback to res.data if shape differs
  return (res.data && Array.isArray(res.data.data)) ? res.data.data : res.data;
};

export default {
  getDesignations,
};
