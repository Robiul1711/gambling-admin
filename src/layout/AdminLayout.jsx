import CommonNavbar from "@/pages/admin/CommonNavbar";
import SideBar from "@/pages/admin/SideBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React, { useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { FiSettings } from "react-icons/fi";
import {
  FaUsers,
  FaFileAlt,
  FaBookOpen,
  FaAlignLeft,
  FaRegNewspaper,
} from "react-icons/fa";
import { useUserProfile } from "@/hooks/fetchUserProfile";
const AdminLayout = () => {
  useUserProfile();
  const [Open, setOpen] = useState(false);

  const sideBar = [
    {
      id: 100,
      icon: <FaAlignLeft />,
      text: "CMS",
      isCMSParent: true,
      subpages: [
        {
          id: "home",
          text: "Home Page",
          sections: [
            { text: "Hero Banner", path: "/dashboard/home/banner" },
          ],
        },
        {
          id: "about",
          text: "About Page",
          sections: [
            { text: "About Settings", path: "/dashboard/about" },
          ],
        },
        {
          id: "news",
          text: "News & Research",
          sections: [
            { text: "Page Settings", path: "/dashboard/news-research/settings" },
            { text: "Audio Clips", path: "/dashboard/news-research/audio" },
          ],
        },
        {
          id: "professionals",
          text: "Professionals Page",
          sections: [
            { text: "Stakeholders Section", path: "/dashboard/professionals/stakeholder" },
          ],
        },
        {
          id: "healthcare",
          text: "Healthcare Page",
          sections: [
            { text: "Banner Section", path: "/dashboard/healthcare/banner" },
            { text: "Position & Video", path: "/dashboard/healthcare/position-video" },
          ],
        },
        {
          id: "public-health",
          text: "Public Health Page",
          sections: [
            { text: "Banner Section", path: "/dashboard/public-health/banner" },
            { text: "Position Section", path: "/dashboard/public-health/position" },
          ],
        },
        {
          id: "cyp",
          text: "Children & Young People Page",
          sections: [
            { text: "Banner Section", path: "/dashboard/cyp/banner" },
            { text: "Intro Section", path: "/dashboard/cyp/intro" },
          ],
        },
        {
          id: "footer",
          text: "Footer Settings",
          path: "/dashboard/footer",
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
          <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 lg:px-[30px] px-2.5 sm:px-5 py-3 shadow-sm">
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
