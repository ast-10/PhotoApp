import React from "react";
import { useAuth } from "../AuthProvider";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Render a loading state while fetching user data
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;