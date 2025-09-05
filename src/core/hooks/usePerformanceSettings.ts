import { useState, useEffect } from 'react';
import { 
  getPerformanceSettings, 
  getEmployeePerformance,
  calculatePerformanceLevel,
  getPerformanceLevelColor,
  type PerformanceSettings,
  type EmployeePerformance,
  type KPISettings
} from '../services/performanceSettingsService';

export const usePerformanceSettings = () => {
  const [settings, setSettings] = useState<PerformanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPerformanceSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Error fetching performance settings:', err);
      setError(err.message || 'Failed to load performance settings');
    } finally {
      setLoading(false);
    }
  };

  const calculateEmployeePerformance = (employeeData: {
    submissions: number;
    interviews: number;
    jobOffers: number;
  }) => {
    if (!settings) return null;

    const submissionsLevel = calculatePerformanceLevel(
      employeeData.submissions,
      settings.submissions,
      settings.performanceLevels
    );

    const interviewsLevel = calculatePerformanceLevel(
      employeeData.interviews,
      settings.interviews,
      settings.performanceLevels
    );

    const jobOffersLevel = calculatePerformanceLevel(
      employeeData.jobOffers,
      settings.jobOffers,
      settings.performanceLevels
    );

    // Calculate overall performance score
    const getScore = (level: string) => {
      if (level === settings.performanceLevels.high) return 100;
      if (level === settings.performanceLevels.average) return 50;
      return 25; // Low performance
    };

    const overallScore = Math.round(
      (getScore(submissionsLevel) + getScore(interviewsLevel) + getScore(jobOffersLevel)) / 3
    );

    const overallLevel = overallScore >= 75 ? settings.performanceLevels.high : 
                        overallScore >= 50 ? settings.performanceLevels.average : 
                        settings.performanceLevels.low;

    return {
      submissions: {
        count: employeeData.submissions,
        level: submissionsLevel,
        color: getPerformanceLevelColor(submissionsLevel),
        thresholds: settings.submissions
      },
      interviews: {
        count: employeeData.interviews,
        level: interviewsLevel,
        color: getPerformanceLevelColor(interviewsLevel),
        thresholds: settings.interviews
      },
      jobOffers: {
        count: employeeData.jobOffers,
        level: jobOffersLevel,
        color: getPerformanceLevelColor(jobOffersLevel),
        thresholds: settings.jobOffers
      },
      overall: {
        score: overallScore,
        level: overallLevel,
        color: getPerformanceLevelColor(overallLevel)
      }
    };
  };

  const getPerformanceLevelForKPI = (kpiType: 'submissions' | 'interviews' | 'jobOffers', value: number) => {
    if (!settings) return null;

    const level = calculatePerformanceLevel(
      value,
      settings[kpiType],
      settings.performanceLevels
    );

    return {
      level,
      color: getPerformanceLevelColor(level),
      thresholds: settings[kpiType]
    };
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  return {
    settings,
    loading,
    error,
    calculateEmployeePerformance,
    getPerformanceLevelForKPI,
    refreshSettings
  };
};

export default usePerformanceSettings;
