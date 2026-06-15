import Dashboard from "@/components/admin/Dashboard";
import AdminLayout from "@/layout/AdminLayout";
import Layout from "@/layout/Layout";
import Home from "@/pages/sites/Home";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([

  // Admin routes
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />, // ✅ Fixed typo
      },
    ],
  },
]);

export default router;
