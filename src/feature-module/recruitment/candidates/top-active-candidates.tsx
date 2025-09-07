import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { backend_url } from '../../../environment';
import ProfileImage from '../../../core/common/ProfileImage';
import { all_routes } from '../../router/all_routes';

interface Candidate {
  rank: number;
  name: string;
  profileImage?: string;
  submissions: number;
  interviews: number;
  offers: number;
  activityScore: number;
  status: string;
  statusClass: string;
}

const TopActiveCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('monthly');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const candidatesPerPage = 20;

  const fetchCandidates = useCallback(async (page: number = 1, filterType: string = filter) => {
    try {
      setLoading(true);
      const response = await fetch(`${backend_url}/api/candidates/dashboard/activity-leaderboard?filter=${filterType}&page=${page}&limit=${candidatesPerPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.data || []);
        setTotalCandidates(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / candidatesPerPage));
      } else {
        console.error('Error fetching active candidates');
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching active candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [filter, candidatesPerPage]);

  useEffect(() => {
    fetchCandidates(currentPage, filter);
  }, [fetchCandidates, currentPage, filter]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Super Active':
        return 'badge-success';
      case 'Active':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h3>Top Active Candidates</h3>
              <p className="text-muted">Super Active and Active candidates across all time periods</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Active Candidates ({totalCandidates})</h5>
              <div className="dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white border-0 btn-sm d-inline-flex align-items-center fs-13"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-calendar me-1" />
                  {filter === 'all' ? 'All' :
                   filter === 'weekly' ? 'Weekly' : 
                   filter === 'monthly' ? 'Monthly' : 
                   filter === '3months' ? 'Last 3 Months' : 
                   filter === '6months' ? 'Last 6 Months' : 'Monthly'}
                </Link>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                      onClick={() => handleFilterChange('all')}
                    >
                      All
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                      onClick={() => handleFilterChange('weekly')}
                    >
                      Weekly
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                      onClick={() => handleFilterChange('monthly')}
                    >
                      Monthly
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                      onClick={() => handleFilterChange('3months')}
                    >
                      Last 3 Months
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                      onClick={() => handleFilterChange('6months')}
                    >
                      Last 6 Months
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading candidates...</p>
              </div>
            ) : candidates.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate</th>
                        <th>Activity Score</th>
                        <th>Submissions</th>
                        <th>Interviews</th>
                        <th>Offers</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((candidate, index) => (
                        <tr key={`${candidate.rank}-${candidate.name}`}>
                          <td>
                            <span className="badge bg-primary rounded-circle" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                              {candidate.rank}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Link to="#" className="avatar me-3">
                                <ProfileImage
                                  key={`${candidate.rank}-${candidate.profileImage}`}
                                  profileImage={candidate.profileImage ? `candidates/${candidate.profileImage}` : undefined}
                                  alt={candidate.name}
                                  className="img-fluid rounded-circle"
                                  fallbackSrc="assets/img/users/user-32.jpg"
                                />
                              </Link>
                              <div>
                                <h6 className="fw-medium mb-0">{candidate.name}</h6>
                                <span className="text-muted fs-12">Activity Score: {candidate.activityScore}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  role="progressbar" 
                                  style={{ 
                                    width: `${Math.min((candidate.activityScore / Math.max(...candidates.map(c => c.activityScore), 1)) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="fw-medium">{candidate.activityScore}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info-transparent">{candidate.submissions}</span>
                          </td>
                          <td>
                            <span className="badge bg-warning-transparent">{candidate.interviews}</span>
                          </td>
                          <td>
                            <span className="badge bg-success-transparent">{candidate.offers}</span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(candidate.status)} badge-xs`}>
                              {candidate.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <Link
                            to="#"
                            className="page-link"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) handlePageChange(currentPage - 1);
                            }}
                          >
                            Previous
                          </Link>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <Link
                              to="#"
                              className="page-link"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                            >
                              {page}
                            </Link>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <Link
                            to="#"
                            className="page-link"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) handlePageChange(currentPage + 1);
                            }}
                          >
                            Next
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <i className="ti ti-users-off fs-1 text-muted mb-3"></i>
                <h5 className="text-muted">No Active Candidates Found</h5>
                <p className="text-muted">No Super Active or Active candidates found for the selected time period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopActiveCandidates;
