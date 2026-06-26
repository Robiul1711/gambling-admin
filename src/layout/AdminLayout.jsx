import CommonNavbar from "@/pages/admin/CommonNavbar";
import SideBar from "@/pages/admin/SideBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React, { useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { FiSettings } from "react-icons/fi";
import { FaUsers, FaFileAlt, FaBookOpen, FaAlignLeft } from "react-icons/fa";
import { useUserProfile } from "@/hooks/fetchUserProfile";
const AdminLayout = () => {
  useUserProfile();
  const [Open, setOpen] = useState(false);

  const sideBar = [
    {
      id: 1,
      icon: <IoHomeOutline />,
      text: "Home Page",
      path: "/dashboard/home",
      sublink: [
        {
          id: 1,
          text: "Hero Banner",
          path: "/dashboard/home/banner",
        },
        {
          id: 2,
          text: "Our Position",
          path: "/dashboard/home/our-position",
        },
      ],
    },
    {
      id: 3,
      icon: <FaUsers />,
      text: "Our Team",
      path: "/dashboard/team",
    },
    {
      id: 4,
      icon: <FaFileAlt />,
      text: "Resources",
      path: "/dashboard/resources",
    },
    {
      id: 5,
      icon: <FaBookOpen />,
      text: "About Page Settings",
      path: "/dashboard/about",
    },
    {
      id: 6,
      icon: <FaAlignLeft />,
      text: "Footer Settings",
      path: "/dashboard/footer",
    },
    {
      id: 2,
      icon: <FiSettings />,
      text: "Settings",
      path: "/dashboard/settings",
    },
  ];
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);
  return (
    <>
      <ScrollRestoration />
      <div className="flex h-screen min-h-screen w-full">
        <SideBar open={Open} setOpen={setOpen} sidebar={sideBar} />
        <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col overflow-auto custom-scrollbar">
          {/* Sticky header container */}
          <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 lg:px-[30px] px-2.5 sm:px-5 py-4 shadow-sm">
            <CommonNavbar open={Open} setOpen={setOpen} />
          </div>
          {/* Content container */}
          <div className="flex flex-col lg:gap-10 gap-5 lg:py-6 py-3 lg:px-[30px] px-2.5 sm:px-5">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Global toast notifications for all admin actions */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  );
};

export default AdminLayout;
