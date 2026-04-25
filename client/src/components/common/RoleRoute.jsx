import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import PageLoader from "./PageLoader";

function RoleRoute({ roles, children }) {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return <PageLoader text="Перевірка доступу..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default RoleRoute;
