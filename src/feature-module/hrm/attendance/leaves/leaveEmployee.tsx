import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import Table from '../../../../core/common/dataTable/index';
import CommonSelect from '../../../../core/common/commonSelect';
import PredefinedDateRanges from '../../../../core/common/datePicker';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import { DatePicker, message } from 'antd';
import CollapseHeader from '../../../../core/common/collapse-header/collapse-header';
import { useUser } from '../../../../core/context/UserContext';
import leaveService, { LeaveRecord } from '../../../../core/services/leaveService';

const leavetype = [
  { value: 'Select', label: 'Select' },
  { value: 'Full Day', label: 'Full Day' },
  { value: 'Half Day', label: 'Half Day' },
];
const selectChoose = [
  { value: 'Select', label: 'Select' },
  { value: 'Full Day', label: 'Full Day' },
  { value: 'First Half', label: 'First Half' },
  { value: 'Second Half', label: 'Second Half' },
];

const LeaveEmployee = () => {
  const { user } = useUser();
  const employeeId = user?._id;

  // State
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    leaveType: leavetype[0],
    from: null as any,
    to: null as any,
    reason: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  // Check if Half Day is selected
  const isHalfDay = addForm.leaveType.value === 'Half Day';

  // Fetch leaves and balances
  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    Promise.all([
      leaveService.getEmployeeLeaves(employeeId),
      leaveService.getLeaveBalances(employeeId),
    ])
      .then(([leavesRes, balanceRes]) => {
        setLeaves(leavesRes.data);
        setBalances(balanceRes.data);
      })
      .catch(() => message.error('Failed to load leave data'))
      .finally(() => setLoading(false));
  }, [employeeId]);

  // Table columns
  const columns = [
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      render: (text: string, record: LeaveRecord) => (
        <div className="d-flex align-items-center">
          <p className="fs-14 fw-medium d-flex align-items-center mb-0">
            {record.leaveType}
            {record.noOfDays === 0.5 && (
              <span className="badge bg-warning-transparent ms-2">Half Day</span>
            )}
          </p>
        </div>
      ),
    },
    {
      title: 'From',
      dataIndex: 'from',
      render: (text: string) => text ? new Date(text).toLocaleDateString() : '',
    },
    {
      title: 'To',
      dataIndex: 'to',
      render: (text: string) => text ? new Date(text).toLocaleDateString() : '',
    },
    {
      title: 'No of Days',
      dataIndex: 'noOfDays',
      render: (text: number) => (
        <span>
          {text === 0.5 ? '0.5 (Half Day)' : text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string) => (
        <span className={`badge ${
          text === 'Approved'
            ? 'bg-success'
            : text === 'Declined'
            ? 'bg-danger'
            : text === 'Cancelled'
            ? 'bg-secondary'
            : 'bg-purple'
        }`}>{text}</span>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      render: (text: string) => <span>{text}</span>,
    },
  ];

  // Add Leave Handlers
  const handleAddFormChange = (field: string, value: any) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    
    // Check if employee has remaining leaves
    const remainingLeaves = calculateRemainingLeaves();
    if (remainingLeaves <= 0) {
      message.error('You have exhausted your leave quota. Cannot apply for more leaves.');
      return;
    }
    
    if (!addForm.leaveType.value || addForm.leaveType.value === 'Select') {
      message.warning('Please select a leave type');
      return;
    }
    if (!addForm.from || !addForm.to) {
      message.warning('Please select from and to dates');
      return;
    }
    
    // Check if the requested leave days exceed remaining leaves
    const requestedDays = isHalfDay ? 0.5 : 
      (() => {
        const fromDate = addForm.from.startOf ? addForm.from.startOf('day').toDate() : new Date(addForm.from);
        const toDate = addForm.to.startOf ? addForm.to.startOf('day').toDate() : new Date(addForm.to);
        const timeDiff = toDate.getTime() - fromDate.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return dayDiff + 1;
      })();
    
    if (requestedDays > remainingLeaves) {
      message.error(`You only have ${remainingLeaves} days remaining. Cannot apply for ${requestedDays} days.`);
      return;
    }
    
    // For Half Day, ensure same day selection
    if (isHalfDay) {
      const fromDate = addForm.from.startOf ? addForm.from.startOf('day') : addForm.from;
      const toDate = addForm.to.startOf ? addForm.to.startOf('day') : addForm.to;
      // Convert to timestamps for comparison
      const fromTimestamp = fromDate.startOf ? fromDate.startOf('day').valueOf() : new Date(fromDate).getTime();
      const toTimestamp = toDate.startOf ? toDate.startOf('day').valueOf() : new Date(toDate).getTime();
      if (fromTimestamp !== toTimestamp) {
        message.warning('For Half Day leave, please select the same date for both from and to');
        return;
      }
    }
    
    setAddLoading(true);
    const fromDate = addForm.from.startOf ? addForm.from.startOf('day').toDate() : new Date(addForm.from);
    const toDate = addForm.to.startOf ? addForm.to.startOf('day').toDate() : new Date(addForm.to);
    
    // Calculate days based on leave type
    let noOfDays;
    if (isHalfDay) {
      noOfDays = 0.5;
    } else {
      // For Full Day, calculate the difference
      const timeDiff = toDate.getTime() - fromDate.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      noOfDays = dayDiff + 1; // Add 1 to include both start and end dates
    }
    
    const leaveData = {
      employeeId,
      leaveType: addForm.leaveType.value,
      from: fromDate,
      to: toDate,
      noOfDays,
      reason: addForm.reason,
      status: 'New',
    };
    
    console.log('Sending leave data:', leaveData);
    
    try {
      await leaveService.addLeaveRequest(leaveData);
      message.success('Leave request submitted');
      setAddForm({ leaveType: leavetype[0], from: null, to: null, reason: '' });
      // Refresh data
      const [leavesRes, balanceRes] = await Promise.all([
        leaveService.getEmployeeLeaves(employeeId),
        leaveService.getLeaveBalances(employeeId),
      ]);
      setLeaves(leavesRes.data);
      setBalances(balanceRes.data);
    } catch (err) {
      console.error('Leave submission error:', err);
      message.error('Failed to submit leave request');
    } finally {
      setAddLoading(false);
    }
  };

  // Modal helpers
  const getModalContainer = () => {
    const modalElement = document.getElementById('modal-datepicker');
    return modalElement ? modalElement : document.body;
  };

  // Card helpers
  const getBalance = (type: string) => balances[type] || 0;

  const calculateUsedLeaves = () => {
    return leaves
      .filter(leave => leave.status === 'Approved')
      .reduce((total, leave) => total + (leave.noOfDays || 0), 0);
  };

  const calculateRemainingLeaves = () => {
    const totalLeaves = 12; // Fixed total of 12 leaves for every employee
    const usedLeaves = calculateUsedLeaves();
    return Math.max(0, totalLeaves - usedLeaves);
  };

  const calculateTotalLeaveDays = () => {
    return leaves.reduce((total, leave) => total + (leave.noOfDays || 0), 0);
  };

  const calculateUnapprovedLeaves = () => {
    return leaves
      .filter(leave => leave.status === 'New')
      .reduce((total, leave) => total + (leave.noOfDays || 0), 0);
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Leaves</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Leaves
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="dropdown">
                  {/* <Link
                    to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-file-export me-1" />
                    Export
                  </Link> */}
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{' '}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mb-2">
                <Link
                  to="#"
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#add_leaves"
                  className={`btn d-flex align-items-center ${calculateRemainingLeaves() <= 0 ? 'btn-secondary disabled' : 'btn-primary'}`}
                  style={{ pointerEvents: calculateRemainingLeaves() <= 0 ? 'none' : 'auto' }}
                >
                  <i className="ti ti-circle-plus me-2" />
                  {calculateRemainingLeaves() <= 0 ? 'No Leaves Remaining' : 'Add Leave'}
                </Link>
              </div>
            </div>
          </div>
          {/* /Breadcrumb */}
          {/* Leave Statistics */}
          <div className="row mb-3">
            <div className="col-xl-4 col-md-6">
              <div className="card bg-primary">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                      <p className="mb-1 text-white">Total Leaves</p>
                      <h4 className="text-white">12</h4>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <span className="avatar avatar-md d-flex">
                          <i className="ti ti-calendar-event fs-32 text-white" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-white-transparent">
                    Annual Leave Quota
                  </span>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6">
              <div className="card bg-success">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                      <p className="mb-1 text-white">Used Leaves</p>
                      <h4 className="text-white">{calculateUsedLeaves()}</h4>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <span className="avatar avatar-md d-flex">
                          <i className="ti ti-calendar-check fs-32 text-white" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-white-transparent">
                    Approved & Used
                  </span>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6">
              <div className="card bg-info">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="text-start">
                      <p className="mb-1 text-white">Remaining Leaves</p>
                      <h4 className="text-white">{calculateRemainingLeaves()}</h4>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-2">
                        <span className="avatar avatar-md d-flex">
                          <i className="ti ti-calendar-time fs-32 text-white" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-white-transparent">
                    Available for Use
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* /Leave Statistics */}
          {/* Leaves list */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <div className="d-flex">
                <h5 className="me-2">Leave List</h5>
                <span className="badge bg-warning-transparent me-2">
                  Unapproved Days : {calculateUnapprovedLeaves()}
                </span>
                <span className="badge bg-success-transparent me-2">
                  Used Days : {calculateUsedLeaves()}
                </span>
                <span className="badge bg-info-transparent me-2">
                  Remaining Days : {calculateRemainingLeaves()}
                </span>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon-end position-relative">
                    <PredefinedDateRanges />
                    <span className="input-icon-addon">
                      <i className="ti ti-chevron-down" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table dataSource={leaves} columns={columns} Selection={true} rowKey="_id" />
            </div>
          </div>
          {/* /Leaves list */}
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014 - 2025 © SmartHR.</p>
          <p>
            Designed & Developed By{' '}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Add Leaves */}
      <div className="modal fade" id="add_leaves">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Leave</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleAddLeave}>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Leave Type</label>
                      <CommonSelect
                        className="select"
                        options={leavetype}
                        value={addForm.leaveType}
                        onChange={(option) => handleAddFormChange('leaveType', option)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">From </label>
                      <div className="input-icon-end position-relative">
                        <DatePicker
                          className="form-control datetimepicker"
                          format={{ format: 'DD-MM-YYYY', type: 'mask' }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                          value={addForm.from}
                          onChange={(date) => {
                            handleAddFormChange('from', date);
                            // For Half Day, automatically set 'to' date to same date
                            if (isHalfDay && date) {
                              handleAddFormChange('to', date);
                            }
                          }}
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">To </label>
                      <div className="input-icon-end position-relative">
                        <DatePicker
                          className="form-control datetimepicker"
                          format={{ format: 'DD-MM-YYYY', type: 'mask' }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                          value={addForm.to}
                          onChange={(date) => handleAddFormChange('to', date)}
                          disabled={isHalfDay}
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-calendar text-gray-7" />
                        </span>
                      </div>
                      {isHalfDay && (
                        <small className="form-text text-muted">
                          For Half Day leave, the "To" date will be automatically set to the same date as "From"
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Reason</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={addForm.reason}
                        onChange={(e) => handleAddFormChange('reason', e.target.value)}
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
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'Adding...' : 'Add Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Leaves */}
    </>
  );
};

export default LeaveEmployee;
