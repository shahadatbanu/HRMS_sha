import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { 
  getCandidateActivityThresholdSettings, 
  updateCandidateActivityThresholdSettings, 
  getCandidateActivityPreview,
  calculateActivityLevel,
  getActivityLevelColor,
  type CandidateActivityThresholdSettings,
  type ActivityThresholds,
  type LevelLabels,
  type LevelColors,
  type CandidateActivityPreview
} from "../../../core/services/candidateActivityThresholdService";
import { useUser } from '../../../core/context/UserContext';
import Swal from 'sweetalert2';

// Activity Threshold Settings Card Component
const ActivityThresholdCard: React.FC<{
  title: string;
  icon: string;
  settings: ActivityThresholds;
  onSettingsChange: (field: keyof ActivityThresholds, value: number) => void;
  examples?: Array<{ value: number; level: string }>;
}> = ({ title, icon, settings, onSettingsChange, examples }) => {
  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex align-items-center">
          <span className="avatar rounded-circle bg-primary me-3">
            <i className={`ti ${icon} fs-16`} />
          </span>
          <h5 className="mb-0">{title} Threshold Settings</h5>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {/* Threshold Inputs */}
          <div className="col-12">
            <label className="form-label fw-medium">Activity Score Thresholds</label>
            <div className="row g-2">
              <div className="col-3">
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
              <div className="col-3">
                <label className="form-label small text-muted">Moderate</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={settings.moderate}
                  onChange={(e) => onSettingsChange("moderate", Number(e.target.value))}
                  min="0"
                  placeholder="Moderate"
                />
              </div>
              <div className="col-3">
                <label className="form-label small text-muted">Active</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={settings.active}
                  onChange={(e) => onSettingsChange("active", Number(e.target.value))}
                  min="0"
                  placeholder="Active"
                />
              </div>
              <div className="col-3">
                <label className="form-label small text-muted">Super Active</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={settings.superActive}
                  onChange={(e) => onSettingsChange("superActive", Number(e.target.value))}
                  min="0"
                  placeholder="Super Active"
                />
              </div>
            </div>
          </div>

          {/* Examples */}
          {examples && examples.length > 0 && (
            <div className="col-12">
              <label className="form-label fw-medium">Examples</label>
              <div className="row g-2">
                {examples.map((example, index) => (
                  <div key={index} className="col-6">
                    <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded">
                      <span className="small text-muted">Score {example.value}</span>
                      <span className={`badge badge-${getActivityLevelColor(example.level)} badge-sm`}>
                        {example.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Level Labels Card Component
const LevelLabelsCard: React.FC<{
  labels: LevelLabels;
  onLabelsChange: (field: keyof LevelLabels, value: string) => void;
}> = ({ labels, onLabelsChange }) => {
  return (
    <div className="card h-100">
      <div className="card-header">
        <div className="d-flex align-items-center">
          <span className="avatar rounded-circle bg-info me-3">
            <i className="ti ti-tag fs-16" />
          </span>
          <h5 className="mb-0">Activity Level Labels</h5>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {Object.entries(labels).map(([key, value]) => (
            <div key={key} className="col-6">
              <label className="form-label small text-muted">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={value}
                onChange={(e) => onLabelsChange(key as keyof LevelLabels, e.target.value)}
                placeholder={`${key} level`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Preview Card Component
const PreviewCard: React.FC<{
  preview: CandidateActivityPreview | null;
  loading: boolean;
}> = ({ preview, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="ti ti-eye-off fs-1 text-muted mb-3"></i>
          <p className="text-muted">No preview data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex align-items-center">
          <span className="avatar rounded-circle bg-success me-3">
            <i className="ti ti-eye fs-16" />
          </span>
          <h5 className="mb-0">Activity Level Preview</h5>
        </div>
      </div>
      <div className="card-body">
        {/* Level Distribution */}
        <div className="row mb-4">
          <div className="col-12">
            <h6 className="mb-3">Current Distribution</h6>
            <div className="row g-2">
              {Object.entries(preview.levelDistribution).map(([level, count]) => (
                <div key={level} className="col-6 col-md-4">
                  <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded">
                    <span className="small text-muted">
                      {level.charAt(0).toUpperCase() + level.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className={`badge badge-${getActivityLevelColor(level)} badge-sm`}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Candidates */}
        <div className="row">
          <div className="col-12">
            <h6 className="mb-3">Sample Candidates</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Activity Score</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.candidates.slice(0, 10).map((candidate, index) => (
                    <tr key={candidate._id || index}>
                      <td>{candidate.firstName} {candidate.lastName}</td>
                      <td>{candidate.activityScore}</td>
                      <td>
                        <span className={`badge badge-${candidate.activityLevel.color} badge-sm`}>
                          {candidate.activityLevel.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateActivityThreshold = () => {
  const { user, isLoading } = useUser();
  const routes = all_routes;
  
  const [settings, setSettings] = useState<CandidateActivityThresholdSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<CandidateActivityPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Check if user is admin or HR
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'admin' && user.role !== 'hr') {
        window.location.href = routes.adminDashboard;
        return;
      }
    }
  }, [user, isLoading, routes.adminDashboard]);

  // Load settings on component mount
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'hr')) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getCandidateActivityThresholdSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load candidate activity threshold settings',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    try {
      setPreviewLoading(true);
      const data = await getCandidateActivityPreview();
      setPreview(data);
    } catch (error) {
      console.error('Error loading preview:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load preview data',
        icon: 'error'
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleThresholdChange = (field: keyof ActivityThresholds, value: number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      thresholds: {
        ...settings.thresholds,
        [field]: value
      }
    });
  };

  const handleLabelsChange = (field: keyof LevelLabels, value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      levelLabels: {
        ...settings.levelLabels,
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateCandidateActivityThresholdSettings(settings);
      
      Swal.fire({
        title: 'Success',
        text: 'Candidate activity threshold settings updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Reload preview after saving
      loadPreview();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update settings',
        icon: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!settings) return;
    
    Swal.fire({
      title: 'Reset Settings',
      text: 'Are you sure you want to reset to default values?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        loadSettings();
      }
    });
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if user is not admin or HR
  if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <i className="ti ti-shield-x text-danger" style={{ fontSize: '4rem' }} />
            <h4 className="text-danger mt-3">Access Denied</h4>
            <p className="text-muted">You don't have permission to access this page.</p>
            <Link to={routes.adminDashboard} className="btn btn-primary">
              <i className="ti ti-arrow-left me-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading settings...</p>
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
            <i className="ti ti-settings-off text-muted" style={{ fontSize: '4rem' }} />
            <h4 className="text-muted mt-3">Settings Not Found</h4>
            <p className="text-muted">Unable to load candidate activity threshold settings.</p>
            <button onClick={loadSettings} className="btn btn-primary">
              <i className="ti ti-refresh me-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Candidate Activity Threshold Settings</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>
                    <i className="ti ti-smart-home" />
                  </Link>
                </li>
                <li className="breadcrumb-item">Recruitment</li>
                <li className="breadcrumb-item">Candidates</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Activity Threshold Settings
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="me-2 mb-2">
              <button
                onClick={loadPreview}
                className="btn btn-outline-info d-flex align-items-center"
                disabled={previewLoading}
              >
                <i className={`ti ti-eye me-2 ${previewLoading ? 'spinning' : ''}`} />
                Preview
              </button>
            </div>
            <div className="me-2 mb-2">
              <button
                onClick={handleReset}
                className="btn btn-outline-warning d-flex align-items-center"
                disabled={saving}
              >
                <i className="ti ti-refresh me-2" />
                Reset
              </button>
            </div>
            <div className="mb-2">
              <button
                onClick={handleSave}
                className="btn btn-primary d-flex align-items-center"
                disabled={saving}
              >
                <i className={`ti ti-device-floppy me-2 ${saving ? 'spinning' : ''}`} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Info: How score is calculated */}
        <div className="alert alert-info d-flex align-items-start mb-4">
          <i className="ti ti-info-circle me-2 mt-1" />
          <div>
            <strong>How the Activity Score is calculated</strong>
            <div className="small text-muted">
              The activity score equals the total number of <b>Submissions</b> + <b>Interviews</b> + <b>Job Offers</b> for a candidate
              within the selected period (weekly, monthly, 3 months, 6 months, or all). The thresholds you set below determine which
              level label (Dead, Low, Moderate, Active, Super Active) is applied to each score.
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <ActivityThresholdCard
              title="Activity Score"
              icon="ti ti-chart-line"
              settings={settings.thresholds}
              onSettingsChange={handleThresholdChange}
              examples={[
                { value: 0, level: settings.levelLabels.dead },
                { value: settings.thresholds.low, level: settings.levelLabels.low },
                { value: settings.thresholds.moderate, level: settings.levelLabels.moderate },
                { value: settings.thresholds.active, level: settings.levelLabels.active },
                { value: settings.thresholds.superActive, level: settings.levelLabels.superActive }
              ]}
            />
          </div>
          <div className="col-lg-4">
            <LevelLabelsCard
              labels={settings.levelLabels}
              onLabelsChange={handleLabelsChange}
            />
          </div>
        </div>

        {/* Preview Card */}
        <div className="row">
          <div className="col-12">
            <PreviewCard preview={preview} loading={previewLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateActivityThreshold;
