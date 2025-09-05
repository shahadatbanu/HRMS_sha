import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import PredefinedDateRanges from '../../../core/common/datePicker'
import Table from "../../../core/common/dataTable/index";
import { all_routes } from '../../router/all_routes';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { employeereportDetails } from '../../../core/data/json/employeereportDetails';
import { DatePicker, TimePicker } from "antd";
import CommonSelect from '../../../core/common/commonSelect';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import axios from 'axios';
import { useUser } from '../../../core/context/UserContext';
import dayjs from 'dayjs';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

declare const process: { env: { [key: string]: string | undefined } };

// Declare Bootstrap types for window object
declare global {
  interface Window {
    bootstrap?: {
      Modal: {
        getInstance: (element: Element) => any;
      };
    };
  }
}

type PasswordField = "password" | "confirmPassword";

const EmployeeDetails = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for bank details form
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNo: '',
    ifsc: '',
    branch: ''
  });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // State for personal information form
  const [personalInfo, setPersonalInfo] = useState({
    passportNumber: '',
    passportExpiry: '',
    nationality: '',
    religion: '',
    maritalStatus: '',
    spouseEmployment: '',
    childrenCount: ''
  });
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // State for emergency contacts form
  const [emergencyContacts, setEmergencyContacts] = useState([{
    name: '',
    relationship: '',
    phone: '',
    type: 'Emergency'
  }]);
  const [emergencySaving, setEmergencySaving] = useState(false);
  const [emergencyError, setEmergencyError] = useState<string | null>(null);

  // State for family information form
  const [familyInfo, setFamilyInfo] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    phone: ''
  });
  const [familySaving, setFamilySaving] = useState(false);
  const [familyError, setFamilyError] = useState<string | null>(null);

  // State for education form
  const [education, setEducation] = useState([{
    institution: '',
    degree: '',
    yearFrom: '',
    yearTo: ''
  }]);
  const [educationSaving, setEducationSaving] = useState(false);
  const [educationError, setEducationError] = useState<string | null>(null);

  // State for experience form
  const [experience, setExperience] = useState([{
    company: '',
    position: '',
    startDate: '',
    endDate: ''
  }]);
  const [experienceSaving, setExperienceSaving] = useState(false);
  const [experienceError, setExperienceError] = useState<string | null>(null);

  // State for basic information form
  const [basicInfo, setBasicInfo] = useState({
    phoneNumber: '',
    email: '',
    gender: '',
    birthday: '',
    address: ''
  });
  const [basicInfoSaving, setBasicInfoSaving] = useState(false);
  const [basicInfoError, setBasicInfoError] = useState<string | null>(null);

  // State for main employee information form
  const [mainEmployeeInfo, setMainEmployeeInfo] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    department: '',
    designation: '',
    joiningDate: '',
    about: ''
  });
  const [mainEmployeeSaving, setMainEmployeeSaving] = useState(false);
  const [mainEmployeeError, setMainEmployeeError] = useState<string | null>(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // State for About Employee modal
  const [aboutText, setAboutText] = useState<string>('');
  const [aboutSaving, setAboutSaving] = useState<boolean>(false);
  const [aboutError, setAboutError] = useState<string | null>(null);

  // State for assigning asset
  const [assetForm, setAssetForm] = useState({
    itemName: '',
    assetCode: '',
    image: '',
    assignedBy: '',
    note: '',
  });
  const [assetSaving, setAssetSaving] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
  const [assetImageFile, setAssetImageFile] = useState<File | null>(null);
  const [assetImagePreview, setAssetImagePreview] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      setImageError(false); // Reset image error when employee changes
      fetchEmployeeDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Separate useEffect for fetching current user profile
  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  // Memoize the profile image URL to prevent unnecessary re-renders
  const profileImageUrl = useMemo(() => {
    if (imageError || !employee?.profileImage) {
      return "assets/img/users/user-13.jpg";
    }
    
    if (employee.profileImage.startsWith('http')) {
      return employee.profileImage;
    }
    
    return `${BACKEND_URL}/uploads/${employee.profileImage}`;
  }, [employee?.profileImage, BACKEND_URL, imageError]);

  const fetchCurrentUserProfile = async () => {
    try {
      setUserProfileLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/employees/me`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Current user profile fetched:', response.data);
      setCurrentUserProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch current user profile:', err);
    } finally {
      setUserProfileLoading(false);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Employee details response:', response.data);
      console.log('Profile image path:', response.data.profileImage);
      setEmployee(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching employee details:', err);
      setError(err.response?.data?.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAboutModal = () => {
    setAboutText(employee?.about || '');
    setAboutError(null);
  };

  const handleAboutSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setAboutSaving(true);
      setAboutError(null);
      await axios.put(
        `${BACKEND_URL}/api/employees/${id}`,
        { about: aboutText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setEmployee((prev: any) => ({ ...prev, about: aboutText }));
      // Show success confirmation box
      const MySwal = withReactContent(Swal);
      await MySwal.fire({
        title: "Success!",
        text: "About information has been updated successfully.",
        icon: "success",
        confirmButtonColor: "#5CB85C",
        confirmButtonText: "OK",
      });
      // Close modal if present
      const modal = document.getElementById('edit_about');
      if (modal) {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        (modal as any)?.classList?.remove('show');
        (modal as any).setAttribute('style', 'display: none');
        document.body.classList.remove('modal-open');
      }
    } catch (err: any) {
      setAboutError(err.response?.data?.message || 'Failed to update about information');
    } finally {
      setAboutSaving(false);
    }
  };

  const handleOpenAssignAsset = () => {
    const assignedByName = currentUserProfile 
      ? `${currentUserProfile.firstName || ''} ${currentUserProfile.lastName || ''}`.trim() || currentUserProfile.email || ''
      : `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || '';
      
    setAssetForm({
      itemName: '',
      assetCode: '',
      image: '',
      assignedBy: assignedByName,
      note: '',
    });
    setAssetImageFile(null);
    setAssetImagePreview(null);
    setAssetError(null);
  };

  const handleAssetImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAssetImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAssetImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewAssetInfo = (assetIndex: number) => {
    setSelectedAssetIndex(assetIndex);
  };

  const handleAssignAssetSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !employee) return;
    try {
      setAssetSaving(true);
      setAssetError(null);
      
      let imageUrl = '';
      
      // Upload image if provided
      if (assetImageFile) {
        const formData = new FormData();
        formData.append('image', assetImageFile);
        
        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/employees/upload/asset-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        imageUrl = uploadResponse.data.imageUrl;
      }
      
      console.log('Creating asset for user:', currentUserProfile?.firstName, currentUserProfile?.lastName);
      
      const newAsset = {
        ...assetForm,
        image: imageUrl,
        assignedOn: new Date(), // Use current timestamp for accurate assignment time
        assignedById: currentUserProfile?._id || user?._id, // Store the user ID who assigned the asset
      };
      const updatedAssets = Array.isArray(employee.assets) ? [...employee.assets, newAsset] : [newAsset];
      const response = await axios.put(
        `${BACKEND_URL}/api/employees/${id}`,
        { assets: updatedAssets },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setEmployee(response.data?.employee ?? ((prev: any) => ({ ...prev, assets: updatedAssets })));
      const MySwal = withReactContent(Swal);
      await MySwal.fire({
        title: "Success!",
        text: "Asset assigned successfully.",
        icon: "success",
        confirmButtonColor: "#5CB85C",
        confirmButtonText: "OK",
      });
      const modal = document.getElementById('assign_asset');
      if (modal) {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        modal.classList.remove('show', 'd-block');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('style', 'display: none !important');
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        if (window.bootstrap) {
          const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) bootstrapModal.hide();
        }
      }
    } catch (err: any) {
      setAssetError(err.response?.data?.message || 'Failed to assign asset');
    } finally {
      setAssetSaving(false);
    }
  };

  const handleDeleteAsset = async (assetIndex: number) => {
    if (!id || !employee) return;
    
    const MySwal = withReactContent(Swal);
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'You want to remove this asset from the employee?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const updatedAssets = employee.assets.filter((_: any, index: number) => index !== assetIndex);
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          { assets: updatedAssets },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setEmployee(response.data?.employee ?? ((prev: any) => ({ ...prev, assets: updatedAssets })));
        
        await MySwal.fire({
          title: 'Deleted!',
          text: 'Asset has been removed successfully.',
          icon: 'success',
          confirmButtonColor: '#5CB85C',
        });
      } catch (err: any) {
        await MySwal.fire({
          title: 'Error!',
          text: err.response?.data?.message || 'Failed to remove asset',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    }
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

    const getModalContainer = () => {
        const modalElement = document.getElementById('modal-datepicker');
        return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
    };
    const getModalContainer2 = () => {
        const modalElement = document.getElementById('modal_datepicker');
        return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
    };

    // Use dynamic data if available, otherwise fallback to static data
    const data = employee ? [
        {
            Name: `${employee.firstName} ${employee.lastName}`,
            Email: employee.email,
            CreatedDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A',
            Role: employee.designation || 'Employee',
            Status: employee.status || 'Active'
        }
    ] : employeereportDetails;
    const columns = [
        {
            title: "Name",
            dataIndex: "Name",
            render: (text: String, record: any) => (
                <Link to={`${all_routes.employeedetails}/${id}`} className="link-default">{employee?.employeeId || 'Emp-001'}</Link>

            ),
            sorter: (a: any, b: any) => a.Name.length - b.Name.length,
        },
        {
            title: "Email",
            dataIndex: "Email",
            sorter: (a: any, b: any) => a.Email.length - b.Email.length,
        },
        {
            title: "Created Date",
            dataIndex: "CreatedDate",
            sorter: (a: any, b: any) => a.CreatedDate.length - b.CreatedDate.length,
        },
        {
            title: "Role",
            dataIndex: "Role",
            render: (text: String, record: any) => (
                <span className={`badge d-inline-flex align-items-center badge-xs ${text === 'Employee' ? 'badge-pink-transparent' : 'badge-soft-purple'}`}>
                    {text}
                </span>

            ),
            sorter: (a: any, b: any) => a.Role.length - b.Role.length,
        },
        {
            title: "Status",
            dataIndex: "Status",
            render: (text: String, record: any) => (
                <span className={`badge d-inline-flex align-items-center badge-xs ${text === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    <i className="ti ti-point-filled me-1" />
                    {text}
                </span>

            ),
            sorter: (a: any, b: any) => a.Status.length - b.Status.length,
        },
    ]

    const departmentChoose = [
        { value: "Select", label: "Select" },
        { value: "All Department", label: "All Department" },
        { value: "Finance", label: "Finance" },
        { value: "Developer", label: "Developer" },
        { value: "Executive", label: "Executive" },
    ];
    const designationChoose = [
        { value: "Select", label: "Select" },
        { value: "Finance", label: "Finance" },
        { value: "Developer", label: "Developer" },
        { value: "Executive", label: "Executive" },
    ];
    const martialstatus = [
        { value: "Select", label: "Select" },
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
    ];
    const salaryChoose = [
        { value: "Select", label: "Select" },
        { value: "Monthly", label: "Monthly" },
        { value: "Annualy", label: "Annualy" },
    ];
    const paymenttype = [
        { value: "Select", label: "Select" },
        { value: "Cash", label: "Cash" },
        { value: "Debit Card", label: "Debit Card" },
        { value: "Mobile Payment", label: "Mobile Payment" },
    ];
    const pfcontribution = [
        { value: "Select", label: "Select" },
        { value: "Employee Contribution", label: "Employee Contribution" },
        { value: "Employer Contribution", label: "Employer Contribution" },
        { value: "Provident Fund Interest", label: "Provident Fund Interest" },
    ];
    const additionalrate = [
        { value: "Select", label: "Select" },
        { value: "ESI", label: "ESI" },
        { value: "EPS", label: "EPS" },
        { value: "EPF", label: "EPF" },
    ];
    const esi = [
        { value: "Select", label: "Select" },
        { value: "Employee Contribution", label: "Employee Contribution" },
        { value: "Employer Contribution", label: "Employer Contribution" },
        { value: "Maternity Benefit ", label: "Maternity Benefit " },
    ];

    // Show loading state
    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading employee details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                        <div className="text-center">
                            <div className="text-danger mb-3">
                                <i className="ti ti-alert-circle fs-48"></i>
                            </div>
                            <h5>Error Loading Employee Details</h5>
                            <p className="text-muted">{error}</p>
                            <Link to={all_routes.employeeList} className="btn btn-primary">
                                <i className="ti ti-arrow-left me-2"></i>
                                Back to Employee List
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show message if no employee data
    if (!employee) {
        return (
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                        <div className="text-center">
                            <div className="text-muted mb-3">
                                <i className="ti ti-user-off fs-48"></i>
                            </div>
                            <h5>Employee Not Found</h5>
                            <p className="text-muted">The requested employee could not be found.</p>
                            <Link to={all_routes.employeeList} className="btn btn-primary">
                                <i className="ti ti-arrow-left me-2"></i>
                                Back to Employee List
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Pre-fill bank details when opening modal
    const handleOpenBankModal = () => {
      setBankDetails({
        bankName: employee?.bankName || '',
        accountNo: employee?.accountNo || '',
        ifsc: employee?.ifsc || '',
        branch: employee?.branch || ''
      });
      setBankError(null);
    };

    // Pre-fill personal info when opening modal
    const handleOpenPersonalModal = () => {
      setPersonalInfo({
        passportNumber: employee?.passportNumber || '',
        passportExpiry: employee?.passportExpiry || '',
        nationality: employee?.nationality || '',
        religion: employee?.religion || '',
        maritalStatus: employee?.maritalStatus || '',
        spouseEmployment: employee?.spouseEmployment || '',
        childrenCount: employee?.childrenCount || ''
      });
      setPersonalError(null);
    };

    // Pre-fill emergency contacts when opening modal
    const handleOpenEmergencyModal = () => {
      setEmergencyContacts(employee?.emergencyContacts && employee.emergencyContacts.length > 0 
        ? employee.emergencyContacts 
        : [{ name: '', relationship: '', phone: '', type: 'Emergency' }]);
      setEmergencyError(null);
    };

    // Pre-fill family info when opening modal
    const handleOpenFamilyModal = () => {
      setFamilyInfo({
        name: employee?.familyInfo?.name || '',
        relationship: employee?.familyInfo?.relationship || '',
        dateOfBirth: employee?.familyInfo?.dateOfBirth
          ? dayjs(employee.familyInfo.dateOfBirth).format('DD-MM-YYYY')
          : '',
        phone: employee?.familyInfo?.phone || ''
      });
      setFamilyError(null);
    };

    // Pre-fill education when opening modal
    const handleOpenEducationModal = () => {
      // Normalize any existing dates to DD-MM-YYYY strings for the DatePickers
      const existing = employee?.education && employee.education.length > 0
        ? employee.education.map((edu: any) => ({
            institution: edu.institution || '',
            degree: edu.degree || '',
            yearFrom: edu.yearFrom ? dayjs(edu.yearFrom).format('DD-MM-YYYY') : '',
            yearTo: edu.yearTo ? dayjs(edu.yearTo).format('DD-MM-YYYY') : '',
          }))
        : [
            { institution: '', degree: '', yearFrom: '', yearTo: '' },
            { institution: '', degree: '', yearFrom: '', yearTo: '' },
            { institution: '', degree: '', yearFrom: '', yearTo: '' },
            { institution: '', degree: '', yearFrom: '', yearTo: '' },
          ];
      setEducation(existing);
      setEducationError(null);
    };

    // Pre-fill experience when opening modal
    const handleOpenExperienceModal = () => {
      const existing = employee?.experience && employee.experience.length > 0
        ? employee.experience.map((exp: any) => ({
            company: exp.company || '',
            position: exp.position || '',
            startDate: exp.startDate ? dayjs(exp.startDate).format('DD-MM-YYYY') : '',
            endDate: exp.endDate ? dayjs(exp.endDate).format('DD-MM-YYYY') : '',
          }))
        : [
            { company: '', position: '', startDate: '', endDate: '' },
          ];
      setExperience(existing);
      setExperienceError(null);
    };

    // Pre-fill basic info when opening modal
    const handleOpenBasicInfoModal = () => {
      // Convert birthday from Date object to DD-MM-YYYY format for the DatePicker
      let birthdayFormatted = '';
      if (employee?.birthday) {
        const birthdayDate = new Date(employee.birthday);
        if (!isNaN(birthdayDate.getTime())) {
          const day = birthdayDate.getDate().toString().padStart(2, '0');
          const month = (birthdayDate.getMonth() + 1).toString().padStart(2, '0');
          const year = birthdayDate.getFullYear();
          birthdayFormatted = `${day}-${month}-${year}`;
        }
      }
      
      setBasicInfo({
        phoneNumber: employee?.phoneNumber || '',
        email: employee?.email || '',
        gender: employee?.gender || '',
        birthday: birthdayFormatted,
        address: employee?.address || ''
      });
      setBasicInfoError(null);
    };

    // Add new emergency contact
    const addEmergencyContact = () => {
      setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '', type: 'Emergency' }]);
    };

    // Remove emergency contact
    const removeEmergencyContact = (index: number) => {
      setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
    };

    // Update emergency contact
    const updateEmergencyContact = (index: number, field: string, value: string) => {
      const updated = [...emergencyContacts];
      updated[index] = { ...updated[index], [field]: value };
      setEmergencyContacts(updated);
    };

    // Add new education entry
    const addEducation = () => {
      setEducation([...education, { institution: '', degree: '', yearFrom: '', yearTo: '' }]);
    };

    // Remove education entry
    const removeEducation = (index: number) => {
      setEducation(education.filter((_, i) => i !== index));
    };

    // Update education entry
    const updateEducation = (index: number, field: string, value: string) => {
      const updated = [...education];
      updated[index] = { ...updated[index], [field]: value };
      setEducation(updated);
    };

    // Add new experience entry
    const addExperience = () => {
      setExperience([...experience, { company: '', position: '', startDate: '', endDate: '' }]);
    };

    // Remove experience entry
    const removeExperience = (index: number) => {
      setExperience(experience.filter((_, i) => i !== index));
    };

    // Update experience entry
    const updateExperience = (index: number, field: string, value: string) => {
      const updated = [...experience];
      updated[index] = { ...updated[index], [field]: value };
      setExperience(updated);
    };

    // Handle bank details form submit
    const handleBankDetailsSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setBankSaving(true);
      setBankError(null);
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          bankDetails,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEmployee((prev: any) => ({ ...prev, ...bankDetails }));
        
        // Show success confirmation box first
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          title: "Success!",
          text: "Bank details have been updated successfully.",
          icon: "success",
          confirmButtonColor: "#5CB85C",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
        
        // Properly close modal and remove backdrop
        const modal = document.getElementById('edit_bank');
        if (modal) {
          // Remove modal backdrop
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
          
          // Remove modal classes and hide
          modal.classList.remove('show', 'd-block');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('style', 'display: none !important');
          
          // Remove body classes
          document.body.classList.remove('modal-open');
          document.body.style.paddingRight = '';
          
          // If using Bootstrap 5, also try the proper API
          if (window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
              bootstrapModal.hide();
            }
          }
        }
      } catch (err: any) {
        setBankError(err.response?.data?.message || 'Failed to update bank details');
      } finally {
        setBankSaving(false);
      }
    };

    // Handle personal info form submit
    const handlePersonalInfoSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setPersonalSaving(true);
      setPersonalError(null);
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          personalInfo,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEmployee((prev: any) => ({ ...prev, ...personalInfo }));
        
        // Show success confirmation box
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          title: "Success!",
          text: "Personal information has been updated successfully.",
          icon: "success",
          confirmButtonColor: "#5CB85C",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
        
        // Close modal
        const modal = document.getElementById('edit_personal');
        if (modal) {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
          modal.classList.remove('show', 'd-block');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('style', 'display: none !important');
          document.body.classList.remove('modal-open');
          document.body.style.paddingRight = '';
          if (window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        }
      } catch (err: any) {
        setPersonalError(err.response?.data?.message || 'Failed to update personal information');
      } finally {
        setPersonalSaving(false);
      }
    };

    // Handle emergency contacts form submit
    const handleEmergencyContactsSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setEmergencySaving(true);
      setEmergencyError(null);
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          { emergencyContacts },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEmployee((prev: any) => ({ ...prev, emergencyContacts }));
        
        // Show success confirmation box
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          title: "Success!",
          text: "Emergency contacts have been updated successfully.",
          icon: "success",
          confirmButtonColor: "#5CB85C",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
        
        // Close modal
        const modal = document.getElementById('edit_emergency');
        if (modal) {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
          modal.classList.remove('show', 'd-block');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('style', 'display: none !important');
          document.body.classList.remove('modal-open');
          document.body.style.paddingRight = '';
          if (window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        }
      } catch (err: any) {
        setEmergencyError(err.response?.data?.message || 'Failed to update emergency contacts');
      } finally {
        setEmergencySaving(false);
      }
    };

    // Handle family info form submit
    const handleFamilyInfoSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setFamilySaving(true);
      setFamilyError(null);
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          { familyInfo },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEmployee(response.data?.employee ?? ((prev: any) => ({ ...prev, familyInfo })));
        
        // Show success confirmation box
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          title: "Success!",
          text: "Family information has been updated successfully.",
          icon: "success",
          confirmButtonColor: "#5CB85C",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
        
        // Close modal
        const modal = document.getElementById('edit_familyinformation');
        if (modal) {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
          modal.classList.remove('show', 'd-block');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('style', 'display: none !important');
          document.body.classList.remove('modal-open');
          document.body.style.paddingRight = '';
          if (window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        }
      } catch (err: any) {
        setFamilyError(err.response?.data?.message || 'Failed to update family information');
      } finally {
        setFamilySaving(false);
      }
    };

    // Handle education form submit
    const handleEducationSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setEducationSaving(true);
      setEducationError(null);
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          { education },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEmployee(response.data?.employee ?? ((prev: any) => ({ ...prev, education })));
        
        // Show success confirmation box
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          title: "Success!",
          text: "Education details have been updated successfully.",
          icon: "success",
          confirmButtonColor: "#5CB85C",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
        
        // Close modal
        const modal = document.getElementById('edit_education');
        if (modal) {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
          modal.classList.remove('show', 'd-block');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('style', 'display: none !important');
          document.body.classList.remove('modal-open');
          document.body.style.paddingRight = '';
          if (window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        }
      } catch (err: any) {
        setEducationError(err.response?.data?.message || 'Failed to update education details');
      } finally {
        setEducationSaving(false);
      }
    };

    // Handle experience form submit
    const handleExperienceSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setExperienceSaving(true);
      setExperienceError(null);
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          { experience },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEmployee(response.data?.employee ?? ((prev: any) => ({ ...prev, experience })));
        
        // Show success confirmation box
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          title: "Success!",
          text: "Experience details have been updated successfully.",
          icon: "success",
          confirmButtonColor: "#5CB85C",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
        
        // Close modal
        const modal = document.getElementById('edit_experience');
        if (modal) {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
          modal.classList.remove('show', 'd-block');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('style', 'display: none !important');
          document.body.classList.remove('modal-open');
          document.body.style.paddingRight = '';
          if (window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        }
      } catch (err: any) {
        setExperienceError(err.response?.data?.message || 'Failed to update experience details');
      } finally {
        setExperienceSaving(false);
      }
    };

    // Handle basic info form submit
    const handleBasicInfoSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setBasicInfoSaving(true);
      setBasicInfoError(null);
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/employees/${id}`,
          basicInfo,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setEmployee((prev: any) => ({ ...prev, ...basicInfo }));
        
        // Show success confirmation box
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          title: "Success!",
          text: "Basic information has been updated successfully.",
          icon: "success",
          confirmButtonColor: "#5CB85C",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
        
        // Close modal
        const modal = document.getElementById('edit_employee');
        if (modal) {
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) backdrop.remove();
          modal.classList.remove('show', 'd-block');
          modal.setAttribute('aria-hidden', 'true');
          modal.setAttribute('style', 'display: none !important');
          document.body.classList.remove('modal-open');
          document.body.style.paddingRight = '';
          if (window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) bootstrapModal.hide();
          }
        }
      } catch (err: any) {
        setBasicInfoError(err.response?.data?.message || 'Failed to update basic information');
      } finally {
        setBasicInfoSaving(false);
      }
    };

    return (
        <>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h6 className="fw-medium d-inline-flex align-items-center mb-3 mb-sm-0">
                                <Link to={all_routes.employeeList}>
                                    <i className="ti ti-arrow-left me-2" />
                                    Employee Details
                                </Link>
                            </h6>
                            {employee && (
                                <h5 className="mb-0">
                                    {employee.firstName} {employee.lastName} - {employee.employeeId}
                                </h5>
                            )}
                        </div>
                        {/* <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            <div className="mb-2">
                                <Link
                                    to="#"
                                    data-bs-toggle="modal" data-inert={true}
                                    data-bs-target="#add_bank_satutory"
                                    className="btn btn-primary d-flex align-items-center"
                                >
                                    <i className="ti ti-circle-plus me-2" />
                                    Bank &amp; Statutory
                                </Link>
                            </div>
                            <div className="head-icons ms-2">
                                <CollapseHeader />
                            </div>
                        </div> */}
                    </div>
                    {/* /Breadcrumb */}
                    <div className="row">
                        <div className="col-xl-4 theiaStickySidebar">
                            <div className="card card-bg-1">
                                <div className="card-body p-0">
                                    <span className="avatar avatar-xl avatar-rounded border border-2 border-white m-auto d-flex mb-2">
                                        <ImageWithBasePath
                                            src={profileImageUrl}
                                            className="w-auto rounded-circle"
                                            alt="Employee Profile"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={() => setImageError(true)}
                                        />
                                    </span>
                                    <div className="text-center px-3 pb-3 border-bottom">
                                        <div className="mb-3">
                                            <h5 className="d-flex align-items-center justify-content-center mb-1">
                                                {employee.firstName} {employee.lastName}
                                                <i className="ti ti-discount-check-filled text-success ms-1" />
                                            </h5>
                                            <span className="badge badge-soft-dark fw-medium me-2">
                                                <i className="ti ti-point-filled me-1" />
                                                {employee.designation || 'Employee'}
                                            </span>
                                            <span className="badge badge-soft-secondary fw-medium">
                                                {employee.department || 'Department'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span className="d-inline-flex align-items-center">
                                                    <i className="ti ti-id me-2" />
                                                    Employee ID
                                                </span>
                                                <p className="text-dark">{employee.employeeId || 'N/A'}</p>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span className="d-inline-flex align-items-center">
                                                    <i className="ti ti-star me-2" />
                                                    Department
                                                </span>
                                                <p className="text-dark">{employee.department || 'N/A'}</p>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span className="d-inline-flex align-items-center">
                                                    <i className="ti ti-calendar-check me-2" />
                                                    Date Of Join
                                                </span>
                                                <p className="text-dark">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div className="row gx-2 mt-3">
                                                <div className="col-12">
                                                    <div>
                                                        <Link
                                                            to="#"
                                                            className="btn btn-dark w-100"
                                                            data-bs-toggle="modal" data-inert={true}
                                                            data-bs-target="#add_employee"
                                                        >
                                                            <i className="ti ti-edit me-1" />
                                                            Edit Info
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-bottom">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <h6>Basic information</h6>
                                            <Link
                                                to="#"
                                                className="btn btn-icon btn-sm"
                                                data-bs-toggle="modal" data-inert={true}
                                                data-bs-target="#edit_employee"
                                                onClick={handleOpenBasicInfoModal}
                                            >
                                                <i className="ti ti-edit" />
                                            </Link>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-phone me-2" />
                                                Phone
                                            </span>
                                            <p className="text-dark">{employee.phoneNumber || 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-mail-check me-2" />
                                                Email
                                            </span>
                                            <span className="text-info d-inline-flex align-items-center">
                                                {employee.email || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-gender-male me-2" />
                                                Gender
                                            </span>
                                            <p className="text-dark text-end">{employee.gender || 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-cake me-2" />
                                                Birthday
                                            </span>
                                            <p className="text-dark text-end">{employee.birthday ? new Date(employee.birthday).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-map-pin-check me-2" />
                                                Address
                                            </span>
                                            <p className="text-dark text-end">{employee.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 border-bottom">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <h6>Personal Information</h6>
                                            <Link
                                                to="#"
                                                className="btn btn-icon btn-sm"
                                                data-bs-toggle="modal" data-inert={true}
                                                data-bs-target="#edit_personal"
                                                onClick={handleOpenPersonalModal}
                                            >
                                                <i className="ti ti-edit" />
                                            </Link>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-e-passport me-2" />
                                                Passport No
                                            </span>
                                            <p className="text-dark">{employee.passportNumber || 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-calendar-x me-2" />
                                                Passport Exp Date
                                            </span>
                                            <p className="text-dark text-end">{employee.passportExpiry ? new Date(employee.passportExpiry).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-gender-male me-2" />
                                                Nationality
                                            </span>
                                            <p className="text-dark text-end">{employee.nationality || 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-bookmark-plus me-2" />
                                                Religion
                                            </span>
                                            <p className="text-dark text-end">{employee.religion || 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-hotel-service me-2" />
                                                Marital status
                                            </span>
                                            <p className="text-dark text-end">{employee.maritalStatus || 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-briefcase-2 me-2" />
                                                Employment of spouse
                                            </span>
                                            <p className="text-dark text-end">{employee.spouseEmployment || 'N/A'}</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="d-inline-flex align-items-center">
                                                <i className="ti ti-baby-bottle me-2" />
                                                No. of children
                                            </span>
                                            <p className="text-dark text-end">{employee.childrenCount !== undefined ? employee.childrenCount : 'N/A'}</p>
                                        </div>
                                    </div>
                                     <div className="p-3 border-bottom">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <h6>Emergency Contact Number</h6>
                                        <Link
                                            to="#"
                                            className="btn btn-icon btn-sm"
                                            data-bs-toggle="modal" data-inert={true}
                                            data-bs-target="#edit_emergency"
                                            onClick={handleOpenEmergencyModal}
                                        >
                                            <i className="ti ti-edit" />
                                        </Link>
                                    </div>
                                    <div>
                                        {employee.emergencyContacts && employee.emergencyContacts.length > 0 ? (
                                            employee.emergencyContacts.map((contact: any, idx: number) => (
                                                <div key={idx} className={idx < employee.emergencyContacts.length - 1 ? "mb-3" : ""}>
                                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                                        <span className="d-inline-flex align-items-center text-muted fs-12">
                                                            {contact.type || 'Emergency'}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <h6 className="d-flex align-items-center fw-medium mb-0">
                                                                {contact.name || 'N/A'}
                                                                <span className="d-inline-flex mx-1">
                                                                    <i className="ti ti-point-filled text-danger" />
                                                                </span>
                                                                {contact.relationship || 'N/A'}
                                                            </h6>
                                                        </div>
                                                        <p className="text-dark mb-0">{contact.phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted">
                                                <i className="ti ti-phone fs-24 mb-2 d-block" />
                                                <p className="mb-0">No emergency contacts available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-8">
                            <div>
                                <div className="tab-content custom-accordion-items">
                                    <div
                                        className="tab-pane active show"
                                        id="bottom-justified-tab1"
                                        role="tabpanel"
                                    >
                                        <div
                                            className="accordion accordions-items-seperate"
                                            id="accordionExample"
                                        >
                                            <div className="accordion-item">
                                                <div className="accordion-header" id="headingOne">
                                                    <div className="accordion-button">
                                                        <div className="d-flex align-items-center flex-fill">
                                                            <h5>About Employee</h5>
                                                            <Link
                                                                to="#"
                                                                className="btn btn-sm btn-icon ms-auto"
                                                                data-bs-toggle="modal" data-inert={true}
                                                                data-bs-target="#edit_about"
                                                                onClick={handleOpenAboutModal}
                                                            >
                                                                <i className="ti ti-edit" />
                                                            </Link>
                                                            <Link
                                                                to="#"
                                                                className="d-flex align-items-center collapsed collapse-arrow"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target="#primaryBorderOne"
                                                                aria-expanded="false"
                                                                aria-controls="primaryBorderOne"
                                                            >
                                                                <i className="ti ti-chevron-down fs-18" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    id="primaryBorderOne"
                                                    className="accordion-collapse collapse show border-top"
                                                    aria-labelledby="headingOne"
                                                    data-bs-parent="#accordionExample"
                                                >
                                                    <div className="accordion-body mt-2">
                                                        {employee.about || 'No description available for this employee.'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item">
                                                <div className="accordion-header" id="headingTwo">
                                                    <div className="accordion-button">
                                                        <div className="d-flex align-items-center flex-fill">
                                                            <h5>Bank Information</h5>
                                                            <Link
                                                                to="#"
                                                                className="btn btn-sm btn-icon ms-auto"
                                                                data-bs-toggle="modal" data-inert={true}
                                                                data-bs-target="#edit_bank"
                                                                onClick={handleOpenBankModal}
                                                            >
                                                                <i className="ti ti-edit" />
                                                            </Link>
                                                            <Link
                                                                to="#"
                                                                className="d-flex align-items-center collapsed collapse-arrow"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target="#primaryBorderTwo"
                                                                aria-expanded="false"
                                                                aria-controls="primaryBorderTwo"
                                                            >
                                                                <i className="ti ti-chevron-down fs-18" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    id="primaryBorderTwo"
                                                    className="accordion-collapse collapse border-top"
                                                    aria-labelledby="headingTwo"
                                                    data-bs-parent="#accordionExample"
                                                >
                                                    <div className="accordion-body">
                                                        <div className="row">
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    Bank Name
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.bankName || 'Not provided'}
                                                                </h6>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    Bank account no
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.accountNo || 'Not provided'}
                                                                </h6>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    IFSC Code
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.ifsc || 'Not provided'}
                                                                </h6>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    Branch
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.branch || 'Not provided'}
                                                                </h6>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item">
                                                <div className="accordion-header" id="headingThree">
                                                    <div className="accordion-button">
                                                        <div className="d-flex align-items-center justify-content-between flex-fill">
                                                            <h5>Family Information</h5>
                                                            <div className="d-flex">
                                                                <Link
                                                                    to="#"
                                                                    className="btn btn-icon btn-sm"
                                                                    data-bs-toggle="modal" data-inert={true}
                                                                    data-bs-target="#edit_familyinformation"
                                                                    onClick={handleOpenFamilyModal}
                                                                >
                                                                    <i className="ti ti-edit" />
                                                                </Link>
                                                                <Link
                                                                    to="#"
                                                                    className="d-flex align-items-center collapsed collapse-arrow"
                                                                    data-bs-toggle="collapse"
                                                                    data-bs-target="#primaryBorderThree"
                                                                    aria-expanded="false"
                                                                    aria-controls="primaryBorderThree"
                                                                >
                                                                    <i className="ti ti-chevron-down fs-18" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    id="primaryBorderThree"
                                                    className="accordion-collapse collapse border-top"
                                                    aria-labelledby="headingThree"
                                                    data-bs-parent="#accordionExample"
                                                >
                                                    <div className="accordion-body">
                                                        <div className="row">
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    Name
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.familyInfo?.name || 'Not provided'}
                                                                </h6>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    Relationship
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.familyInfo?.relationship || 'Not provided'}
                                                                </h6>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    Date of birth
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.familyInfo?.dateOfBirth ? new Date(employee.familyInfo.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                                                </h6>
                                                            </div>
                                                            <div className="col-md-3">
                                                                <span className="d-inline-flex align-items-center">
                                                                    Phone
                                                                </span>
                                                                <h6 className="d-flex align-items-center fw-medium mt-1">
                                                                    {employee?.familyInfo?.phone || 'Not provided'}
                                                                </h6>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="accordion-item">
                                                        <div className="row">
                                                            <div className="accordion-header" id="headingFour">
                                                                <div className="accordion-button">
                                                                    <div className="d-flex align-items-center justify-content-between flex-fill">
                                                                        <h5>Education Details</h5>
                                                                        <div className="d-flex">
                                                                            <Link
                                                                                to="#"
                                                                                className="btn btn-icon btn-sm"
                                                                                data-bs-toggle="modal" data-inert={true}
                                                                                data-bs-target="#edit_education"
                                                                                onClick={handleOpenEducationModal}
                                                                            >
                                                                                <i className="ti ti-edit" />
                                                                            </Link>
                                                                            <Link
                                                                                to="#"
                                                                                className="d-flex align-items-center collapsed collapse-arrow"
                                                                                data-bs-toggle="collapse"
                                                                                data-bs-target="#primaryBorderFour"
                                                                                aria-expanded="false"
                                                                                aria-controls="primaryBorderFour"
                                                                            >
                                                                                <i className="ti ti-chevron-down fs-18" />
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                id="primaryBorderFour"
                                                                className="accordion-collapse collapse border-top"
                                                                aria-labelledby="headingFour"
                                                                data-bs-parent="#accordionExample"
                                                            >
                                                                <div className="accordion-body">
                                                                    <div>
                                                                        {employee?.education && employee.education.length > 0 ? (
                                                                            employee.education.map((edu: any, idx: number) => (
                                                                                <div className="mb-3" key={idx}>
                                                                            <div className="d-flex align-items-center justify-content-between">
                                                                                <div>
                                                                                    <span className="d-inline-flex align-items-center fw-normal">
                                                                                                {edu.institution || 'Not provided'}
                                                                                    </span>
                                                                                    <h6 className="d-flex align-items-center mt-1">
                                                                                                {edu.degree || 'Not provided'}
                                                                                    </h6>
                                                                                </div>
                                                                                        <p className="text-dark">{edu.yearFrom || ''} - {edu.yearTo || ''}</p>
                                                                            </div>
                                                                        </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="text-center text-muted">No education details available.</div>
                                                                        )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="accordion-item">
                                                        <div className="row">
                                                            <div className="accordion-header" id="headingFive">
                                                                <div className="accordion-button collapsed">
                                                                    <div className="d-flex align-items-center justify-content-between flex-fill">
                                                                        <h5>Experience</h5>
                                                                        <div className="d-flex">
                                                                            <Link
                                                                                to="#"
                                                                                className="btn btn-icon btn-sm"
                                                                                data-bs-toggle="modal" data-inert={true}
                                                                                data-bs-target="#edit_experience"
                                                                                onClick={handleOpenExperienceModal}
                                                                            >
                                                                                <i className="ti ti-edit" />
                                                                            </Link>
                                                                            <Link
                                                                                to="#"
                                                                                className="d-flex align-items-center collapsed collapse-arrow"
                                                                                data-bs-toggle="collapse"
                                                                                data-bs-target="#primaryBorderFive"
                                                                                aria-expanded="false"
                                                                                aria-controls="primaryBorderFive"
                                                                            >
                                                                                <i className="ti ti-chevron-down fs-18" />
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                id="primaryBorderFive"
                                                                className="accordion-collapse collapse border-top"
                                                                aria-labelledby="headingFive"
                                                                data-bs-parent="#accordionExample"
                                                            >
                                                                <div className="accordion-body">
                                                                    <div>
                                                                        {employee?.experience && employee.experience.length > 0 ? (
                                                                            employee.experience.map((exp: any, idx: number) => (
                                                                                <div className={idx < employee.experience.length - 1 ? "mb-3" : ""} key={idx}>
                                                                            <div className="d-flex align-items-center justify-content-between">
                                                                                <div>
                                                                                    <h6 className="d-inline-flex align-items-center fw-medium">
                                                                                                {exp.company || 'Not provided'}
                                                                                    </h6>
                                                                                    <span className="d-flex align-items-center badge bg-secondary-transparent mt-1">
                                                                                        <i className="ti ti-point-filled me-1" />
                                                                                                {exp.position || 'Not provided'}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-dark">
                                                                                            {exp.startDate || ''} - {exp.endDate || 'Present'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="text-center text-muted">No experience details available.</div>
                                                                        )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="contact-grids-tab p-0 mb-3">
                                                        <ul
                                                            className="nav nav-underline"
                                                            id="myTab"
                                                            role="tablist"
                                                        >
                                                            {/* <li className="nav-item" role="presentation">
                                                                <button
                                                                    className="nav-link active"
                                                                    id="info-tab2"
                                                                    data-bs-toggle="tab"
                                                                    data-bs-target="#basic-info2"
                                                                    type="button"
                                                                    role="tab"
                                                                    aria-selected="true"
                                                                >
                                                                    Projects
                                                                </button>
                                                            </li> */}
                                                            <li className="nav-item" role="presentation">
                                                                <button
                                                                    className="nav-link active"
                                                                    id="address-tab2"
                                                                    data-bs-toggle="tab"
                                                                    data-bs-target="#address2"
                                                                    type="button"
                                                                    role="tab"
                                                                    aria-selected="true"
                                                                >
                                                                    Assets
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="tab-content" id="myTabContent3">
                                                        {/* Projects tab content commented out
                                                        <div
                                                            className="tab-pane fade show active"
                                                            id="basic-info2"
                                                            role="tabpanel"
                                                            aria-labelledby="info-tab2"
                                                            tabIndex={0}
                                                        >
                                                            <div className="row">
                                                                <div className="col-md-6 d-flex">
                                                                    <div className="card flex-fill mb-4 mb-md-0">
                                                                        <div className="card-body">
                                                                            <div className="d-flex align-items-center pb-3 mb-3 border-bottom">
                                                                                <Link
                                                                                    to={all_routes.projectdetails}
                                                                                    className="flex-shrink-0 me-2"
                                                                                >
                                                                                    <ImageWithBasePath
                                                                                        src="assets/img/social/project-03.svg"
                                                                                        alt="Img"
                                                                                    />
                                                                                </Link>
                                                                                <div>
                                                                                    <h6 className="mb-1">
                                                                                        <Link to={all_routes.projectdetails}>
                                                                                            World Health
                                                                                        </Link>
                                                                                    </h6>
                                                                                    <div className="d-flex align-items-center">
                                                                                        <p className="mb-0 fs-13">8 tasks</p>
                                                                                        <p className="fs-13">
                                                                                            <span className="mx-1">
                                                                                                <i className="ti ti-point-filled text-primary" />
                                                                                            </span>
                                                                                            15 Completed
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col-md-6">
                                                                                    <div>
                                                                                        <span className="mb-1 d-block">
                                                                                            Deadline
                                                                                        </span>
                                                                                        <p className="text-dark">
                                                                                            31 July 2025
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-6">
                                                                                    <div>
                                                                                        <span className="mb-1 d-block">
                                                                                            Project Lead
                                                                                        </span>
                                                                                        <Link
                                                                                            to="#"
                                                                                            className="fw-normal d-flex align-items-center"
                                                                                        >
                                                                                            <ImageWithBasePath
                                                                                                className="avatar avatar-sm rounded-circle me-2"
                                                                                                src="assets/img/profiles/avatar-01.jpg"
                                                                                                alt="Img"
                                                                                            />
                                                                                            Leona
                                                                                        </Link>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6 d-flex">
                                                                    <div className="card flex-fill mb-0">
                                                                        <div className="card-body">
                                                                            <div className="d-flex align-items-center pb-3 mb-3 border-bottom">
                                                                                <Link
                                                                                    to={all_routes.projectdetails}
                                                                                    className="flex-shrink-0 me-2"
                                                                                >
                                                                                    <ImageWithBasePath
                                                                                        src="assets/img/social/project-01.svg"
                                                                                        alt="Img"
                                                                                    />
                                                                                </Link>
                                                                                <div>
                                                                                    <h6 className="mb-1 text-truncate">
                                                                                        <Link to={all_routes.projectdetails}>
                                                                                            Hospital Administration
                                                                                        </Link>
                                                                                    </h6>
                                                                                    <div className="d-flex align-items-center">
                                                                                        <p className="mb-0 fs-13">8 tasks</p>
                                                                                        <p className="fs-13">
                                                                                            <span className="mx-1">
                                                                                                <i className="ti ti-point-filled text-primary" />
                                                                                            </span>
                                                                                            15 Completed
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row">
                                                                                <div className="col-md-6">
                                                                                    <div>
                                                                                        <span className="mb-1 d-block">
                                                                                            Deadline
                                                                                        </span>
                                                                                        <p className="text-dark">
                                                                                            31 July 2025
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-6">
                                                                                    <div>
                                                                                        <span className="mb-1 d-block">
                                                                                            Project Lead
                                                                                        </span>
                                                                                        <Link
                                                                                            to="#"
                                                                                            className="fw-normal d-flex align-items-center"
                                                                                        >
                                                                                            <ImageWithBasePath
                                                                                                className="avatar avatar-sm rounded-circle me-2"
                                                                                                src="assets/img/profiles/avatar-01.jpg"
                                                                                                alt="Img"
                                                                                            />
                                                                                            Leona
                                                                                        </Link>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                        */}
                                                        <div
                                                            className="tab-pane fade show active"
                                                            id="address2"
                                                            role="tabpanel"
                                                            aria-labelledby="address-tab2"
                                                            tabIndex={0}
                                                        >
                                                            <div className="row">
                                                                <div className="col-md-12 d-flex">
                                                                    <div className="card flex-fill">
                                                                        <div className="card-header">
                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                <h5 className="card-title mb-0">Assets</h5>
                                                                                {(user?.role === 'admin' || user?.role === 'hr') && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-primary btn-sm"
                                                                                        data-bs-toggle="modal"
                                                                                        data-bs-target="#assign_asset"
                                                                                        onClick={handleOpenAssignAsset}
                                                                                    >
                                                                                        <i className="ti ti-plus me-1"></i>
                                                                                        Add Asset
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="card-body">
                                                                            {employee?.assets && employee.assets.length > 0 ? (
                                                                                employee.assets.map((asset: any, index: number) => (
                                                                                    <div key={index} className="row align-items-center mb-3">
                                                                                <div className="col-md-8">
                                                                                    <div className="d-flex align-items-center">
                                                                                                <div className="flex-shrink-0 me-2">
                                                                                            <ImageWithBasePath
                                                                                                        src={asset.image ? `/uploads/${asset.image}` : "assets/img/products/product-05.jpg"}
                                                                                                className="img-fluid rounded-circle"
                                                                                                        alt="asset"
                                                                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                                            />
                                                                                                </div>
                                                                                        <div>
                                                                                            <h6 className="mb-1">
                                                                                                        {asset.itemName} - {asset.assetCode}
                                                                                            </h6>
                                                                                            <div className="d-flex align-items-center">
                                                                                                <p>
                                                                                                    <span className="text-primary">
                                                                                                                {asset.assetCode}
                                                                                                        <i className="ti ti-point-filled text-primary mx-1" />
                                                                                                    </span>
                                                                                                            Assigned on {dayjs(asset.assignedOn).format('DD MMM, YYYY hh:mm A')}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-3">
                                                                                    <div>
                                                                                        <span className="mb-1 d-block">
                                                                                            Assigned by
                                                                                        </span>
                                                                                                                                                                                                 <div className="fw-normal">
                                                                                                     {asset.assignedBy}
                                                                                                 </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-md-1">
                                                                                    <div className="dropdown ms-2">
                                                                                        <Link
                                                                                            to="#"
                                                                                            className="d-inline-flex align-items-center"
                                                                                            data-bs-toggle="dropdown"
                                                                                            aria-expanded="false"
                                                                                        >
                                                                                            <i className="ti ti-dots-vertical" />
                                                                                        </Link>
                                                                                        <ul className="dropdown-menu dropdown-menu-end p-3">
                                                                                            <li>
                                                                                                <Link
                                                                                                    to="#"
                                                                                                    className="dropdown-item rounded-1"
                                                                                                    data-bs-toggle="modal" data-inert={true}
                                                                                                    data-bs-target="#asset_info"
                                                                                                            onClick={() => handleViewAssetInfo(index)}
                                                                                                >
                                                                                                    View Info
                                                                                                </Link>
                                                                                            </li>
                                                                                            {(user?.role === 'admin' || user?.role === 'hr') && (
                                                                                                        <>
                                                                                                <li>
                                                                                                    <Link
                                                                                                        to="#"
                                                                                                        className="dropdown-item rounded-1"
                                                                                                        data-bs-toggle="modal" data-inert={true}
                                                                                                        data-bs-target="#assign_asset"
                                                                                                        onClick={handleOpenAssignAsset}
                                                                                                    >
                                                                                                        Assign New Asset
                                                                                                    </Link>
                                                                                                </li>
                                                                                            <li>
                                                                                                <Link
                                                                                                    to="#"
                                                                                                                    className="dropdown-item rounded-1 text-danger"
                                                                                                                    onClick={() => handleDeleteAsset(index)}
                                                                                                >
                                                                                                                    Remove Asset
                                                                                                </Link>
                                                                                            </li>
                                                                                                        </>
                                                                                                    )}
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                                ))
                                                                            ) : (
                                                                                <div className="text-center py-4">
                                                                                    <div className="mb-3">
                                                                                        <i className="ti ti-package text-muted" style={{ fontSize: '3rem' }}></i>
                                                                        </div>
                                                                                    <h6 className="text-muted">No assets assigned</h6>
                                                                                    <p className="text-muted">This employee doesn't have any assets assigned yet.</p>
                                                                                    {(user?.role === 'admin' || user?.role === 'hr') && (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-primary btn-sm"
                                                                                            data-bs-toggle="modal"
                                                                                            data-bs-target="#assign_asset"
                                                                                            onClick={handleOpenAssignAsset}
                                                                                        >
                                                                                            <i className="ti ti-plus me-1"></i>
                                                                                            Assign First Asset
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            {/* /Edit Employee */}
            {/* Edit Personal */}
            <div className="modal fade" id="edit_personal">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Personal Info</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handlePersonalInfoSave}>
                            <div className="modal-body pb-0">
                                {personalError && <div className="alert alert-danger">{personalError}</div>}
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                Passport No <span className="text-danger"> *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                value={personalInfo.passportNumber}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, passportNumber: e.target.value })}
                                                required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                Passport Expiry Date <span className="text-danger"> *</span>
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
                                                    value={personalInfo.passportExpiry ? dayjs(personalInfo.passportExpiry) : null}
                                                    onChange={(date) => setPersonalInfo({ ...personalInfo, passportExpiry: date ? date.format('YYYY-MM-DD') : '' })}
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
                                                Nationality <span className="text-danger"> *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                value={personalInfo.nationality}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                                                required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                            <label className="form-label">Religion</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                value={personalInfo.religion}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, religion: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Marital status <span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={martialstatus}
                                                value={martialstatus.find(option => option.value === personalInfo.maritalStatus) || martialstatus[0]}
                                                onChange={(option) => option && setPersonalInfo({ ...personalInfo, maritalStatus: option.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Employment spouse</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={personalInfo.spouseEmployment}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, spouseEmployment: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">No. of children</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={personalInfo.childrenCount}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, childrenCount: e.target.value })}
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
                                    disabled={personalSaving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={personalSaving}>
                                    {personalSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Personal */}
            {/* Edit Emergency Contact */}
            <div className="modal fade" id="edit_emergency">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Emergency Contact Details</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleEmergencyContactsSave}>
                            <div className="modal-body pb-0">
                                {emergencyError && <div className="alert alert-danger">{emergencyError}</div>}
                                {emergencyContacts.map((contact, index) => (
                                    <div key={index} className="border-bottom mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="mb-0">Emergency Contact {index + 1}</h5>
                                            {emergencyContacts.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => removeEmergencyContact(index)}
                                                >
                                                    <i className="ti ti-trash" />
                                                </button>
                                            )}
                                        </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Name <span className="text-danger"> *</span>
                                                </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={contact.name}
                                                        onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                                                        required
                                                    />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                    <label className="form-label">Relationship</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={contact.relationship}
                                                        onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                                                    />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                        Phone <span className="text-danger"> *</span>
                                                </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={contact.phone}
                                                        onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                                                        required
                                                    />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                    <label className="form-label">Type</label>
                                                    <select
                                                        className="form-control"
                                                        value={contact.type}
                                                        onChange={(e) => updateEmergencyContact(index, 'type', e.target.value)}
                                                    >
                                                        <option value="Emergency">Emergency</option>
                                                        <option value="Family">Family</option>
                                                        <option value="Friend">Friend</option>
                                                        <option value="Work">Work</option>
                                                    </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ))}
                                <div className="text-center mb-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={addEmergencyContact}
                                    >
                                        <i className="ti ti-plus me-1" />
                                        Add Another Contact
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-white border me-2"
                                    data-bs-dismiss="modal"
                                    disabled={emergencySaving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={emergencySaving}>
                                    {emergencySaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Emergency Contact */}
            {/* Edit Bank */}
            <div className="modal fade" id="edit_bank">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Bank Details</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleBankDetailsSave}>
                            <div className="modal-body pb-0">
                                {bankError && <div className="alert alert-danger">{bankError}</div>}
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Bank Name <span className="text-danger"> *</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={bankDetails.bankName}
                                                onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Bank Account No</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={bankDetails.accountNo}
                                                onChange={e => setBankDetails({ ...bankDetails, accountNo: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">IFSC Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={bankDetails.ifsc}
                                                onChange={e => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Branch Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={bankDetails.branch}
                                                onChange={e => setBankDetails({ ...bankDetails, branch: e.target.value })}
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
                                    disabled={bankSaving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={bankSaving}>
                                    {bankSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Bank */}
            {/* Add Family */}
            <div className="modal fade" id="edit_familyinformation">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Family Information</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleFamilyInfoSave}>
                            <div className="modal-body pb-0">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Name <span className="text-danger"> *</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={familyInfo.name}
                                                onChange={(e) => setFamilyInfo(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Relationship </label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={familyInfo.relationship}
                                                onChange={(e) => setFamilyInfo(prev => ({ ...prev, relationship: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Phone </label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={familyInfo.phone}
                                                onChange={(e) => setFamilyInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Date of Birth <span className="text-danger"> *</span>
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
                                                    value={familyInfo.dateOfBirth ? dayjs(familyInfo.dateOfBirth, 'DD-MM-YYYY') : null}
                                                    onChange={(date) => setFamilyInfo(prev => ({ ...prev, dateOfBirth: date ? date.format('DD-MM-YYYY') : '' }))}
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
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
                                <button type="submit" className="btn btn-primary" disabled={familySaving}>
                                    {familySaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Family */}
            {/* Add Education */}
            <div className="modal fade" id="edit_education">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Education Information</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleEducationSave}>
                            <div className="modal-body pb-0">
                                {educationError && <div className="alert alert-danger">{educationError}</div>}
                                {education.map((edu, idx) => (
                                  <div className="row" key={idx}>
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Institution Name <span className="text-danger"> *</span>
                                        </label>
                                        <input 
                                          type="text" 
                                          className="form-control" 
                                          value={edu.institution}
                                          onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                                          placeholder={idx === 0 ? 'Secondary' : idx === 1 ? 'Senior Secondary' : idx === 2 ? 'Graduation' : idx === 3 ? 'Post Graduation' : 'Institution'}
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Course <span className="text-danger"> *</span>
                                        </label>
                                        <input 
                                          type="text" 
                                          className="form-control" 
                                          value={edu.degree}
                                          onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                          placeholder="e.g., B.Sc, M.Tech"
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Start Date <span className="text-danger"> *</span>
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
                                            value={edu.yearFrom ? dayjs(edu.yearFrom, 'DD-MM-YYYY') : null}
                                            onChange={(date) => updateEducation(idx, 'yearFrom', date ? date.format('DD-MM-YYYY') : '')}
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
                                          End Date <span className="text-danger"> *</span>
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
                                            value={edu.yearTo ? dayjs(edu.yearTo, 'DD-MM-YYYY') : null}
                                            onChange={(date) => updateEducation(idx, 'yearTo', date ? date.format('DD-MM-YYYY') : '')}
                                          />
                                          <span className="input-icon-addon">
                                            <i className="ti ti-calendar text-gray-7" />
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-12">
                                      <div className="d-flex justify-content-end mb-3">
                                        {education.length > 1 && (
                                          <button type="button" className="btn btn-outline-danger btn-sm me-2" onClick={() => removeEducation(idx)}>
                                            Remove
                                          </button>
                                        )}
                                        {idx === education.length - 1 && (
                                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={addEducation}>
                                            Add Another
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-white border me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={educationSaving}>
                                    {educationSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Education */}
            {/* Add Experience */}
            <div className="modal fade" id="edit_experience">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Company Information</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleExperienceSave}>
                            <div className="modal-body pb-0">
                                <div className="row">
                                    {experienceError && <div className="alert alert-danger">{experienceError}</div>}
                                    {experience.map((exp, idx) => (
                                      <>
                                        <div className="col-md-6">
                                          <div className="mb-3">
                                            <label className="form-label">
                                              Previous Company Name <span className="text-danger"> *</span>
                                            </label>
                                            <input 
                                              type="text" 
                                              className="form-control" 
                                              value={exp.company}
                                              onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                            />
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                          <div className="mb-3">
                                            <label className="form-label">
                                              Designation <span className="text-danger"> *</span>
                                            </label>
                                            <input 
                                              type="text" 
                                              className="form-control" 
                                              value={exp.position}
                                              onChange={(e) => updateExperience(idx, 'position', e.target.value)}
                                            />
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                          <div className="mb-3">
                                            <label className="form-label">
                                              Start Date <span className="text-danger"> *</span>
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
                                                value={exp.startDate ? dayjs(exp.startDate, 'DD-MM-YYYY') : null}
                                                onChange={(date) => updateExperience(idx, 'startDate', date ? date.format('DD-MM-YYYY') : '')}
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
                                              End Date <span className="text-danger"> *</span>
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
                                                value={exp.endDate ? dayjs(exp.endDate, 'DD-MM-YYYY') : null}
                                                onChange={(date) => updateExperience(idx, 'endDate', date ? date.format('DD-MM-YYYY') : '')}
                                              />
                                              <span className="input-icon-addon">
                                                <i className="ti ti-calendar text-gray-7" />
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="d-flex justify-content-end mb-3">
                                            {experience.length > 1 && (
                                              <button type="button" className="btn btn-outline-danger btn-sm me-2" onClick={() => removeExperience(idx)}>
                                                Remove
                                              </button>
                                            )}
                                            {idx === experience.length - 1 && (
                                              <button type="button" className="btn btn-outline-primary btn-sm" onClick={addExperience}>
                                                Add Another
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    ))}
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-check-label d-flex align-items-center mt-0">
                                                <input
                                                    className="form-check-input mt-0 me-2"
                                                    type="checkbox"
                                                    defaultChecked
                                                />
                                                <span className="text-dark">
                                                    Check if you working present
                                                </span>
                                            </label>
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
                                <button type="submit" className="btn btn-primary" disabled={experienceSaving}>
                                    {experienceSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Experience */}
            {/* Add Employee Success */}
            <div className="modal fade" id="success_modal" role="dialog">
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="text-center p-3">
                                <span className="avatar avatar-lg avatar-rounded bg-success mb-3">
                                    <i className="ti ti-check fs-24" />
                                </span>
                                <h5 className="mb-2">Employee Added Successfully</h5>
                                <p className="mb-3">
                                    Stephan Peralt has been added with Client ID :{" "}
                                    <span className="text-primary">#EMP - 0001</span>
                                </p>
                                <div>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <Link to={all_routes.employeeList} className="btn btn-dark w-100">
                                                Back to List
                                            </Link>
                                        </div>
                                        <div className="col-6">
                                            <Link
                                                to={all_routes.employeedetails}
                                                className="btn btn-primary w-100"
                                            >
                                                Detail Page
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Add Client Success */}
            {/* Add Statuorty */}
            {/* <div className="modal fade" id="add_bank_satutory">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Bank &amp; Statutory</h4>
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
                                <div className="border-bottom mb-4">
                                    <h5 className="mb-3">Basic Salary Information</h5>
                                    <div className="row mb-2">
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Salary basis <span className="text-danger"> *</span>
                                                </label>
                                                <CommonSelect
                                                    className='select'
                                                    options={salaryChoose}
                                                    defaultValue={salaryChoose[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Salary basis</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    defaultValue="$"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Payment type</label>
                                                <CommonSelect
                                                    className='select'
                                                    options={paymenttype}
                                                    defaultValue={paymenttype[0]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-bottom mb-4">
                                    <h5 className="mb-3">PF Information</h5>
                                    <div className="row mb-2">
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    PF contribution <span className="text-danger"> *</span>
                                                </label>
                                                <CommonSelect
                                                    className='select'
                                                    options={pfcontribution}
                                                    defaultValue={pfcontribution[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">PF No</label>
                                                <input type="text" className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Employee PF rate</label>
                                                <input type="text" className="form-control" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Additional rate</label>
                                                <CommonSelect
                                                    className='select'
                                                    options={additionalrate}
                                                    defaultValue={additionalrate[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Total rate</label>
                                                <input type="text" className="form-control" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="mb-3">ESI Information</h5>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                ESI contribution<span className="text-danger"> *</span>
                                            </label>
                                            <CommonSelect
                                                className='select'
                                                options={esi}
                                                defaultValue={esi[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">ESI Number</label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Employee ESI rate<span className="text-danger"> *</span>
                                            </label>
                                            <input type="text" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Additional rate</label>
                                            <CommonSelect
                                                className='select'
                                                options={additionalrate}
                                                defaultValue={additionalrate[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Total rate</label>
                                            <input type="text" className="form-control" />
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
                                <button type="button" data-bs-dismiss="modal" className="btn btn-primary">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div> */}
            {/* /Add Statuorty */}
            {/* Asset Information */}
            <div className="modal fade" id="asset_info">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Asset Information</h4>
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
                            {employee?.assets && selectedAssetIndex !== null && employee.assets[selectedAssetIndex] ? (
                                (() => {
                                    const asset = employee.assets[selectedAssetIndex];
                                    return (
                                        <>
                            <div className="bg-light p-3 rounded d-flex align-items-center mb-3">
                                <span className="avatar avatar-lg flex-shrink-0 me-2">
                                    <ImageWithBasePath
                                                        src={asset.image ? `/uploads/${asset.image}` : "assets/img/laptop.jpg"}
                                                        alt="asset"
                                                        className="img-fluid rounded-circle"
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                </span>
                                <div>
                                                    <h6>{asset.itemName} - {asset.assetCode}</h6>
                                    <p className="fs-13">
                                                        <span className="text-primary">{asset.assetCode} </span>
                                                        <i className="ti ti-point-filled text-primary" /> Assigned on {dayjs(asset.assignedOn).format('DD MMM, YYYY hh:mm A')}
                                    </p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                                        <p className="fs-13 mb-0">Item Name</p>
                                                        <p className="text-gray-9">{asset.itemName}</p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                                        <p className="fs-13 mb-0">Asset Code</p>
                                                        <p className="text-gray-9">{asset.assetCode}</p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                                                                                                 <p className="fs-13 mb-0">Assigned By</p>
                                                         <p className="text-gray-9">{asset.assignedBy}</p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                                        <p className="fs-13 mb-0">Assigned On</p>
                                                        <p className="text-gray-9">{dayjs(asset.assignedOn).format('DD MMM, YYYY hh:mm A')}</p>
                                    </div>
                                </div>
                                                {asset.note && (
                                                    <div className="col-md-12">
                                    <div className="mb-3">
                                                            <p className="fs-13 mb-0">Notes</p>
                                                            <p className="text-gray-9">{asset.note}</p>
                                    </div>
                                </div>
                                                )}
                                    </div>
                                            {asset.image && (
                            <div>
                                                    <p className="fs-13 mb-2">Asset Image</p>
                                <div className="d-flex align-items-center">
                                    <ImageWithBasePath
                                                            src={`/uploads/${asset.image}`}
                                                            alt="asset"
                                        className="img-fluid rounded"
                                                            style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                                            )}
                                        </>
                                    );
                                })()
                            ) : (
                                <div className="text-center py-4">
                                    <div className="mb-3">
                                        <i className="ti ti-package text-muted" style={{ fontSize: '3rem' }}></i>
                        </div>
                                    <h6 className="text-muted">No asset selected</h6>
                                    <p className="text-muted">Please select an asset to view its details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* /Asset Information */}
            {/* Assign Asset (Admin/HR) */}
            <div className="modal fade" id="assign_asset">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Assign Asset</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleAssignAssetSave}>
                            <div className="modal-body pb-0">
                                {assetError && <div className="alert alert-danger">{assetError}</div>}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Item Name</label>
                                            <input type="text" className="form-control" value={assetForm.itemName} onChange={(e) => setAssetForm({ ...assetForm, itemName: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Asset Code</label>
                                            <input type="text" className="form-control" value={assetForm.assetCode} onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Assigned By</label>
                                            <input type="text" className="form-control" value={assetForm.assignedBy} onChange={(e) => setAssetForm({ ...assetForm, assignedBy: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Asset Image</label>
                                            <input 
                                                type="file" 
                                                className="form-control" 
                                                accept="image/*"
                                                onChange={handleAssetImageChange}
                                            />
                                            {assetImagePreview && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={assetImagePreview} 
                                                        alt="Asset preview" 
                                                        className="img-thumbnail" 
                                                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                                                    />
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Note</label>
                                            <textarea className="form-control" rows={3} value={assetForm.note} onChange={(e) => setAssetForm({ ...assetForm, note: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={assetSaving}>{assetSaving ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Assign Asset */}
            {/* Refuse */}
            <div className="modal fade" id="refuse_msg">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Raise Issue</h4>
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
                                            <label className="form-label">
                                                Description<span className="text-danger"> *</span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows={4}
                                                defaultValue={""}
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
                                <button type="button" data-bs-dismiss="modal" className="btn btn-primary">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Refuse */}
            {/* Edit Employee Basic Info */}
            <div className="modal fade" id="edit_employee">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Basic Information</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleBasicInfoSave}>
                            <div className="modal-body pb-0">
                                {basicInfoError && <div className="alert alert-danger">{basicInfoError}</div>}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Phone Number <span className="text-danger"> *</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={basicInfo.phoneNumber}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, phoneNumber: e.target.value })}
                                                required
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
                                                className="form-control"
                                                value={basicInfo.email}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Gender</label>
                                            <select
                                                className="form-control"
                                                value={basicInfo.gender}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Birthday</label>
                                            <div className="input-icon-end position-relative">
                                                <DatePicker
                                                    className="form-control datetimepicker"
                                                    format={{
                                                        format: "DD-MM-YYYY",
                                                        type: "mask",
                                                    }}
                                                    getPopupContainer={getModalContainer}
                                                    placeholder="DD-MM-YYYY"
                                                    value={basicInfo.birthday ? dayjs(basicInfo.birthday, 'DD-MM-YYYY') : null}
                                                    onChange={(date) => setBasicInfo({ ...basicInfo, birthday: date ? date.format('DD-MM-YYYY') : '' })}
                                                />
                                                <span className="input-icon-addon">
                                                    <i className="ti ti-calendar text-gray-7" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label className="form-label">Address</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={basicInfo.address}
                                                onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                                                placeholder="Enter address"
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
                                    disabled={basicInfoSaving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={basicInfoSaving}>
                                    {basicInfoSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Employee Basic Info */}
            {/* Edit About Employee */}
            <div className="modal fade" id="edit_about">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit About Employee</h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={handleAboutSave}>
                            <div className="modal-body pb-0">
                                {aboutError && <div className="alert alert-danger">{aboutError}</div>}
                                <div className="mb-3">
                                    <label className="form-label">About</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        value={aboutText}
                                        onChange={(e) => setAboutText(e.target.value)}
                                        placeholder="Enter a brief description about the employee"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-white border me-2"
                                    data-bs-dismiss="modal"
                                    disabled={aboutSaving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={aboutSaving}>
                                    {aboutSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit About Employee */}
            {/* Edit Main Employee Info */}
            <div className="modal fade" id="add_employee">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center">
                                <h4 className="modal-title me-2">Edit Employee Information</h4>
                                <span>Employee ID : {employee?.employeeId || 'N/A'}</span>
                            </div>
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
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                First Name <span className="text-danger"> *</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                defaultValue={employee?.firstName || ''} 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Last Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                defaultValue={employee?.lastName || ''} 
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
                                                className="form-control" 
                                                defaultValue={employee?.employeeId || ''} 
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
                                                    defaultValue={employee?.joiningDate ? dayjs(employee.joiningDate) : null}
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
                                                Email <span className="text-danger"> *</span>
                                            </label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                defaultValue={employee?.email || ''} 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Phone Number <span className="text-danger"> *</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                defaultValue={employee?.phoneNumber || ''} 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Company<span className="text-danger"> *</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                defaultValue={employee?.company || ''} 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Department</label>
                                            <CommonSelect
                                                className='select'
                                                options={departmentChoose}
                                                defaultValue={departmentChoose.find(d => d.value === employee?.department) || departmentChoose[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Designation</label>
                                            <CommonSelect
                                                className='select'
                                                options={designationChoose}
                                                defaultValue={designationChoose.find(d => d.value === employee?.designation) || designationChoose[0]}
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
                                                defaultValue={employee?.about || ''}
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
                                >
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" data-bs-dismiss="modal">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Edit Main Employee Info */}
        </>








    )
}

export default EmployeeDetails
