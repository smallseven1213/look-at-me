// src/routes/PublicRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../hooks/useUserStore";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const user = useUserStore((state) => state.user);

  if (user?.token != null && user?.token !== "") {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
