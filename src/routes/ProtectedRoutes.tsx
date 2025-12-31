import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRoutesProps {
  authenticated: boolean;
  redirectPath?: string;
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({
  authenticated,
  redirectPath = "/",
}) => {
  return authenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoutes;
