import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";
import CollapseHeader from "../../core/common/collapse-header/collapse-header";
import { 
  getPerformanceSettings, 
  updatePerformanceSettings, 
  getEmployeePerformance,
  getPerformancePreview,
  calculatePerformanceLevel,
  getPerformanceLevelColor,
  type PerformanceSettings,
  type KPISettings,
  type EmployeePerformance,
  type PerformancePreview
} from "../../core/services/performanceSettingsService";
import { useUser } from '../../core/context/UserContext';
import Swal from 'sweetalert2';

// KPI Settings Card Component
const KPISettingsCard: React.FC<{
  title: string;
  icon: string;
  settings: KPISettings;
  onSettingsChange: (field: keyof KPISettings, value: number) => void;
  examples?: Array<{ value: number; level: string }>;
}> = ({ title, icon, settings, onSettingsChange, examples }) => {
  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex align-items-center">
          <span className="avatar rounded-circle bg-primary me-3">
            <i className={`ti ${icon} fs-16`} />
          </span>
          <h5 className="mb-0">{title} KPI Settings</h5>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Threshold Inputs */}
          <div className="col-12">
            <label className="form-label fw-medium">Performance Thresholds</label>
            <div className="row g-2">
              <div className="col-4">
                <label className="form-label small text-muted">Low</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={settings.low}
                  onChange={(e) => onSettingsChange("low", Number(e.target.value))}
                  min="0"
                  placeholder="Low"
                />
              </div>
              <div className="col-4">
                <label className="form-label small text-muted">Average</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={settings.average}
                  onChange={(e) => onSettingsChange("average", Number(e.target.value))}
                  min="0"
                  placeholder="Average"
                />
              </div>
              <div className="col-4">
                <label className="form-label small text-muted">High</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={settings.high}
                  onChange={(e) => onSettingsChange("high", Number(e.target.value))}
                  min="0"
                  placeholder="High"
                />
              </div>
            </div>
          </div>

          {/* Performance Level Display */}
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
              <div>
                <label className="form-label fw-medium mb-1">Performance Levels</label>
                <div className="d-flex gap-2">
                  <span className="badge badge-danger">Below {settings.low} = Low</span>
                  <span className="badge badge-warning">{settings.low}-{settings.average-1} = Average</span>
                  <span className="badge badge-success">{settings.high}+ = High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Examples Preview */}
          {examples && examples.length > 0 && (
            <div className="col-12">
              <label className="form-label fw-medium">Examples</label>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Value</th>
                      <th>Performance Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examples.map((example, index) => (
                      <tr key={index}>
                        <td>{example.value}</td>
                        <td>
                          <span className={`badge badge-${getPerformanceLevelColor(example.level)}`}>
                            {example.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Employee Performance Table Component
const EmployeePerformanceTable: React.FC<{
  employees: EmployeePerformance[];
  loading: boolean;
}> = ({ employees, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading employee performance data...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="ti ti-users-off fs-1 text-muted mb-3"></i>
        <p className="text-muted">No employee performance data available.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Designation</th>
            <th>Submissions</th>
            <th>Interviews</th>
            <th>Job Offers</th>
            <th>Overall Performance</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employeeId}>
              <td>
                <div>
                  <h6 className="fw-medium mb-0">{employee.employeeName}</h6>
                  <small className="text-muted">{employee.employeeEmail}</small>
                </div>
              </td>
              <td>
                <span className="badge badge-light">{employee.employeeDesignation}</span>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">{employee.performance.submissions.count}</span>
                  <span className={`badge badge-${getPerformanceLevelColor(employee.performance.submissions.level)}`}>
                    {employee.performance.submissions.level}
                  </span>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">{employee.performance.interviews.count}</span>
                  <span className={`badge badge-${getPerformanceLevelColor(employee.performance.interviews.level)}`}>
                    {employee.performance.interviews.level}
                  </span>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">{employee.performance.jobOffers.count}</span>
                  <span className={`badge badge-${getPerformanceLevelColor(employee.performance.jobOffers.level)}`}>
                    {employee.performance.jobOffers.level}
                  </span>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    <div className="fw-bold">{employee.performance.overall.score}%</div>
                    <div className="progress" style={{ height: '4px', width: '60px' }}>
                      <div 
                        className={`progress-bar bg-${getPerformanceLevelColor(employee.performance.overall.level)}`}
                        style={{ width: `${employee.performance.overall.score}%` }}
                      />
                    </div>
                  </div>
                  <span className={`badge badge-${getPerformanceLevelColor(employee.performance.overall.level)}`}>
                    {employee.performance.overall.level}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PerformanceIndicator = () => {
    const routes = all_routes;
  const { user } = useUser();

  // State for performance settings
  const [settings, setSettings] = useState<PerformanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<PerformancePreview | null>(null);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
    fetchPreview();
    fetchEmployeePerformance();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getPerformanceSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load performance settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const data = await getPerformancePreview();
      setPreview(data);
    } catch (error) {
      console.error('Error fetching preview:', error);
    }
  };

  const fetchEmployeePerformance = async () => {
    try {
      setEmployeeLoading(true);
      const data = await getEmployeePerformance();
      setEmployeePerformance(data.employeePerformance);
    } catch (error) {
      console.error('Error fetching employee performance:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleSettingsChange = (kpiType: 'submissions' | 'interviews' | 'jobOffers', field: keyof KPISettings, value: number) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [kpiType]: {
          ...prev[kpiType],
          [field]: value
        }
      };
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      
      await updatePerformanceSettings({
        submissions: settings.submissions,
        interviews: settings.interviews,
        jobOffers: settings.jobOffers,
        performanceLevels: settings.performanceLevels,
        description: settings.description
      });

      setSuccess('Performance settings saved successfully!');
      
      // Refresh preview and employee performance data
      await Promise.all([
        fetchPreview(),
        fetchEmployeePerformance()
      ]);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved!',
        text: 'Performance settings have been updated successfully.',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings');
      
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to save performance settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    const result = await Swal.fire({
      title: 'Reset to Defaults?',
      text: 'This will reset all KPI thresholds to their default values. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reset!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setSaving(true);
        await updatePerformanceSettings({
          submissions: { low: 10, average: 20, high: 30 },
          interviews: { low: 5, average: 10, high: 15 },
          jobOffers: { low: 2, average: 5, high: 8 }
        });
        
        await fetchSettings();
        await fetchPreview();
        await fetchEmployeePerformance();
        
        Swal.fire({
          icon: 'success',
          title: 'Reset Complete!',
          text: 'Performance settings have been reset to default values.',
        });
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: error.message || 'Failed to reset settings.',
        });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading performance settings...</p>
          </div>
            </div>
          </div>
    );
  }

  if (!settings) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <i className="ti ti-alert-circle fs-1 text-danger mb-3"></i>
            <h4 className="text-danger">Error Loading Settings</h4>
            <p className="text-muted">Failed to load performance settings. Please try again.</p>
            <button className="btn btn-primary" onClick={fetchSettings}>
              Retry
            </button>
            </div>
          </div>
          </div>
    );
  }

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Performance Indicator Settings</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Performance</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Performance Indicator Settings
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}

          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="ti ti-check-circle me-2"></i>
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="ti ti-alert-circle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {/* Settings Description */}
          <div className="row mb-4">
            <div className="col-12">
          <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h4 className="mb-2">KPI Performance Thresholds</h4>
                      <p className="text-muted mb-0">
                        Configure performance thresholds for Submissions, Interviews, and Job Offers. 
                        These settings will be used to automatically calculate employee performance levels 
                        based on their actual recruitment activities.
                      </p>
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleResetToDefaults}
                          disabled={saving}
                        >
                          <i className="ti ti-refresh me-1"></i>
                          Reset to Defaults
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSaveSettings}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-device-floppy me-1"></i>
                              Save Settings
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>

          {/* KPI Settings Cards */}
          <div className="row mb-4">
            <div className="col-lg-4 col-md-6 mb-4">
              <KPISettingsCard
                title="Submissions"
                icon="ti-file-text"
                settings={settings.submissions}
                onSettingsChange={(field, value) => handleSettingsChange('submissions', field, value)}
                examples={preview?.examples.submissions}
              />
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <KPISettingsCard
                title="Interviews"
                icon="ti-calendar-event"
                settings={settings.interviews}
                onSettingsChange={(field, value) => handleSettingsChange('interviews', field, value)}
                examples={preview?.examples.interviews}
              />
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <KPISettingsCard
                title="Job Offers"
                icon="ti-briefcase"
                settings={settings.jobOffers}
                onSettingsChange={(field, value) => handleSettingsChange('jobOffers', field, value)}
                examples={preview?.examples.jobOffers}
              />
            </div>
          </div>

          {/* Employee Performance Table */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">Employee Performance Overview</h5>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchEmployeePerformance}
                    disabled={employeeLoading}
                  >
                    {employeeLoading ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    ) : (
                      <i className="ti ti-refresh me-1"></i>
                    )}
                    Refresh
                  </button>
                </div>
                <div className="card-body">
                  <EmployeePerformanceTable 
                    employees={employeePerformance}
                    loading={employeeLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014 - 2025 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default PerformanceIndicator;
