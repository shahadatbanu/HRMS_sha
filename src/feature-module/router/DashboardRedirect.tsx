import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../core/context/UserContext';
import { all_routes } from './all_routes';

const DashboardRedirect: React.FC = () => {
  const { user, isLoading } = useUser();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to={all_routes.adminDashboard} replace />;
    case 'hr':
      return <Navigate to={all_routes.adminDashboard} replace />;
    case 'employee':
      return <Navigate to={all_routes.attendanceemployee} replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;
