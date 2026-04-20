import React from 'react';
import { Navigate } from 'react-router-dom';
import { Role } from '../../types';
import { Store } from '../../services/store';

interface PrivateRouteProps {
  children?: React.ReactNode;
  allowedRoles?: Role[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const user = Store.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};