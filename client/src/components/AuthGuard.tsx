import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  requireRole?: 'user' | 'farmer';
}

/** Redirects unauthenticated users to /login and optionally enforces a role. */
export default function AuthGuard({ children, requireRole }: Props) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && role !== requireRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500 mb-2">Access Denied</p>
          <p className="text-slate-500">This page requires {requireRole} access.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
