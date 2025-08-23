import React from 'react';
import { useUser } from '../context/UserContext';

interface RoleBasedMenuProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleBasedMenu: React.FC<RoleBasedMenuProps> = ({ children, allowedRoles }) => {
  const { user } = useUser();

  // If no user is logged in, don't show the menu item
  if (!user) {
    return null;
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  // If user has the required role, show the menu item
  return <>{children}</>;
};

export default RoleBasedMenu;
