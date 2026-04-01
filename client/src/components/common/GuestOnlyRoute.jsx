import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import PageLoader from "./PageLoader";

function GuestOnlyRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return <PageLoader text="Підготовка сторінки..." />;
  }

  if (user) {
    return <Navigate to="/profil" replace />;
  }

  return children;
}

export default GuestOnlyRoute;
