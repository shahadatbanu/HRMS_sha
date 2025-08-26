import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Table from "../../core/common/dataTable/index";
import { all_routes } from '../router/all_routes';
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import { terminationtype } from '../../core/common/selectoption/selectoption';
import CommonSelect, { Option } from '../../core/common/commonSelect';
import { DatePicker, Modal, message, Button } from "antd";
import CollapseHeader from '../../core/common/collapse-header/collapse-header';
import axios from 'axios';
import dayjs from 'dayjs';
import { useUser } from '../../core/context/UserContext';

// Bootstrap Modal type fix
// Minimal type for Bootstrap Modal
// (TypeScript will not complain about construct signature)
type BootstrapModal = {
  getInstance: (element: Element) => any;
  new (element: Element): { hide: () => void };
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Termination = () => {
  const { user, isLoading } = useUser();
  const [terminatedData, setTerminatedData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Option | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<Option | undefined>(undefined);
  const [noticeDate, setNoticeDate] = useState<any>(null);
  const [terminationDate, setTerminationDate] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTermination, setEditingTermination] = useState<any>(null);
  const [editTerminationType, setEditTerminationType] = useState<Option | undefined>(undefined);
  const [editNoticeDate, setEditNoticeDate] = useState<any>(null);
  const [editTerminationDate, setEditTerminationDate] = useState<any>(null);
  const [editReason, setEditReason] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingTermination, setDeletingTermination] = useState<any>(null);

  // Fetch terminated employees for the table
  const fetchTerminated = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/termination`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTerminatedData(res.data.data || []);
    } catch (err) {
      message.error('Failed to fetch terminated employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active employees for the dropdown
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/employees?activeOnly=true`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Non-terminated employees:', res.data); // Debug log
      setEmployees(res.data.map((emp: any) => ({ label: emp.firstName + ' ' + emp.lastName, value: emp._id })));
    } catch (err) {
      message.error('Failed to fetch employees');
    }
  };

  useEffect(() => {
    fetchTerminated();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (editingTermination) {
      setEditTerminationType(
        terminationtype.find(opt => opt.value === editingTermination.terminationType)
      );
      setEditNoticeDate(editingTermination.noticeDate ? (editNoticeDate && editNoticeDate.constructor && editNoticeDate.constructor.name === 'Dayjs' ? editNoticeDate : dayjs(editingTermination.noticeDate)) : null);
      setEditTerminationDate(editingTermination.terminationDate ? (editTerminationDate && editTerminationDate.constructor && editTerminationDate.constructor.name === 'Dayjs' ? editTerminationDate : dayjs(editingTermination.terminationDate)) : null);
      setEditReason(editingTermination.reason || '');
      setEditDescription(editingTermination.description || '');
    }
    // eslint-disable-next-line
  }, [editingTermination]);

  if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'hr'))) {
    return <div className="container mt-5"><div className="alert alert-danger">You do not have permission to access this page.</div></div>;
  }

  // Add Termination handler
  const handleAddTermination = async () => {
    if (!selectedEmployee || !selectedType || !terminationDate) {
      message.warning('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/termination`, {
        employeeId: selectedEmployee.value,
        terminationType: selectedType.value,
        noticeDate: noticeDate ? noticeDate.toISOString() : undefined,
        terminationDate: terminationDate.toISOString(),
        reason,
        description,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Termination added');
      window.setTimeout(() => {
        const modal = document.getElementById('new_termination');
        const Modal = (window.bootstrap as any)?.Modal;
        if (Modal && modal) {
          let modalInstance = Modal.getInstance(modal);
          if (!modalInstance && typeof Modal === 'function') {
            try {
              modalInstance = new Modal(modal);
            } catch (e) {
              // fallback: hide via jQuery if available
              if ((window as any).$) (window as any).$(modal).modal('hide');
            }
          }
          if (modalInstance && typeof modalInstance.hide === 'function') {
            modalInstance.hide();
          }
        }
      }, 100);
      setSelectedEmployee(undefined);
      setSelectedType(undefined);
      setNoticeDate(null);
      setTerminationDate(null);
      setReason('');
      setDescription('');
      fetchTerminated();
      fetchEmployees();
    } catch (err) {
      message.error('Failed to add termination');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTermination) return;
    setLoading(true);
    try {
      await axios.put(`${BACKEND_URL}/api/termination/${editingTermination._id}`, {
        terminationType: editTerminationType?.value,
        noticeDate: editNoticeDate ? editNoticeDate.toISOString() : undefined,
        terminationDate: editTerminationDate ? editTerminationDate.toISOString() : undefined,
        reason: editReason,
        description: editDescription,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Termination updated');
      setEditModalVisible(false);
      setEditingTermination(null);
      fetchTerminated();
    } catch (err) {
      message.error('Failed to update termination');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for CommonSelect
  const handleEmployeeChange = (option: Option | null) => setSelectedEmployee(option || undefined);
  const handleTypeChange = (option: Option | null) => setSelectedType(option || undefined);

  const handleEditTermination = (record: any) => {
    setEditingTermination(record);
    setEditModalVisible(true);
  };

  const handleDeleteTermination = (record: any) => {
    setDeletingTermination(record);
    setDeleteModalVisible(true);
  };

  const confirmDeleteTermination = async () => {
    if (!deletingTermination) return;
    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/termination/${deletingTermination._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Also set employee.terminated = false
      if (deletingTermination.employee && deletingTermination.employee._id) {
        await axios.put(`${BACKEND_URL}/api/employees/${deletingTermination.employee._id}`, {
          terminated: false,
          status: 'Active',
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      message.success("Termination deleted");
      setDeleteModalVisible(false);
      setDeletingTermination(null);
      fetchTerminated();
      fetchEmployees();
    } catch (err) {
      message.error("Failed to delete termination");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "employee",
      render: (emp: any) => emp ? (
        <div className="d-flex align-items-center">
          <ImageWithBasePath
            src={emp.profileImage ? `${BACKEND_URL}/uploads/${emp.profileImage}` : `${BACKEND_URL}/uploads/default.jpg`}
            className="rounded-circle me-2"
            alt="user"
            style={{ width: 48, height: 48, objectFit: 'cover', border: '2px solid #eee', background: '#f3f3f3' }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{emp.email}</div>
          </div>
        </div>
      ) : '-',
    },
    {
      title: "Termination Type",
      dataIndex: "terminationType",
    },
    {
      title: "Notice Date",
      dataIndex: "noticeDate",
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: "Termination Date",
      dataIndex: "terminationDate",
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: "Reason",
      dataIndex: "reason",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-link p-0"
            title="Edit"
            onClick={() => handleEditTermination(record)}
          >
            <i className="ti ti-edit me-1" />
          </button>
          <button
            className="btn btn-link text-danger p-0"
            title="Delete"
            onClick={() => handleDeleteTermination(record)}
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
              <h2 className="mb-1">Termination</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Performance</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Termination
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="mb-2">
                <Link
                  to="#"
                  className="btn btn-primary d-flex align-items-center"
                  data-bs-toggle="modal"
                  data-bs-target="#new_termination"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Termination
                </Link>
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
                  <h5 className="d-flex align-items-center">Terminated Employees</h5>
                </div>
                <div className="card-body p-0">
                  <Table dataSource={terminatedData} columns={columns} rowKey="_id" />
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
      {/* Add Termination (Bootstrap modal, theme style) */}
      <div className="modal fade" id="new_termination" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Termination</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAddTermination();
              }}
            >
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Non-Terminated Employee</label>
                      <CommonSelect
                        className="select"
                        options={employees}
                        value={selectedEmployee}
                        onChange={handleEmployeeChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Termination Type</label>
                      <CommonSelect
                        className="select"
                        options={terminationtype}
                        value={selectedType}
                        onChange={handleTypeChange}
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
                      <label className="form-label">Termination Date</label>
                      <DatePicker
                        className="form-control datetimepicker"
                        value={terminationDate}
                        onChange={setTerminationDate}
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
                <button
                  type="button"
                  className="btn btn-white border me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Termination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {editModalVisible && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Termination</h4>
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
                        <label className="form-label">Termination Type</label>
                        <CommonSelect
                          className="select"
                          options={terminationtype}
                          value={editTerminationType}
                          onChange={opt => setEditTerminationType(opt || undefined)}
                        />
                      </div>
                    </div>
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
                        <label className="form-label">Termination Date</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          value={editTerminationDate}
                          onChange={setEditTerminationDate}
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
                <p>Are you sure you want to delete this termination?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalVisible(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDeleteTermination} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Termination
