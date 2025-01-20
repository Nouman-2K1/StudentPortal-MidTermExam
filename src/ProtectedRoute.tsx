import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { UserRole } from './Interface/User.interface';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useUser();
  const location = useLocation();

  if (!user) {
    // Save the attempted url for redirecting after login
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
