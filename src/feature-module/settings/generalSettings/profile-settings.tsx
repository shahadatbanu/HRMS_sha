import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import CommonSelect from "../../../core/common/commonSelect";
import { profilecity, profilesel, profilestate } from "../../../core/common/selectoption/selectoption";
import CollapseHeader from "../../../core/common/collapse-header/collapse-header";
import { useUser } from '../../../core/context/UserContext';
import { backend_url } from "../../../environment";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import Swal from 'sweetalert2';

const Profilesettings = () => {
  const routes = all_routes;
  const { user, isLoading, setUser } = useUser();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    country: "Select",
    state: "Select",
    city: "Select",
    postalCode: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load user data on component mount
  useEffect(() => {
    if (user && !isLoading) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        country: "Select",
        state: "Select",
        city: "Select",
        postalCode: "",
      });
    }
  }, [user, isLoading]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('address', formData.address);
      
      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await fetch(`${backend_url}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

             if (!response.ok) {
         setError(data.message || 'Update failed');
       } else {
         setSuccess('Profile updated successfully');
         
         // Update user context with new data
         if (data.user) {
           setUser(data.user);
         }
         
         // Show success message
         Swal.fire({
           icon: 'success',
           title: 'Success!',
           text: 'Profile updated successfully',
           timer: 2000,
           showConfirmButton: false
         });
         
         // Reset image state
         setProfileImage(null);
         setImagePreview(null);
       }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get profile image source
  const getProfileImageSrc = () => {
    if (imagePreview) {
      return imagePreview;
    }
    if (user?.profileImage) {
      return `${backend_url}/uploads/${user.profileImage}`;
    }
    return '/assets/img/profiles/avatar-24.jpg';
  };

  return (
    <div>
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            {/* Breadcrumb */}
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
              <div className="my-auto mb-2">
                <h2 className="mb-1">Profile Settings</h2>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>
                        <i className="ti ti-smart-home" />
                      </Link>
                    </li>
                    <li className="breadcrumb-item">Settings</li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Profile Settings
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="head-icons ms-2">
                <CollapseHeader />
              </div>
            </div>
            {/* /Breadcrumb */}
            
            {/* Success/Error Messages */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
              </div>
            )}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}

            <div className="row">
              <div className="col-xl-3 theiaStickySidebar">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex flex-column list-group settings-list">
                      <Link
                        to={routes.profilesettings}
                        className="d-inline-flex align-items-center rounded active py-2 px-3"
                      >
                        <i className="ti ti-arrow-badge-right me-2" />
                        Profile Settings
                      </Link>
                      <Link
                        to={routes.securitysettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Security Settings
                      </Link>
                      <Link
                        to={routes.notificationssettings}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Notifications
                      </Link>
                      <Link
                        to={routes.connectedApps}
                        className="d-inline-flex align-items-center rounded py-2 px-3"
                      >
                        Connected Apps
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-9">
                <div className="card">
                  <div className="card-body">
                    <div className="border-bottom mb-3 pb-3">
                      <h4>Profile Settings</h4>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="border-bottom mb-3">
                        <div className="row">
                          <div className="col-md-12">
                            <div>
                              <h6 className="mb-3">Basic Information</h6>
                              <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                                <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                                  {user?.profileImage || imagePreview ? (
                                    <img
                                      src={getProfileImageSrc()}
                                      alt="Profile"
                                      className="img-fluid rounded-circle"
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/assets/img/profiles/avatar-24.jpg";
                                      }}
                                    />
                                  ) : (
                                    <i className="ti ti-photo text-gray-3 fs-16" />
                                  )}
                                </div>
                                <div className="profile-upload">
                                  <div className="mb-2">
                                    <h6 className="mb-1">Profile Photo</h6>
                                    <p className="fs-12">
                                      Recommended image size is 300px x 300px, max 5MB
                                    </p>
                                  </div>
                                  <div className="profile-uploader d-flex align-items-center">
                                    <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                      Upload
                                      <input
                                        type="file"
                                        className="form-control image-sign"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                      />
                                    </div>
                                    {(profileImage || imagePreview) && (
                                      <button
                                        type="button"
                                        className="btn btn-light btn-sm"
                                        onClick={() => {
                                          setProfileImage(null);
                                          setImagePreview(null);
                                        }}
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">
                                  First Name *
                                </label>
                              </div>
                              <div className="col-md-8">
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">
                                  Last Name *
                                </label>
                              </div>
                              <div className="col-md-8">
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">Email</label>
                              </div>
                              <div className="col-md-8">
                                <input 
                                  type="email" 
                                  className="form-control"
                                  value={formData.email}
                                  disabled
                                  title="Email cannot be changed"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">Phone</label>
                              </div>
                              <div className="col-md-8">
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="phoneNumber"
                                  value={formData.phoneNumber}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-bottom mb-3">
                        <h6 className="mb-3">Address Information</h6>
                        <div className="row">
                          <div className="col-md-12">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-2">
                                <label className="form-label mb-md-0">Address</label>
                              </div>
                              <div className="col-md-10">
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">Country</label>
                              </div>
                              <div className="col-md-8">
                                <div>
                                  <CommonSelect
                                    className="select"
                                    options={profilesel}
                                    value={profilesel.find(opt => opt.value === formData.country)}
                                    onChange={(option) => option && handleSelectChange('country', option.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">State</label>
                              </div>
                              <div className="col-md-8">
                                <div>
                                  <CommonSelect
                                    className="select"
                                    options={profilestate}
                                    value={profilestate.find(opt => opt.value === formData.state)}
                                    onChange={(option) => option && handleSelectChange('state', option.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">City</label>
                              </div>
                              <div className="col-md-8">
                                <CommonSelect
                                  className="select"
                                  options={profilecity}
                                  value={profilecity.find(opt => opt.value === formData.city)}
                                  onChange={(option) => option && handleSelectChange('city', option.value)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="row align-items-center mb-3">
                              <div className="col-md-4">
                                <label className="form-label mb-md-0">
                                  Postal Code
                                </label>
                              </div>
                              <div className="col-md-8">
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="postalCode"
                                  value={formData.postalCode}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-end">
                        <Link
                          to={routes.adminDashboard}
                          className="btn btn-outline-light border me-3"
                        >
                          Cancel
                        </Link>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
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
      </>
    </div>
  )
}

export default Profilesettings;
