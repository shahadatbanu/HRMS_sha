import React, { useState } from 'react';

// TypeScript interfaces
interface Interviewer {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  role?: string;
}

interface InterviewCardProps {
  id: string;
  candidateName: string;
  position: string;
  dateTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  interviewType: 'Technical' | 'Behavioral' | 'Final Round' | 'Initial Screening' | 'L1' | 'L2' | 'L3';
  meetingLink?: string;
  platform?: 'Zoom' | 'Teams' | 'Meet' | 'Skype' | 'Other';
  duration: string;
  interviewers: Interviewer[];
  timezone?: string;
  notes?: string;
  onReschedule?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onAddToCalendar?: (id: string) => void;
  onSendReminder?: (id: string) => void;
  onCopyLink?: (link: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  id,
  candidateName,
  position,
  dateTime,
  status,
  interviewType,
  meetingLink,
  platform,
  duration,
  interviewers,
  timezone = 'UTC',
  notes,
  onReschedule,
  onStatusChange,
  onAddToCalendar,
  onSendReminder,
  onCopyLink,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status configuration
  const statusConfig = {
    Scheduled: { color: 'bg-info', icon: 'ti ti-calendar', text: 'Scheduled' },
    Completed: { color: 'bg-success', icon: 'ti ti-check-circle', text: 'Completed' },
    Cancelled: { color: 'bg-danger', icon: 'ti ti-x-circle', text: 'Cancelled' }
  };

  // Interview type configuration
  const typeConfig = {
    Technical: { color: 'bg-primary', icon: 'ti ti-code' },
    Behavioral: { color: 'bg-info', icon: 'ti ti-brain' },
    'Final Round': { color: 'bg-success', icon: 'ti ti-trophy' },
    'Initial Screening': { color: 'bg-secondary', icon: 'ti ti-user-check' },
    'L1': { color: 'bg-secondary', icon: 'ti ti-user-check' },
    'L2': { color: 'bg-primary', icon: 'ti ti-code' },
    'L3': { color: 'bg-success', icon: 'ti ti-trophy' }
  };

  // Platform configuration
  const platformConfig = {
    Zoom: { icon: 'ti ti-brand-zoom', color: 'text-info' },
    Teams: { icon: 'ti ti-brand-microsoft', color: 'text-primary' },
    Meet: { icon: 'ti ti-brand-google', color: 'text-danger' },
    Skype: { icon: 'ti ti-brand-skype', color: 'text-primary' },
    Other: { icon: 'ti ti-video', color: 'text-secondary' }
  };

  // Format date and time
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Handle copy link
  const handleCopyLink = async () => {
    if (meetingLink) {
      try {
        await navigator.clipboard.writeText(meetingLink);
        setCopied(true);
        onCopyLink?.(meetingLink);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  // Handle status change
  const handleStatusChange = () => {
    const statuses = ['Scheduled', 'Completed', 'Cancelled'];
    const currentIndex = statuses.indexOf(status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange?.(id, nextStatus);
  };

  const { date, time } = formatDateTime(dateTime);
  const statusStyle = statusConfig[status as keyof typeof statusConfig];
  const typeStyle = typeConfig[interviewType as keyof typeof typeConfig];
  const platformStyle = platform ? platformConfig[platform as keyof typeof platformConfig] : null;



  return (
    <div className="interview-card-modern">
      <div className="card glass-morphism" style={{
        borderRadius: '16px',
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Header Section */}
        <div className="card-header-section d-flex justify-content-between align-items-start mb-4">
                     <div className="date-time-section">
             <div className="date-display fw-bold text-dark mb-1" style={{ fontSize: '1.4rem', fontWeight: '600' }}>
               {date}
             </div>
                         <div className="time-display d-flex align-items-center">
               <i className="ti ti-clock text-primary me-2" style={{ fontSize: '1rem' }}></i>
               <span className="fw-semibold text-dark" style={{ fontSize: '1rem' }}>{time}</span>
               {timezone !== 'UTC' && (
                 <span className="text-muted ms-2" style={{ fontSize: '0.85rem' }}>({timezone})</span>
               )}
             </div>
          </div>
          
          <div className="header-actions d-flex align-items-center gap-3">
                         {/* Interviewer Info */}
             <div className="interviewer-info d-flex align-items-center">
                               <div className="interviewer-avatar me-2">
                  {interviewers[0]?.avatar ? (
                    <img 
                      src={interviewers[0].avatar} 
                      alt={interviewers[0].name}
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="ti ti-user-check text-primary" style={{ fontSize: '1.5rem' }}></i>
                  )}
                </div>
                             <div className="interviewer-details">
                 <div className="fw-semibold text-dark" style={{ fontSize: '1.1rem' }}>{interviewers[0]?.name || 'Interviewer'}</div>
                 <div className="text-muted small">Primary Interviewer</div>
               </div>
            </div>
            
            {/* Status Badge */}
            <button
              className={`badge ${statusStyle.color} rounded-pill px-3 py-2 border-0`}
              onClick={handleStatusChange}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              title={`Click to change status (currently ${status})`}
            >
              <i className={`${statusStyle.icon} me-1`}></i>
              {statusStyle.text}
            </button>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="card-content-section mb-4">
                                {/* Candidate Info */}
           <div className="candidate-info mb-3">
             <div className="d-flex align-items-center justify-content-between mb-2">
               <div className="d-flex align-items-center">
                 <div className="candidate-avatar me-3">
                   <i className="ti ti-user text-secondary" style={{ fontSize: '1.5rem' }}></i>
                 </div>
                 <div className="candidate-details">
                   <h5 className="fw-bold text-dark mb-1">{candidateName}</h5>
                   <p className="text-muted mb-0">{position}</p>
                 </div>
               </div>
                               <div className="interview-type-badge">
                  <span className={`badge ${typeStyle.color} rounded-pill px-3 py-1`} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    <i className={`${typeStyle.icon} me-1`} style={{ fontSize: '0.9rem' }}></i>
                    {interviewType.startsWith('L') ? `Round - ${interviewType}` : interviewType}
                  </span>
                </div>
             </div>
           </div>

           {/* Interview Details */}
           <div className="interview-details">
             <div className="row g-3">

              

              
            </div>
          </div>

                     {/* Meeting Link Section */}
           <div className="link-section mb-3 p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
             <div className="d-flex align-items-center justify-content-between">
               <div className="link-info d-flex align-items-center">
                 {platformStyle && (
                   <i className={`${platformStyle.icon} ${platformStyle.color} me-2`} style={{ fontSize: '1.2rem' }}></i>
                 )}
                 <div className="link-details">
                   <div className="fw-semibold text-dark">Meeting Link</div>
                   {meetingLink ? (
                     <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                       {meetingLink}
                     </div>
                   ) : (
                     <div className="text-muted small" style={{ fontStyle: 'italic' }}>
                       No meeting link added yet
                     </div>
                   )}
                 </div>
               </div>
               
               <div className="link-actions d-flex gap-2">
                 {meetingLink ? (
                   <>
                     <button
                       className="btn btn-sm btn-outline-secondary rounded-circle"
                       onClick={handleCopyLink}
                       title="Copy link"
                       style={{ width: '36px', height: '36px' }}
                     >
                       <i className={`ti ${copied ? 'ti-check text-success' : 'ti-copy'}`}></i>
                     </button>
                     
                     <a
                       href={meetingLink}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="btn btn-primary btn-sm rounded-pill"
                     >
                       <i className="ti ti-external-link me-1"></i>
                       Join Meeting
                     </a>
                   </>
                 ) : (
                   <button
                     className="btn btn-outline-primary btn-sm rounded-pill"
                     onClick={() => onEdit?.(id)}
                     title="Add meeting link"
                   >
                     <i className="ti ti-plus me-1"></i>
                     Add Link
                   </button>
                 )}
               </div>
             </div>
           </div>

           {/* Notes Section */}
           {notes && (
             <div className="notes-section mb-4 p-3 bg-light rounded" style={{ borderRadius: '12px' }}>
               <div className="d-flex align-items-start">
                 <i className="ti ti-notes text-secondary me-2 mt-1"></i>
                 <div className="flex-grow-1">
                   <small className="text-muted d-block mb-1">Notes:</small>
                   <p className="mb-0 text-dark small">{notes}</p>
                 </div>
               </div>
             </div>
           )}
         </div>

        {/* Actions Section */}
        <div className="actions-section d-flex justify-content-between align-items-center">
          <div className="primary-actions d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill"
              onClick={() => onReschedule?.(id)}
              style={{ borderRadius: '8px' }}
            >
              <i className="ti ti-calendar-time me-1"></i>
              Reschedule
            </button>
            
                         <button
               className="btn btn-outline-secondary btn-sm rounded-pill"
               onClick={() => onAddToCalendar?.(id)}
               style={{ borderRadius: '8px' }}
             >
               <i className="ti ti-calendar-plus me-1"></i>
               Add to Calendar
             </button>
          </div>
          
          <div className="secondary-actions">
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm rounded-circle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="ti ti-dots-vertical"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item" onClick={() => onEdit?.(id)}>
                    <i className="ti ti-edit me-2"></i>
                    Edit Interview
                  </button>
                </li>
                                 <li>
                   <button className="dropdown-item" onClick={() => onDelete?.(id)}>
                     <i className="ti ti-trash me-2"></i>
                     Delete Interview
                   </button>
                 </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard; 