import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import axios from 'axios';
import { backend_url } from '../../../environment';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  designation: string;
  profileImage?: string;
  birthday: Date;
  daysUntil: number;
}

interface MonthlyBirthdays {
  [key: string]: Employee[];
}

const EmployeeBirthdays = () => {
  const routes = all_routes;
  const [birthdays, setBirthdays] = useState<MonthlyBirthdays>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Function to toggle month expansion
  const toggleMonthExpansion = (monthIndex: number) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthIndex)) {
        newSet.delete(monthIndex);
      } else {
        newSet.add(monthIndex);
      }
      return newSet;
    });
  };

  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${backend_url}/api/employees/birthdays/yearly`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        params: { year: selectedYear }
      });

      if (response.data.success) {
        setBirthdays(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch birthdays');
      }
    } catch (err: any) {
      console.error('Error fetching birthdays:', err);
      setError(err.response?.data?.message || 'Failed to fetch birthdays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, [selectedYear]);

  const getMonthColor = (monthIndex: number) => {
    const colors = [
      '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', 
      '#fce4ec', '#e0f2f1', '#f1f8e9', '#fff8e1',
      '#fafafa', '#f3e5f5', '#e8f5e8', '#fff3e0'
    ];
    return colors[monthIndex];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilText = (daysUntil: number) => {
    if (daysUntil === 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days ago`;
    return `${daysUntil} days`;
  };

  const getDaysUntilColor = (daysUntil: number) => {
    if (daysUntil === 0) return 'text-success';
    if (daysUntil === 1) return 'text-warning';
    if (daysUntil < 0) return 'text-muted';
    if (daysUntil <= 7) return 'text-info';
    return 'text-muted';
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Employee Birthdays</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Employee Birthdays</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading birthdays...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Employee Birthdays</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Employee Birthdays</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="text-danger">
                    <i className="ti ti-alert-circle fs-1"></i>
                    <h4 className="mt-3">Error Loading Birthdays</h4>
                    <p>{error}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={fetchBirthdays}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Employee Birthdays</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Employee Birthdays</li>
              </ul>
            </div>
            <div className="col-auto">
              <div className="d-flex align-items-center">
                <label className="me-2">Year:</label>
                <select 
                  className="form-select form-select-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {months.map((month, monthIndex) => {
            const monthKey = (monthIndex + 1).toString().padStart(2, '0');
            const monthBirthdays = birthdays[monthKey] || [];
            const isExpanded = expandedMonths.has(monthIndex);
            
            return (
              <div key={month} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                <div className="card h-100" style={{ borderLeft: `4px solid ${getMonthColor(monthIndex)}` }}>
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="ti ti-calendar-event me-2"></i>
                      {month}
                    </h5>
                    <span className="badge bg-light text-dark">
                      {monthBirthdays.length} {monthBirthdays.length === 1 ? 'Birthday' : 'Birthdays'}
                    </span>
                  </div>
                  <div className="card-body p-0">
                    {monthBirthdays.length > 0 ? (
                      <div className="list-group list-group-flush" style={{ maxHeight: isExpanded ? 'none' : '300px', overflowY: 'auto' }}>
                        {(isExpanded ? monthBirthdays : monthBirthdays.slice(0, 5)).map((employee) => (
                          <div key={employee._id} className="list-group-item border-0 p-3">
                            <div className="d-flex align-items-center">
                              <Link to={routes.employeedetailsWithId.replace(':id', employee._id)} className="avatar me-3">
                                <ImageWithBasePath
                                  src={employee.profileImage ? `${backend_url}/uploads/${employee.profileImage}` : "/assets/img/users/user-01.jpg"}
                                  className="rounded-circle"
                                  alt="img"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                              </Link>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">
                                  <Link to={routes.employeedetailsWithId.replace(':id', employee._id)} className="text-decoration-none">
                                    {employee.fullName}
                                  </Link>
                                </h6>
                                <p className="text-muted mb-1 small">{employee.designation}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">
                                    {formatDate(employee.birthday)}
                                  </small>
                                  <span className={`badge ${getDaysUntilColor(employee.daysUntil)}`}>
                                    {getDaysUntilText(employee.daysUntil)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Show "View All" button if there are more than 5 birthdays */}
                        {monthBirthdays.length > 5 && (
                          <div className="list-group-item border-0 p-3 text-center">
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => toggleMonthExpansion(monthIndex)}
                            >
                              {isExpanded ? 'Show Less' : `View All (${monthBirthdays.length} birthdays)`}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="ti ti-cake text-muted fs-2"></i>
                        <p className="text-muted mt-2 mb-0">No birthdays this month</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(birthdays).length === 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="ti ti-cake text-muted fs-1"></i>
                  <h4 className="mt-3">No Birthdays Found</h4>
                  <p className="text-muted">No employee birthdays found for the selected year.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeBirthdays;
