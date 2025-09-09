import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { backend_url } from '../../../environment';
import { all_routes } from '../../router/all_routes';
import { useUser } from '../../../core/context/UserContext';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';

interface Interview {
  _id: string;
  candidateId: string;
  candidateName: string;
  candidateProfileImage?: string;
  appliedRole: string;
  scheduledDate: string;
  interviewLevel: string;
  interviewer: string;
  interviewLink?: string;
  notes?: string;
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

const AdminInterviews = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const routes = all_routes;
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [employees, setEmployees] = useState<any[]>([]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'admin' && user.role !== 'hr') {
        navigate(routes.adminDashboard);
        return;
      }
    }
  }, [user, isLoading, navigate, routes.adminDashboard]);

  useEffect(() => {
    if (user?._id && (user.role === 'admin' || user.role === 'hr')) {
      fetchInterviews();
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${backend_url}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setEmployees(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backend_url}/api/candidates/admin-interviews`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setInterviews(result.data || []);
      } else {
        console.error('Error fetching interviews:', response.status);
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatInterviewDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatInterviewTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInterviewBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'first round':
      case 'initial':
        return 'primary';
      case 'second round':
      case 'technical':
        return 'info';
      case 'final round':
      case 'hr':
        return 'success';
      case 'manager':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusBadge = (dateString: string) => {
    const interviewDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    interviewDate.setHours(0, 0, 0, 0);

    if (interviewDate < today) {
      return { text: 'Past', color: 'secondary' };
    } else if (interviewDate.getTime() === today.getTime()) {
      return { text: 'Today', color: 'warning' };
    } else {
      return { text: 'Upcoming', color: 'success' };
    }
  };

  const handleViewCandidate = (candidateId: string) => {
    navigate(routes.candidateDetails.replace(':id', candidateId));
  };

  const handleViewEmployee = (employeeId: string) => {
    navigate(routes.employeedetailsWithId.replace(':id', employeeId));
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.appliedRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = employeeFilter === 'all' || 
                           (interview.assignedTo && interview.assignedTo._id === employeeFilter);
    
    if (filter === 'all') return matchesSearch && matchesEmployee;
    
    const interviewDate = new Date(interview.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    interviewDate.setHours(0, 0, 0, 0);
    
    if (filter === 'upcoming') return matchesSearch && matchesEmployee && interviewDate >= today;
    if (filter === 'past') return matchesSearch && matchesEmployee && interviewDate < today;
    
    return matchesSearch && matchesEmployee;
  });

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

  // Show access denied if user is not admin or hr
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

  return (
    <>
      <style>
        {`
          .interview-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(0, 0, 0, 0.05);
            background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
          }
          
          .interview-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: rgba(0, 123, 255, 0.2);
          }
          
          .glass-morphism {
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
          }
          
          .glass-morphism:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
          }
          
          .candidate-avatar, .employee-avatar {
            transition: all 0.3s ease;
          }
          
          .candidate-avatar:hover, .employee-avatar:hover {
            transform: scale(1.1);
          }
          
          .interview-time-icon {
            transition: all 0.3s ease;
          }
          
          .interview-card:hover .interview-time-icon {
            transform: scale(1.1);
          }
          
          .btn-action {
            transition: all 0.3s ease;
          }
          
          .btn-action:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .filter-btn {
            transition: all 0.3s ease;
          }
          
          .filter-btn.active {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          }
          
          .search-input, .form-select {
            transition: all 0.3s ease;
          }
          
          .search-input:focus, .form-select:focus {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.15);
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .interview-card {
            animation: slideInUp 0.6s ease-out;
          }
          
          .empty-state {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-radius: 16px;
          }
          
          .empty-state-icon {
            transition: all 0.3s ease;
          }
          
          .empty-state:hover .empty-state-icon {
            transform: scale(1.05);
          }
          
          .stats-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .stats-card h3 {
            color: white;
            margin-bottom: 0.5rem;
          }
          
          .stats-card p {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 0;
          }
        `}
      </style>
      
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">All Interviews</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Admin</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    All Interviews
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="me-2 mb-2">
                <button
                  onClick={fetchInterviews}
                  className="btn btn-outline-primary d-flex align-items-center"
                  disabled={loading}
                >
                  <i className={`ti ti-refresh me-2 ${loading ? 'spinning' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <h3>{interviews.length}</h3>
                <p>Total Interviews</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <h3>{interviews.filter(i => new Date(i.scheduledDate) >= new Date(new Date().setHours(0,0,0,0))).length}</h3>
                <p>Upcoming</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <h3>{interviews.filter(i => new Date(i.scheduledDate) < new Date(new Date().setHours(0,0,0,0))).length}</h3>
                <p>Past</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-card">
                <h3>{new Set(interviews.map(i => i.interviewer)).size}</h3>
                <p>Interviewers</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="row mb-4">
            <div className="col-lg-4">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn filter-btn ${filter === 'all' ? 'btn-primary active' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('all')}
                >
                  All Interviews ({interviews.length})
                </button>
                <button
                  className={`btn filter-btn ${filter === 'upcoming' ? 'btn-primary active' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('upcoming')}
                >
                  Upcoming ({interviews.filter(i => new Date(i.scheduledDate) >= new Date(new Date().setHours(0,0,0,0))).length})
                </button>
                <button
                  className={`btn filter-btn ${filter === 'past' ? 'btn-primary active' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('past')}
                >
                  Past ({interviews.filter(i => new Date(i.scheduledDate) < new Date(new Date().setHours(0,0,0,0))).length})
                </button>
              </div>
            </div>
            <div className="col-lg-3">
              <select
                className="form-select"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-lg-5">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ti ti-search" />
                </span>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search interviews, candidates, or interviewers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Interviews List */}
          <div className="row">
            {loading ? (
              <div className="col-12">
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading interviews...</p>
                </div>
              </div>
            ) : filteredInterviews.length > 0 ? (
              filteredInterviews.map((interview) => {
                const status = getStatusBadge(interview.scheduledDate);
                return (
                  <div key={interview._id} className="col-lg-6 col-xl-4 mb-4">
                    <div className="card interview-card glass-morphism h-100">
                      <div className="card-body p-4">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <div className="candidate-avatar me-3">
                              <img
                                src={interview.candidateProfileImage ? `${backend_url}/uploads/candidates/${interview.candidateProfileImage}` : "assets/img/users/user-01.jpg"}
                                alt={interview.candidateName}
                                className="rounded-circle"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.src = "assets/img/users/user-01.jpg";
                                }}
                              />
                            </div>
                            <div>
                              <h6 className="mb-1 fw-semibold">{interview.candidateName}</h6>
                              <span className={`badge badge-${getInterviewBadgeColor(interview.interviewLevel)} badge-sm`}>
                                {interview.appliedRole}
                              </span>
                            </div>
                          </div>
                          <span className={`badge badge-${status.color} badge-sm`}>
                            {status.text}
                          </span>
                        </div>

                        {/* Interview Details */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="ti ti-calendar-event text-primary me-2 interview-time-icon" />
                            <span className="fw-medium">{formatInterviewDate(interview.scheduledDate)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="ti ti-clock-hour-11 text-primary me-2 interview-time-icon" />
                            <span className="fw-medium">{formatInterviewTime(interview.scheduledDate)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="ti ti-user text-primary me-2 interview-time-icon" />
                            <span className="fw-medium">Interviewer: {interview.interviewer}</span>
                          </div>
                          {interview.assignedTo && (
                            <div className="d-flex align-items-center">
                              <i className="ti ti-user-check text-info me-2 interview-time-icon" />
                              <span className="fw-medium text-info">
                                Assigned to: {interview.assignedTo.firstName} {interview.assignedTo.lastName}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Interview Level */}
                        <div className="mb-3">
                          <span className={`badge badge-${getInterviewBadgeColor(interview.interviewLevel)} badge-lg`}>
                            {interview.interviewLevel}
                          </span>
                        </div>

                        {/* Notes */}
                        {interview.notes && (
                          <div className="mb-3">
                            <p className="text-muted small mb-0">
                              <i className="ti ti-note me-1" />
                              {interview.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="d-flex gap-2">
                          {interview.interviewLink ? (
                            <a
                              href={interview.interviewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm btn-action flex-fill"
                            >
                              <i className="ti ti-video me-1" />
                              Join Meeting
                            </a>
                          ) : (
                            <button
                              onClick={() => handleViewCandidate(interview.candidateId)}
                              className="btn btn-outline-primary btn-sm btn-action flex-fill"
                            >
                              <i className="ti ti-eye me-1" />
                              View Candidate
                            </button>
                          )}
                          {interview.assignedTo && (
                            <button
                              onClick={() => handleViewEmployee(interview.assignedTo._id)}
                              className="btn btn-outline-info btn-sm btn-action"
                              title="View Employee"
                            >
                              <i className="ti ti-user" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <div className="text-center py-5 empty-state">
                  <div className="empty-state-icon mb-4">
                    <i className="ti ti-calendar-off text-muted" style={{ fontSize: '4rem' }} />
                  </div>
                  <h4 className="text-muted mb-3">No Interviews Found</h4>
                  <p className="text-muted mb-4">
                    {searchTerm || filter !== 'all' || employeeFilter !== 'all'
                      ? 'No interviews match your current filters.' 
                      : 'No interviews have been scheduled yet.'}
                  </p>
                  {(searchTerm || filter !== 'all' || employeeFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                        setEmployeeFilter('all');
                      }}
                      className="btn btn-outline-primary"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminInterviews;
