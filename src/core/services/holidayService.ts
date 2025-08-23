import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Holiday {
  _id?: string;
  name: string;
  date: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface HolidayResponse {
  success: boolean;
  data: Holiday[];
}

export interface SingleHolidayResponse {
  success: boolean;
  data: Holiday;
  message?: string;
}

export const getHolidays = async (): Promise<HolidayResponse> => {
  const response = await api.get('/holidays');
  return response.data;
};

export const getHolidayById = async (id: string): Promise<SingleHolidayResponse> => {
  const response = await api.get(`/holidays/${id}`);
  return response.data;
};

export const createHoliday = async (holiday: Omit<Holiday, '_id'>): Promise<SingleHolidayResponse> => {
  const response = await api.post('/holidays', holiday);
  return response.data;
};

export const updateHoliday = async (id: string, holiday: Partial<Holiday>): Promise<SingleHolidayResponse> => {
  const response = await api.put(`/holidays/${id}`, holiday);
  return response.data;
};

export const deleteHoliday = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/holidays/${id}`);
  return response.data;
};

export default {
  getHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};
