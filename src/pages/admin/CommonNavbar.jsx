import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { clearUser, setUser } from "@/redux/slices/uiSlice";
import { selectUser } from "@/hooks/fetchUserProfile";
import { toast } from "react-toastify";
import { GiHamburgerMenu } from "react-icons/gi";
import { FiLogOut, FiChevronRight, FiSettings } from "react-icons/fi";

// Breadcrumb label map
const breadcrumbMap = {
  "/dashboard": "Dashboard",
  "/dashboard/home": "Home Page",
  "/dashboard/home/banner": "Hero Banner",
  "/dashboard/home/our-position": "Our Position",
  "/dashboard/settings": "Settings",
};

const CommonNavbar = ({ open, setOpen }) => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Build breadcrumbs from URL
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    return {
      label:
        breadcrumbMap[path] ||
        seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      path,
      isLast: i === segments.length - 1,
    };
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    dispatch(clearAuth());
    dispatch(clearUser());
    toast.success("Logged out successfully", { autoClose: 2000 });
    navigate("/");
  };

  const getInitial = () => (user?.name ? user.name.charAt(0).toUpperCase() : "A");

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
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400 cursor-default">Pages</span>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.path} className="flex items-center gap-1.5 min-w-0">
                <FiChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                <span
                  className={`truncate ${
                    crumb.isLast ? "text-gray-900 font-semibold" : "text-gray-500"
                  }`}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5 tracking-tight">
            {breadcrumbs.length > 0
              ? breadcrumbs[breadcrumbs.length - 1].label
              : "Dashboard"}
          </h1>
        </div>
      </div>

      {/* Right: Profile only */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#156E94]/30 hover:bg-[#156E94]/5 transition-all duration-200 shadow-sm group"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#156E94] to-[#0F4A63] flex items-center justify-center text-white font-bold text-sm">
                {getInitial()}
              </div>
            )}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-[#156E94] transition-colors">
              {user?.name || "Admin"}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight capitalize">
              {user?.role || "admin"}
            </span>
          </div>
        </button>

        {/* Dropdown */}
        {showProfileMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl shadow-black/5 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#156E94] to-[#0F4A63] flex items-center justify-center text-white font-bold text-sm">
                      {getInitial()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
                </div>
              </div>
            </div>

            {/* Menu */}
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
  );
};

export default CommonNavbar;
