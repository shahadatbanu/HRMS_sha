import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from "../../../core/common/dataTable/index";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from '../../router/all_routes';
import axios from 'axios';
import { useUser } from '../../../core/context/UserContext';
import { useNavigate } from 'react-router-dom';

declare const process: { env: { [key: string]: string | undefined } };

// Define interfaces
interface TeamLead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  department: string;
  profileImage?: string;
  status: string;
  joiningDate: string;
  recruiters: Recruiter[];
}

interface Recruiter {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  department: string;
  profileImage?: string;
  status: string;
  joiningDate: string;
  teamLeadId: string;
}

interface TeamLeadTableRow {
  key: string;
  EmpId: string;
  Name: string;
  Email: string;
  Phone: string;
  Designation: string;
  Department: string;
  JoiningDate: string;
  Status: string;
  Image: string;
  RecruitersCount: number;
  Recruiters: Recruiter[];
}

const ManageTeamLeads = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [teamLeads, setTeamLeads] = useState<TeamLeadTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamLead, setSelectedTeamLead] = useState<TeamLead | null>(null);
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [showAddRecruiterModal, setShowAddRecruiterModal] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Fetch team leads data
  useEffect(() => {
    fetchTeamLeads();
  }, []);

  const fetchTeamLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/employees/team-leads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const mappedData = response.data.map((teamLead: any) => ({
        key: teamLead._id,
        EmpId: teamLead.employeeId,
        Name: `${teamLead.firstName} ${teamLead.lastName}`,
        Email: teamLead.email,
        Phone: teamLead.phoneNumber,
        Designation: teamLead.designation,
        Department: teamLead.department,
        JoiningDate: teamLead.joiningDate ? new Date(teamLead.joiningDate).toLocaleDateString() : '',
        Status: teamLead.status || 'Active',
        Image: teamLead.profileImage ? `${BACKEND_URL}/uploads/${teamLead.profileImage}` : 'assets/img/users/user-01.jpg',
        RecruitersCount: teamLead.recruiters?.length || 0,
        Recruiters: teamLead.recruiters || []
      }));

      setTeamLeads(mappedData);
    } catch (error: any) {
      console.error('Error fetching team leads:', error);
      setError(error.response?.data?.message || 'Failed to fetch team leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruitersForTeamLead = async (teamLeadId: string) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/employees/recruiters/${teamLeadId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRecruiters(response.data);
    } catch (error: any) {
      console.error('Error fetching recruiters:', error);
      setError(error.response?.data?.message || 'Failed to fetch recruiters');
    }
  };

  const handleViewRecruiters = (record: TeamLeadTableRow) => {
    const teamLead = teamLeads.find(tl => tl.key === record.key);
    if (teamLead) {
      setSelectedTeamLead(teamLead as any);
      setRecruiters(teamLead.Recruiters);
      setShowRecruiterModal(true);
    }
  };

  const handleAddRecruiter = () => {
    setEditingRecruiter(null);
    setShowAddRecruiterModal(true);
  };

  const handleEditRecruiter = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setShowAddRecruiterModal(true);
  };

  const handleDeleteRecruiter = async (recruiterId: string) => {
    if (window.confirm('Are you sure you want to delete this recruiter?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/employees/recruiters/${recruiterId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Refresh data
        fetchTeamLeads();
        if (selectedTeamLead) {
          fetchRecruitersForTeamLead(selectedTeamLead._id);
        }
        
        alert('Recruiter deleted successfully');
      } catch (error: any) {
        console.error('Error deleting recruiter:', error);
        alert(error.response?.data?.message || 'Failed to delete recruiter');
      }
    }
  };

  const columns = [
    {
      title: "Emp ID",
      dataIndex: "EmpId",
      sorter: (a: any, b: any) => a.EmpId.length - b.EmpId.length,
    },
    {
      title: "Name",
      dataIndex: "Name",
      render: (text: string, record: any) => (
        <div className="d-flex align-items-center">
          <ImageWithBasePath
            src={record.Image}
            alt="User"
            className="avatar avatar-sm rounded-circle me-2"
          />
          <div>
            <h6 className="mb-0">{text}</h6>
            <small className="text-muted">{record.Email}</small>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: any, b: any) => a.Phone.length - b.Phone.length,
    },
    {
      title: "Designation",
      dataIndex: "Designation",
      sorter: (a: any, b: any) => a.Designation.length - b.Designation.length,
    },
    {
      title: "Department",
      dataIndex: "Department",
      sorter: (a: any, b: any) => a.Department.length - b.Department.length,
    },
    {
      title: "Joining Date",
      dataIndex: "JoiningDate",
      sorter: (a: any, b: any) => a.JoiningDate.length - b.JoiningDate.length,
    },
    {
      title: "Recruiters",
      dataIndex: "RecruitersCount",
      render: (count: number, record: any) => (
        <span className="badge badge-primary">{count}</span>
      ),
      sorter: (a: any, b: any) => a.RecruitersCount - b.RecruitersCount,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string, record: any) => (
        <span className={`badge ${text === 'Active' ? 'badge-success' : 'badge-danger'} d-inline-flex align-items-center badge-xs`}>
          <i className="ti ti-point-filled me-1" />
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text: string, record: any) => (
        <div className="d-flex align-items-center">
          <button
            className="btn btn-sm btn-outline-primary me-2"
            onClick={() => handleViewRecruiters(record)}
            title="View Recruiters"
          >
            <i className="ti ti-eye"></i>
          </button>
        </div>
      ),
    },
  ];

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading team leads...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if user is not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <i className="ti ti-shield-x fs-1 text-danger mb-3"></i>
            <h4 className="text-danger">Access Denied</h4>
            <p className="text-muted">You don't have permission to access this page.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Breadcrumb */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Manage Team Leads</h4>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to={all_routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Manage Team Leads</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="ti ti-alert-circle me-2"></i>
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* Team Leads Table */}
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <Table
                columns={columns}
                dataSource={teamLeads}  
              />
            </div>
          </div>
        </div>

        {/* Recruiters Modal */}
        {showRecruiterModal && selectedTeamLead && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Recruiters under {selectedTeamLead.firstName} {selectedTeamLead.lastName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRecruiterModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Recruiters ({recruiters.length})</h6>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAddRecruiter}
                    >
                      <i className="ti ti-plus me-1"></i>
                      Add Recruiter
                    </button>
                  </div>
                  
                  {recruiters.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="ti ti-users fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No recruiters assigned to this team lead.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recruiters.map((recruiter) => (
                            <tr key={recruiter._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <ImageWithBasePath
                                    src={recruiter.profileImage ? `${BACKEND_URL}/uploads/${recruiter.profileImage}` : 'assets/img/users/user-01.jpg'}
                                    alt="User"
                                    className="avatar avatar-sm rounded-circle me-2"
                                  />
                                  <div>
                                    <h6 className="mb-0">{recruiter.firstName} {recruiter.lastName}</h6>
                                    <small className="text-muted">{recruiter.designation}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{recruiter.email}</td>
                              <td>{recruiter.phoneNumber}</td>
                              <td>
                                <span className={`badge ${recruiter.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                                  {recruiter.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex">
                                  <button
                                    className="btn btn-sm btn-outline-primary me-1"
                                    onClick={() => handleEditRecruiter(recruiter)}
                                    title="Edit"
                                  >
                                    <i className="ti ti-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteRecruiter(recruiter._id)}
                                    title="Delete"
                                  >
                                    <i className="ti ti-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRecruiterModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Recruiter Modal */}
        {showAddRecruiterModal && (
          <AddEditRecruiterModal
            teamLeadId={selectedTeamLead?._id || ''}
            recruiter={editingRecruiter}
            onClose={() => {
              setShowAddRecruiterModal(false);
              setEditingRecruiter(null);
            }}
            onSuccess={() => {
              fetchTeamLeads();
              if (selectedTeamLead) {
                fetchRecruitersForTeamLead(selectedTeamLead._id);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

// Add/Edit Recruiter Modal Component
interface AddEditRecruiterModalProps {
  teamLeadId: string;
  recruiter?: Recruiter | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEditRecruiterModal: React.FC<AddEditRecruiterModalProps> = ({
  teamLeadId,
  recruiter,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    firstName: recruiter?.firstName || '',
    lastName: recruiter?.lastName || '',
    email: recruiter?.email || '',
    phoneNumber: recruiter?.phoneNumber || '',
    designation: recruiter?.designation || 'Recruiter',
    department: recruiter?.department || '',
    password: '',
    employeeId: '',
    username: '',
    joiningDate: recruiter?.joiningDate ? new Date(recruiter.joiningDate).toISOString().split('T')[0] : '',
    status: recruiter?.status || 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        role: 'employee',
        teamLeadId,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : new Date().toISOString()
      };

      if (recruiter) {
        // Update existing recruiter
        await axios.put(`${BACKEND_URL}/api/employees/recruiters/${recruiter._id}`, submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('Recruiter updated successfully');
      } else {
        // Create new recruiter
        await axios.post(`${BACKEND_URL}/api/employees/recruiters`, submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('Recruiter added successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving recruiter:', error);
      setError(error.response?.data?.message || 'Failed to save recruiter');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {recruiter ? 'Edit Recruiter' : 'Add New Recruiter'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="ti ti-alert-circle me-2"></i>
                  {error}
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>First Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Last Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Phone Number <span className="text-danger">*</span></label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Employee ID <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      disabled={!!recruiter}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Username <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={!!recruiter}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {!recruiter && (
                <div className="form-group">
                  <label>Password <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {recruiter ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  recruiter ? 'Update Recruiter' : 'Add Recruiter'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageTeamLeads;
