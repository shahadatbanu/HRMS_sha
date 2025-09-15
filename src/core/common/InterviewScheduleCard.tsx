import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { backend_url } from '../../environment';
import { all_routes } from '../../feature-module/router/all_routes';

interface Interview {
  _id: string;
  candidateId: string;
  candidateName: string;
  candidateProfileImage?: string;
  appliedRole: string;
  scheduledDate: string;
  interviewLevel: string;
  interviewer: string;
  interviewLink?: string;
  notes?: string;
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface InterviewScheduleCardProps {
  employeeId: string;
}

const InterviewScheduleCard: React.FC<InterviewScheduleCardProps> = ({ employeeId }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const routes = all_routes;

  useEffect(() => {
    fetchUpcomingInterviews();
  }, [employeeId]);

  const fetchUpcomingInterviews = async () => {
    if (!employeeId) {
      console.log('🔍 InterviewScheduleCard: No employeeId provided');
      return;
    }
    
    console.log('🔍 InterviewScheduleCard: Fetching interviews for employeeId:', employeeId);
    console.log('🔍 InterviewScheduleCard: API URL:', `${backend_url}/api/candidates/upcoming-interviews?employeeId=${employeeId}`);
    
    try {
      setLoading(true);
      const response = await fetch(`${backend_url}/api/candidates/upcoming-interviews?employeeId=${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 InterviewScheduleCard: Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 InterviewScheduleCard: API Response:', result);
        console.log('🔍 InterviewScheduleCard: Interviews data:', result.data);
        setInterviews(result.data || []);
      } else {
        const errorText = await response.text();
        console.error('❌ InterviewScheduleCard: Error fetching upcoming interviews:', response.status, errorText);
        setInterviews([]);
      }
    } catch (error) {
      console.error('❌ InterviewScheduleCard: Error fetching upcoming interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatInterviewDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatInterviewTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInterviewBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'first round':
      case 'initial':
        return 'primary';
      case 'second round':
      case 'technical':
        return 'info';
      case 'final round':
      case 'hr':
        return 'success';
      case 'manager':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const handleViewCandidate = (candidateId: string) => {
    navigate(`${routes.candidatesGrid}?viewCandidate=${candidateId}`);
  };

  return (
    <div className="card flex-fill">
      <div className="card-header py-2 d-flex align-items-center justify-content-between flex-wrap">
        <h5 className="mb-0">Schedules</h5>
        <Link to={routes.employeeInterviews} className="btn btn-light btn-sm">
          View All
        </Link>
      </div>
      <div className="card-body py-2">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading interviews...</p>
          </div>
        ) : interviews.length > 0 ? (
          interviews.map((interview, index) => (
            <div key={interview._id} className={`bg-light p-2 br-5 ${index < interviews.length - 1 ? 'mb-2' : 'mb-0'}`}>
              <span className={`badge badge-${getInterviewBadgeColor(interview.interviewLevel)} badge-xs mb-1`}>
                {interview.appliedRole}
              </span>
              <h6 className="mb-1 text-truncate fs-14">
                Interview - {interview.candidateName}
              </h6>
              <div className="d-flex align-items-center flex-wrap">
                <p className="fs-12 mb-1 me-2">
                  <i className="ti ti-calendar-event me-1" />
                  {formatInterviewDate(interview.scheduledDate)}
                </p>
                <p className="fs-12 mb-1">
                  <i className="ti ti-clock-hour-11 me-1" />
                  {formatInterviewTime(interview.scheduledDate)}
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-between border-top mt-1 pt-2">
                <div className="d-flex align-items-center">
                  <div className="avatar-list-stacked avatar-group-sm me-2">
                    {/* Candidate Profile Picture */}
                    <span className="avatar avatar-sm avatar-rounded">
                      <img
                        className="border border-white"
                        src={interview.candidateProfileImage ? `${backend_url}/uploads/candidates/${interview.candidateProfileImage}` : "assets/img/users/user-01.jpg"}
                        alt={`${interview.candidateName}`}
                        onError={(e) => {
                          if (e.currentTarget.src !== "assets/img/users/user-01.jpg") {
                            e.currentTarget.src = "assets/img/users/user-01.jpg";
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                    </span>
                    {/* Recruiter Profile Picture */}
                    {interview.assignedTo && (
                      <span className="avatar avatar-sm avatar-rounded">
                        <img
                          className="border border-white"
                          src={interview.assignedTo.profileImage ? `${backend_url}/uploads/${interview.assignedTo.profileImage}` : "assets/img/users/user-01.jpg"}
                          alt={`${interview.assignedTo.firstName} ${interview.assignedTo.lastName}`}
                          onError={(e) => {
                            e.currentTarget.src = "assets/img/users/user-01.jpg";
                          }}
                        />
                      </span>
                    )}
                  </div>
                  {interview.interviewLink ? (
                    <Link
                      to={interview.interviewLink} 
                      className="btn btn-primary btn-xs"
                      target="_blank"
                    >
                      Join
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleViewCandidate(interview.candidateId)}
                      className="btn btn-primary btn-xs"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <i className="ti ti-calendar-off text-muted fs-2 mb-3"></i>
            <p className="text-muted">No upcoming interviews scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewScheduleCard;