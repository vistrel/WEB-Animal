import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import AdsCatalogPage from "../pages/AdsCatalogPage";
import AdDetailsPage from "../pages/AdDetailsPage";
import CreateAdPage from "../pages/CreateAdPage";
import EditAdPage from "../pages/EditAdPage";
import FavoritesPage from "../pages/FavoritesPage";
import MessagesPage from "../pages/MessagesPage";
import SellerPage from "../pages/SellerPage";
import ModerationPage from "../pages/ModerationPage";
import AdminPage from "../pages/AdminPage";
import AboutPage from "../pages/AboutPage";
import RulesPage from "../pages/RulesPage";
import ContactsPage from "../pages/ContactsPage";
import PrivacyPage from "../pages/PrivacyPage";
import NotFoundPage from "../pages/NotFoundPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import GuestOnlyRoute from "../components/common/GuestOnlyRoute";
import RoleRoute from "../components/common/RoleRoute";

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
        path: "favorites",
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "moderation",
        element: (
          <RoleRoute roles={["MODERATOR", "ADMIN"]}>
            <ModerationPage />
          </RoleRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleRoute roles={["ADMIN"]}>
            <AdminPage />
          </RoleRoute>
        ),
      },
      {
        path: "create-ad",
        element: (
          <ProtectedRoute>
            <CreateAdPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "edit-ad/:id",
        element: (
          <ProtectedRoute>
            <EditAdPage />
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
        path: "users/:id",
        element: <SellerPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "rules",
        element: <RulesPage />,
      },
      {
        path: "contacts",
        element: <ContactsPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
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
