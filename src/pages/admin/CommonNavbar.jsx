import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { toast } from "react-toastify";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosNotifications, IoIosSearch } from "react-icons/io";
import { FiLogOut, FiChevronRight, FiSettings, FiUser } from "react-icons/fi";

// Breadcrumb mapping
const breadcrumbMap = {
  "/dashboard": "Dashboard",
  "/dashboard/admin-list": "Admin List",
  "/dashboard/settings": "Settings",
  "/dashboard/analytics": "Analytics",
};

const CommonNavbar = ({ open, setOpen }) => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    return {
      label: breadcrumbMap[path] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      path,
      isLast: i === segments.length - 1,
    };
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    dispatch(clearAuth());
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    });
    navigate("/login");
  };

  // Sample notifications (placeholder)
  const notifications = [
    { id: 1, text: "New user registered", time: "2 min ago", unread: true },
    { id: 2, text: "Report ready for review", time: "1 hour ago", unread: true },
    { id: 3, text: "System update completed", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const formatDate = () => {
    const now = new Date();
    const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    return now.toLocaleDateString("en-US", options);
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left: Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => setOpen(!open)}
          className="xl:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#156E94] transition-all duration-200 shadow-sm"
        >
          <GiHamburgerMenu size={18} />
        </button>

        <div className="min-w-0">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400 hover:text-gray-600 transition-colors cursor-default">
              Pages
            </span>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.path} className="flex items-center gap-1.5 min-w-0">
                <FiChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                <span
                  className={`truncate ${
                    crumb.isLast
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5 tracking-tight">
            {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : "Dashboard"}
          </h1>
        </div>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={`relative hidden sm:block transition-all duration-200 ${
            searchFocused ? "w-72" : "w-56"
          }`}
        >
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-200 ${
              searchFocused
                ? "border-[#156E94] ring-2 ring-[#156E94]/10 bg-white"
                : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
            }`}
          >
            <IoIosSearch
              size={16}
              className={`flex-shrink-0 transition-colors ${
                searchFocused ? "text-[#156E94]" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
            />
            {searchFocused && (
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md border border-gray-200 bg-gray-100 text-[10px] text-gray-400 font-mono">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#156E94] hover:border-[#156E94]/30 hover:bg-[#156E94]/5 transition-all duration-200 shadow-sm"
          >
            <IoIosNotifications size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl shadow-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  <button className="text-xs text-[#156E94] hover:text-[#0F4A63] font-medium transition-colors">
                    Mark all read
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      notif.unread ? "bg-[#156E94]/5" : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.unread ? "bg-[#156E94]" : "bg-gray-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.unread ? "font-medium text-gray-900" : "text-gray-600"}`}>
                        {notif.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 text-center">
                <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#156E94]/30 hover:bg-[#156E94]/5 transition-all duration-200 shadow-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#156E94] to-[#0F4A63] flex items-center justify-center text-white font-semibold text-sm shadow-inner">
              A
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900 leading-tight group-hover:text-[#156E94] transition-colors">
                Admin
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">{formatDate()}</span>
            </div>
          </button>

          {/* Profile dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl shadow-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Profile Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#156E94] to-[#0F4A63] flex items-center justify-center text-white font-semibold text-sm shadow-inner">
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
                    <p className="text-xs text-gray-400 truncate">admin@safe.gambling</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/dashboard/settings");
                  }}
                >
                  <FiSettings size={16} className="text-gray-400" />
                  Settings
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonNavbar;
