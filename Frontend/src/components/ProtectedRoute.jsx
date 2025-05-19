import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  // Show loading indicator while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Auth is loading...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Check if authenticated using regular variable, not a function call
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to signin');
    return <Navigate to="/signin" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
