import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default PublicRoute;
