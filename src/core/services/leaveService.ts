import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/leaves`,
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

export interface LeaveRecord {
  _id: string;
  employeeId: any;
  leaveType: string;
  from: string;
  to: string;
  noOfDays: number;
  status: string;
  reason?: string;
  approvedBy?: any;
  approvedAt?: string;
  cancelledAt?: string;
  cancelledBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveResponse {
  success: boolean;
  data: LeaveRecord[];
}

export interface SingleLeaveResponse {
  success: boolean;
  data: LeaveRecord;
  message?: string;
}

export interface LeaveBalanceResponse {
  success: boolean;
  data: Record<string, number>;
}

export const getEmployeeLeaves = async (employeeId: string): Promise<LeaveResponse> => {
  const res = await api.get(`/employee/${employeeId}`);
  return res.data;
};

export const getLeaveBalances = async (employeeId: string): Promise<LeaveBalanceResponse> => {
  const res = await api.get(`/balance/${employeeId}`);
  return res.data;
};

export const addLeaveRequest = async (leaveData: Partial<LeaveRecord>): Promise<SingleLeaveResponse> => {
  const res = await api.post(`/`, leaveData);
  return res.data;
};

export const updateLeaveRequest = async (leaveId: string, updateData: Partial<LeaveRecord>): Promise<SingleLeaveResponse> => {
  const res = await api.put(`/${leaveId}`, updateData);
  return res.data;
};

export const deleteLeaveRequest = async (leaveId: string): Promise<SingleLeaveResponse> => {
  const res = await api.delete(`/${leaveId}`);
  return res.data;
};

export const getAllLeaveRequests = async (params: any = {}): Promise<LeaveResponse & { pagination: any }> => {
  const res = await api.get(`/`, { params });
  return res.data;
};

export default {
  getEmployeeLeaves,
  getLeaveBalances,
  addLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  getAllLeaveRequests,
};
