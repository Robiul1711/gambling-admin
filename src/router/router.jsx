import Dashboard from "@/components/admin/Dashboard";
import AdminLayout from "@/layout/AdminLayout";
import AuthLayout from "@/layout/AuthLayout";
import PrivateRoute from "@/components/common/PrivateRoute";
import ForgetPassword from "@/pages/authPages/ForgetPassword";
import Login from "@/pages/authPages/Login";
import Register from "@/pages/authPages/Register";
import ResetPassword from "@/pages/authPages/ResetPassword";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  // Auth routes (no sidebar/navbar)
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/forgot-password",
        element: <ForgetPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
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
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

export default router;
