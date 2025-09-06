import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from "../../core/common/dataTable/index";
import { all_routes } from '../router/all_routes';
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import ProfileImage from '../../core/common/ProfileImage';
import CommonSelect, { Option } from '../../core/common/commonSelect';
import { DatePicker, message, Button, Upload, Input, Form } from "antd";
import { UploadOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import CollapseHeader from '../../core/common/collapse-header/collapse-header';
import axios from 'axios';
import designationService from '../../core/services/designationService';
import { useUser } from '../../core/context/UserContext';

const Promotion = () => {
    const { user, isLoading } = useUser();
    const [employees, setEmployees] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [promotionModal, setPromotionModal] = useState<{ visible: boolean, employee: any | null }>({ visible: false, employee: null });
    const [selectedDesignation, setSelectedDesignation] = useState<Option | undefined>(undefined);
    const [promotionDate, setPromotionDate] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [employeePromotions, setEmployeePromotions] = useState<any[]>([]);
    const [imageLoadStates, setImageLoadStates] = useState<{[key: string]: boolean}>({});
    const [form] = Form.useForm();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/employees`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEmployees(res.data);
        } catch (err) {
            message.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchDesignations = async () => {
        try {
            const res = await designationService.getDesignations();
            setDesignations(res.data.filter((d: any) => d.status === 'Active'));
        } catch (err) {
            message.error('Failed to fetch designations');
        }
    };

    const fetchPromotions = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/promotions`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEmployeePromotions(res.data.data || []);
        } catch (err) {
            console.error('Error fetching promotions:', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchDesignations();
        fetchPromotions();
    }, []);

    if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'hr'))) {
        return <div className="container mt-5"><div className="alert alert-danger">You do not have permission to access this page.</div></div>;
    }

    const handlePromote = (employee: any) => {
        setPromotionModal({ visible: true, employee });
        setSelectedDesignation(undefined);
        setPromotionDate(null);
        setSelectedFile(null);
        form.resetFields();
    };

    const handlePromotionSubmit = async () => {
        if (!selectedDesignation || !promotionModal.employee) {
            message.warning('Please select a new designation');
            return;
        }
        setLoading(true);
        try {
            // Create promotion record
            const formData = new FormData();
            formData.append('employeeId', promotionModal.employee._id);
            formData.append('fromDesignation', promotionModal.employee.designation);
            formData.append('toDesignation', selectedDesignation.value);
            formData.append('effectiveDate', promotionDate ? promotionDate.toDate() : new Date().toISOString());
            formData.append('reason', 'Promotion approved');
            formData.append('remarks', 'Promotion processed through system');

            if (selectedFile) {
                formData.append('promotionLetter', selectedFile.originFileObj || selectedFile);
            }

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/promotions`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('Upload response:', response.data);
            message.success('Promotion successful');
            setPromotionModal({ visible: false, employee: null });
            fetchEmployees();
            fetchPromotions();
            
            // Close modal using data attributes
            const modal = document.getElementById('promotionModal');
            if (modal) {
                const closeButton = modal.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
                if (closeButton) {
                    closeButton.click();
                }
            }
        } catch (err: any) {
            console.error('Promotion error details:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                message.error(`Promotion failed: ${err.response.data.message || 'Unknown error'}`);
            } else {
                message.error('Failed to promote employee');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDesignationChange = (option: Option | null) => {
        setSelectedDesignation(option || undefined);
    };

    const handleFileChange = (info: any) => {
        console.log('File change info:', info);
        if (info.fileList && info.fileList.length > 0) {
            console.log('Selected file:', info.fileList[0]);
            setSelectedFile(info.fileList[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleDownloadLetter = async (promotion: any) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/promotions/${promotion._id}/download-letter`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    responseType: 'blob'
                }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', promotion.promotionLetter.originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            message.error('Failed to download promotion letter');
        }
    };

    const getEmployeePromotion = (employeeId: string) => {
        return employeePromotions.find(p => p.employee._id === employeeId);
    };

    const handleImageLoad = (employeeId: string) => {
        setImageLoadStates(prev => ({ ...prev, [employeeId]: true }));
    };

    const handleImageError = (employeeId: string) => {
        setImageLoadStates(prev => ({ ...prev, [employeeId]: false }));
    };

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    const getProfileImage = (img: string | undefined) => {
        if (!img) return '/assets/img/users/default.jpg';
        if (img.startsWith('http') || img.startsWith('/uploads')) return img;
        return `${BACKEND_URL}/uploads/${img.replace(/^uploads[\\/]/, '')}`;
    };

    const columns = [
        {
            title: "Employee",
            dataIndex: "firstName",
            render: (text: string, record: any) => {
                return (
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <ProfileImage
                                profileImage={record.profileImage}
                                alt="user"
                                className="rounded-circle"
                                style={{ 
                                    width: 40, 
                                    height: 40, 
                                    objectFit: 'cover',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef'
                                }}
                                fallbackSrc={`${BACKEND_URL}/uploads/default.jpg`}
                            />
                        </div>
                        <div>
                            <h6 className="mb-0 fw-semibold">{record.firstName} {record.lastName}</h6>
                            <small className="text-muted">{record.email}</small>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Department",
            dataIndex: "department",
        },
        {
            title: "Current Designation",
            dataIndex: "designation",
        },
        {
            title: "Promote",
            dataIndex: "actions",
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    size="small"
                    className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
                    icon={<i className="ti ti-arrow-up me-1" />}
                    onClick={() => handlePromote(record)}
                    data-bs-toggle="modal"
                    data-bs-target="#promotionModal"
                    style={{ 
                        height: '32px',
                        minWidth: '80px',
                        backgroundColor: '#3b82f6',
                        borderColor: '#3b82f6'
                    }}
                >
                    Promote
                </Button>
            ),
        },
        {
            title: "Promotion Letter",
            dataIndex: "document",
            render: (_: any, record: any) => {
                const promotion = getEmployeePromotion(record._id);
                return (
                    <div className="d-flex gap-2">
                        {promotion && promotion.promotionLetter ? (
                            <Button
                                type="primary"
                                size="small"
                                className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                                icon={<DownloadOutlined className="me-1" />}
                                onClick={() => handleDownloadLetter(promotion)}
                                style={{ 
                                    height: '32px',
                                    minWidth: '90px'
                                }}
                            >
                                Download
                            </Button>
                        ) : (
                            <span className="text-muted fw-normal">No document</span>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <div className="page-wrapper">
                <div className="content">
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Promotion</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Performance</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Promotion
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            <div className="head-icons ms-2">
                                <CollapseHeader />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="card">
                                <div className="card-header">
                                    <h4 className="card-title">Promote Employees</h4>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <Table 
                                            dataSource={employees} 
                                            columns={columns} 
                                            rowKey="_id"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Removed Promotion History & Documents section as per edit hint */}
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
            {/* Promotion Modal */}
            <div className="modal fade" id="promotionModal" tabIndex={-1} aria-labelledby="promotionModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">
                                <i className="ti ti-arrow-up me-2 text-primary"></i>
                                Promote {promotionModal.employee ? promotionModal.employee.firstName + ' ' + promotionModal.employee.lastName : ''}
                            </h4>
                            <button
                                type="button"
                                className="btn-close custom-btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={() => setPromotionModal({ visible: false, employee: null })}
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handlePromotionSubmit(); }}>
                            <div className="modal-body pb-0">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">New Designation</label>
                                            <div style={{ position: 'relative' }}>
                                                <CommonSelect
                                                    options={designations.map((d: any) => ({ label: d.name, value: d.name }))}
                                                    value={selectedDesignation}
                                                    onChange={handleDesignationChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Effective Date</label>
                                            <DatePicker
                                                className="form-control"
                                                value={promotionDate}
                                                onChange={setPromotionDate}
                                                format="DD-MM-YYYY"
                                                placeholder="Select effective date"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Promotion Letter (Optional)</label>
                                    <div className="mt-3">
                                        <Upload
                                            beforeUpload={() => false}
                                            maxCount={1}
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            fileList={selectedFile ? [selectedFile] : []}
                                            className="upload-area"
                                        >
                                            <Button
                                                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                                                style={{ height: '45px', width: '100%' }}
                                            >
                                                <UploadOutlined className="me-2" />
                                                Select File
                                            </Button>
                                        </Upload>
                                    </div>
                                    <small className="form-text text-muted mt-2 d-block">
                                        Supported formats: PDF, DOC, DOCX (Max 10MB)
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-white border me-2"
                                    data-bs-dismiss="modal"
                                    onClick={() => setPromotionModal({ visible: false, employee: null })}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Promoting...' : 'Promote'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Promotion;
