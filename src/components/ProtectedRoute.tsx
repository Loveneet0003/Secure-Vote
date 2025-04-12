
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiresAdmin = false }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please log in to access this page");
    } else if (requiresAdmin && !isAdmin) {
      toast.error("You don't have permission to access this page");
    }
  }, [isLoggedIn, isAdmin, requiresAdmin]);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
