import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import activityService, { Activity } from '../../../core/services/activityService';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { backend_url } from '../../../environment';
import Swal from 'sweetalert2';

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [pageSize] = useState(20);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [currentPage, filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getAllActivities(currentPage, pageSize, filter);
      setActivities(response.data);
      setTotalActivities(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action: string) => {
    return activityService.getActivityIcon(action);
  };

  const getActivityColor = (action: string) => {
    return activityService.getActivityColor(action);
  };

  const getActivityLabel = (entityType: string) => {
    return activityService.getActivityLabel(entityType);
  };

  const formatActivityDescription = (activity: Activity) => {
    return activityService.formatActivityDescription(activity);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleDeleteAllActivities = async () => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete all ${totalActivities} activities. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await activityService.deleteAllActivities();
        
        // Show success message
        await Swal.fire(
          'Deleted!',
          `All ${totalActivities} activities have been deleted successfully.`,
          'success'
        );

        // Refresh the activities list
        await fetchActivities();
      } catch (error) {
        console.error('Error deleting all activities:', error);
        
        // Show error message
        await Swal.fire(
          'Error!',
          'Failed to delete activities. Please try again.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(i)}
            disabled={i === currentPage}
          >
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav aria-label="Activities pagination">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">All Activities</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Administration</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Activities
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="me-2 mb-2">
                <button
                  onClick={fetchActivities}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <i className={`ti ${loading ? 'ti-loader-2' : 'ti-refresh'} ${loading ? 'animate-spin' : ''}`}></i>
                  Refresh
                </button>
              </div>
              <div className="me-2 mb-2">
                <button
                  onClick={handleDeleteAllActivities}
                  className="btn btn-danger"
                  disabled={loading || totalActivities === 0}
                >
                  <i className="ti ti-trash"></i>
                  Delete All Activities
                </button>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <label className="form-label mb-0">Filter by:</label>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn btn-outline-primary ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-success ${filter === 'employee' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('employee')}
                      >
                        Employees
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-info ${filter === 'candidate' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('candidate')}
                      >
                        Candidates
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-warning ${filter === 'todo' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('todo')}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-secondary ${filter === 'attendance' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('attendance')}
                      >
                        Attendance
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-purple ${filter === 'leave' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('leave')}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activities Table */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    Activities ({totalActivities} total)
                  </h5>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-3">Loading activities...</p>
                    </div>
                  ) : activities.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Activity</th>
                              <th>Type</th>
                              <th>Description</th>
                              <th>Date & Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities.map((activity) => (
                              <tr key={activity._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {activity.user.profileImage ? (
                                      <img
                                        src={`${backend_url}/uploads/${activity.user.profileImage}`}
                                        className="rounded-circle me-2"
                                        alt="img"
                                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <ImageWithBasePath
                                        src="assets/img/users/user-01.jpg"
                                        className="rounded-circle me-2"
                                        alt="img"
                                        style={{ width: '32px', height: '32px' }}
                                      />
                                    )}
                                    <div>
                                      <h6 className="mb-0 fs-14">
                                        {activity.user.firstName} {activity.user.lastName}
                                      </h6>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <i className={`ti ${getActivityIcon(activity.action)} ${getActivityColor(activity.action)} me-2`}></i>
                                    <span className="text-capitalize">
                                      {activity.action.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className={getActivityLabel(activity.entityType).color}>
                                    {getActivityLabel(activity.entityType).text}
                                  </span>
                                </td>
                                <td>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: formatActivityDescription(activity)
                                    }}
                                    className="fs-13"
                                  />
                                </td>
                                <td>
                                  <span className="text-muted fs-13">
                                    {formatDate(activity.timestamp)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4">
                          {renderPagination()}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <i className="ti ti-activity text-muted fs-1 mb-3"></i>
                      <h5 className="text-muted">No activities found</h5>
                      <p className="text-muted">There are no activities matching your current filter.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Activities;
