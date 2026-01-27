import { Navigate, Outlet, useLocation } from "react-router";
import { getToken } from "../api/http";

export const RequireAuth = () => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};
