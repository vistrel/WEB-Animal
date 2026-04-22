import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import AdsCatalogPage from "../pages/AdsCatalogPage";
import AdDetailsPage from "../pages/AdDetailsPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import GuestOnlyRoute from "../components/common/GuestOnlyRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: (
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "register",
        element: (
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ads",
        element: <AdsCatalogPage />,
      },
      {
        path: "ads/:slug",
        element: <AdDetailsPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "403",
        element: <ForbiddenPage />,
      },

      {
        path: "vkhid",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "reyestratsiya",
        element: <Navigate to="/register" replace />,
      },
      {
        path: "profil",
        element: <Navigate to="/profile" replace />,
      },
      {
        path: "ogoloshennya",
        element: <Navigate to="/ads" replace />,
      },
      {
        path: "pro-servis",
        element: <Navigate to="/about" replace />,
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
