import React, { useState } from 'react'
import { all_routes } from '../../router/all_routes'
import { Link } from 'react-router-dom'
import Table from "../../../core/common/dataTable/index";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import PredefinedDateRanges from '../../../core/common/datePicker';
// import { employee_list_details } from '../../../core/data/json/employees_list_details';
import { DatePicker } from 'antd';
import CommonSelect from '../../../core/common/commonSelect';
import { getDesignations } from '../../../core/services/designationService';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import axios from 'axios';
import dayjs from 'dayjs';
type PasswordField = "password" | "confirmPassword";

declare const process: { env: { [key: string]: string | undefined } };

// Define the mapped employee type
interface EmployeeTableRow {
  key: string;
  EmpId: string;
  Name: string;
  Email: string;
  Phone: string;
  Designation: string;
  JoiningDate: string;
  JoiningDateISO?: string;
  Status: string;
  Image: string;
  CurrentRole: string;
}

const EmployeeList = () => {

  // const data = employee_list_details;
  // Instead, fetch from backend:
  const [data, setData] = useState<EmployeeTableRow[]>([]);
  const [filterDesignation, setFilterDesignation] = useState<string>('Select');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    newJoiners: 0,
    totalChange: '+19.01%',
    activeChange: '+19.01%',
    inactiveChange: '+19.01%',
    newJoinersChange: '+19.01%'
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Reusable mapping function
  const mapEmployeeData = (employees: any[]) => employees.map((emp: any) => ({
    key: emp._id,
    EmpId: emp.employeeId,
    Name: emp.firstName + ' ' + emp.lastName,
    Email: emp.email,
    Phone: emp.phoneNumber,
    Designation: emp.designation,
    JoiningDate: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '',
    JoiningDateISO: emp.joiningDate || undefined,
    Status: emp.status || 'Active',
    Image: emp.profileImage ? `${BACKEND_URL}/uploads/${emp.profileImage}` : '/assets/img/users/user-01.jpg',
    CurrentRole: emp.designation || '',
  }));

  const [filterDateRange, setFilterDateRange] = useState<{ start: dayjs.Dayjs | null; end: dayjs.Dayjs | null }>({ start: null, end: null });
  const [applyDateFilter, setApplyDateFilter] = useState<boolean>(false);

  const filteredData = React.useMemo(() => {
    let result = data;
    if (filterDesignation && filterDesignation !== 'Select') {
      result = result.filter((row) => row.Designation === filterDesignation);
    }
    if (filterStatus) {
      result = result.filter((row) => row.Status === filterStatus);
    }
    if (applyDateFilter && filterDateRange.start && filterDateRange.end) {
      const start = filterDateRange.start.startOf('day');
      const end = filterDateRange.end.endOf('day');
      result = result.filter((row) => {
        if (!row.JoiningDateISO) return false;
        const d = dayjs(row.JoiningDateISO);
        return d.isValid() && (d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end));
      });
    }
    return result;
  }, [data, filterDesignation, filterStatus, filterDateRange, applyDateFilter]);

  React.useEffect(() => {
    // Fetch employee data from backend
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        console.log('Raw employee data from backend:', res.data);
        const mapped = mapEmployeeData(res.data);
        console.log('Mapped employee data for table:', mapped);
        setData(mapped);
      })
      .catch(err => {
        // Optionally handle error
        setData([]);
      });

    // Fetch dashboard statistics
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees/stats/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        setDashboardStats(res.data);
        console.log('Dashboard stats:', res.data); // Debug
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
      });
  }, []);


  const columns = [
    {
      title: "Emp ID",
      dataIndex: "EmpId",
      render: (text: String, record: any) => (
        <Link to={`${all_routes.employeedetails}/${record.key}`}>{text}</Link>
      ),
      sorter: (a: any, b: any) => a.EmpId.length - b.EmpId.length,
    },
    {
      title: "Name",
      dataIndex: "Name",
      render: (text: string, record: any) => (
        <div className="d-flex align-items-center">
          <Link
            to={`${all_routes.employeedetails}/${record.key}`}
            className="avatar avatar-md"
            
          >
            <img 
              src={record.Image} 
              alt="img" 
              className="img-fluid rounded-circle"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Link>
          <div className="ms-2">
            <p className="text-dark mb-0">
              <Link
                to={`${all_routes.employeedetails}/${record.key}`}
                
              >
                {record.Name}
              </Link>
            </p>
            <span className="fs-12">{record.CurrentRole}</span>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.Name.length - b.Name.length,
    },
    {
      title: "Email",
      dataIndex: "Email",
      sorter: (a: any, b: any) => a.Email.length - b.Email.length,
    },
    {
      title: "Phone",
      dataIndex: "Phone",
      sorter: (a: any, b: any) => a.Phone.length - b.Phone.length,
    },
    {
      title: "Designation",
      dataIndex: "Designation",
      render: (text: string, record: any) => (
        <div className="dropdown me-3">
          <Link
            to="#"
            className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
            data-bs-toggle="dropdown"
          >
            {record.Designation}
          </Link>
          <ul className="dropdown-menu  dropdown-menu-end p-3">
            <li>
              <Link to="#" className="dropdown-item rounded-1">
                Developer
              </Link>
            </li>
            <li>
              <Link to="#" className="dropdown-item rounded-1">
                Executive
              </Link>
            </li>
          </ul>
        </div>
      ),
      sorter: (a: any, b: any) => a.Designation.length - b.Designation.length,
    },
    {
      title: "Joining Date",
      dataIndex: "JoiningDate",
      sorter: (a: any, b: any) => a.JoiningDate.length - b.JoiningDate.length,
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
      title: "",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <div className="action-icon d-inline-flex">
          <Link
            to="#"
            className="me-2"
            data-bs-toggle="modal" data-inert={true}
            data-bs-target="#edit_employee"
            onClick={() => handleEditClick(record)}
          >
            <i className="ti ti-edit" />
          </Link>
          <Link
            to="#"
            data-bs-toggle="modal"
            data-inert={true}
            data-bs-target="#delete_modal"
            onClick={() => setSelectedEmployee(record)}
          >
            <i className="ti ti-trash" />
          </Link>
        </div>
      ),
    },
  ]

  const department = [
    { value: "Select", label: "Select" },
    { value: "All Department", label: "All Department" },
    { value: "Finance", label: "Finance" },
    { value: "Developer", label: "Developer" },
    { value: "Executive", label: "Executive" },
  ];
  const [designationOptions, setDesignationOptions] = useState<{ value: string; label: string }[]>([
    { value: "Select", label: "Select" },
  ]);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getDesignations();
        if (!isMounted) return;
        const options = Array.isArray(res)
          ? [{ value: 'Select', label: 'Select' }, ...res.filter((d: any) => d?.status !== 'Inactive').map((d: any) => ({ value: d.name, label: d.name }))]
          : [{ value: 'Select', label: 'Select' }];
        setDesignationOptions(options);
      } catch (e) {
        setDesignationOptions([{ value: 'Select', label: 'Select' }]);
      }
    })();
    return () => { isMounted = false };
  }, []);

  const getModalContainer = () => {
    const modalElement = document.getElementById('modal-datepicker');
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // --- Integration for Add/Edit/Delete Employee (Backend) ---
  const [form, setForm] = useState<Record<string, any>>({}); // For add/edit modal
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null); // For edit/delete
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'add' | 'edit' | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false); // For delete success modal
  
  // Force re-render of CommonSelect components when form changes
  const [selectKey, setSelectKey] = useState(0);
  
  React.useEffect(() => {
    setSelectKey(prev => prev + 1);
  }, [form.department, form.designation]);

  // Helper to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as any;
    
    if (type === 'file' && files && files[0]) {
      // Handle file upload with preview
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert('File size must be less than 4MB');
        return;
      }
      
      setForm(prev => ({ ...prev, [name]: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'file' ? files[0] : value
      }));
    }
  };

  // Helper to refresh dashboard stats
  const refreshDashboardStats = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees/stats/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDashboardStats(res.data);
    } catch (err) {
      console.error('Error refreshing dashboard stats:', err);
    }
  };

  // Helper to clear form and preview
  const clearForm = () => {
    setForm({});
    setImagePreview(null);
    setSelectedEmployee(null);
  };

  // Helper to populate form with employee data for editing
  const populateFormWithEmployee = (employee: any) => {
    // Log the raw value for debugging
    console.log('Raw employee.JoiningDate:', employee.JoiningDate);

    // Try to parse with multiple formats, fallback to native
    let joiningDate = '';
    if (employee.JoiningDate) {
      let parsed = dayjs(employee.JoiningDate, ['DD-MM-YYYY', 'M/D/YYYY', 'MM/DD/YYYY'], true);
      if (!parsed.isValid()) {
        parsed = dayjs(employee.JoiningDate); // fallback to native parse (ISO, timestamp, etc)
      }
      joiningDate = parsed.isValid() ? parsed.format('DD-MM-YYYY') : '';
    }
    const formData = {
      firstName: employee.Name.split(' ')[0] || '',
      lastName: employee.Name.split(' ').slice(1).join(' ') || '',
      employeeId: employee.EmpId || '',
      joiningDate,
      username: employee.Email?.split('@')[0] || '',
      email: employee.Email || '',
      phoneNumber: employee.Phone || '',
      company: 'Company Name', // Default value since not in table data
      department: employee.Designation || '',
      designation: employee.Designation || '',
      status: employee.Status || 'Active',
      about: 'Employee description', // Default value since not in table data
    };
    
    setForm(formData);
    
    // Set image preview if available
    if (employee.Image && employee.Image !== '/assets/img/users/user-01.jpg') {
      setImagePreview(employee.Image);
    } else {
      setImagePreview(null);
    }
  };

  // Handle edit button click
  const handleEditClick = (employee: any) => {
    setSelectedEmployee(employee);
    populateFormWithEmployee(employee);
  };

  // Add Employee
  const handleAddEmployee = async () => {
    setLoading(true);
    // Required fields check
    const requiredFields = [
      'firstName', 'lastName', 'employeeId', 'joiningDate', 'username', 'email', 'password', 'phoneNumber', 'company', 'department', 'designation'
    ];
    for (const field of requiredFields) {
      if (!form[field]) {
        alert(`Please fill the required field: ${field}`);
        setLoading(false);
        return;
      }
    }
    try {
      await addEmployeeRequest(form);
      setSuccessType('add');
      setShowSuccess(true);
      // Do not clear form or refresh list yet
    } catch (err: any) {
      console.error('Error adding employee:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (typeof err === 'string' ? err : 'Failed to add employee');
      alert(errorMessage);
    }
    setLoading(false);
  };

  // Edit Employee
  const handleEditEmployee = async () => {
    setLoading(true);
    // Required fields check
    const requiredFields = [
      'firstName', 'lastName', 'employeeId', 'joiningDate', 'username', 'email', 'phoneNumber', 'company', 'department', 'designation'
    ];
    for (const field of requiredFields) {
      if (!form[field]) {
        alert(`Please fill the required field: ${field}`);
        setLoading(false);
        return;
      }
    }
    if (!selectedEmployee) return;
    try {
      // Use selectedEmployee.key (which is the MongoDB _id)
      await editEmployeeRequest(selectedEmployee.key, form);
      setSuccessType('edit');
      setShowSuccess(true);
      // Do not clear form or refresh list yet
    } catch (err: any) {
      console.error('Error editing employee:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (typeof err === 'string' ? err : 'Failed to edit employee');
      alert(errorMessage);
    }
    setLoading(false);
  };

  // Delete Employee
  const handleDeleteEmployee = async (id: string) => {
    setLoading(true);
    try {
      await deleteEmployeeRequest(id);
      // Refresh list and stats
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then((res: any) => setData(mapEmployeeData(res.data)));
      await refreshDashboardStats();
      setShowDeleteSuccess(true); // Show delete success modal
      setTimeout(() => setShowDeleteSuccess(false), 2000); // Auto-close after 2s
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete employee';
      alert(errorMessage);
    }
    setLoading(false);
  };

  // Backend request helpers (use previous logic)
  const addEmployeeRequest = async (formData: Record<string, any>) => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string' || value instanceof Blob) {
        data.append(key, value as string | Blob);
      } else if (value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/employees`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  };
  const editEmployeeRequest = async (id: string, formData: Record<string, any>) => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string' || value instanceof Blob) {
        data.append(key, value as string | Blob);
      } else if (value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/employees/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  };
  const deleteEmployeeRequest = async (id: string) => {
    await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/employees/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  };

  // Add handlers for department and designation select changes
  const handleDepartmentChange = (option: { value: string; label: string } | null) => {
    setForm(prev => ({ ...prev, department: option ? option.value : '' }));
  };
  const handleDesignationChange = (option: { value: string; label: string } | null) => {
    setForm(prev => ({ ...prev, designation: option ? option.value : '' }));
  };

  // Handler for closing the success modal
  const handleSuccessModalClose = () => {
    setShowSuccess(false);
    setSuccessType(null);
    clearForm();
    // Refresh list and stats
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then((res: any) => setData(mapEmployeeData(res.data)));
    refreshDashboardStats();
  };

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const handleStatusChange = (option: { value: string; label: string } | null) => {
    setForm(prev => ({ ...prev, status: option ? option.value : '' }));
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Employee</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Employee List
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              {/* <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    to={all_routes.employeeList}
                    className="btn btn-icon btn-sm active bg-primary text-white me-1"
                  >
                    <i className="ti ti-list-tree" />
                  </Link>
                  <Link to={all_routes.employeeGrid} className="btn btn-icon btn-sm">
                    <i className="ti ti-layout-grid" />
                  </Link>
                </div>
              </div> */}
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
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#add_employee"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Employee
                </Link>
              </div>
              {/* <div className="head-icons ms-2">
                <CollapseHeader />
              </div> */}
            </div>
          </div>
          {/* /Breadcrumb */}
          <div className="row">
            {/* Total Plans */}
            <div className="col-lg-3 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center overflow-hidden">
                    <div>
                      <span className="avatar avatar-lg bg-dark rounded-circle">
                        <i className="ti ti-users" />
                      </span>
                    </div>
                    <div className="ms-2 overflow-hidden">
                      <p className="fs-12 fw-medium mb-1 text-truncate">
                        Total Employee
                      </p>
                      <h4>{dashboardStats.totalEmployees}</h4>
                    </div>
                  </div>
                  <div>
                    <span className="badge badge-soft-purple badge-sm fw-normal">
                      <i className="ti ti-arrow-wave-right-down" />
                      {dashboardStats.totalChange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* /Total Plans */}
            {/* Total Plans */}
            <div className="col-lg-3 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center overflow-hidden">
                    <div>
                      <span className="avatar avatar-lg bg-success rounded-circle">
                        <i className="ti ti-user-share" />
                      </span>
                    </div>
                    <div className="ms-2 overflow-hidden">
                      <p className="fs-12 fw-medium mb-1 text-truncate">Active</p>
                      <h4>{dashboardStats.activeEmployees}</h4>
                    </div>
                  </div>
                  <div>
                    <span className="badge badge-soft-primary badge-sm fw-normal">
                      <i className="ti ti-arrow-wave-right-down" />
                      {dashboardStats.activeChange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* /Total Plans */}
            {/* Inactive Plans */}
            <div className="col-lg-3 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center overflow-hidden">
                    <div>
                      <span className="avatar avatar-lg bg-danger rounded-circle">
                        <i className="ti ti-user-pause" />
                      </span>
                    </div>
                    <div className="ms-2 overflow-hidden">
                      <p className="fs-12 fw-medium mb-1 text-truncate">InActive</p>
                      <h4>{dashboardStats.inactiveEmployees}</h4>
                    </div>
                  </div>
                  <div>
                    <span className="badge badge-soft-dark badge-sm fw-normal">
                      <i className="ti ti-arrow-wave-right-down" />
                      {dashboardStats.inactiveChange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* /Inactive Companies */}
            {/* No of Plans  */}
            <div className="col-lg-3 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center overflow-hidden">
                    <div>
                      <span className="avatar avatar-lg bg-info rounded-circle">
                        <i className="ti ti-user-plus" />
                      </span>
                    </div>
                    <div className="ms-2 overflow-hidden">
                      <p className="fs-12 fw-medium mb-1 text-truncate">
                        New Joiners
                      </p>
                      <h4>{dashboardStats.newJoiners}</h4>
                    </div>
                  </div>
                  <div>
                    <span className="badge badge-soft-secondary badge-sm fw-normal">
                      <i className="ti ti-arrow-wave-right-down" />
                      {dashboardStats.newJoinersChange}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* /No of Plans */}
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Plan List</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon-end position-relative">
                    <PredefinedDateRanges 
                      onDateRangeChange={(start, end) => {
                        setFilterDateRange({
                          start: dayjs(start.toDate()),
                          end: dayjs(end.toDate()),
                        });
                        setApplyDateFilter(true);
                      }}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-chevron-down" />
                    </span>
                  </div>
                </div>
                <div className="me-3" style={{ minWidth: 220 }}>
                  <CommonSelect
                    className='select'
                    options={designationOptions}
                    value={designationOptions.find(d => d.value === filterDesignation) || designationOptions[0]}
                    onChange={(opt: any) => setFilterDesignation(opt ? opt.value : 'Select')}
                  />
                </div>
                <div className="dropdown me-3">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Select Status
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={() => setFilterStatus('Active')}
                      >
                        Active
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={() => setFilterStatus('Inactive')}
                      >
                        Inactive
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={() => setFilterStatus('')}
                      >
                        Clear Status
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                      >
                        Ascending
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <Table dataSource={filteredData} columns={columns} Selection={true} rowKey="key" />
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
      {/* Add Employee */}
      <div className="modal fade" id="add_employee">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <h4 className="modal-title me-2">Add New Employee</h4>
                <span>Employee ID : EMP -0024</span>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={clearForm}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form action={all_routes.employeeList}>
              <div className="contact-grids-tab">
                <ul className="nav nav-underline" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="info-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#basic-info"
                      type="button"
                      role="tab"
                      aria-selected="true"
                    >
                      Basic Information
                    </button>
                  </li>
                  <li className="nav-item" role="presentation" style={{ display: 'none' }}>
                    <button
                      className="nav-link"
                      id="address-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#address"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      Permissions
                    </button>
                  </li>
                </ul>
              </div>
              <div className="tab-content" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="basic-info"
                  role="tabpanel"
                  aria-labelledby="info-tab"
                  tabIndex={0}
                >
                  <div className="modal-body pb-0 ">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                          <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="rounded-circle"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <i className="ti ti-photo text-gray-2 fs-16" />
                            )}
                          </div>
                          <div className="profile-upload">
                            <div className="mb-2">
                              <h6 className="mb-1">Upload Profile Image</h6>
                              <p className="fs-12">Image should be below 4 mb</p>
                            </div>
                            <div className="profile-uploader d-flex align-items-center">
                              <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                Upload
                                <input
                                  type="file"
                                  name="profileImage"
                                  className="form-control image-sign"
                                  accept="image/*"
                                  onChange={handleInputChange}
                                />
                              </div>
                              <Link
                                to="#"
                                className="btn btn-light btn-sm"
                              >
                                Cancel
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            First Name <span className="text-danger"> *</span>
                          </label>
                          <input type="text" name="firstName" className="form-control" value={form.firstName || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input type="text" name="lastName" className="form-control" value={form.lastName || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Employee ID <span className="text-danger"> *</span>
                          </label>
                          <input type="text" name="employeeId" className="form-control" value={form.employeeId || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Joining Date <span className="text-danger"> *</span>
                          </label>
                          <div className="input-icon-end position-relative">
                            <DatePicker
                              className="form-control datetimepicker"
                              format={{
                                format: "DD-MM-YYYY",
                                type: "mask",
                              }}
                              getPopupContainer={getModalContainer}
                              placeholder="DD-MM-YYYY"
                              onChange={(date, dateString) => setForm(prev => ({ ...prev, joiningDate: dateString }))}
                            />
                            <span className="input-icon-addon">
                              <i className="ti ti-calendar text-gray-7" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Username <span className="text-danger"> *</span>
                          </label>
                          <input type="text" name="username" className="form-control" value={form.username || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Email <span className="text-danger"> *</span>
                          </label>
                          <input type="email" name="email" className="form-control" value={form.email || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Password <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type={
                                passwordVisibility.password
                                  ? "text"
                                  : "password"
                              }
                              className="pass-input form-control"
                              name="password"
                              onChange={handleInputChange}
                            />
                            <span
                              className={`ti toggle-passwords ${passwordVisibility.password
                                ? "ti-eye"
                                : "ti-eye-off"
                                }`}
                              onClick={() =>
                                togglePasswordVisibility("password")
                              }
                            ></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Confirm Password <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type={
                                passwordVisibility.confirmPassword
                                  ? "text"
                                  : "password"
                              }
                              className="pass-input form-control"
                              name="confirmPassword"
                              onChange={handleInputChange}
                            />
                            <span
                              className={`ti toggle-passwords ${passwordVisibility.confirmPassword
                                ? "ti-eye"
                                : "ti-eye-off"
                                }`}
                              onClick={() =>
                                togglePasswordVisibility("confirmPassword")
                              }
                            ></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Phone Number <span className="text-danger"> *</span>
                          </label>
                          <input type="text" name="phoneNumber" className="form-control" value={form.phoneNumber || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Company<span className="text-danger"> *</span>
                          </label>
                          <input type="text" name="company" className="form-control" value={form.company || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <CommonSelect
                            key={`add-dept-${selectKey}`}
                            className='select'
                            options={department}
                            value={department.find(d => d.value === form.department) || department[0]}
                            onChange={handleDepartmentChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Designation</label>
                          <CommonSelect
                            key={`add-desig-${selectKey}`}
                            className='select'
                            options={designationOptions}
                            value={designationOptions.find(d => d.value === form.designation) || designationOptions[0]}
                            onChange={handleDesignationChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <CommonSelect
                            className="select"
                            options={statusOptions}
                            value={statusOptions.find(s => s.value === form.status) || statusOptions[0]}
                            onChange={handleStatusChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            About <span className="text-danger"> *</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            name="about"
                            value={form.about || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                      onClick={clearForm}
                    >
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleAddEmployee} data-bs-dismiss="modal" disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="address"
                  role="tabpanel"
                  aria-labelledby="address-tab"
                  tabIndex={0}
                  style={{ display: 'none' }}
                >
                  <div className="modal-body">
                    <div className="card bg-light-500 shadow-none">
                      <div className="card-body d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <h6>Enable Options</h6>
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="form-check form-switch me-2">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                role="switch"
                              />
                              Enable all Module
                            </label>
                          </div>
                          <div className="form-check d-flex align-items-center">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                defaultChecked
                              />
                              Select All
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive border rounded">
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Holidays
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Leaves
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Clients
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Projects
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Tasks
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Chats
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                    defaultChecked
                                  />
                                  Assets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Timing Sheets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                      onClick={clearForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-bs-toggle="modal" data-inert={true}
                      data-bs-target="#success_modal"
                    >
                      Save{" "}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Employee */}
      {/* Edit Employee */}
      <div className="modal fade" id="edit_employee">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <h4 className="modal-title me-2">Edit Employee</h4>
                <span>Employee ID : EMP -0024</span>
              </div>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={clearForm}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form action={all_routes.employeeList}>
              <div className="contact-grids-tab">
                <ul className="nav nav-underline" id="myTab2" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="info-tab2"
                      data-bs-toggle="tab"
                      data-bs-target="#basic-info2"
                      type="button"
                      role="tab"
                      aria-selected="true"
                    >
                      Basic Information
                    </button>
                  </li>
                  <li className="nav-item" role="presentation" style={{ display: 'none' }}>
                    <button
                      className="nav-link"
                      id="address-tab2"
                      data-bs-toggle="tab"
                      data-bs-target="#address2"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      Permissions
                    </button>
                  </li>
                </ul>
              </div>
              <div className="tab-content" id="myTabContent2">
                <div
                  className="tab-pane fade show active"
                  id="basic-info2"
                  role="tabpanel"
                  aria-labelledby="info-tab2"
                  tabIndex={0}
                >
                  <div className="modal-body pb-0 ">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                          <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="rounded-circle"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <i className="ti ti-photo text-gray-2 fs-16" />
                            )}
                          </div>
                          <div className="profile-upload">
                            <div className="mb-2">
                              <h6 className="mb-1">Upload Profile Image</h6>
                              <p className="fs-12">Image should be below 4 mb</p>
                            </div>
                            <div className="profile-uploader d-flex align-items-center">
                              <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                Upload
                                <input
                                  type="file"
                                  name="profileImage"
                                  className="form-control image-sign"
                                  accept="image/*"
                                  onChange={handleInputChange}
                                />
                              </div>
                              <Link
                                to="#"
                                className="btn btn-light btn-sm"
                              >
                                Cancel
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            First Name <span className="text-danger"> *</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            className="form-control"
                            value={form.firstName || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            value={form.lastName || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Employee ID <span className="text-danger"> *</span>
                          </label>
                          <input
                            type="text"
                            name="employeeId"
                            className="form-control"
                            value={form.employeeId || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Joining Date <span className="text-danger"> *</span>
                          </label>
                          <div className="input-icon-end position-relative">
                            <DatePicker
                              className="form-control datetimepicker"
                              format={{
                                format: "DD-MM-YYYY",
                                type: "mask",
                              }}
                              getPopupContainer={getModalContainer}
                              placeholder="DD-MM-YYYY"
                              onChange={(date, dateString) => setForm(prev => ({ ...prev, joiningDate: dateString }))}
                            />
                            <span className="input-icon-addon">
                              <i className="ti ti-calendar text-gray-7" />
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Username <span className="text-danger"> *</span>
                          </label>
                          <input
                            type="text"
                            name="username"
                            className="form-control"
                            value={form.username || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Email <span className="text-danger"> *</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={form.email || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Password <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type={
                                passwordVisibility.password
                                  ? "text"
                                  : "password"
                              }
                              className="pass-input form-control"
                              name="password"
                              onChange={handleInputChange}
                            />
                            <span
                              className={`ti toggle-passwords ${passwordVisibility.password
                                ? "ti-eye"
                                : "ti-eye-off"
                                }`}
                              onClick={() =>
                                togglePasswordVisibility("password")
                              }
                            ></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Confirm Password <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type={
                                passwordVisibility.confirmPassword
                                  ? "text"
                                  : "password"
                              }
                              className="pass-input form-control"
                              name="confirmPassword"
                              onChange={handleInputChange}
                            />
                            <span
                              className={`ti toggle-passwords ${passwordVisibility.confirmPassword
                                ? "ti-eye"
                                : "ti-eye-off"
                                }`}
                              onClick={() =>
                                togglePasswordVisibility("confirmPassword")
                              }
                            ></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Phone Number <span className="text-danger"> *</span>
                          </label>
                          <input type="text" name="phoneNumber" className="form-control" value={form.phoneNumber || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Company<span className="text-danger"> *</span>
                          </label>
                          <input type="text" name="company" className="form-control" value={form.company || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <CommonSelect
                            key={`dept-${selectKey}`}
                            className='select'
                            options={department}
                            defaultValue={department.find(d => d.value === form.department) || department[0]}
                            onChange={handleDepartmentChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Designation</label>
                          <CommonSelect
                            key={`desig-${selectKey}`}
                            className='select'
                            options={designationOptions}
                            value={designationOptions.find(d => d.value === form.designation) || designationOptions[0]}
                            onChange={handleDesignationChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <CommonSelect
                            className="select"
                            options={statusOptions}
                            value={statusOptions.find(s => s.value === form.status) || statusOptions[0]}
                            onChange={handleStatusChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            About <span className="text-danger"> *</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows={3}
                            name="about"
                            value={form.about || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                      onClick={clearForm}
                    >
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleEditEmployee} data-bs-dismiss="modal" disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="address2"
                  role="tabpanel"
                  aria-labelledby="address-tab2"
                  tabIndex={0}
                  style={{ display: 'none' }}
                >
                  <div className="modal-body">
                    <div className="card bg-light-500 shadow-none">
                      <div className="card-body d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <h6>Enable Options</h6>
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="form-check form-switch me-2">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                role="switch"
                              />
                              Enable all Module
                            </label>
                          </div>
                          <div className="form-check d-flex align-items-center">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                defaultChecked
                              />
                              Select All
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive border rounded">
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Holidays
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Leaves
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Clients
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Projects
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Tasks
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Chats
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                    defaultChecked
                                  />
                                  Assets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Timing Sheets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                      onClick={clearForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-bs-toggle="modal" data-inert={true}
                      data-bs-target="#success_modal"
                    >
                      Save{" "}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Employee */}
      {/* Add Employee Success */}
      <div className={`modal fade${showSuccess ? ' show d-block' : ''}`} id="success_modal" role="dialog" style={{ display: showSuccess ? 'block' : 'none', background: showSuccess ? 'rgba(0,0,0,0.5)' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body">
              <div className="text-center p-3">
                <span className="avatar avatar-lg avatar-rounded bg-success mb-3">
                  <i className="ti ti-check fs-24" />
                </span>
                <h5 className="mb-2">
                  {successType === 'add' ? 'Employee Added Successfully' : 'Employee Updated Successfully'}
                </h5>
                <p className="mb-3">
                  {successType === 'add'
                    ? 'The employee has been added.'
                    : 'The employee has been updated.'}
                </p>
                <div>
                  <div className="row g-2">
                    <div className="col-6">
                      <button className="btn btn-dark w-100" onClick={handleSuccessModalClose} data-bs-dismiss="modal">
                        Back to List
                      </button>
                    </div>
                    <div className="col-6">
                      <button className="btn btn-primary w-100" onClick={handleSuccessModalClose} data-bs-dismiss="modal">
                        Detail Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add/Edit Employee Success */}

      {/* Delete Employee Modal */}
      <div className="modal fade" id="delete_modal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 justify-content-center">
              <span className="avatar avatar-lg avatar-rounded bg-warning mb-3">
                <i className="ti ti-alert-triangle fs-24 text-white" />
              </span>
            </div>
            <div className="modal-body text-center">
              <h5 className="mb-2">Delete Employee</h5>
              <p className="mb-3">Are you sure you want to delete this employee? This action cannot be undone.</p>
            </div>
            <div className="modal-footer justify-content-center border-0 pb-4">
              <button type="button" className="btn btn-outline-secondary me-2 px-4" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4"
                data-bs-dismiss="modal"
                onClick={() => selectedEmployee && handleDeleteEmployee(selectedEmployee.key)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Employee Modal */}
      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="modal fade show d-block" id="delete_success_modal" role="dialog" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-body">
                <div className="text-center p-3">
                  <span className="avatar avatar-lg avatar-rounded bg-success mb-3">
                    <i className="ti ti-check fs-24" />
                  </span>
                  <h5 className="mb-2">Employee Deleted Successfully</h5>
                  <p className="mb-3">The employee has been deleted.</p>
                  <button className="btn btn-dark w-100" onClick={() => setShowDeleteSuccess(false)} data-bs-dismiss="modal">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* /Delete Success Modal */}
    </>

  )
}

export default EmployeeList
