import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authStore";
import { sidebarSections } from "../config/sidebarSections";

const getDefaultPath = (userRoles) => {
  const isOnlyAlumno =
    userRoles.includes("ALUMNO") &&
    userRoles.every((role) => role === "ALUMNO");

  return isOnlyAlumno ? "/alumno/boleta-final" : "/dashboard";
};

const getRouteItem = (pathname) => {
  const items = sidebarSections.flatMap((section) => section.items);

  return items
    .filter(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
};

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const userRoles = user?.roles?.map((role) => role.nombre) || [];
  const routeItem = getRouteItem(location.pathname);

  if (
    routeItem &&
    !routeItem.roles.some((role) => userRoles.includes(role))
  ) {
    const fallbackPath = getDefaultPath(userRoles);

    return (
      <Navigate
        to={fallbackPath === location.pathname ? "/" : fallbackPath}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
