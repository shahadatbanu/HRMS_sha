import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import Table from '../../../../core/common/dataTable/index';
import { message, Button, Spin } from 'antd';
import PredefinedDateRanges from '../../../../core/common/datePicker';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import CollapseHeader from '../../../../core/common/collapse-header/collapse-header';
import leaveService, { LeaveRecord } from '../../../../core/services/leaveService';

const LeaveAdmin = () => {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [refresh, setRefresh] = useState(0);

  // Fetch all leave requests
  useEffect(() => {
    setLoading(true);
    setError(null);
    leaveService.getAllLeaveRequests({ page: pagination.page, limit: pagination.limit })
      .then(res => {
        setLeaves(res.data);
        if (res.pagination) setPagination(res.pagination);
      })
      .catch(() => setError('Failed to load leave requests'))
      .finally(() => setLoading(false));
  }, [pagination.page, pagination.limit, refresh]);

  // Approve/Reject handlers
  const handleAction = async (leaveId: string, status: 'Approved' | 'Declined') => {
    try {
      setLoading(true);
      await leaveService.updateLeaveRequest(leaveId, { status });
      message.success(`Leave ${status.toLowerCase()} successfully`);
      setRefresh(r => r + 1);
    } catch {
      message.error('Failed to update leave status');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeId',
      render: (emp: any) => emp ? (
        <div className="d-flex align-items-center file-name-icon">
          <span className="avatar avatar-md border avatar-rounded" style={{ width: 40, height: 40, overflow: 'hidden', display: 'inline-block', borderRadius: '50%' }}>
            <ImageWithBasePath
              src={
                emp.profileImage
                  ? (emp.profileImage.startsWith('http') || emp.profileImage.startsWith('/assets'))
                    ? emp.profileImage
                    : `/uploads/${emp.profileImage}`
                  : '/assets/img/users/default.jpg'
              }
              alt="img"
              width={40}
              height={40}
              style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%', display: 'block' }}
            />
          </span>
          <div className="ms-2">
            <h6 className="fw-medium mb-0">{emp.firstName} {emp.lastName}</h6>
            <span className="fs-12 fw-normal">{emp.designation || ''}</span>
          </div>
        </div>
      ) : '-',
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
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
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string) => (
        <span className={`badge ${
          text === 'Approved' ? 'bg-success' :
          text === 'Declined' ? 'bg-danger' :
          text === 'Cancelled' ? 'bg-secondary' : 'bg-purple'}`}>{text}</span>
      ),
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      render: (_: any, record: LeaveRecord) => (
        <>
          <Button
            type="primary"
            size="small"
            disabled={record.status !== 'New'}
            onClick={() => handleAction(record._id, 'Approved')}
            style={{ marginRight: 8 }}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            disabled={record.status !== 'New'}
            onClick={() => handleAction(record._id, 'Declined')}
          >
            Reject
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Leave Approval</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Admin</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Leave Approval
                  </li>
                </ol>
              </nav>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Leave Requests</h5>
                  </div>
            <div className="card-body p-0">
              {error && <div className="alert alert-danger">{error}</div>}
              <Spin spinning={loading} tip="Loading...">
                <Table
                  dataSource={leaves}
                  columns={columns}
                  rowKey="_id"
                />
              </Spin>
                </div>
              </div>
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
    </>
  );
};

export default LeaveAdmin;
