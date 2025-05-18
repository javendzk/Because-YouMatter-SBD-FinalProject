import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to redirect authenticated users away from public routes
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Redirect to welcoming page if already authenticated
  if (isAuthenticated()) {
    return <Navigate to="/welcoming" replace />;
  }

  // Render children if not authenticated
  return children;
};

export default PublicRoute;
