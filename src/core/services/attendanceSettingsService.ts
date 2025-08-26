import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface AttendanceSettings {
  _id: string;
  autoAbsenceEnabled: boolean;
  absenceMarkingTime: string; // HH:MM format
  workingHours: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  lateThresholdMinutes: number;
  halfDayThresholdHours: number;
  description: string;
  formattedAbsenceMarkingTime: string; // 12-hour format
  formattedWorkingHours: {
    startTime: string; // 12-hour format
    endTime: string; // 12-hour format
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbsenceStats {
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  notMarked: number;
  date: string;
}

export interface MarkAbsencesResult {
  marked: number;
  skipped: number;
  totalEmployees: number;
  markedTime: string;
  reason?: string;
}

// Get attendance settings
export const getAttendanceSettings = async (): Promise<AttendanceSettings> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/attendance-settings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching attendance settings:', error);
    throw error;
  }
};

// Update attendance settings
export const updateAttendanceSettings = async (settings: Partial<AttendanceSettings>): Promise<AttendanceSettings> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/attendance-settings`, settings, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating attendance settings:', error);
    throw error;
  }
};

// Manually trigger absence marking
export const markAbsences = async (): Promise<MarkAbsencesResult> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/attendance-settings/mark-absences`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error marking absences:', error);
    throw error;
  }
};

// Get absence statistics
export const getAbsenceStats = async (date?: string): Promise<AbsenceStats> => {
  try {
    const token = localStorage.getItem('token');
    const params = date ? { date } : {};
    const response = await axios.get(`${API_BASE_URL}/attendance-settings/absence-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching absence stats:', error);
    throw error;
  }
};

// Utility function to format time for display
export const formatTimeForDisplay = (time: string): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

// Utility function to validate time format
export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Utility function to convert 12-hour format to 24-hour format
export const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Utility function to convert 24-hour format to 12-hour format
export const convertTo12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};
