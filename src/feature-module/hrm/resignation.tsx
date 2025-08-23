import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../core/common/dataTable/index';
import { all_routes } from '../router/all_routes';
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import CommonSelect, { Option } from '../../core/common/commonSelect';
import { DatePicker, message } from 'antd';
import CollapseHeader from '../../core/common/collapse-header/collapse-header';
import axios from 'axios';
import dayjs from 'dayjs';
import { useUser } from '../../core/context/UserContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Resignation = () => {
  const { user, isLoading } = useUser();
  const [resignationData, setResignationData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Option | undefined>(undefined);
  const [noticeDate, setNoticeDate] = useState<any>(null);
  const [resignationDate, setResignationDate] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingResignation, setEditingResignation] = useState<any>(null);
  const [editEmployee, setEditEmployee] = useState<Option | undefined>(undefined);
  const [editNoticeDate, setEditNoticeDate] = useState<any>(null);
  const [editResignationDate, setEditResignationDate] = useState<any>(null);
  const [editReason, setEditReason] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingResignation, setDeletingResignation] = useState<any>(null);

  // Fetch resignations
  const fetchResignations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/resignation`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setResignationData(res.data.data || []);
    } catch (err) {
      message.error('Failed to fetch resignations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch non-resigned employees for dropdown
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Only show employees who are not resigned
      setEmployees(res.data.filter((emp: any) => !emp.resigned).map((emp: any) => ({ label: emp.firstName + ' ' + emp.lastName, value: emp._id })));
    } catch (err) {
      message.error('Failed to fetch employees');
    }
  };

  useEffect(() => {
    fetchResignations();
    fetchEmployees();
  }, []);

  if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'hr'))) {
    return <div className="container mt-5"><div className="alert alert-danger">You do not have permission to access this page.</div></div>;
  }

  // Add Resignation
  const handleAddResignation = async () => {
    if (!selectedEmployee || !resignationDate) {
      message.warning('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/resignation`, {
        employeeId: selectedEmployee.value,
        noticeDate: noticeDate ? noticeDate.toISOString() : undefined,
        resignationDate: resignationDate.toISOString(),
        reason,
        description,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Resignation added');
      setAddModalVisible(false);
      setSelectedEmployee(undefined);
      setNoticeDate(null);
      setResignationDate(null);
      setReason('');
      setDescription('');
      fetchResignations();
      fetchEmployees();
    } catch (err) {
      message.error('Failed to add resignation');
    } finally {
      setLoading(false);
    }
  };

  // Edit Resignation
  const handleEditResignation = (record: any) => {
    setEditingResignation(record);
    setEditEmployee(record.employee ? { label: record.employee.firstName + ' ' + record.employee.lastName, value: record.employee._id } : undefined);
    setEditNoticeDate(record.noticeDate ? dayjs(record.noticeDate) : null);
    setEditResignationDate(record.resignationDate ? dayjs(record.resignationDate) : null);
    setEditReason(record.reason || '');
    setEditDescription(record.description || '');
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResignation) return;
    setLoading(true);
    try {
      await axios.put(`${BACKEND_URL}/api/resignation/${editingResignation._id}`, {
        noticeDate: editNoticeDate ? editNoticeDate.toISOString() : undefined,
        resignationDate: editResignationDate ? editResignationDate.toISOString() : undefined,
        reason: editReason,
        description: editDescription,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Resignation updated');
      setEditModalVisible(false);
      setEditingResignation(null);
      fetchResignations();
    } catch (err) {
      message.error('Failed to update resignation');
    } finally {
      setLoading(false);
    }
  };

  // Delete Resignation
  const handleDeleteResignation = (record: any) => {
    setDeletingResignation(record);
    setDeleteModalVisible(true);
  };

  const confirmDeleteResignation = async () => {
    if (!deletingResignation) return;
    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/resignation/${deletingResignation._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Resignation deleted');
      setDeleteModalVisible(false);
      setDeletingResignation(null);
      fetchResignations();
      fetchEmployees();
    } catch (err) {
      message.error('Failed to delete resignation');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Resigning Employee',
      dataIndex: 'employee',
      render: (emp: any) => emp ? (
        <div className="d-flex align-items-center">
          <span className="avatar avatar-md me-2">
            <ImageWithBasePath
              src={emp.profileImage ? `${BACKEND_URL}/uploads/${emp.profileImage}` : `${BACKEND_URL}/uploads/default.jpg`}
              className="rounded-circle"
              alt="user"
            />
          </span>
          <h6 className="fw-medium mb-0">{emp.firstName} {emp.lastName}</h6>
        </div>
      ) : '-',
    },
    {
      title: 'Department',
      dataIndex: 'employee',
      render: (emp: any) => emp?.department || '-',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
    },
    {
      title: 'Notice Date',
      dataIndex: 'noticeDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Resignation Date',
      dataIndex: 'resignationDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: any) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-link p-0"
            title="Edit"
            onClick={() => handleEditResignation(record)}
          >
            <i className="ti ti-edit me-1" />
          </button>
          <button
            className="btn btn-link text-danger p-0"
            title="Delete"
            onClick={() => handleDeleteResignation(record)}
          >
            <i className="ti ti-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Resignation</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Performance</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Resignation
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2">
                <button
                  className="btn btn-primary d-flex align-items-center"
                  onClick={() => setAddModalVisible(true)}
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Resignation
                </button>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                  <h5 className="d-flex align-items-center">Resignation List</h5>
                </div>
                <div className="card-body p-0">
                  <Table dataSource={resignationData} columns={columns} rowKey="_id" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between bg-white border-top p-3">
          <p className="mb-0">2014 - 2025 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* Add Resignation Modal */}
      {addModalVisible && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Resignation</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  aria-label="Close"
                  onClick={() => setAddModalVisible(false)}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleAddResignation();
                }}
              >
                <div className="modal-body pb-0">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Resigning Employee</label>
                        <CommonSelect
                          className="select"
                          options={employees}
                          value={selectedEmployee}
                          onChange={opt => setSelectedEmployee(opt || undefined)}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Notice Date</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          value={noticeDate}
                          onChange={setNoticeDate}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Resignation Date</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          value={resignationDate}
                          onChange={setResignationDate}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Reason</label>
                        <input
                          type="text"
                          className="form-control"
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-white border me-2" onClick={() => setAddModalVisible(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Resignation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Edit Resignation Modal */}
      {editModalVisible && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Resignation</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  aria-label="Close"
                  onClick={() => setEditModalVisible(false)}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body pb-0">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Notice Date</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          value={editNoticeDate}
                          onChange={setEditNoticeDate}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Resignation Date</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          value={editResignationDate}
                          onChange={setEditResignationDate}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Reason</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editReason}
                          onChange={e => setEditReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditModalVisible(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Delete Confirmation</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  aria-label="Close"
                  onClick={() => setDeleteModalVisible(false)}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this resignation?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalVisible(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDeleteResignation} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Resignation;
