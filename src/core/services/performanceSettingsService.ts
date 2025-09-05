import { backend_url } from '../../environment';

// Types for performance settings
export interface KPISettings {
  low: number;
  average: number;
  high: number;
}

export interface PerformanceLevels {
  low: string;
  average: string;
  high: string;
}

export interface PerformanceSettings {
  _id: string;
  submissions: KPISettings;
  interviews: KPISettings;
  jobOffers: KPISettings;
  performanceLevels: PerformanceLevels;
  isActive: boolean;
  description: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeDesignation: string;
  totalCandidates: number;
  submissions: number;
  interviews: number;
  jobOffers: number;
  performance: {
    submissions: {
      count: number;
      level: string;
      thresholds: KPISettings;
    };
    interviews: {
      count: number;
      level: string;
      thresholds: KPISettings;
    };
    jobOffers: {
      count: number;
      level: string;
      thresholds: KPISettings;
    };
    overall: {
      score: number;
      level: string;
    };
  };
}

export interface PerformancePreview {
  settings: PerformanceSettings;
  examples: {
    submissions: Array<{ value: number; level: string }>;
    interviews: Array<{ value: number; level: string }>;
    jobOffers: Array<{ value: number; level: string }>;
  };
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface EmployeePerformanceResponse {
  settings: PerformanceSettings;
  employeePerformance: EmployeePerformance[];
}

// Get performance settings
export const getPerformanceSettings = async (): Promise<PerformanceSettings> => {
  try {
    const response = await fetch(`${backend_url}/api/performance-settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PerformanceSettings> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch performance settings');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching performance settings:', error);
    throw error;
  }
};

// Update performance settings
export const updatePerformanceSettings = async (
  settings: Partial<{
    submissions: Partial<KPISettings>;
    interviews: Partial<KPISettings>;
    jobOffers: Partial<KPISettings>;
    performanceLevels: Partial<PerformanceLevels>;
    description: string;
  }>
): Promise<PerformanceSettings> => {
  try {
    const response = await fetch(`${backend_url}/api/performance-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PerformanceSettings> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update performance settings');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating performance settings:', error);
    throw error;
  }
};

// Get employee performance data
export const getEmployeePerformance = async (
  employeeId?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<EmployeePerformanceResponse> => {
  try {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await fetch(`${backend_url}/api/performance-settings/employee-performance?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<EmployeePerformanceResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch employee performance');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching employee performance:', error);
    throw error;
  }
};

// Get performance preview with examples
export const getPerformancePreview = async (): Promise<PerformancePreview> => {
  try {
    const response = await fetch(`${backend_url}/api/performance-settings/preview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<PerformancePreview> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch performance preview');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching performance preview:', error);
    throw error;
  }
};

// Utility function to calculate performance level
export const calculatePerformanceLevel = (
  value: number,
  thresholds: KPISettings,
  performanceLevels: PerformanceLevels
): string => {
  if (value < thresholds.low) {
    return performanceLevels.low;
  } else if (value >= thresholds.low && value < thresholds.average) {
    return performanceLevels.average;
  } else if (value >= thresholds.high) {
    return performanceLevels.high;
  } else {
    return performanceLevels.average; // Between average and high
  }
};

// Utility function to get performance level color
export const getPerformanceLevelColor = (level: string): string => {
  if (level.includes('High') || level.includes('Excellent')) {
    return 'success';
  } else if (level.includes('Average') || level.includes('Good')) {
    return 'info';
  } else if (level.includes('Low') || level.includes('Below')) {
    return 'danger';
  } else {
    return 'secondary';
  }
};

export default {
  getPerformanceSettings,
  updatePerformanceSettings,
  getEmployeePerformance,
  getPerformancePreview,
  calculatePerformanceLevel,
  getPerformanceLevelColor
};
