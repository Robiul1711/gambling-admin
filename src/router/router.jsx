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
import AboutMissionManager from "@/pages/admin/AboutMissionManager";
import FooterManager from "@/pages/admin/FooterManager";
import NewsResearchSettingsManager from "@/pages/admin/NewsResearchSettingsManager";
import PhoenixAudioManager from "@/pages/admin/PhoenixAudioManager";
import ProfessionalsManager from "@/pages/admin/ProfessionalsManager";
import HealthcareBannerManager from "@/pages/admin/HealthcareBannerManager";
import HealthcarePositionVideoManager from "@/pages/admin/HealthcarePositionVideoManager";
import PublicHealthBannerManager from "@/pages/admin/PublicHealthBannerManager";
import PublicHealthPositionManager from "@/pages/admin/PublicHealthPositionManager";
import CYPBannerManager from "@/pages/admin/CYPBannerManager";
import CYPIntroManager from "@/pages/admin/CYPIntroManager";
import CYPSafeguardingFilmsManager from "@/pages/admin/CYPSafeguardingFilmsManager";
import GetHelpOverviewManager from "@/pages/admin/GetHelpOverviewManager";
import GetHelpCheckInManager from "@/pages/admin/GetHelpCheckInManager";
import GetHelpTreatmentManager from "@/pages/admin/GetHelpTreatmentManager";
import GetHelpFamilyFriendsManager from "@/pages/admin/GetHelpFamilyFriendsManager";
import GetHelpWhatHarmManager from "@/pages/admin/GetHelpWhatHarmManager";
import GetHelpVictimsManager from "@/pages/admin/GetHelpVictimsManager";
import GetHelpScaleManager from "@/pages/admin/GetHelpScaleManager";
import OurWorkBurdenBannerManager from "@/pages/admin/OurWorkBurdenBannerManager";
import OurWorkModifiableManager from "@/pages/admin/OurWorkModifiableManager";
import OurWorkExplainedManager from "@/pages/admin/OurWorkExplainedManager";
import OurWorkTacticsManager from "@/pages/admin/OurWorkTacticsManager";
import OurWorkUnderstandingManager from "@/pages/admin/OurWorkUnderstandingManager";
import OurWorkLooksLikeManager from "@/pages/admin/OurWorkLooksLikeManager";
import OurWorkStigmaManager from "@/pages/admin/OurWorkStigmaManager";
import OurWorkInequalityManager from "@/pages/admin/OurWorkInequalityManager";
import OurWorkPolicyManager from "@/pages/admin/OurWorkPolicyManager";
import OurWorkMembersManager from "@/pages/admin/OurWorkMembersManager";
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
      { path: "/dashboard/about/mission", element: <AboutMissionManager /> },
      { path: "/dashboard/professionals/stakeholder", element: <ProfessionalsManager /> },
      { path: "/dashboard/healthcare/banner", element: <HealthcareBannerManager /> },
      { path: "/dashboard/healthcare/position-video", element: <HealthcarePositionVideoManager /> },
      { path: "/dashboard/public-health/banner", element: <PublicHealthBannerManager /> },
      { path: "/dashboard/public-health/position", element: <PublicHealthPositionManager /> },
      { path: "/dashboard/cyp/banner", element: <CYPBannerManager /> },
      { path: "/dashboard/cyp/intro", element: <CYPIntroManager /> },
      { path: "/dashboard/cyp/safeguarding-films", element: <CYPSafeguardingFilmsManager /> },
      { path: "/dashboard/get-help/overview", element: <GetHelpOverviewManager /> },
      { path: "/dashboard/get-help/check-in", element: <GetHelpCheckInManager /> },
      { path: "/dashboard/get-help/treatment", element: <GetHelpTreatmentManager /> },
      { path: "/dashboard/get-help/family-friends", element: <GetHelpFamilyFriendsManager /> },
      { path: "/dashboard/get-help/what-harm", element: <GetHelpWhatHarmManager /> },
      { path: "/dashboard/get-help/victims-not-bystanders", element: <GetHelpVictimsManager /> },
      { path: "/dashboard/get-help/scale-section", element: <GetHelpScaleManager /> },
      { path: "/dashboard/our-work/burden-of-harm", element: <OurWorkBurdenBannerManager /> },
      { path: "/dashboard/our-work/modifiable-risk-factor", element: <OurWorkModifiableManager /> },
      { path: "/dashboard/our-work/gambling-explained", element: <OurWorkExplainedManager /> },
      { path: "/dashboard/our-work/gambling-tactics", element: <OurWorkTacticsManager /> },
      { path: "/dashboard/our-work/understanding-harms", element: <OurWorkUnderstandingManager /> },
      { path: "/dashboard/our-work/looks-like", element: <OurWorkLooksLikeManager /> },
      { path: "/dashboard/our-work/stigma", element: <OurWorkStigmaManager /> },
      { path: "/dashboard/our-work/inequality", element: <OurWorkInequalityManager /> },
      { path: "/dashboard/our-work/policy", element: <OurWorkPolicyManager /> },
      { path: "/dashboard/our-work/members-only", element: <OurWorkMembersManager /> },
      { path: "/dashboard/footer", element: <FooterManager /> },
      {
        path: "/dashboard/news-research/settings",
        element: <NewsResearchSettingsManager />,
      },
      {
        path: "/dashboard/news-research/audio",
        element: <PhoenixAudioManager />,
      },
    ],
  },
]);

export default router;
