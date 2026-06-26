import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import logo from "@/assets/images/logo.png";
import useClient from "@/hooks/useClient";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { toast } from "react-toastify";

const navItemStyles = {
  base: "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
  active:
    "bg-white/15 text-white shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-white before:rounded-r-full",
  inactive:
    "text-white/70 hover:bg-white/10 hover:text-white",
};

const SideBar = ({ sidebar, open, setOpen }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.ui);
  const [activeParentIndex, setActiveParentIndex] = useState(null);

  // Fetch brand logo dynamically from footer settings
  const { data: responseData } = useClient({
    queryKey: ["footerSettings"],
    url: "/footer",
  });
  const footerData = responseData?.data;

  useEffect(() => {
    sidebar.forEach((item, index) => {
      if (item.sublink) {
        const activeSub = item.sublink.find(
          (sub) => sub.path === location.pathname
        );
        if (activeSub) {
          setActiveParentIndex(index);
        }
      }
    });
  }, [location.pathname, sidebar]);

  const isActive = (paths) => {
    if (!paths) return false;
    const pathArray = Array.isArray(paths) ? paths : [paths];
    return pathArray.includes(location.pathname);
  };

  const isParentActive = (item) => {
    if (!item.sublink) return isActive(item.activePaths || item.path);
    return item.sublink.some((sub) => isActive(sub.path));
  };

  const toggleSubmenu = (index) => {
    setActiveParentIndex((prev) => (prev === index ? null : index));
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    });
    navigate("/");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out z-40 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        } xl:hidden`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`h-full flex flex-col bg-gradient-to-b from-[#0F4A63] via-[#156E94] to-[#0D3B4F] transition-all duration-300 ease-in-out ${
          open
            ? "left-0 top-0 w-[300px] z-50 shadow-2xl shadow-black/20"
            : "-left-full xl:w-[280px] w-[300px]"
        } xl:static fixed overflow-hidden`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgY3k9IjAlIiBjeD0iNTAlIiByPSI4MCUiIGlkPSJnIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDAuMDYpIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDApIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex-shrink-0 px-6 pt-8 pb-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-white/15 rounded-xl group-hover:bg-white/25 transition-all duration-200 shadow-lg overflow-hidden p-1.5">
                <img src={footerData?.logo || logo} alt="logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-lg leading-tight tracking-tight">
                  Admin Panel
                </span>
                <span className="text-white/50 text-[10px] uppercase tracking-widest font-medium">
                  Management
                </span>
              </div>
            </Link>

            {/* Divider */}
            <div className="mt-6 h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
            {/* Section label */}
            <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
              Main Menu
            </p>

            {sidebar?.map((item, index) => {
              const parentActive = isParentActive(item);
              const isActuallyActive = isActive(item?.activePaths || item?.path);

              return !item?.sublink ? (
                <Link
                  key={index}
                  to={item?.path}
                  onClick={() => {
                    setActiveParentIndex(null);
                    setOpen(false);
                  }}
                  className={`${navItemStyles.base} ${
                    isActuallyActive
                      ? navItemStyles.active
                      : navItemStyles.inactive
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{item?.icon}</span>
                  <span className="truncate">{item?.text}</span>
                  {isActuallyActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              ) : (
                <div key={index} className="space-y-1">
                  {/* Parent link */}
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`w-full ${navItemStyles.base} ${
                      parentActive
                        ? navItemStyles.active
                        : navItemStyles.inactive
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{item?.icon}</span>
                    <span className="truncate flex-1 text-left">
                      {item?.text}
                    </span>
                    <MdKeyboardArrowDown
                      size={18}
                      className={`transition-transform duration-300 flex-shrink-0 ${
                        activeParentIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Sublinks */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      activeParentIndex === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-4 pl-3 border-l border-white/10 space-y-1 py-1">
                      {item?.sublink?.map((value, subIndex) => (
                        <Link
                          key={subIndex}
                          to={value?.path}
                          onClick={() => setOpen(false)}
                          className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive(value?.path)
                              ? "text-white bg-white/15 font-medium"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {value?.text}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="flex-shrink-0 px-4 pb-6 pt-4">
            <div className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0 mb-4" />
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || "Admin"}
                    className="w-9 h-9 rounded-full object-cover shadow-inner"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white font-semibold text-sm shadow-inner">
                    {user?.name ? user.name[0].toUpperCase() : "A"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium leading-tight">
                    {user?.name || "Admin"}
                  </span>
                  <span className="text-white/40 text-[11px]">
                    {user?.email || "admin@safe.gambling"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                title=""
              >
                <IoLogOutOutline size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
