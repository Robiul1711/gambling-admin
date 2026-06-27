import Dashboard from "@/components/admin/Dashboard";
import AdminLayout from "@/layout/AdminLayout";
import AuthLayout from "@/layout/AuthLayout";
import PrivateRoute from "@/components/common/PrivateRoute";
import ForgetPassword from "@/pages/authPages/ForgetPassword";
import Login from "@/pages/authPages/Login";
import Register from "@/pages/authPages/Register";
import ResetPassword from "@/pages/authPages/ResetPassword";
import HeroBannerManager from "@/pages/admin/HeroBannerManager";
import SettingsPage from "@/pages/admin/SettingsPage";
import OurTeamManager from "@/pages/admin/OurTeamManager";
import ResourceManager from "@/pages/admin/ResourceManager";
import AboutPageManager from "@/pages/admin/AboutPageManager";
import FooterManager from "@/pages/admin/FooterManager";
import NewsResearchSettingsManager from "@/pages/admin/NewsResearchSettingsManager";
import PhoenixAudioManager from "@/pages/admin/PhoenixAudioManager";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  // Auth routes (no sidebar/navbar)
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgetPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
  // Admin routes (protected by PrivateRoute)
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/dashboard/home/banner", element: <HeroBannerManager /> },
      { path: "/dashboard/settings", element: <SettingsPage /> },
      { path: "/dashboard/team", element: <OurTeamManager /> },
      { path: "/dashboard/resources", element: <ResourceManager /> },
      { path: "/dashboard/about", element: <AboutPageManager /> },
      { path: "/dashboard/footer", element: <FooterManager /> },
      { path: "/dashboard/news-research/settings", element: <NewsResearchSettingsManager /> },
      { path: "/dashboard/news-research/audio", element: <PhoenixAudioManager /> },
    ],
  },
]);

export default router;
