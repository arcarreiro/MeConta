
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../services/store';
import { Role } from '../types';

const Dashboard: React.FC = () => {
  const user = Store.getCurrentUser();
  
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case Role.ADMIN:
      return <Navigate to="/admin" />;
    case Role.MONITOR:
      return <Navigate to="/monitor" />;
    case Role.STUDENT:
    default:
      return <Navigate to="/student" />;
  }
};

export default Dashboard;
