import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { routeConfig } from "@/permissions"; // Import our new config
import NotFound from "@/pages/NotFound";

const ProtectedRoute = () => {
  const { isAuthenticated, permissions: userPermissions } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Find the configuration for the current route
  const findRouteConfig = (pathname) => {
    // First, try for an exact match
    let route = routeConfig.find((p) => p.path === pathname);
    if (route) return route;

    // If no exact match, try for a dynamic route match (e.g., /employees/:id)
    route = routeConfig.find((p) => {
      if (!p.path.includes(":")) return false;
      // Convert path like '/employees/:id' to a regex like '^\/employees\/[^\/]+$'
      const regex = new RegExp(`^${p.path.replace(/:\w+/g, "[^/]+")}$`);
      return regex.test(pathname);
    });
    return route;
  };

  const currentRoute = findRouteConfig(location.pathname);

  // If the route is not defined in our config, it's a 404
  if (!currentRoute) {
    return <NotFound />;
  }

  const { permission: requiredPermission } = currentRoute;

  // If the route requires no specific permission, allow access
  if (!requiredPermission) {
    return <Outlet />;
  }

  // Check if the user has the required permission
  if (userPermissions && userPermissions.includes(requiredPermission)) {
    return <Outlet />;
  }

  // If all checks fail, the user is not authorized
  console.warn(
    `Access denied to ${location.pathname}. Required permission: "${requiredPermission}"`
  );
  return <NotFound />; // Or a dedicated "Access Denied" page
};

export default ProtectedRoute;
