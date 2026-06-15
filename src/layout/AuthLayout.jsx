import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { FaReact } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import logo from "@/assets/images/logo.png"
const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - decorative / brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#156E94] to-[#0F4A63] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center mb-4">

      <img src={logo} alt="" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-[family-name:var(--font-poppins)]">
            Admin Dashboard  
          </h1>
          <p className="text-lg text-white/80 max-w-md mx-auto font-[family-name:var(--font-poppins)]">
            Manage content, users, and analytics all in one place.
          </p>
        </div>
      </div>

      {/* Right side - form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
};

export default AuthLayout;
