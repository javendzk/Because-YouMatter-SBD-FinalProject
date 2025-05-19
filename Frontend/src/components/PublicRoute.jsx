import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to redirect authenticated users away from public routes
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('PublicRoute: Auth check - isAuthenticated:', isAuthenticated, 'loading:', loading);  // Show loading indicator while checking authentication
  if (loading) {
    console.log('PublicRoute: Auth is loading...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // No redirect for authenticated users - they can access public routes
  console.log('PublicRoute: Rendering children regardless of authentication status');
  return children;
};

export default PublicRoute;
