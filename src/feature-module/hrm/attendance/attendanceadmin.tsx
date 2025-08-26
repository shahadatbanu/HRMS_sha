import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { all_routes } from '../../router/all_routes';
import PredefinedDateRanges from '../../../core/common/datePicker';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Table from "../../../core/common/dataTable/index";
import CommonSelect from '../../../core/common/commonSelect';
import { DatePicker, TimePicker } from 'antd';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import { useUser } from '../../../core/context/UserContext';
import { 
  getAttendanceRecords, 
  formatAttendanceForTable,
  type AttendanceRecord,
  type AttendanceFilters
} from '../../../core/services/attendanceService';
import moment from 'moment';

const AttendanceAdmin = () => {
  const { user } = useUser();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  
  // Filter states
  const [filters, setFilters] = useState<AttendanceFilters>({
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Late', label: 'Late' },
    { value: 'Half Day', label: 'Half Day' }
  ];

  const sortByOptions = [
    { value: 'date', label: 'Date' },
    { value: 'checkIn.time', label: 'Check In Time' },
    { value: 'checkOut.time', label: 'Check Out Time' },
    { value: 'status', label: 'Status' },
    { value: 'productionHours', label: 'Production Hours' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' }
  ];

  // Get backend URL for profile images
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await getAttendanceRecords(filters);
      const formattedData = response.data.map(formatAttendanceForTable);
      setAttendanceData(formattedData);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle date range change from PredefinedDateRanges
  const handleDateRangeChange = (start: moment.Moment, end: moment.Moment) => {
    setFilters(prev => ({
      ...prev,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  // Check if user has access - Admin only
  if (!user || user.role !== 'admin') {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <i className="ti ti-shield-x fs-1 text-muted mb-3"></i>
              <h4>Access Denied</h4>
              <p className="text-muted">This page is accessible to administrators only.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      title: "Employee",
      dataIndex: "Employee",
      render: (text: String, record: any) => {
        let imgSrc = '';
        if (record.Image) {
          // Always use backend URL for uploads
          imgSrc = `${BACKEND_URL}/uploads/${record.Image.replace(/^uploads[\\/]/, '')}`;
        }
        return (
          <div className="d-flex align-items-center file-name-icon">
            <span className="avatar avatar-md border avatar-rounded">
              {imgSrc ? (
                <img src={imgSrc} className="img-fluid" alt="img" style={{ borderRadius: '50%', objectFit: 'cover', aspectRatio: '1/1', width: 40, height: 40 }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/react/template/assets/img/users/default.png'; }} />
              ) : (
                <i className="ti ti-user fs-24 text-muted" />
              )}
            </span>
            <div className="ms-2">
              <h6 className="fw-medium">
                {record.Employee}
              </h6>
              <span className="fs-12 fw-normal ">{record.Role}</span>
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => a.Employee.length - b.Employee.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: String, record: any) => (
        <span className={`badge ${text === 'Present' ? 'badge-success-transparent' : 'badge-danger-transparent'} d-inline-flex align-items-center`}>
          <i className="ti ti-point-filled me-1" />
          {record.Status}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },
    {
      title: "Check In",
      dataIndex: "CheckIn",
      sorter: (a: any, b: any) => a.CheckIn.length - b.CheckIn.length,
    },
    {
      title: "Location",
      dataIndex: "Location",
      render: (text: String, record: any) => {
        // Check if we have geolocation data
        const hasGeolocation = record.geolocation && 
          record.geolocation.latitude && 
          record.geolocation.longitude;
        
        if (hasGeolocation) {
          const mapUrl = `https://www.google.com/maps?q=${record.geolocation.latitude},${record.geolocation.longitude}`;
          return (
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-decoration-none"
              title="Click to open in Google Maps"
            >
              <i className="ti ti-map-pin me-1" />
              {record.Location}
              <i className="ti ti-external-link ms-1 fs-12" />
            </a>
          );
        } else {
          return (
            <span className="text-muted">
              <i className="ti ti-map-pin me-1" />
              {record.Location}
            </span>
          );
        }
      },
      sorter: (a: any, b: any) => a.Location.length - b.Location.length,
    },
    {
      title: "Check Out",
      dataIndex: "CheckOut",
      sorter: (a: any, b: any) => a.CheckOut.length - b.CheckOut.length,
    },
    {
      title: "Late",
      dataIndex: "Late",
      sorter: (a: any, b: any) => a.Late.length - b.Late.length,
    },
    {
      title: "Production Hours",
      dataIndex: "ProductionHours",
      render: (text: String, record: any) => (
        <span className={`badge d-inline-flex align-items-center badge-sm ${record.ProductionHours < '8.00'
          ? 'badge-danger'
          : record.ProductionHours >= '8.00' && record.ProductionHours <= '9.00'
            ? 'badge-success'
            : 'badge-info'
          }`}
        >
          <i className="ti ti-clock-hour-11 me-1"></i>{record.ProductionHours}
        </span>
      ),
      sorter: (a: any, b: any) => a.ProductionHours.length - b.ProductionHours.length,
    },
  ];

  const getModalContainer = () => {
    const modalElement = document.getElementById('modal-datepicker');
    return modalElement ? modalElement : document.body;
  };

  const getModalContainer2 = () => {
    const modalElement = document.getElementById('modal_datepicker');
    return modalElement ? modalElement : document.body;
  };

  // Helper to calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(0)}%`;
  };

  // Simulate previous period data (replace with real data if available)
  const previousStats = {
    Present: 0,
    Late: 0,
    'Half Day': 0,
    Leave: 0,
    Absent: 0,
  };

  // Current period counts
  const presentCount = attendanceData.filter(item => item.Status === 'Present').length;
  const lateCount = attendanceData.filter(item => item.Status === 'Late').length;
  const halfDayCount = attendanceData.filter(item => item.Status === 'Half Day').length;
  const leaveCount = attendanceData.filter(item => item.Status === 'Leave').length;
  const absentCount = attendanceData.filter(item => item.Status === 'Absent').length;

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Attendance Admin</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Attendance Admin
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    to={all_routes.attendanceemployee}
                    className="btn btn-icon btn-sm  me-1"
                  >
                    <i className="ti ti-brand-days-counter" />
                  </Link>
                  <Link
                    to={all_routes.attendanceadmin}
                    className="btn btn-icon btn-sm active bg-primary text-white"
                  >
                    <i className="ti ti-calendar-event" />
                  </Link>
                </div>
              </div>
              <div className="me-2 mb-2">
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-file-export me-1" />
                    Export
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                      >
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                      >
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mb-2">
                <Link
                  to="#"
                  className="btn btn-primary d-flex align-items-center"
                  data-bs-target="#attendance_report"
                  data-bs-toggle="modal" data-inert={true}
                >
                  <i className="ti ti-file-analytics me-2" />
                  Report
                </Link>
              </div>
              <div className="ms-2 head-icons">
                <CollapseHeader />
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="card border-0">
            <div className="card-body">
              <div className="row align-items-center mb-4">
                <div className="col-md-5">
                  <div className="mb-3 mb-md-0">
                    <h4 className="mb-1">Attendance Details Today</h4>
                    <p>Data from {pagination.totalRecords} total attendance records</p>
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="d-flex align-items-center justify-content-md-end">
                    <h6>Total Records: {pagination.totalRecords}</h6>
                    {/* Replace static avatars with dynamic ones */}
                    <div className="avatar-list-stacked avatar-group-sm ms-4">
                      {attendanceData.slice(0, 5).map((item, idx) => {
                        let imgSrc = '';
                        if (item.Image) {
                          imgSrc = `${BACKEND_URL}/uploads/${item.Image.replace(/^uploads[\\/]/, '')}`;
                        }
                        return (
                          <span className="avatar avatar-rounded" key={item._id || idx}>
                            {imgSrc ? (
                              <img src={imgSrc} className="border border-white" alt={item.Employee} style={{ borderRadius: '50%', objectFit: 'cover', aspectRatio: '1/1', width: 32, height: 32 }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/react/template/assets/img/users/default.png'; }} />
                            ) : (
                              <i className="ti ti-user fs-18 text-muted" />
                            )}
                          </span>
                        );
                      })}
                      {attendanceData.length > 5 && (
                        <span className="avatar bg-primary avatar-rounded text-fixed-white fs-12">
                          +{attendanceData.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border rounded">
                <div className="row gx-0">
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Present</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>{presentCount}</h5>
                        <span className="badge badge-success d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          {calculatePercentageChange(presentCount, previousStats.Present)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Late Login</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>{lateCount}</h5>
                        <span className="badge badge-danger d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          {calculatePercentageChange(lateCount, previousStats.Late)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Half Day</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>{halfDayCount}</h5>
                        <span className="badge badge-warning d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          {calculatePercentageChange(halfDayCount, previousStats['Half Day'])}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4 border-end">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Leave</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>{leaveCount}</h5>
                        <span className="badge badge-success d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          {calculatePercentageChange(leaveCount, previousStats.Leave)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md col-sm-4">
                    <div className="p-3">
                      <span className="fw-medium mb-1 d-block">Absent</span>
                      <div className="d-flex align-items-center justify-content-between">
                        <h5>{absentCount}</h5>
                        <span className="badge badge-danger d-inline-flex align-items-center">
                          <i className="ti ti-arrow-wave-right-down me-1" />
                          {calculatePercentageChange(absentCount, previousStats.Absent)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Admin Attendance</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon-end position-relative">
                    <PredefinedDateRanges 
                      onDateRangeChange={(start, end) => {
                        handleFilterChange('startDate', start.format('YYYY-MM-DD'));
                        handleFilterChange('endDate', end.format('YYYY-MM-DD'));
                      }}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-chevron-down" />
                    </span>
                  </div>
                </div>
                <div className="me-3">
                  <CommonSelect
                    className="select"
                    options={statusOptions}
                    value={statusOptions.find(option => option.value === filters.status) || statusOptions[0]}
                    onChange={(option) => handleFilterChange('status', option?.value || '')}
                  />
                </div>
                <div className="me-3">
                  <CommonSelect
                    className="select"
                    options={sortByOptions}
                    value={sortByOptions.find(option => option.value === filters.sortBy) || sortByOptions[0]}
                    onChange={(option) => handleFilterChange('sortBy', option?.value || 'date')}
                  />
                </div>
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort Order: {filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange('sortOrder', 'desc')}
                      >
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={() => handleFilterChange('sortOrder', 'asc')}
                      >
                        Ascending
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <Table dataSource={attendanceData} columns={columns} Selection={true} />
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center p-3 border-top">
                      <div className="text-muted">
                        Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} entries
                      </div>
                      <nav>
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                            <Link
                              className="page-link"
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (pagination.currentPage > 1) {
                                  handlePageChange(pagination.currentPage - 1);
                                }
                              }}
                            >
                              Previous
                            </Link>
                          </li>
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                                <Link
                                  className="page-link"
                                  to="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                  }}
                                >
                                  {page}
                                </Link>
                              </li>
                            );
                          })}
                          <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                            <Link
                              className="page-link"
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (pagination.currentPage < pagination.totalPages) {
                                  handlePageChange(pagination.currentPage + 1);
                                }
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
              )}
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
      {/* Edit Attendance */}
      <div className="modal fade" id="edit_attendance">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Attendance</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Date</label>
                      <div className="input-icon input-icon-new position-relative w-100 me-2">
                        <DatePicker
                          className="form-control datetimepicker"
                          format={{
                            format: "DD-MM-YYYY",
                            type: "mask",
                          }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Check In</label>
                      <div className="input-icon input-icon-new position-relative w-100">
                        <TimePicker getPopupContainer={getModalContainer2} use12Hours placeholder="Choose" format="h:mm A" className="form-control timepicker" />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Check Out</label>
                      <div className="input-icon input-icon-new position-relative w-100">
                        <TimePicker getPopupContainer={getModalContainer2} use12Hours placeholder="Choose" format="h:mm A" className="form-control timepicker" />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Break</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="30 Min	"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Late</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="32 Min"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Production Hours</label>
                      <div className="input-icon input-icon-new position-relative w-100">
                        <TimePicker getPopupContainer={getModalContainer2} use12Hours placeholder="Choose" format="h:mm A" className="form-control timepicker" />
                        <span className="input-icon-addon">
                          <i className="ti ti-clock-hour-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3 ">
                      <label className="form-label">Status</label>
                      <CommonSelect
                        className='select'
                        options={statusOptions.filter(option => option.value !== '')}
                        defaultValue={statusOptions[1]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="button" data-bs-dismiss="modal" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Attendance */}
      {/* Attendance Report */}
      <div className="modal fade" id="attendance_report">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Attendance Report</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="card shadow-none bg-transparent-light">
                <div className="card-body pb-1">
                  <div className="row">
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Total Records</span>
                        <p className="text-gray-9 fw-medium">{pagination.totalRecords}</p>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Present</span>
                        <p className="text-gray-9 fw-medium">{attendanceData.filter(item => item.Status === 'Present').length}</p>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Absent</span>
                        <p className="text-gray-9 fw-medium">{attendanceData.filter(item => item.Status === 'Absent').length}</p>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Late</span>
                        <p className="text-gray-9 fw-medium">{attendanceData.filter(item => item.Status === 'Late').length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Attendance Report */}
    </>
  )
}

export default AttendanceAdmin
