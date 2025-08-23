import axios from 'axios';

// Use environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AttendanceRecord {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    designation?: string;
    profileImage?: string;
  };
  date: string;
  checkIn: {
    time: string;
    location: string;
    locationName?: string;
    geolocation?: {
      latitude: number;
      longitude: number;
    };
  };
  checkOut?: {
    time: string;
    location: string;
    locationName?: string;
    geolocation?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  breaks: Array<{
    startTime: string;
    endTime?: string;
    duration?: number;
  }>;
  totalBreakTime: number;
  lateMinutes: number;
  overtimeMinutes: number;
  productionHours: number;
  totalWorkingHours: number;
  notes: string;
  isActive: boolean;
  formattedDate: string;
  formattedCheckIn: string;
  formattedCheckOut: string;
  formattedBreakTime: string;
  formattedLateTime: string;
  formattedOvertime: string;
  formattedProductionHours: string;
}

export interface AttendanceStatistics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
  averageProductionHours: number;
}

export interface AttendanceFilters {
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

export interface SingleAttendanceResponse {
  success: boolean;
  data: AttendanceRecord;
  message?: string;
}

export interface StatisticsResponse {
  success: boolean;
  data: AttendanceStatistics;
}

// Get all attendance records with filters
export const getAttendanceRecords = async (filters: AttendanceFilters = {}): Promise<AttendanceResponse> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/attendance?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

// Get attendance records for a specific employee
export const getEmployeeAttendance = async (
  employeeId: string,
  filters: { startDate?: string; endDate?: string; status?: string } = {}
): Promise<AttendanceResponse> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/attendance/employee/${employeeId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    throw error;
  }
};

// Get today's attendance for an employee
export const getTodayAttendance = async (employeeId: string): Promise<SingleAttendanceResponse> => {
  try {
    const response = await api.get(`/attendance/employee/${employeeId}/today`);
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    throw error;
  }
};

// Check-in
export const checkIn = async (employeeId: string, location: string = '', locationName: string = '', geolocation?: { latitude: number; longitude: number } | null): Promise<SingleAttendanceResponse> => {
  try {
    const response = await api.post('/attendance/checkin', {
      employeeId,
      location,
      locationName,
      geolocation
    });
    return response.data;
  } catch (error) {
    console.error('Error during check-in:', error);
    throw error;
  }
};

// Check-out
export const checkOut = async (employeeId: string, location: string = '', locationName: string = '', geolocation?: { latitude: number; longitude: number } | null): Promise<SingleAttendanceResponse> => {
  try {
    const response = await api.post('/attendance/checkout', {
      employeeId,
      location,
      locationName,
      geolocation
    });
    return response.data;
  } catch (error) {
    console.error('Error during check-out:', error);
    throw error;
  }
};

// Start break
export const startBreak = async (employeeId: string): Promise<SingleAttendanceResponse> => {
  try {
    const response = await api.post('/attendance/break/start', {
      employeeId
    });
    return response.data;
  } catch (error) {
    console.error('Error starting break:', error);
    throw error;
  }
};

// End break
export const endBreak = async (employeeId: string): Promise<SingleAttendanceResponse> => {
  try {
    const response = await api.post('/attendance/break/end', {
      employeeId
    });
    return response.data;
  } catch (error) {
    console.error('Error ending break:', error);
    throw error;
  }
};

// Get attendance statistics
export const getAttendanceStatistics = async (
  employeeId: string,
  period: 'week' | 'month' | 'year' = 'month',
  startDate?: Date,
  endDate?: Date
): Promise<StatisticsResponse> => {
  try {
    let url = `/attendance/statistics/${employeeId}?period=${period}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate.toISOString().slice(0, 10)}&endDate=${endDate.toISOString().slice(0, 10)}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    throw error;
  }
};

// Update attendance record (admin only)
export const updateAttendanceRecord = async (
  attendanceId: string,
  updateData: Partial<AttendanceRecord>
): Promise<SingleAttendanceResponse> => {
  try {
    const response = await api.put(`/attendance/${attendanceId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }
};

// Delete attendance record (admin only)
export const deleteAttendanceRecord = async (attendanceId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    throw error;
  }
};

// Reset today's attendance (for testing purposes - admin only)
export const resetAttendance = async (employeeId: string): Promise<{ success: boolean; message: string; deletedCount: number }> => {
  try {
    const response = await api.delete(`/attendance/reset/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error resetting attendance:', error);
    throw error;
  }
};

// Helper function to format attendance data for table display
export const formatAttendanceForTable = (attendance: AttendanceRecord) => {
  return {
    _id: attendance._id,
    Employee: attendance.employeeId ? `${attendance.employeeId.firstName} ${attendance.employeeId.lastName}` : '',
    Image: attendance.employeeId && attendance.employeeId.profileImage ? attendance.employeeId.profileImage : '',
    Role: attendance.employeeId && attendance.employeeId.designation ? attendance.employeeId.designation : '',
    Date: attendance.formattedDate,
    CheckIn: attendance.formattedCheckIn,
    Location: attendance.checkIn?.locationName || attendance.checkIn?.location || '-',
    geolocation: attendance.checkIn?.geolocation || null,
    Status: attendance.status,
    CheckOut: attendance.formattedCheckOut || '-',
    Break: attendance.formattedBreakTime,
    Late: attendance.formattedLateTime,
    Overtime: attendance.formattedOvertime,
    ProductionHours: attendance.formattedProductionHours,
    Production: 1, // This seems to be a static value in the original data
  };
};

export default {
  getAttendanceRecords,
  getEmployeeAttendance,
  getTodayAttendance,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getAttendanceStatistics,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  resetAttendance,
  formatAttendanceForTable,
}; 