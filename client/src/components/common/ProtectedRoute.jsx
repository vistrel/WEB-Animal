import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import PageLoader from "./PageLoader";

function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return <PageLoader text="Перевірка доступу..." />;
  }

  if (!user) {
    return <Navigate to="/vkhid" replace />;
  }

  return children;
}

export default ProtectedRoute;
