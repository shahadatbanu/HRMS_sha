import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PredefinedDateRanges from '../../../core/common/datePicker'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { all_routes } from '../../router/all_routes'
import CollapseHeader from '../../../core/common/collapse-header/collapse-header'
import CommonSelect from '../../../core/common/commonSelect';
import { useUser } from '../../../core/context/UserContext';

// Add CSS animations for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes progressBar {
        from {
            width: 100%;
        }
        to {
            width: 0%;
        }
    }
`;

// Define interface for recruiter type
interface Recruiter {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    designation: string;
    department: string;
}

// Define interface for candidate details
interface CandidateDetails {
    _id: string;
    candidateId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    appliedRole: string;
    appliedCompany: string;
    currentRole: string;
    yearsOfExperience: number;
    relevantExperience: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    cvFile: string;
    profileImage: string;
    coverLetter: string;
    portfolio: string;
    status: string;
    source: string;
    createdAt: string;
    recruiter: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        designation: string;
        profileImage?: string;
    };
    assignedTo: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage?: string;
    };
    techStack: Array<{
        category: string;
        skills: string[];
    }>;
    education: Array<{
        institution: string;
        degree: string;
        fieldOfStudy: string;
        yearFrom: string;
        yearTo: string;
        grade: string;
        description: string;
    }>;
    experience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
        technologies: string[];
    }>;
    notes: Array<{
        _id: string;
        content: string;
        createdBy: {
            firstName: string;
            lastName: string;
            profileImage?: string;
        };
        createdAt: string;
    }>;
    attachments: Array<{
        _id: string;
        fileName: string;
        originalName: string;
        fileType: string;
        fileSize: number;
        uploadedBy: {
            firstName: string;
            lastName: string;
            profileImage?: string;
        };
        uploadedAt: string;
        description?: string;
    }>;
    interviews: Array<{
        scheduledDate: string;
        completedDate: string;
        interviewer: string;
        notes: string;
        feedback: string;
        rating: number;
        status: string;
    }>;
}

const CandidateGrid = () => {
    const [form, setForm] = useState({
        candidateId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        appliedRole: '',
        appliedCompany: '',
        source: '',
        currentRole: '',
        yearsOfExperience: '',
        relevantExperience: '',
        recruiter: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        },
        education: [],
        certifications: [],
        experience: [],
        techStack: [],
        coverLetter: '',
        portfolio: ''
    });

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingCvFile, setExistingCvFile] = useState<string | null>(null);
    const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetails | null>(null);
    const [loadingCandidateDetails, setLoadingCandidateDetails] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [filtering, setFiltering] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    // Filter state
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        assignedTo: '',
        experience: '',
        techStack: '',
        dateFrom: '',
        dateTo: ''
    });
    const [confirmAction, setConfirmAction] = useState<{ type: 'reject' | 'next-stage', candidateId: string, newStatus: string, displayName?: string } | null>(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [editingNote, setEditingNote] = useState<{ id: string, content: string } | null>(null);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [isDeletingNote, setIsDeletingNote] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
    
    // Attachments state
    const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [attachmentDescription, setAttachmentDescription] = useState('');
    const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
    const [isDeletingAttachment, setIsDeletingAttachment] = useState(false);
    const [deleteAttachmentId, setDeleteAttachmentId] = useState<string | null>(null);
    const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] = useState(false);
    
    // Candidate CRUD states
    const [showDeleteCandidateModal, setShowDeleteCandidateModal] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
    const [isDeletingCandidate, setIsDeletingCandidate] = useState(false);
    const [showEditCandidateModal, setShowEditCandidateModal] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<any>(null);

    // User context for role-based access control
    const { user, hasPermission } = useUser();

    const sourceOptions = [
        { value: 'Reference', label: 'Reference' },
        { value: 'Direct', label: 'Direct' },
        { value: 'Job Board', label: 'Job Board' },
        { value: 'LinkedIn', label: 'LinkedIn' },
        { value: 'Other', label: 'Other' }
    ];

    // techCategories removed as it's not being used

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setForm(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof typeof form] as any),
                    [child]: value
                }
            }));
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (e.target.name === 'cvFile') {
                setCvFile(file);
            } else if (e.target.name === 'profileImage') {
                setProfileImageFile(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const clearForm = () => {
        setForm({
            candidateId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            appliedRole: '',
            appliedCompany: '',
            source: '',
            currentRole: '',
            yearsOfExperience: '',
            relevantExperience: '',
            recruiter: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: ''
            },
            education: [],
            certifications: [],
            experience: [],
            techStack: [],
            coverLetter: '',
            portfolio: ''
        });
        setCvFile(null);
        setProfileImageFile(null);
        setImagePreview(null);
        setExistingCvFile(null);
        setExistingProfileImage(null);
        setMessage('');
        // Don't reset showSuccess here - let it be managed separately
    };

    const fetchRecruiters = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await fetch('/api/candidates/employees/recruiters', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setRecruiters(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching recruiters:', error);
        }
    };

    // Fetch recruiters and candidates on component mount
    useEffect(() => {
        fetchRecruiters();
        fetchCandidates(1, filters);
    }, []);

    // Add event listener for offcanvas close
    useEffect(() => {
        const offcanvas = document.getElementById('candidate_details');
        if (offcanvas) {
            const handleOffcanvasClose = () => {
                setSelectedCandidate(null);
            };
            
            offcanvas.addEventListener('hidden.bs.offcanvas', handleOffcanvasClose);
            
            return () => {
                offcanvas.removeEventListener('hidden.bs.offcanvas', handleOffcanvasClose);
            };
        }
    }, []);

    // Auto-dismiss success alerts after 4 seconds
    useEffect(() => {
        if (showSuccessAlert) {
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 4000);
            
            return () => clearTimeout(timer);
        }
    }, [showSuccessAlert]);

    // Auto-dismiss error modals after 6 seconds
    useEffect(() => {
        if (showErrorModal) {
            const timer = setTimeout(() => {
                setShowErrorModal(false);
            }, 6000);
            
            return () => clearTimeout(timer);
        }
    }, [showErrorModal]);

    const fetchCandidates = async (page = currentPage, filterParams = filters) => {
        try {
            setLoadingCandidates(true);
            setFiltering(false);
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...filters
            });

            const response = await fetch(`/api/candidates?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setCandidates(result.data);
                    setTotalRecords(result.pagination.totalRecords);
                    // Use the total pages from the backend response
                    setTotalPages(result.pagination.total);
                    setCurrentPage(page);
                }
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const fetchCandidateDetails = async (candidateId: string) => {
        try {
            setLoadingCandidateDetails(true);
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await fetch(`/api/candidates/${candidateId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSelectedCandidate(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching candidate details:', error);
        } finally {
            setLoadingCandidateDetails(false);
        }
    };

    const handleCandidateClick = (candidateId: string) => {
        fetchCandidateDetails(candidateId);
    };

    // Filter handling functions
    const handleFilterChange = (filterName: string, value: string) => {
        const newFilters = { ...filters, [filterName]: value };
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
        setFiltering(true);
        
        // Debounce search input for better UX
        if (filterName === 'search') {
            const timeoutId = setTimeout(() => {
                fetchCandidates(1, newFilters);
                setFiltering(false);
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            fetchCandidates(1, newFilters);
            setFiltering(false);
        }
    };

    const handlePageChange = (page: number) => {
        fetchCandidates(page, filters);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        const newFilters = { ...filters };
        fetchCandidates(1, newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            status: '',
            assignedTo: '',
            experience: '',
            techStack: '',
            dateFrom: '',
            dateTo: ''
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        fetchCandidates(1, clearedFilters);
    };



    const getStatusBadgeColor = (status: string) => {
        // If status is empty/null/undefined, default to 'New'
        const actualStatus = status || 'New';
        
        switch (actualStatus) {
            case 'CV Received':
            case 'New':
                return 'bg-purple';
            case 'CV Shortlisted by Client':
            case 'Scheduled':
                return 'bg-pink';
            case 'Interview Scheduled':
            case 'Interviewed':
                return 'bg-info';
            case 'Interview Completed':
            case 'Offered':
                return 'bg-warning';
            case 'Selected':
            case 'Offer Received':
            case 'Hired':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const getDisplayStatus = (status: string) => {
        // If status is empty/null/undefined, return 'New'
        if (!status || status.trim() === '') {
            return 'New';
        }
        
        switch (status) {
            case 'CV Received':
            case 'New':
                return 'New';
            case 'CV Shortlisted by Client':
            case 'Scheduled':
                return 'Scheduled';
            case 'Interview Scheduled':
            case 'Interviewed':
                return 'Interviewed';
            case 'Interview Completed':
            case 'Offered':
                return 'Offered';
            case 'Selected':
            case 'Offer Received':
            case 'Hired':
                return 'Hired';
            case 'Rejected':
                return 'Rejected';
            default:
                return 'New';
        }
    };

    // Function to determine which pipeline stage should be active
    const getActivePipelineStage = (status: string) => {
        // If status is empty/null/undefined, return 'New'
        if (!status || status.trim() === '') {
            return 'New';
        }
        
        switch (status) {
            case 'CV Received':
            case 'New':
                return 'New';
            case 'CV Shortlisted by Client':
            case 'Scheduled':
                return 'Scheduled';
            case 'Interview Scheduled':
            case 'Interviewed':
                return 'Interviewed';
            case 'Interview Completed':
            case 'Offered':
                return 'Offered';
            case 'Selected':
            case 'Offer Received':
            case 'Hired':
                return 'Hired';
            case 'Rejected':
                return 'Rejected';
            default:
                return 'New';
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccess(false);
        // Clear form when success modal is closed
        setForm({
            candidateId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            appliedRole: '',
            appliedCompany: '',
            source: '',
            currentRole: '',
            yearsOfExperience: '',
            relevantExperience: '',
            recruiter: '',
            address: {
                street: '',
                city: '',
                state: '',
                country: '',
                zipCode: ''
            },
            education: [],
            certifications: [],
            experience: [],
            techStack: [],
            coverLetter: '',
            portfolio: ''
        });
        setCvFile(null);
        setProfileImageFile(null);
        setImagePreview(null);
        setMessage('');
        // Refresh candidates after successful addition
        fetchCandidates();
    };

    const getCleanFileName = (fileName: string) => {
        if (!fileName) return 'CV File';
        
        const ext = fileName.split('.').pop();
        const nameWithoutExt = fileName.replace(`.${ext}`, '');
        
        // Handle both old format (timestamp-random-originalname) and new format (originalname-shortid)
        const parts = nameWithoutExt.split('-');
        
        // If it's the old format with timestamp at the beginning (timestamp is 13+ digits)
        if (parts.length >= 3 && /^\d{13,}$/.test(parts[0])) {
            // Old format: timestamp-random-originalname
            // Remove first two parts (timestamp and random number)
            const cleanName = parts.slice(2).join('-');
            return cleanName ? `${cleanName}.${ext}` : fileName;
        } else {
            // New format: originalname-shortid or originalname-shortid-shortid
            // Check if the last two parts are numeric identifiers
            if (parts.length >= 2) {
                const lastPart = parts[parts.length - 1];
                const secondLastPart = parts[parts.length - 2];
                
                // Check if last part is a short numeric ID (3-6 digits)
                if (/^\d{3,6}$/.test(lastPart)) {
                    // Check if second last part is also a numeric ID (6-9 digits)
                    if (/^\d{6,9}$/.test(secondLastPart)) {
                        // Remove both numeric identifiers
                        const cleanName = parts.slice(0, -2).join('-');
                        return cleanName ? `${cleanName}.${ext}` : fileName;
                    } else {
                        // Remove only the last numeric identifier
                        const cleanName = parts.slice(0, -1).join('-');
                        return cleanName ? `${cleanName}.${ext}` : fileName;
                    }
                } else if (/^\d{6,9}$/.test(lastPart)) {
                    // Remove the last part (short unique identifier)
                    const cleanName = parts.slice(0, -1).join('-');
                    return cleanName ? `${cleanName}.${ext}` : fileName;
                }
            }
            
            // If no pattern matches, return the original
            return fileName;
        }
    };

    const truncateFileName = (fileName: string, maxLength: number = 50) => {
        if (fileName.length <= maxLength) return fileName;
        
        const fileExt = fileName.substring(fileName.lastIndexOf('.'));
        const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        const maxNameLength = maxLength - fileExt.length - 3; // 3 for "..."
        
        if (fileNameWithoutExt.length <= maxNameLength) return fileName;
        
        // Try to keep the beginning and end of the filename
        const startLength = Math.floor(maxNameLength * 0.6);
        const endLength = maxNameLength - startLength;
        
        const start = fileNameWithoutExt.substring(0, startLength);
        const end = fileNameWithoutExt.substring(fileNameWithoutExt.length - endLength);
        
        return start + '...' + end + fileExt;
    };

    const parseErrorMessage = (error: any) => {
        if (typeof error === 'string') {
            return {
                title: 'Error',
                message: error
            };
        }
        
        if (error?.message) {
            // Handle MongoDB duplicate key errors
            if (error.message.includes('E11000 duplicate key error')) {
                if (error.message.includes('email')) {
                    return {
                        title: 'Email Already Exists',
                        message: 'A candidate with this email address already exists. Please use a different email address or check if this candidate has already been added to the system.'
                    };
                }
                return {
                    title: 'Duplicate Entry',
                    message: 'This record already exists in the system. Please check your input and try again.'
                };
            }
            
            // Handle validation errors
            if (error.message.includes('validation failed')) {
                return {
                    title: 'Validation Error',
                    message: 'Please check your input and ensure all required fields are filled correctly.'
                };
            }
            
            // Handle file upload errors
            if (error.message.includes('file') || error.message.includes('upload')) {
                return {
                    title: 'File Upload Error',
                    message: error.message
                };
            }
            
            return {
                title: 'Error',
                message: error.message
            };
        }
        
        return {
            title: 'Unexpected Error',
            message: 'An unexpected error occurred. Please try again.'
        };
    };

    const handleDownloadCV = async (candidateId: string, fileName: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication required. Please login again.');
                return;
            }

            const response = await fetch(`/api/candidates/${candidateId}/download-cv`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to download CV');
            }

            // Create a blob from the response
            const blob = await response.blob();
            
            // Create a download link with clean filename
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = getCleanFileName(fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading CV:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Error downloading CV: ${errorMessage}`);
        }
    };

    const handleStatusUpdate = async (candidateId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication required. Please login again.');
                return;
            }

            const response = await fetch(`/api/candidates/${candidateId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: `Status changed to ${newStatus}`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }

            // Refresh the candidate details from server to get updated status
            await fetchCandidateDetails(candidateId);

            // Refresh the candidates list to show updated status
            await fetchCandidates();

            setSuccessMessage(`Status updated successfully to ${newStatus}`);
            setShowSuccessAlert(true);
            
            // Auto-hide success alert after 3 seconds
            setTimeout(() => {
                setShowSuccessAlert(false);
            }, 3000);

        } catch (error) {
            console.error('Error updating status:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setSuccessMessage(`Error updating status: ${errorMessage}`);
            setShowSuccessAlert(true);
            
            // Auto-hide error alert after 5 seconds
            setTimeout(() => {
                setShowSuccessAlert(false);
            }, 5000);
        }
    };

    const handleReject = () => {
        if (selectedCandidate) {
            setConfirmAction({
                type: 'reject',
                candidateId: selectedCandidate._id,
                newStatus: 'Rejected'
            });
            setShowConfirmModal(true);
        }
    };

    const handleMoveToNextStage = () => {
        if (selectedCandidate) {
            const currentStatus = selectedCandidate.status;
            let nextStatus = 'New';

            // Define the status progression using consistent naming
            switch (currentStatus) {
                case 'New':
                    nextStatus = 'Scheduled';
                    break;
                case 'Scheduled':
                    nextStatus = 'Interviewed';
                    break;
                case 'Interviewed':
                    nextStatus = 'Offered';
                    break;
                case 'Offered':
                    nextStatus = 'Hired';
                    break;
                case 'Hired':
                    setSuccessMessage('Candidate has already reached the final stage.');
                    setShowSuccessAlert(true);
                    setTimeout(() => setShowSuccessAlert(false), 3000);
                    return;
                case 'Rejected':
                    setSuccessMessage('Cannot move a rejected candidate to the next stage. Please change the status first.');
                    setShowSuccessAlert(true);
                    setTimeout(() => setShowSuccessAlert(false), 3000);
                    return;
                default:
                    nextStatus = 'Scheduled';
            }

            // Map status to display name for confirmation dialog
            const statusToDisplayMap: { [key: string]: string } = {
                'New': 'New',
                'Scheduled': 'Scheduled',
                'Interviewed': 'Interviewed',
                'Offered': 'Offered',
                'Hired': 'Hired',
                'Rejected': 'Rejected'
            };

            const displayName = statusToDisplayMap[nextStatus] || nextStatus;

            setConfirmAction({
                type: 'next-stage',
                candidateId: selectedCandidate._id,
                newStatus: nextStatus,
                displayName: displayName
            });
            setShowConfirmModal(true);
        }
    };

    const handlePipelineStageClick = (stageStatus: string) => {
        if (selectedCandidate) {
            // Map the display names to actual status values - using consistent naming
            const statusMap: { [key: string]: string } = {
                'New': 'New',
                'Scheduled': 'Scheduled',
                'Interviewed': 'Interviewed',
                'Offered': 'Offered',
                'Hired': 'Hired',
                'Rejected': 'Rejected'
            };

            const newStatus = statusMap[stageStatus];
            
            if (newStatus) {
                if (newStatus !== selectedCandidate.status) {
                    setConfirmAction({
                        type: 'next-stage',
                        candidateId: selectedCandidate._id,
                        newStatus: newStatus,
                        displayName: stageStatus // Add display name for confirmation dialog
                    });
                    setShowConfirmModal(true);
                } else {
                    // Show feedback that candidate is already at this stage
                    setSuccessMessage(`Candidate is already at the "${stageStatus}" stage.`);
                    setShowSuccessAlert(true);
                    setTimeout(() => setShowSuccessAlert(false), 3000);
                }
            }
        }
    };

    const handleAddNote = async () => {
        if (!selectedCandidate || !newNote.trim()) {
            return;
        }

        setIsAddingNote(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/candidates/${selectedCandidate._id}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newNote.trim() })
            });

            const result = await response.json();

            if (result.success) {
                // Refresh candidate details to get updated notes
                await fetchCandidateDetails(selectedCandidate._id);
                setNewNote('');
                setShowNoteInput(false);
                setSuccessMessage('Note added successfully');
                setShowSuccessAlert(true);
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error adding note:', error);
            setErrorTitle('Error');
            setErrorMessage('Failed to add note. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleEditNote = async () => {
        if (!selectedCandidate || !editingNote || !editingNote.content.trim()) {
            return;
        }

        setIsEditingNote(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/candidates/${selectedCandidate._id}/notes/${editingNote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: editingNote.content.trim() })
            });

            const result = await response.json();

            if (result.success) {
                // Refresh candidate details to get updated notes
                await fetchCandidateDetails(selectedCandidate._id);
                setEditingNote(null);
                setSuccessMessage('Note updated successfully');
                setShowSuccessAlert(true);
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error updating note:', error);
            setErrorTitle('Error');
            setErrorMessage('Failed to update note. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsEditingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!selectedCandidate) {
            return;
        }

        setDeleteNoteId(noteId);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteNote = async () => {
        if (!selectedCandidate || !deleteNoteId) {
            return;
        }

        setIsDeletingNote(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/candidates/${selectedCandidate._id}/notes/${deleteNoteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                // Refresh candidate details to get updated notes
                await fetchCandidateDetails(selectedCandidate._id);
                setSuccessMessage('Note deleted successfully');
                setShowSuccessAlert(true);
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            setErrorTitle('Error');
            setErrorMessage('Failed to delete note. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsDeletingNote(false);
            setShowDeleteConfirmModal(false);
            setDeleteNoteId(null);
        }
    };

    // Attachment functions
    const handleAttachmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachmentFile(file);
        }
    };

    const handleUploadAttachment = async () => {
        if (!selectedCandidate || !attachmentFile) {
            return;
        }

        setIsUploadingAttachment(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const formData = new FormData();
            formData.append('file', attachmentFile);
            if (attachmentDescription.trim()) {
                formData.append('description', attachmentDescription.trim());
            }

            const response = await fetch(`/api/candidates/${selectedCandidate._id}/attachments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Refresh candidate details to get updated attachments
                await fetchCandidateDetails(selectedCandidate._id);
                setSuccessMessage('Attachment uploaded successfully');
                setShowSuccessAlert(true);
                setShowAttachmentUpload(false);
                setAttachmentFile(null);
                setAttachmentDescription('');
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error uploading attachment:', error);
            setErrorTitle('Error');
            setErrorMessage('Failed to upload attachment. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsUploadingAttachment(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId: string) => {
        if (!selectedCandidate) {
            return;
        }

        setDeleteAttachmentId(attachmentId);
        setShowDeleteAttachmentModal(true);
    };

    const confirmDeleteAttachment = async () => {
        if (!selectedCandidate || !deleteAttachmentId) {
            return;
        }

        setIsDeletingAttachment(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/candidates/${selectedCandidate._id}/attachments/${deleteAttachmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                // Refresh candidate details to get updated attachments
                await fetchCandidateDetails(selectedCandidate._id);
                setSuccessMessage('Attachment deleted successfully');
                setShowSuccessAlert(true);
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error deleting attachment:', error);
            setErrorTitle('Error');
            setErrorMessage('Failed to delete attachment. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsDeletingAttachment(false);
            setShowDeleteAttachmentModal(false);
            setDeleteAttachmentId(null);
        }
    };

    const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/candidates/${selectedCandidate?._id}/attachments/${attachmentId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Failed to download attachment');
            }
        } catch (error) {
            console.error('Error downloading attachment:', error);
            setErrorTitle('Download Error');
            setErrorMessage('Failed to download attachment. Please try again.');
            setShowErrorModal(true);
        }
    };

    const handleAddCandidate = async () => {

        
        setLoading(true);
        setMessage('');

        // Basic validation for required fields
        if (!form.firstName || !form.lastName || !form.email || !form.phone) {
            setMessage('Please fill in all required fields (First Name, Last Name, Email, Phone)');
            setLoading(false);
            return;
        }

        try {
    
            const formDataToSend = new FormData();
            
            // Add basic fields
            Object.keys(form).forEach(key => {
                if (key !== 'education' && key !== 'certifications' && key !== 'experience' && key !== 'techStack') {
                    const value = form[key as keyof typeof form];
                    if (typeof value === 'object') {
                        formDataToSend.append(key, JSON.stringify(value));
                    } else if (key === 'recruiter' && value) {
                        formDataToSend.append(key, String(value));
                    } else if (key !== 'recruiter') {
                        formDataToSend.append(key, String(value));
                    }
                }
            });

            // Add arrays
            formDataToSend.append('education', JSON.stringify(form.education));
            formDataToSend.append('certifications', JSON.stringify(form.certifications));
            formDataToSend.append('experience', JSON.stringify(form.experience));
            formDataToSend.append('techStack', JSON.stringify(form.techStack));

            // Add CV file
            if (cvFile) {
                formDataToSend.append('cvFile', cvFile);
            }

            // Add Profile Image file
            if (profileImageFile) {
                formDataToSend.append('profileImage', profileImageFile);
            }

            // Log form data for debugging


            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('Authentication required. Please login again.');
                setLoading(false);
                return;
            }


            const response = await fetch('/api/candidates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                setShowSuccess(true);
                // Clear form and close modal
                clearForm();
                // Close modal
                const modal = document.getElementById('add_candidate');
                if (modal) {
                    const bootstrapModal = window.bootstrap?.Modal.getInstance(modal);
                    bootstrapModal?.hide();
                }

                // Refresh candidates list
                fetchCandidates();
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error:', error);
            const parsedError = parseErrorMessage(error);
            setErrorTitle(parsedError.title);
            setErrorMessage(parsedError.message);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    // CRUD Functions for Candidates
    const handleEditCandidate = (candidate: any) => {
        setEditingCandidate(candidate);
        setForm({
            candidateId: candidate.candidateId || '',
            firstName: candidate.firstName || '',
            lastName: candidate.lastName || '',
            email: candidate.email || '',
            phone: candidate.phone || '',
            appliedRole: candidate.appliedRole || '',
            appliedCompany: candidate.appliedCompany || '',
            source: candidate.source || '',
            currentRole: candidate.currentRole || '',
            yearsOfExperience: candidate.yearsOfExperience || '',
            relevantExperience: candidate.relevantExperience || '',
            recruiter: candidate.recruiter?._id || '',
            address: {
                street: candidate.address?.street || '',
                city: candidate.address?.city || '',
                state: candidate.address?.state || '',
                country: candidate.address?.country || '',
                zipCode: candidate.address?.zipCode || ''
            },
            education: candidate.education || [],
            certifications: candidate.certifications || [],
            experience: candidate.experience || [],
            techStack: candidate.techStack || [],
            coverLetter: candidate.coverLetter || '',
            portfolio: candidate.portfolio || ''
        });
        
        // Set existing files
        setExistingCvFile(candidate.cvFile || null);
        setExistingProfileImage(candidate.profileImage || null);
        
        // Clear new file uploads
        setCvFile(null);
        setProfileImageFile(null);
        setImagePreview(null);
        
        setShowEditCandidateModal(true);
    };

    const handleUpdateCandidate = async () => {
        if (!editingCandidate) {
            return;
        }
        
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            
            // Add basic fields
            Object.keys(form).forEach(key => {
                if (key !== 'education' && key !== 'certifications' && key !== 'experience' && key !== 'techStack') {
                    const value = form[key as keyof typeof form];
                    if (typeof value === 'object') {
                        formDataToSend.append(key, JSON.stringify(value));
                    } else if (key === 'recruiter' && value) {
                        formDataToSend.append(key, String(value));
                    } else if (key !== 'recruiter') {
                        formDataToSend.append(key, String(value));
                    }
                }
            });

            // Add arrays
            formDataToSend.append('education', JSON.stringify(form.education));
            formDataToSend.append('certifications', JSON.stringify(form.certifications));
            formDataToSend.append('experience', JSON.stringify(form.experience));
            formDataToSend.append('techStack', JSON.stringify(form.techStack));

            // Add CV file if changed
            if (cvFile) {
                formDataToSend.append('cvFile', cvFile);
            }

            // Add Profile Image file if changed
            if (profileImageFile) {
                formDataToSend.append('profileImage', profileImageFile);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('Authentication required. Please login again.');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/candidates/${editingCandidate._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMessage('Candidate updated successfully');
                setShowSuccessAlert(true);
                setShowEditCandidateModal(false);
                setEditingCandidate(null);
                clearForm();
                fetchCandidates();
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error updating candidate:', error);
            const parsedError = parseErrorMessage(error);
            setErrorTitle(parsedError.title);
            setErrorMessage(parsedError.message);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCandidate = (candidateId: string) => {
        setCandidateToDelete(candidateId);
        setShowDeleteCandidateModal(true);
    };

    const confirmDeleteCandidate = async () => {
        if (!candidateToDelete) return;
        
        setIsDeletingCandidate(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/candidates/${candidateToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMessage('Candidate deleted successfully');
                setShowSuccessAlert(true);
                setShowDeleteCandidateModal(false);
                setCandidateToDelete(null);
                fetchCandidates();
            } else {
                const parsedError = parseErrorMessage(result);
                setErrorTitle(parsedError.title);
                setErrorMessage(parsedError.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error deleting candidate:', error);
            setErrorTitle('Error');
            setErrorMessage('Failed to delete candidate. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsDeletingCandidate(false);
        }
    };

    return (
        <>
            <style>{notificationStyles}</style>
            {/* Custom Styles */}
            <style>
                {`
                    .attachment-card {
                        transition: all 0.2s ease;
                        border: 1px solid #e9ecef;
                        height: auto;
                    }
                    .attachment-card:hover {
                        border-color: #007bff;
                        box-shadow: 0 0.125rem 0.25rem rgba(0, 123, 255, 0.075);
                    }
                    .file-name-truncate {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%;
                    }
                    .min-w-0 {
                        min-width: 0;
                    }
                    .attachment-filename {
                        word-break: break-word;
                        line-height: 1.2;
                        margin-bottom: 0.25rem;
                    }
                    .attachment-card .card-body {
                        padding: 0.75rem;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                    }
                    .attachment-file-icon {
                        width: 35px;
                        height: 35px;
                        flex-shrink: 0;
                    }
                    .attachment-date-size {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.5rem;
                    }
                    .attachment-user-section {
                        padding-top: 0.5rem;
                        border-top: 1px solid #f0f0f0;
                        margin-top: auto;
                    }
                    .attachment-description {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        line-height: 1.4;
                        max-height: 2.8em;
                        margin-bottom: 0.5rem;
                    }
                    .attachment-dropdown-btn {
                        background: none;
                        border: none;
                        padding: 0.25rem;
                        color: #6c757d;
                        transition: color 0.2s ease;
                    }
                    .attachment-dropdown-btn:hover {
                        color: #495057;
                        background: none;
                        border: none;
                    }
                    .attachment-dropdown-btn:focus {
                        box-shadow: none;
                        background: none;
                        border: none;
                    }
                    .candidate-dropdown-btn {
                        background: none;
                        border: none;
                        padding: 0.25rem;
                        color: #6c757d;
                        transition: color 0.2s ease;
                    }
                    .candidate-dropdown-btn:hover {
                        color: #495057;
                        background: none;
                        border: none;
                    }
                    .candidate-dropdown-btn:focus {
                        box-shadow: none;
                        background: none;
                        border: none;
                    }
                `}
            </style>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h2 className="mb-1">Candidates</h2>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={all_routes.adminDashboard}>
                                            <i className="ti ti-smart-home" />
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">Recruitment</li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Candidates
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
                            {/* View Toggles - Commented out
                            <div className="me-2 mb-2">
                                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                                    <Link
                                        to={all_routes.candidateskanban}
                                        className="btn btn-icon btn-sm me-1"
                                    >
                                        <i className="ti ti-layout-kanban" />
                                    </Link>
                                    <Link to={all_routes.candidateslist} className="btn btn-icon btn-sm me-1">
                                        <i className="ti ti-list-tree" />
                                    </Link>
                                    <Link
                                        to={all_routes.candidatesGrid}
                                        className="btn btn-icon btn-sm active bg-primary text-white"
                                    >
                                        <i className="ti ti-layout-grid" />
                                    </Link>
                                </div>
                            </div>
                            */}
                            {/* Export Button - Commented out
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
                            */}
                            {hasPermission('create', 'candidates') && (
                                <div className="mb-2">
                                    <Link
                                        to="#"
                                        data-bs-toggle="modal"
                                        data-bs-target="#add_candidate"
                                        className="btn btn-primary d-flex align-items-center"
                                    >
                                        <i className="ti ti-circle-plus me-2" />
                                        Add Candidate
                                    </Link>
                                </div>
                            )}
                            

                            
                            
                            {/* <div className="head-icons ms-2">
                                <CollapseHeader />
                            </div> */}
                           
                        </div>
                    </div>
                    {/* /Breadcrumb */}
                    <div className="card">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                                <h5>Candidates</h5>
                                <div className="d-flex align-items-center flex-wrap row-gap-3">
                                    <div className="me-3">
                                        <div className="input-icon-end position-relative">
                                            <PredefinedDateRanges />
                                            <span className="input-icon-addon">
                                                <i className="ti ti-chevron-down" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="me-3">
                                        <div className="input-icon-end position-relative">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search candidates..."
                                                value={filters.search}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                            />
                                            <span className="input-icon-addon">
                                                <i className="ti ti-search" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="me-3">
                                        <select 
                                            className="form-select"
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="">All Status</option>
                                            <option value="New">New</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Interviewed">Interviewed</option>
                                            <option value="Offered">Offered</option>
                                            <option value="Hired">Hired</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div>
                                        <select 
                                            className="form-select"
                                            value={filters.experience}
                                            onChange={(e) => handleFilterChange('experience', e.target.value)}
                                        >
                                            <option value="">All Experience</option>
                                            <option value="0-2">0-2 years</option>
                                            <option value="3-5">3-5 years</option>
                                            <option value="6-10">6-10 years</option>
                                            <option value="10+">10+ years</option>
                                        </select>
                                    </div>
                                    {/* <div className="me-3">
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={clearFilters}
                                            disabled={!filters.search && !filters.status && !filters.experience}
                                        >
                                            <i className="ti ti-x me-1"></i>
                                            Clear Filters
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Candidates Grid */}
                    <div className="row">
                        {loadingCandidates ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading candidates...</p>
                            </div>
                        ) : candidates.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <i className="ti ti-users fs-48 text-muted mb-3"></i>
                                <h5 className="text-muted">No candidates found</h5>
                                <p className="text-muted">Start by adding your first candidate using the "Add Candidate" button.</p>
                            </div>
                        ) : (
                            candidates.map((candidate, index) => (
                                <div key={candidate._id || index} className="col-xxl-3 col-xl-4 col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center flex-shrink-0">
                                                    <div
                                                        className="avatar avatar-lg avatar rounded me-2 cursor-pointer"
                                                        data-bs-toggle="offcanvas"
                                                        data-bs-target="#candidate_details"
                                                        onClick={() => handleCandidateClick(candidate._id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {candidate.profileImage ? (
                                                            <div style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '8px' }}>
                                                                <img
                                                                    src={`/uploads/candidates/${candidate.profileImage}`}
                                                                    className="img-fluid w-100 h-100"
                                                                    alt={`${candidate.firstName} ${candidate.lastName}`}
                                                                    style={{ objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        // Fallback to default image if profile image fails to load
                                                                        e.currentTarget.src = '/assets/img/users/user-1.jpg';
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                className="d-flex align-items-center justify-content-center bg-light rounded"
                                                                style={{ width: '48px', height: '48px' }}
                                                            >
                                                                <i className="ti ti-user text-muted fs-20"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <div className="d-flex flex-wrap mb-1">
                                                            <h6 className="fs-16 fw-semibold me-1">
                                                                <div
                                                                    className="cursor-pointer"
                                                                    data-bs-toggle="offcanvas"
                                                                    data-bs-target="#candidate_details"
                                                                    onClick={() => handleCandidateClick(candidate._id)}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {candidate.firstName} {candidate.lastName}
                                                                </div>
                                                            </h6>
                                                            <span className="badge bg-primary-transparent">
                                                                {candidate.candidateId || `Cand-${(index + 1).toString().padStart(3, '0')}`}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray fs-13 fw-normal">
                                                            {candidate.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Three Dots Menu - Only show if user has edit or delete permissions */}
                                                {(hasPermission('update', 'candidates') || hasPermission('delete', 'candidates')) && (
                                                    <div className="dropdown">
                                                        <button
                                                            className="candidate-dropdown-btn"
                                                            type="button"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-end">
                                                            {hasPermission('update', 'candidates') && (
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() => handleEditCandidate(candidate)}
                                                                    >
                                                                        <i className="ti ti-edit me-2"></i>
                                                                        Edit
                                                                    </button>
                                                                </li>
                                                            )}
                                                            {hasPermission('delete', 'candidates') && (
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() => handleDeleteCandidate(candidate._id)}
                                                                    >
                                                                        <i className="ti ti-trash me-2"></i>
                                                                        Delete
                                                                    </button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-light rounder p-2">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="text-gray fs-14 fw-normal">Applied Role</h6>
                                                    <span className="text-dark fs-14 fw-medium">
                                                        {candidate.appliedRole || 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <h6 className="text-gray fs-14 fw-normal">Applied Date</h6>
                                                    <span className="text-dark fs-14 fw-medium">
                                                        {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('en-US', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }) : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <h6 className="text-gray fs-14 fw-normal">Status</h6>
                                                    <span className={`fs-10 fw-medium badge ${getStatusBadgeColor(candidate.status)}`}>
                                                        <i className="ti ti-point-filled" /> {getDisplayStatus(candidate.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* /Candidates Grid */}
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
            {/* Candidate Details */}
            <div
                className="offcanvas offcanvas-end offcanvas-large"
                tabIndex={-1}
                id="candidate_details"
            >
                <div className="offcanvas-header border-bottom">
                    <h4 className="d-flex align-items-center">
                        Candidate Details
                        <span className="badge bg-primary-transparent fw-medium ms-2">
                            {selectedCandidate ? (selectedCandidate.candidateId || `Cand-${selectedCandidate._id.slice(-6)}`) : 'Cand-001'}
                        </span>
                    </h4>
                    <button
                        type="button"
                        className="btn-close custom-btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    >
                        <i className="ti ti-x" />
                    </button>
                </div>
                <div className="offcanvas-body">
                    {loadingCandidateDetails ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading candidate details...</p>
                        </div>
                    ) : selectedCandidate ? (
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-center flex-wrap flex-md-nowrap row-gap-3">
                                    <span className="avatar avatar-xxxl candidate-img flex-shrink-0 me-3">
                                        {selectedCandidate.profileImage ? (
                                            <img
                                                src={`/uploads/candidates/${selectedCandidate.profileImage}`}
                                                alt={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                                                className="img-fluid rounded"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/assets/img/users/user-03.jpg';
                                                }}
                                            />
                                        ) : (
                                            <ImageWithBasePath src="assets/img/users/user-03.jpg" alt="Img" />
                                        )}
                                    </span>
                                    <div className="flex-fill border rounded p-3 pb-0">
                                        <div className="row align-items-center">
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <p className="mb-1">Candidate Name</p>
                                                    <h6 className="fw-normal">{selectedCandidate.firstName} {selectedCandidate.lastName}</h6>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <p className="mb-1">Applied Role</p>
                                                    <h6 className="fw-normal">{selectedCandidate.appliedRole || 'Not specified'}</h6>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <p className="mb-1">Applied Date</p>
                                                    <h6 className="fw-normal">
                                                        {selectedCandidate.createdAt ? new Date(selectedCandidate.createdAt).toLocaleDateString('en-US', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }) : 'N/A'}
                                                    </h6>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <p className="mb-1">Email</p>
                                                    <h6 className="fw-normal">{selectedCandidate.email}</h6>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <p className="mb-1">Recruiter</p>
                                                    <h6 className="fw-normal d-flex align-items-center">
                                                        <span className="avatar avatar-xs avatar-rounded me-1">
                                                            {selectedCandidate.recruiter?.profileImage ? (
                                                                <img
                                                                    src={`/uploads/${selectedCandidate.recruiter.profileImage}`}
                                                                    alt={`${selectedCandidate.recruiter.firstName} ${selectedCandidate.recruiter.lastName}`}
                                                                    className="img-fluid rounded"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                                                        onError={(e) => {
                                        e.currentTarget.src = '/assets/img/users/user-01.jpg';
                                    }}
                                                                />
                                                            ) : (
                                                                <ImageWithBasePath src="assets/img/users/user-01.jpg" alt="Img" />
                                                            )}
                                                        </span>
                                                        {selectedCandidate.recruiter ? 
                                                            `${selectedCandidate.recruiter.firstName} ${selectedCandidate.recruiter.lastName}` : 
                                                            'Not assigned'
                                                        }
                                                    </h6>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="mb-3">
                                                    <p className="mb-1">Status</p>
                                                    <span className={`badge ${getStatusBadgeColor(selectedCandidate.status)} d-inline-flex align-items-center`}>
                                                        <i className="ti ti-point-filled me-1" />
                                                        {getDisplayStatus(selectedCandidate.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <i className="ti ti-user fs-48 text-muted mb-3"></i>
                            <h5 className="text-muted">No candidate selected</h5>
                            <p className="text-muted">Click on a candidate to view their details.</p>
                        </div>
                    )}
                    <div className="contact-grids-tab p-0 mb-3">
                        <ul className="nav nav-underline" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link active pt-0"
                                    id="info-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#basic-info"
                                    type="button"
                                    role="tab"
                                    aria-selected="true"
                                >
                                    Profile
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link pt-0"
                                    id="address-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#address"
                                    type="button"
                                    role="tab"
                                    aria-selected="false"
                                >
                                    Hiring Pipeline
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link pt-0"
                                    id="address-tab2"
                                    data-bs-toggle="tab"
                                    data-bs-target="#address2"
                                    type="button"
                                    role="tab"
                                    aria-selected="false"
                                >
                                    Notes
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link pt-0"
                                    id="attachments-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#attachments"
                                    type="button"
                                    role="tab"
                                    aria-selected="false"
                                >
                                    Attachments
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
                            {selectedCandidate ? (
                                <>
                                    <div className="card">
                                        <div className="card-header">
                                            <h5>Personal Information</h5>
                                        </div>
                                        <div className="card-body pb-0">
                                            <div className="row align-items-center">
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Candidate Name</p>
                                                        <h6 className="fw-normal">{selectedCandidate.firstName} {selectedCandidate.lastName}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Phone</p>
                                                        <h6 className="fw-normal">{selectedCandidate.phone || 'Not provided'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Email</p>
                                                        <h6 className="fw-normal">{selectedCandidate.email}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Current Role</p>
                                                        <h6 className="fw-normal">{selectedCandidate.currentRole || 'Not specified'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Years of Experience</p>
                                                        <h6 className="fw-normal">{selectedCandidate.yearsOfExperience || 'Not specified'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Source</p>
                                                        <h6 className="fw-normal">{selectedCandidate.source || 'Not specified'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Applied Company</p>
                                                        <h6 className="fw-normal">{selectedCandidate.appliedCompany || 'Not specified'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Portfolio</p>
                                                        <h6 className="fw-normal">
                                                            {selectedCandidate.portfolio ? (
                                                                <a href={selectedCandidate.portfolio} target="_blank" rel="noopener noreferrer">
                                                                    View Portfolio
                                                                </a>
                                                            ) : 'Not provided'}
                                                        </h6>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header">
                                            <h5>Address Information</h5>
                                        </div>
                                        <div className="card-body pb-0">
                                            <div className="row align-items-center">
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Address</p>
                                                        <h6 className="fw-normal">{selectedCandidate.address?.street || 'Not provided'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">City</p>
                                                        <h6 className="fw-normal">{selectedCandidate.address?.city || 'Not provided'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">State</p>
                                                        <h6 className="fw-normal">{selectedCandidate.address?.state || 'Not provided'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Country</p>
                                                        <h6 className="fw-normal">{selectedCandidate.address?.country || 'Not provided'}</h6>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedCandidate.cvFile && (
                                        <div className="card">
                                            <div className="card-header">
                                                <h5>Resume</h5>
                                            </div>
                                            <div className="card-body pb-0">
                                                <div className="row align-items-center">
                                                    <div className="col-md-6">
                                                        <div className="d-flex align-items-center mb-3">
                                                            <span className="avatar avatar-lg bg-light-500 border text-dark me-2">
                                                                <i className="ti ti-file-description fs-24" />
                                                            </span>
                                                            <div>
                                                                <h6 className="fw-medium">{getCleanFileName(selectedCandidate.cvFile)}</h6>
                                                                <span>CV File</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 text-md-end">
                                                            <button
                                                                onClick={() => handleDownloadCV(selectedCandidate._id, selectedCandidate.cvFile)}
                                                                className="btn btn-dark d-inline-flex align-items-center"
                                                            >
                                                                <i className="ti ti-download me-1" />
                                                                Download
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCandidate.coverLetter && (
                                        <div className="card">
                                            <div className="card-header">
                                                <h5>Cover Letter</h5>
                                            </div>
                                            <div className="card-body">
                                                <p className="mb-0">{selectedCandidate.coverLetter}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCandidate.relevantExperience && (
                                        <div className="card">
                                            <div className="card-header">
                                                <h5>Relevant Experience Summary</h5>
                                            </div>
                                            <div className="card-body">
                                                <p className="mb-0">{selectedCandidate.relevantExperience}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCandidate.techStack && selectedCandidate.techStack.length > 0 && (
                                        <div className="card">
                                            <div className="card-header">
                                                <h5>Technical Skills</h5>
                                            </div>
                                            <div className="card-body">
                                                {selectedCandidate.techStack.map((tech, index) => (
                                                    <div key={index} className="mb-3">
                                                        <h6 className="fw-medium mb-2">{tech.category}</h6>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {tech.skills.map((skill, skillIndex) => (
                                                                <span key={skillIndex} className="badge bg-light text-dark">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedCandidate.education && selectedCandidate.education.length > 0 && (
                                        <div className="card">
                                            <div className="card-header">
                                                <h5>Education</h5>
                                            </div>
                                            <div className="card-body">
                                                {selectedCandidate.education.map((edu, index) => (
                                                    <div key={index} className="border-bottom pb-3 mb-3">
                                                        <h6 className="fw-medium mb-1">{edu.degree} in {edu.fieldOfStudy}</h6>
                                                        <p className="text-muted mb-1">{edu.institution}</p>
                                                        <p className="text-muted mb-1">
                                                            {edu.yearFrom} - {edu.yearTo || 'Present'}
                                                            {edu.grade && ` • Grade: ${edu.grade}`}
                                                        </p>
                                                        {edu.description && (
                                                            <p className="mb-0">{edu.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedCandidate.experience && selectedCandidate.experience.length > 0 && (
                                        <div className="card">
                                            <div className="card-header">
                                                <h5>Professional Experience</h5>
                                            </div>
                                            <div className="card-body">
                                                {selectedCandidate.experience.map((exp, index) => (
                                                    <div key={index} className="border-bottom pb-3 mb-3">
                                                        <h6 className="fw-medium mb-1">{exp.position}</h6>
                                                        <p className="text-muted mb-1">{exp.company}</p>
                                                        <p className="text-muted mb-1">
                                                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} - 
                                                            {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A')}
                                                        </p>
                                                        {exp.description && (
                                                            <p className="mb-2">{exp.description}</p>
                                                        )}
                                                        {exp.technologies && exp.technologies.length > 0 && (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {exp.technologies.map((tech, techIndex) => (
                                                                    <span key={techIndex} className="badge bg-light text-dark">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="ti ti-user fs-48 text-muted mb-3"></i>
                                    <h5 className="text-muted">No candidate selected</h5>
                                    <p className="text-muted">Select a candidate to view their profile information.</p>
                                </div>
                            )}
                        </div>
                        <div
                            className="tab-pane fade"
                            id="address"
                            role="tabpanel"
                            aria-labelledby="address-tab"
                            tabIndex={0}
                        >
                            {selectedCandidate ? (
                                <>
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="fw-medium mb-2">Candidate Pipeline Stage</h5>
                                            <div className="pipeline-list candidates border-0 mb-0">
                                                <ul className="mb-0">
                                                    <li>
                                                        <Link 
                                                            to="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePipelineStageClick('New');
                                                            }}
                                                            className={getActivePipelineStage(selectedCandidate.status) === 'New' ? 'bg-purple' : 'bg-gray-100'}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            New
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link 
                                                            to="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePipelineStageClick('Scheduled');
                                                            }}
                                                            className={getActivePipelineStage(selectedCandidate.status) === 'Scheduled' ? 'bg-purple' : 'bg-gray-100'}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            Scheduled
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link 
                                                            to="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePipelineStageClick('Interviewed');
                                                            }}
                                                            className={getActivePipelineStage(selectedCandidate.status) === 'Interviewed' ? 'bg-purple' : 'bg-gray-100'}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            Interviewed
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link 
                                                            to="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePipelineStageClick('Offered');
                                                            }}
                                                            className={getActivePipelineStage(selectedCandidate.status) === 'Offered' ? 'bg-purple' : 'bg-gray-100'}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            Offered
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link 
                                                            to="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePipelineStageClick('Hired');
                                                            }}
                                                            className={getActivePipelineStage(selectedCandidate.status) === 'Hired' ? 'bg-purple' : 'bg-gray-100'}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            Hired
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link 
                                                            to="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePipelineStageClick('Rejected');
                                                            }}
                                                            className={getActivePipelineStage(selectedCandidate.status) === 'Rejected' ? 'bg-purple' : 'bg-gray-100'}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            Rejected
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header">
                                            <h5>Details</h5>
                                        </div>
                                        <div className="card-body pb-0">
                                            <div className="row align-items-center">
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Current Status</p>
                                                        <span className={`badge ${getStatusBadgeColor(selectedCandidate.status)} d-inline-flex align-items-center`}>
                                                            <i className="ti ti-point-filled me-1" />
                                                            {getDisplayStatus(selectedCandidate.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Applied Role</p>
                                                        <h6 className="fw-normal">{selectedCandidate.appliedRole || 'Not specified'}</h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Applied Date</p>
                                                        <h6 className="fw-normal">
                                                            {selectedCandidate.createdAt ? new Date(selectedCandidate.createdAt).toLocaleDateString('en-US', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) : 'N/A'}
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <p className="mb-1">Recruiter</p>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-sm avatar-rounded me-2">
                                                                {selectedCandidate.recruiter?.profileImage ? (
                                                                    <img
                                                                        src={`/uploads/${selectedCandidate.recruiter.profileImage}`}
                                                                        alt={`${selectedCandidate.recruiter.firstName} ${selectedCandidate.recruiter.lastName}`}
                                                                        className="img-fluid rounded"
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        onError={(e) => {
                                                                            e.currentTarget.src = '/assets/img/users/user-01.jpg';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <ImageWithBasePath src="assets/img/users/user-01.jpg" alt="Img" />
                                                                )}
                                                            </div>
                                                            <h6>
                                                                {selectedCandidate.recruiter ? 
                                                                    `${selectedCandidate.recruiter.firstName} ${selectedCandidate.recruiter.lastName}` : 
                                                                    'Not assigned'
                                                                }
                                                            </h6>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="d-flex align-items-center justify-content-end">
                                                <button 
                                                    className="btn btn-dark me-3"
                                                    onClick={handleReject}
                                                    disabled={!selectedCandidate}
                                                >
                                                    Reject
                                                </button>
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={handleMoveToNextStage}
                                                    disabled={!selectedCandidate}
                                                >
                                                    Move to Next Stage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedCandidate.interviews && selectedCandidate.interviews.length > 0 && (
                                        <div className="card">
                                            <div className="card-header">
                                                <h5>Interview History</h5>
                                            </div>
                                            <div className="card-body">
                                                {selectedCandidate.interviews.map((interview, index) => (
                                                    <div key={index} className="border-bottom pb-3 mb-3">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <h6 className="mb-1">Interview #{index + 1}</h6>
                                                                <p className="text-muted mb-1">
                                                                    Scheduled: {new Date(interview.scheduledDate).toLocaleDateString()}
                                                                </p>
                                                                {interview.completedDate && (
                                                                    <p className="text-muted mb-1">
                                                                        Completed: {new Date(interview.completedDate).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                                <p className="mb-1"><strong>Interviewer:</strong> {interview.interviewer}</p>
                                                                {interview.notes && (
                                                                    <p className="mb-1"><strong>Notes:</strong> {interview.notes}</p>
                                                                )}
                                                                {interview.feedback && (
                                                                    <p className="mb-1"><strong>Feedback:</strong> {interview.feedback}</p>
                                                                )}
                                                                {interview.rating && (
                                                                    <p className="mb-1"><strong>Rating:</strong> {interview.rating}/5</p>
                                                                )}
                                                            </div>
                                                            <span className={`badge ${interview.status === 'Completed' ? 'bg-success' : interview.status === 'Scheduled' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                {interview.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="ti ti-user fs-48 text-muted mb-3"></i>
                                    <h5 className="text-muted">No candidate selected</h5>
                                    <p className="text-muted">Select a candidate to view their hiring pipeline.</p>
                                </div>
                            )}
                        </div>
                        <div
                            className="tab-pane fade"
                            id="address2"
                            role="tabpanel"
                            aria-labelledby="address-tab2"
                            tabIndex={0}
                        >
                            {selectedCandidate ? (
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5>Notes</h5>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setShowNoteInput(!showNoteInput)}
                                        >
                                            <i className="ti ti-plus me-1"></i>
                                            Add Note
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        {/* Add Note Input Section */}
                                        {showNoteInput && (
                                            <div className="mb-4 p-3 border rounded bg-light">
                                                <div className="mb-3">
                                                    <label className="form-label fw-medium">Add Note</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={4}
                                                        placeholder="Enter your note here..."
                                                        value={newNote}
                                                        onChange={(e) => setNewNote(e.target.value)}
                                                        disabled={isAddingNote}
                                                    ></textarea>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={handleAddNote}
                                                        disabled={!newNote.trim() || isAddingNote}
                                                    >
                                                        {isAddingNote ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Adding...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="ti ti-check me-1"></i>
                                                                Save Note
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setShowNoteInput(false);
                                                            setNewNote('');
                                                        }}
                                                        disabled={isAddingNote}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Existing Notes */}
                                        {selectedCandidate.notes && selectedCandidate.notes.length > 0 ? (
                                            selectedCandidate.notes.map((note, index) => (
                                                <div key={index} className="border-bottom pb-3 mb-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-sm avatar-rounded me-2">
                                                                {note.createdBy?.profileImage ? (
                                                                    <img
                                                                        src={`/uploads/${note.createdBy.profileImage}`}
                                                                        alt={`${note.createdBy.firstName} ${note.createdBy.lastName}`}
                                                                        className="img-fluid rounded"
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        onError={(e) => {
                                                                            e.currentTarget.src = '/assets/img/users/user-01.jpg';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <ImageWithBasePath src="assets/img/users/user-01.jpg" alt="Img" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0">
                                                                    {note.createdBy ? 
                                                                        `${note.createdBy.firstName} ${note.createdBy.lastName}` : 
                                                                        'Unknown User'
                                                                    }
                                                                </h6>
                                                                <small className="text-muted">
                                                                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-1">
                                                            {hasPermission('update', 'candidates') && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => setEditingNote({ id: note._id, content: note.content })}
                                                                    title="Edit Note"
                                                                >
                                                                    <i className="ti ti-edit"></i>
                                                                </button>
                                                            )}
                                                            {hasPermission('delete', 'candidates') && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteNote(note._id)}
                                                                    disabled={isDeletingNote}
                                                                    title="Delete Note"
                                                                >
                                                                    {isDeletingNote ? (
                                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                    ) : (
                                                                        <i className="ti ti-trash"></i>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {editingNote && editingNote.id === note._id ? (
                                                        <div className="mb-3">
                                                            <textarea
                                                                className="form-control"
                                                                rows={3}
                                                                value={editingNote.content}
                                                                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                                                disabled={isEditingNote}
                                                            ></textarea>
                                                            <div className="d-flex gap-2 mt-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={handleEditNote}
                                                                    disabled={!editingNote.content.trim() || isEditingNote}
                                                                >
                                                                    {isEditingNote ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                            Updating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="ti ti-check me-1"></i>
                                                                            Update
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={() => setEditingNote(null)}
                                                                    disabled={isEditingNote}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mb-0">{note.content}</p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="ti ti-note fs-48 text-muted mb-3"></i>
                                                <h6 className="text-muted">No notes yet</h6>
                                                <p className="text-muted">No notes have been added for this candidate.</p>
                                                {!showNoteInput && hasPermission('create', 'candidates') && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm mt-2"
                                                        onClick={() => setShowNoteInput(true)}
                                                    >
                                                        <i className="ti ti-plus me-1"></i>
                                                        Add First Note
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="ti ti-user fs-48 text-muted mb-3"></i>
                                    <h5 className="text-muted">No candidate selected</h5>
                                    <p className="text-muted">Select a candidate to view their notes.</p>
                                </div>
                            )}
                        </div>
                        <div
                            className="tab-pane fade"
                            id="attachments"
                            role="tabpanel"
                            aria-labelledby="attachments-tab"
                            tabIndex={0}
                        >
                            {selectedCandidate ? (
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5>Attachments</h5>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
                                        >
                                            <i className="ti ti-plus me-1"></i>
                                            Add Attachment
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        {/* Add Attachment Input Section */}
                                        {showAttachmentUpload && (
                                            <div className="mb-4 p-3 border rounded bg-light">
                                                <div className="mb-3">
                                                    <label className="form-label fw-medium">Upload File</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        onChange={handleAttachmentFileChange}
                                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                                    />
                                                    <small className="text-muted">
                                                        Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB)
                                                    </small>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label fw-medium">Description (Optional)</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={2}
                                                        placeholder="Enter a description for this attachment..."
                                                        value={attachmentDescription}
                                                        onChange={(e) => setAttachmentDescription(e.target.value)}
                                                        disabled={isUploadingAttachment}
                                                    ></textarea>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={handleUploadAttachment}
                                                        disabled={!attachmentFile || isUploadingAttachment}
                                                    >
                                                        {isUploadingAttachment ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="ti ti-upload me-1"></i>
                                                                Upload Attachment
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setShowAttachmentUpload(false);
                                                            setAttachmentFile(null);
                                                            setAttachmentDescription('');
                                                        }}
                                                        disabled={isUploadingAttachment}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Existing Attachments */}
                                        {selectedCandidate.attachments && selectedCandidate.attachments.length > 0 ? (
                                            <div className="row g-3">
                                                {selectedCandidate.attachments.map((attachment, index) => (
                                                    <div key={index} className="col-12 col-md-6 col-lg-6 col-xl-4">
                                                        <div className="card border h-100 attachment-card">
                                                            <div className="card-body p-3 d-flex flex-column">
                                                                {/* File Icon and Name Section - Fixed at Top */}
                                                                <div className="d-flex align-items-start mb-3">
                                                                    <div className="avatar avatar-sm avatar-rounded me-3 bg-primary d-flex align-items-center justify-content-center attachment-file-icon">
                                                                        <i className="ti ti-file-text fs-16 text-white"></i>
                                                                    </div>
                                                                    <div className="flex-grow-1 min-w-0">
                                                                        <h6 className="mb-1 fw-semibold attachment-filename" title={attachment.originalName}>
                                                                            {truncateFileName(attachment.originalName, 50)}
                                                                        </h6>
                                                                    </div>
                                                                    <div className="dropdown flex-shrink-0">
                                                                        <button
                                                                            className="attachment-dropdown-btn"
                                                                            type="button"
                                                                            data-bs-toggle="dropdown"
                                                                            aria-expanded="false"
                                                                        >
                                                                            <i className="ti ti-dots-vertical"></i>
                                                                        </button>
                                                                        <ul className="dropdown-menu">
                                                                            <li>
                                                                                <button
                                                                                    className="dropdown-item"
                                                                                    onClick={() => handleDownloadAttachment(attachment._id, attachment.originalName)}
                                                                                >
                                                                                    <i className="ti ti-download me-2"></i>
                                                                                    Download
                                                                                </button>
                                                                            </li>
                                                                            {hasPermission('delete', 'candidates') && (
                                                                                <li>
                                                                                    <button
                                                                                        className="dropdown-item text-danger"
                                                                                        onClick={() => handleDeleteAttachment(attachment._id)}
                                                                                        disabled={isDeletingAttachment}
                                                                                    >
                                                                                        <i className="ti ti-trash me-2"></i>
                                                                                        Delete
                                                                                    </button>
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Date and Size Section - Fixed in Middle */}
                                                                <div className="attachment-date-size">
                                                                    <small className="text-muted">
                                                                        {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                                                    </small>
                                                                    <small className="text-muted">
                                                                        {new Date(attachment.uploadedAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </small>
                                                                </div>
                                                                
                                                                {/* Description Section - If exists */}
                                                                {attachment.description && (
                                                                    <div>
                                                                        <p className="mb-0 text-muted small attachment-description" title={attachment.description}>
                                                                            {attachment.description}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Admin User Section - Fixed at Bottom */}
                                                                <div className="attachment-user-section">
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="avatar avatar-xs avatar-rounded me-2 flex-shrink-0">
                                                                            {attachment.uploadedBy?.profileImage ? (
                                                                                <img
                                                                                    src={`/uploads/${attachment.uploadedBy.profileImage}`}
                                                                                    alt={`${attachment.uploadedBy.firstName} ${attachment.uploadedBy.lastName}`}
                                                                                    className="img-fluid rounded"
                                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.src = '/assets/img/users/user-01.jpg';
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <ImageWithBasePath src="assets/img/users/user-01.jpg" alt="Img" />
                                                                            )}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {attachment.uploadedBy ? 
                                                                                `${attachment.uploadedBy.firstName} ${attachment.uploadedBy.lastName}` : 
                                                                                'Unknown User'
                                                                            }
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="ti ti-folder fs-48 text-muted mb-3"></i>
                                                <h6 className="text-muted">No attachments yet</h6>
                                                <p className="text-muted">No attachments have been uploaded for this candidate.</p>
                                                {!showAttachmentUpload && hasPermission('create', 'candidates') && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm mt-2"
                                                        onClick={() => setShowAttachmentUpload(true)}
                                                    >
                                                        <i className="ti ti-plus me-1"></i>
                                                        Add First Attachment
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="ti ti-user fs-48 text-muted mb-3"></i>
                                    <h5 className="text-muted">No candidate selected</h5>
                                    <p className="text-muted">Select a candidate to view their attachments.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Pagination Component - Temporarily Hidden */}
            {/* {totalRecords > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                    <div className="d-flex align-items-center">
                        <span className="text-muted me-3">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} candidates
                        </span>
                        <select 
                            className="form-select form-select-sm" 
                            style={{ width: 'auto' }}
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        >
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <i className="ti ti-chevron-left"></i>
                                </button>
                            </li>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                        <button 
                                            className="page-link"
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    </li>
                                );
                            })}
                            
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <i className="ti ti-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )} */}
            
            {/* Candidate Details */}

            {/* Add Candidate Modal */}
            <div className="modal fade" id="add_candidate">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="d-flex align-items-center">
                                <h4 className="modal-title me-2">Add New Candidate</h4>
                                <span>Candidate ID : {form.candidateId || `CAND-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`}</span>
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
                        <form>
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
                                            Candidate Information
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            {/* Message Display */}
                            {message && (
                                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                                    {message}
                                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                                </div>
                            )}
                            <div className="tab-content" id="myTabContent">
                                <div
                                    className="tab-pane fade show active"
                                    id="basic-info"
                                    role="tabpanel"
                                    aria-labelledby="info-tab"
                                    tabIndex={0}
                                >
                                    <div className="modal-body pb-0">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                                                    <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded border border-dashed me-2 flex-shrink-0 text-dark frames">
                                                        {imagePreview ? (
                                                            <img 
                                                                src={imagePreview} 
                                                                alt="Preview" 
                                                                className="rounded"
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
                                                                    onChange={handleFileChange}
                                                                />
                                                            </div>
                                                            <Link
                                                                to="#"
                                                                className="btn btn-light btn-sm"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setImagePreview(null);
                                                                }}
                                                            >
                                                                Cancel
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        First Name <span className="text-danger"> *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="firstName"
                                                        value={form.firstName}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Last Name <span className="text-danger"> *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="lastName"
                                                        value={form.lastName}
                                                        onChange={handleInputChange}
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
                                                        name="email"
                                                        value={form.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Phone Number <span className="text-danger"> *</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        name="phone"
                                                        value={form.phone}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Applied Role <span className="text-danger"> *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="appliedRole"
                                                        value={form.appliedRole}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">
                                                        Applied Company <span className="text-danger"> *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="appliedCompany"
                                                        value={form.appliedCompany}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Source</label>
                                                    <CommonSelect
                                                        className="select"
                                                        options={sourceOptions}
                                                        value={sourceOptions.find(s => s.value === form.source) || undefined}
                                                        onChange={(option) => {
                                                            if (option) {
                                                                setForm(prev => ({ ...prev, source: option.value }));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Recruiter</label>
                                                    <CommonSelect
                                                        className="select"
                                                        options={recruiters.map(recruiter => ({
                                                            value: recruiter._id,
                                                            label: `${recruiter.firstName} ${recruiter.lastName} (${recruiter.designation})`
                                                        }))}
                                                        value={recruiters.find(r => r._id === form.recruiter) ? {
                                                            value: form.recruiter,
                                                            label: `${recruiters.find(r => r._id === form.recruiter)?.firstName} ${recruiters.find(r => r._id === form.recruiter)?.lastName} (${recruiters.find(r => r._id === form.recruiter)?.designation})`
                                                        } : undefined}
                                                        onChange={(option) => {
                                                            if (option) {
                                                                setForm(prev => ({ ...prev, recruiter: option.value }));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Current Role</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="currentRole"
                                                        value={form.currentRole}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Years of Experience</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="yearsOfExperience"
                                                        value={form.yearsOfExperience}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">CV/Resume</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        name="cvFile"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={handleFileChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Relevant Experience Summary</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={3}
                                                        name="relevantExperience"
                                                        value={form.relevantExperience}
                                                        onChange={handleInputChange}
                                                        placeholder="Describe the candidate's relevant experience..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <h6 className="mb-3">Address Information</h6>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Street Address</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="address.street"
                                                        value={form.address.street}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">City</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="address.city"
                                                        value={form.address.city}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">State</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="address.state"
                                                        value={form.address.state}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Country</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="address.country"
                                                        value={form.address.country}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">ZIP Code</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="address.zipCode"
                                                        value={form.address.zipCode}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Portfolio URL</label>
                                                    <input
                                                        type="url"
                                                        className="form-control"
                                                        name="portfolio"
                                                        value={form.portfolio}
                                                        onChange={handleInputChange}
                                                        placeholder="https://portfolio.example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label">Cover Letter</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={4}
                                                        name="coverLetter"
                                                        value={form.coverLetter}
                                                        onChange={handleInputChange}
                                                        placeholder="Candidate's cover letter..."
                                                    />
                                                </div>
                                            </div>
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
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleAddCandidate} 
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Add Candidate Modal */}

            {/* Success Modal */}
            {showSuccess && (
                <div className="modal fade show d-block" id="success_modal" role="dialog" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', animation: 'slideInUp 0.3s ease-out' }}>
                            <div className="modal-body p-5">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <span className="avatar avatar-xxl avatar-rounded bg-success d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', animation: 'bounceIn 0.6s ease-out' }}>
                                            <i className="ti ti-check fs-32 text-white" />
                                        </span>
                                    </div>
                                    <h4 className="mb-3 text-dark fw-semibold" style={{ fontSize: '1.25rem' }}>Candidate Added Successfully</h4>
                                    <p className="mb-4 text-muted fs-14" style={{ lineHeight: '1.6' }}>
                                        The candidate profile has been created successfully.
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <button 
                                            className="btn btn-outline-secondary px-4 py-2" 
                                            onClick={() => {
                                                handleSuccessModalClose();
                                                // Ensure the add candidate modal is also closed
                                                const modal = document.getElementById('add_candidate');
                                                if (modal) {
                                                    const bootstrapModal = window.bootstrap?.Modal.getInstance(modal);
                                                    bootstrapModal?.hide();
                                                }
                                            }}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                        >
                                            <i className="ti ti-arrow-left me-2"></i>
                                            Back to List
                                        </button>
                                        <button 
                                            className="btn btn-primary px-4 py-2" 
                                            onClick={() => {
                                                handleSuccessModalClose();
                                                // Reopen the add candidate modal using data attributes
                                                setTimeout(() => {
                                                    const addButton = document.querySelector('[data-bs-target="#add_candidate"]');
                                                    if (addButton) {
                                                        (addButton as HTMLElement).click();
                                                    }
                                                }, 100);
                                            }}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                        >
                                            <i className="ti ti-plus me-2"></i>
                                            Add Another
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* /Success Modal */}

            {/* Custom Confirmation Modal */}
            {showConfirmModal && confirmAction && (
                <div className="modal fade show d-block" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-body p-4">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <span className="avatar avatar-xxl avatar-rounded bg-warning d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <i className="ti ti-alert-triangle fs-32 text-white" />
                                        </span>
                                    </div>
                                    <h4 className="mb-3 text-dark fw-semibold">
                                        {confirmAction.type === 'reject' ? 'Reject Candidate' : 'Move to Next Stage'}
                                    </h4>
                                    <p className="mb-4 text-muted fs-14">
                                        {confirmAction.type === 'reject' 
                                            ? 'Are you sure you want to reject this candidate? This action will mark the candidate as rejected.'
                                            : `Are you sure you want to move this candidate to the next stage? The status will change to "${confirmAction.displayName || confirmAction.newStatus}".`
                                        }
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <button 
                                            className="btn btn-outline-secondary px-4 py-2" 
                                            onClick={() => setShowConfirmModal(false)}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className={`btn px-4 py-2 ${confirmAction.type === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                                            onClick={() => {
                                                handleStatusUpdate(confirmAction.candidateId, confirmAction.newStatus);
                                                setShowConfirmModal(false);
                                            }}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                        >
                                            {confirmAction.type === 'reject' ? 'Reject' : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Success/Error Alert */}
            {showSuccessAlert && (
                <div 
                    className="position-fixed top-0 end-0 p-3" 
                    style={{ zIndex: 10000, marginTop: '20px', marginRight: '20px' }}
                >
                    <div 
                        className={`alert alert-dismissible fade show shadow-lg ${
                            successMessage.includes('Error') || successMessage.includes('Cannot') || successMessage.includes('already reached')
                                ? 'alert-danger' 
                                : 'alert-success'
                        }`}
                        style={{ 
                            borderRadius: '12px', 
                            minWidth: '300px',
                            border: 'none',
                            animation: 'slideInRight 0.3s ease-out',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Auto-dismiss progress bar */}
                        <div 
                            className="position-absolute top-0 start-0 h-100"
                            style={{
                                background: successMessage.includes('Error') || successMessage.includes('Cannot') || successMessage.includes('already reached')
                                    ? 'rgba(220, 53, 69, 0.2)'
                                    : 'rgba(25, 135, 84, 0.2)',
                                width: '100%',
                                animation: 'progressBar 4s linear forwards'
                            }}
                        />
                        
                        <div className="d-flex align-items-center position-relative">
                            <div className="me-3">
                                {successMessage.includes('Error') || successMessage.includes('Cannot') || successMessage.includes('already reached') ? (
                                    <i className="ti ti-alert-circle fs-20 text-danger" />
                                ) : (
                                    <i className="ti ti-check-circle fs-20 text-success" />
                                )}
                            </div>
                            <div className="flex-grow-1">
                                <p className="mb-0 fw-medium">{successMessage}</p>
                            </div>
                            <button 
                                type="button" 
                                className="btn-close ms-2" 
                                onClick={() => setShowSuccessAlert(false)}
                                style={{ fontSize: '0.8rem' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Error Modal */}
            {showErrorModal && (
                <div className="modal fade show d-block" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                            {/* Auto-dismiss progress bar */}
                            <div 
                                className="position-absolute top-0 start-0 w-100"
                                style={{
                                    background: 'rgba(220, 53, 69, 0.3)',
                                    height: '4px',
                                    animation: 'progressBar 6s linear forwards'
                                }}
                            />
                            
                            <div className="modal-body p-4">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <span className="avatar avatar-xxl avatar-rounded bg-danger d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <i className="ti ti-alert-triangle fs-32 text-white" />
                                        </span>
                                    </div>
                                    <h4 className="mb-3 text-dark fw-semibold">{errorTitle}</h4>
                                    <p className="mb-4 text-muted fs-14" style={{ lineHeight: '1.6' }}>
                                        {errorMessage}
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <button 
                                            className="btn btn-outline-secondary px-4 py-2" 
                                            onClick={() => setShowErrorModal(false)}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                        >
                                            Close
                                        </button>
                                        {errorTitle === 'Email Already Exists' && (
                                            <button 
                                                className="btn btn-primary px-4 py-2" 
                                                onClick={() => {
                                                    setShowErrorModal(false);
                                                    // Clear the email field
                                                    setForm(prev => ({ ...prev, email: '' }));
                                                }}
                                                style={{ borderRadius: '8px', fontWeight: '500' }}
                                            >
                                                <i className="ti ti-edit me-2"></i>
                                                Change Email
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Beautiful Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
                <div className="modal fade show d-block" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-body p-4">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <span className="avatar avatar-xxl avatar-rounded bg-warning d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <i className="ti ti-trash fs-32 text-white" />
                                        </span>
                                    </div>
                                    <h4 className="mb-3 text-dark fw-semibold">Delete Note</h4>
                                    <p className="mb-4 text-muted fs-14" style={{ lineHeight: '1.6' }}>
                                        Are you sure you want to delete this note? This action cannot be undone.
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <button 
                                            className="btn btn-outline-secondary px-4 py-2" 
                                            onClick={() => {
                                                setShowDeleteConfirmModal(false);
                                                setDeleteNoteId(null);
                                            }}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                            disabled={isDeletingNote}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn btn-danger px-4 py-2" 
                                            onClick={confirmDeleteNote}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                            disabled={isDeletingNote}
                                        >
                                            {isDeletingNote ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-trash me-2"></i>
                                                    Delete Note
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Beautiful Delete Attachment Confirmation Modal */}
            {showDeleteAttachmentModal && (
                <div className="modal fade show d-block" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-body p-4">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <span className="avatar avatar-xxl avatar-rounded bg-danger d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <i className="ti ti-file-x fs-32 text-white" />
                                        </span>
                                    </div>
                                    <h4 className="mb-3 text-dark fw-semibold">Delete Attachment</h4>
                                    <p className="mb-4 text-muted fs-14" style={{ lineHeight: '1.6' }}>
                                        Are you sure you want to delete this attachment? This action cannot be undone and the file will be permanently removed.
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <button 
                                            className="btn btn-outline-secondary px-4 py-2" 
                                            onClick={() => {
                                                setShowDeleteAttachmentModal(false);
                                                setDeleteAttachmentId(null);
                                            }}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                            disabled={isDeletingAttachment}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn btn-danger px-4 py-2" 
                                            onClick={confirmDeleteAttachment}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                            disabled={isDeletingAttachment}
                                        >
                                            {isDeletingAttachment ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-trash me-2"></i>
                                                    Delete Attachment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Candidate Modal */}
            {showEditCandidateModal && editingCandidate && (
                <div className="modal fade show d-block" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-header">
                                <div className="d-flex align-items-center">
                                    <h4 className="modal-title me-2">Edit Candidate</h4>
                                    <span>Candidate ID : {editingCandidate._id}</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close custom-btn-close"
                                    onClick={() => {
                                        setShowEditCandidateModal(false);
                                        setEditingCandidate(null);
                                        clearForm();
                                    }}
                                    aria-label="Close"
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>
                            <form>
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
                                                Candidate Information
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                {/* Message Display */}
                                {message && (
                                    <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                                        {message}
                                        <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                                    </div>
                                )}
                                <div className="tab-content" id="myTabContent">
                                    <div
                                        className="tab-pane fade show active"
                                        id="basic-info"
                                        role="tabpanel"
                                        aria-labelledby="info-tab"
                                        tabIndex={0}
                                    >
                                        <div className="modal-body pb-0">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                                                        <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                                                            {imagePreview ? (
                                                                <img 
                                                                    src={imagePreview} 
                                                                    alt="Preview" 
                                                                    className="rounded"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : editingCandidate.profileImage ? (
                                                                <img 
                                                                    src={`/uploads/candidates/${editingCandidate.profileImage}`} 
                                                                    alt="Profile" 
                                                                    className="rounded"
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
                                                                        onChange={handleFileChange}
                                                                    />
                                                                </div>
                                                                <Link
                                                                    to="#"
                                                                    className="btn btn-light btn-sm"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setImagePreview(null);
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            First Name <span className="text-danger"> *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="firstName"
                                                            value={form.firstName}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Last Name <span className="text-danger"> *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="lastName"
                                                            value={form.lastName}
                                                            onChange={handleInputChange}
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
                                                            name="email"
                                                            value={form.email}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Phone Number <span className="text-danger"> *</span>
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            className="form-control"
                                                            name="phone"
                                                            value={form.phone}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Applied Role <span className="text-danger"> *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="appliedRole"
                                                            value={form.appliedRole}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Applied Company <span className="text-danger"> *</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="appliedCompany"
                                                            value={form.appliedCompany}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Source</label>
                                                        <CommonSelect
                                                            className="select"
                                                            options={sourceOptions}
                                                            value={sourceOptions.find(s => s.value === form.source) || undefined}
                                                            onChange={(option) => {
                                                                if (option) {
                                                                    setForm(prev => ({ ...prev, source: option.value }));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Recruiter</label>
                                                        <CommonSelect
                                                            className="select"
                                                            options={recruiters.map(recruiter => ({
                                                                value: recruiter._id,
                                                                label: `${recruiter.firstName} ${recruiter.lastName} (${recruiter.designation})`
                                                            }))}
                                                            value={recruiters.find(r => r._id === form.recruiter) ? {
                                                                value: form.recruiter,
                                                                label: `${recruiters.find(r => r._id === form.recruiter)?.firstName} ${recruiters.find(r => r._id === form.recruiter)?.lastName} (${recruiters.find(r => r._id === form.recruiter)?.designation})`
                                                            } : undefined}
                                                            onChange={(option) => {
                                                                if (option) {
                                                                    setForm(prev => ({ ...prev, recruiter: option.value }));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Current Role</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="currentRole"
                                                            value={form.currentRole}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Years of Experience</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="yearsOfExperience"
                                                            value={form.yearsOfExperience}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">CV/Resume</label>
                                                            {existingCvFile && (
                                                            <div className="mb-2">
                                                                <div className="d-flex align-items-center p-2 bg-light rounded">
                                                                    <i className="ti ti-file-text me-2 text-primary"></i>
                                                                    <span className="flex-grow-1">{getCleanFileName(existingCvFile)}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary me-2"
                                                                        onClick={() => handleDownloadCV(editingCandidate._id, existingCvFile)}
                                                                    >
                                                                        <i className="ti ti-download me-1"></i>
                                                                        Download
                                                                    </button>
                                                                </div>
                                                                <small className="text-muted">Upload a new file to replace the existing CV</small>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            name="cvFile"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={handleFileChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Relevant Experience Summary</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows={3}
                                                            name="relevantExperience"
                                                            value={form.relevantExperience}
                                                            onChange={handleInputChange}
                                                            placeholder="Describe the candidate's relevant experience..."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <h6 className="mb-3">Address Information</h6>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Street Address</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.street"
                                                            value={form.address.street}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label className="form-label">City</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.city"
                                                            value={form.address.city}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label className="form-label">State</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.state"
                                                            value={form.address.state}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label className="form-label">Country</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.country"
                                                            value={form.address.country}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label className="form-label">ZIP Code</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="address.zipCode"
                                                            value={form.address.zipCode}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Portfolio URL</label>
                                                        <input
                                                            type="url"
                                                            className="form-control"
                                                            name="portfolio"
                                                            value={form.portfolio}
                                                            onChange={handleInputChange}
                                                            placeholder="https://portfolio.example.com"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Cover Letter</label>
                                                        <textarea
                                                            className="form-control"
                                                            rows={4}
                                                            name="coverLetter"
                                                            value={form.coverLetter}
                                                            onChange={handleInputChange}
                                                            placeholder="Candidate's cover letter..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-light border me-2"
                                        onClick={() => {
                                            setShowEditCandidateModal(false);
                                            setEditingCandidate(null);
                                            clearForm();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={handleUpdateCandidate} 
                                        disabled={loading}
                                    >
                                        {loading ? 'Updating...' : 'Update Candidate'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Candidate Confirmation Modal */}
            {showDeleteCandidateModal && (
                <div className="modal fade show d-block" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-body p-4">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <span className="avatar avatar-xxl avatar-rounded bg-danger d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <i className="ti ti-user-x fs-32 text-white" />
                                        </span>
                                    </div>
                                    <h4 className="mb-3 text-dark fw-semibold">Delete Candidate</h4>
                                    <p className="mb-4 text-muted fs-14" style={{ lineHeight: '1.6' }}>
                                        Are you sure you want to delete this candidate? This action cannot be undone and all associated data will be permanently removed.
                                    </p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <button 
                                            className="btn btn-outline-secondary px-4 py-2" 
                                            onClick={() => {
                                                setShowDeleteCandidateModal(false);
                                                setCandidateToDelete(null);
                                            }}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                            disabled={isDeletingCandidate}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn btn-danger px-4 py-2" 
                                            onClick={confirmDeleteCandidate}
                                            style={{ borderRadius: '8px', fontWeight: '500' }}
                                            disabled={isDeletingCandidate}
                                        >
                                            {isDeletingCandidate ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-trash me-2"></i>
                                                    Delete Candidate
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>


    )
}

export default CandidateGrid
