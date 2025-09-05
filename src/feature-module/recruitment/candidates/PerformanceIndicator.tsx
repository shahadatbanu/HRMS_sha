import React from 'react';
import usePerformanceSettings from '../../../core/hooks/usePerformanceSettings';

interface PerformanceIndicatorProps {
  employeeData: {
    submissions: number;
    interviews: number;
    jobOffers: number;
  };
  showDetails?: boolean;
  compact?: boolean;
}

const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  employeeData,
  showDetails = false,
  compact = false
}) => {
  const { calculateEmployeePerformance, loading } = usePerformanceSettings();

  if (loading) {
    return (
      <div className="text-center py-2">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const performance = calculateEmployeePerformance(employeeData);

  if (!performance) {
    return (
      <div className="text-muted small">
        <i className="ti ti-alert-circle me-1"></i>
        Performance data unavailable
      </div>
    );
  }

  if (compact) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="d-flex align-items-center">
          <div className="me-2">
            <div className="fw-bold small">{performance.overall.score}%</div>
            <div className="progress" style={{ height: '3px', width: '40px' }}>
              <div 
                className={`progress-bar bg-${performance.overall.color}`}
                style={{ width: `${performance.overall.score}%` }}
              />
            </div>
          </div>
          <span className={`badge badge-${performance.overall.color} badge-xs`}>
            {performance.overall.level}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-indicator">
      {/* Overall Performance */}
      <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
        <div>
          <h6 className="mb-1">Overall Performance</h6>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <div className="fs-24 fw-bold text-primary">{performance.overall.score}%</div>
              <div className="text-muted small">Overall Score</div>
            </div>
            <span className={`badge badge-${performance.overall.color}`}>
              {performance.overall.level}
            </span>
          </div>
        </div>
        <div className="position-relative">
          <svg width="60" height="60" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e9ecef"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={performance.overall.color === 'success' ? '#28a745' : 
                     performance.overall.color === 'info' ? '#17a2b8' : 
                     performance.overall.color === 'warning' ? '#ffc107' : '#dc3545'}
              strokeWidth="3"
              strokeDasharray={`${performance.overall.score}, 100`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {showDetails && (
        <div className="row g-2">
          {/* Submissions */}
          <div className="col-4">
            <div className="text-center p-2 border rounded">
              <div className="fw-bold text-primary">{performance.submissions.count}</div>
              <div className="small text-muted">Submissions</div>
              <span className={`badge badge-${performance.submissions.color} badge-xs`}>
                {performance.submissions.level}
              </span>
            </div>
          </div>

          {/* Interviews */}
          <div className="col-4">
            <div className="text-center p-2 border rounded">
              <div className="fw-bold text-info">{performance.interviews.count}</div>
              <div className="small text-muted">Interviews</div>
              <span className={`badge badge-${performance.interviews.color} badge-xs`}>
                {performance.interviews.level}
              </span>
            </div>
          </div>

          {/* Job Offers */}
          <div className="col-4">
            <div className="text-center p-2 border rounded">
              <div className="fw-bold text-success">{performance.jobOffers.count}</div>
              <div className="small text-muted">Job Offers</div>
              <span className={`badge badge-${performance.jobOffers.color} badge-xs`}>
                {performance.jobOffers.level}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceIndicator;
