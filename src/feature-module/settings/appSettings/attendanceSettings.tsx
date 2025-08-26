import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../../../core/context/UserContext';
import { 
  getAttendanceSettings, 
  updateAttendanceSettings, 
  markAbsences, 
  getAbsenceStats,
  type AttendanceSettings,
  type AbsenceStats,
  type MarkAbsencesResult,
  validateTimeFormat,
  formatTimeForDisplay
} from '../../../core/services/attendanceSettingsService';

const AttendanceSettingsComponent = () => {
  const { user } = useUser();

  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [markingAbsences, setMarkingAbsences] = useState(false);
  const [stats, setStats] = useState<AbsenceStats | null>(null);
  const [markResult, setMarkResult] = useState<MarkAbsencesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    autoAbsenceEnabled: true,
    absenceMarkingTime: '12:00',
    workingHours: {
      startTime: '09:00',
      endTime: '18:00'
    },
    lateThresholdMinutes: 15,
    halfDayThresholdHours: 4,
    description: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);



  // Role-based access control - only admin and hr can access
  if (!user || !['admin', 'hr'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getAttendanceSettings();
      setSettings(data);
      setFormData({
        autoAbsenceEnabled: data.autoAbsenceEnabled,
        absenceMarkingTime: data.absenceMarkingTime,
        workingHours: data.workingHours,
        lateThresholdMinutes: data.lateThresholdMinutes,
        halfDayThresholdHours: data.halfDayThresholdHours,
        description: data.description
      });
    } catch (error) {
      setError('Failed to fetch attendance settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getAbsenceStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof typeof prev];
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    // Validate time formats first
    if (!validateTimeFormat(formData.absenceMarkingTime)) {
      setError('Invalid absence marking time format. Use HH:MM format.');
      return;
    }
    if (!validateTimeFormat(formData.workingHours.startTime)) {
      setError('Invalid start time format. Use HH:MM format.');
      return;
    }
    if (!validateTimeFormat(formData.workingHours.endTime)) {
      setError('Invalid end time format. Use HH:MM format.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedSettings = await updateAttendanceSettings(formData);
      setSettings(updatedSettings);
      setSuccess('Attendance settings updated successfully!');
    } catch (error) {
      setError('Failed to update attendance settings');
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAbsences = async () => {
    try {
      setMarkingAbsences(true);
      setError(null);
      setSuccess(null);

      const result = await markAbsences();
      setMarkResult(result);
      setSuccess(`Absence marking completed! ${result.marked} employees marked as absent.`);
      
      // Refresh stats
      await fetchStats();
    } catch (error) {
      setError('Failed to mark absences');
      console.error('Error marking absences:', error);
    } finally {
      setMarkingAbsences(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Attendance Settings</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                                     <li className="breadcrumb-item">
                     <Link to="/">
                       <i className="ti ti-smart-home" />
                       Dashboard
                     </Link>
                   </li>
                                     <li className="breadcrumb-item active">Attendance Settings</li>
                </ol>
              </nav>
            </div>
          </div>

          

          {/* Alerts */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="ti ti-alert-circle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="ti ti-check-circle me-2"></i>
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
            </div>
          )}

          <div className="row">
            {/* Settings Form */}
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Attendance Configuration</h4>
                  <p className="card-text">Configure automatic absence marking and attendance rules</p>
                </div>
                <div className="card-body">
                  <form>
                    {/* Auto Absence Marking */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Enable Automatic Absence Marking</label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="autoAbsenceEnabled"
                            checked={formData.autoAbsenceEnabled}
                            onChange={(e) => handleInputChange('autoAbsenceEnabled', e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="autoAbsenceEnabled">
                            Automatically mark employees as absent if they haven't checked in by the specified time
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Absence Marking Time */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Absence Marking Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.absenceMarkingTime}
                          onChange={(e) => handleInputChange('absenceMarkingTime', e.target.value)}
                          disabled={!formData.autoAbsenceEnabled}
                        />
                        <small className="form-text text-muted">
                          Employees will be marked as absent if they haven't checked in by this time
                        </small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Current Setting</label>
                        <div className="form-control-plaintext">
                          {formData.autoAbsenceEnabled ? (
                            <span className="text-success">
                              <i className="ti ti-clock me-1"></i>
                              {formatTimeForDisplay(formData.absenceMarkingTime)}
                            </span>
                          ) : (
                            <span className="text-muted">
                              <i className="ti ti-x me-1"></i>
                              Disabled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Working Hours Start</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.workingHours.startTime}
                          onChange={(e) => handleInputChange('workingHours.startTime', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Working Hours End</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.workingHours.endTime}
                          onChange={(e) => handleInputChange('workingHours.endTime', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Thresholds */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Late Threshold (minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.lateThresholdMinutes}
                          onChange={(e) => handleInputChange('lateThresholdMinutes', parseInt(e.target.value))}
                          min="0"
                          max="480"
                        />
                        <small className="form-text text-muted">
                          Minutes after start time to mark as late
                        </small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Half Day Threshold (hours)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.halfDayThresholdHours}
                          onChange={(e) => handleInputChange('halfDayThresholdHours', parseInt(e.target.value))}
                          min="1"
                          max="12"
                        />
                        <small className="form-text text-muted">
                          Minimum hours worked to count as full day
                        </small>
                      </div>
                    </div>

                    

                    {/* Description */}
                    <div className="row mb-3">
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Additional notes about attendance settings..."
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="row">
                      <div className="col-12">
                                                 <button
                           type="button"
                           className="btn btn-primary"
                           onClick={handleSave}
                           disabled={saving}
                         >
                           {saving ? (
                             <>
                               <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                               Saving...
                             </>
                           ) : (
                             <>
                               <i className="ti ti-device-floppy me-2"></i>
                               Save Settings
                             </>
                           )}
                         </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Statistics and Actions */}
            <div className="col-lg-4">
              {/* Manual Absence Marking */}
              <div className="card mb-3">
                <div className="card-header">
                  <h5 className="card-title">Manual Actions</h5>
                </div>
                <div className="card-body">
                  <button
                    type="button"
                    className="btn btn-warning w-100 mb-2"
                    onClick={handleMarkAbsences}
                    disabled={markingAbsences || !formData.autoAbsenceEnabled}
                  >
                    {markingAbsences ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Marking Absences...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-user-x me-2"></i>
                        Mark Absences Now
                      </>
                    )}
                  </button>
                  <small className="text-muted">
                    Manually trigger absence marking for today
                  </small>
                </div>
              </div>

              {/* Today's Statistics */}
              {stats && (
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">Today's Attendance</h5>
                    <small className="text-muted">{stats.date}</small>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-6 mb-3">
                        <div className="bg-success bg-opacity-10 rounded p-2">
                          <h4 className="text-success mb-1">{stats.present}</h4>
                          <small className="text-muted">Present</small>
                        </div>
                      </div>
                      <div className="col-6 mb-3">
                        <div className="bg-danger bg-opacity-10 rounded p-2">
                          <h4 className="text-danger mb-1">{stats.absent}</h4>
                          <small className="text-muted">Absent</small>
                        </div>
                      </div>
                      <div className="col-6 mb-3">
                        <div className="bg-warning bg-opacity-10 rounded p-2">
                          <h4 className="text-warning mb-1">{stats.late}</h4>
                          <small className="text-muted">Late</small>
                        </div>
                      </div>
                      <div className="col-6 mb-3">
                        <div className="bg-info bg-opacity-10 rounded p-2">
                          <h4 className="text-info mb-1">{stats.halfDay}</h4>
                          <small className="text-muted">Half Day</small>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <small className="text-muted">
                        Total Employees: {stats.totalEmployees}
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Marking Result */}
              {markResult && (
                <div className="card mt-3">
                  <div className="card-header">
                    <h6 className="card-title">Last Marking Result</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Marked as Absent:</span>
                      <span className="fw-bold text-danger">{markResult.marked}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Skipped:</span>
                      <span className="fw-bold text-muted">{markResult.skipped}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Total Employees:</span>
                      <span className="fw-bold">{markResult.totalEmployees}</span>
                    </div>
                    {markResult.reason && (
                      <small className="text-muted d-block mt-2">
                        Reason: {markResult.reason}
                      </small>
                    )}
                  </div>
                </div>
              )}
                         </div>
           </div>
         </div>
       </div>

       
     </>
   );
 };

export default AttendanceSettingsComponent;
