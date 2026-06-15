import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { setToken } from "@/redux/slices/authSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const axiosPublic = useAxiosPublic();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axiosPublic.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { token } = response.data.data;
      dispatch(setToken({ token }));

      toast.success("Welcome back! You have been signed in successfully.", {
        position: "top-right",
        autoClose: 3000,
      });

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile header */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#156E94] to-[#0F4A63] rounded-2xl mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Welcome Back
        </h2>
        <p className="text-gray-500 mt-1 text-sm font-[family-name:var(--font-poppins)]">
          Sign in to your admin account
        </p>
      </div>

      {/* Desktop heading */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Sign In
        </h2>
        <p className="text-gray-500 mt-2 font-[family-name:var(--font-poppins)]">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 font-[family-name:var(--font-poppins)]">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiMail className={`h-4 w-4 ${errors.email ? "text-red-400" : "text-gray-400"}`} />
            </div>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors duration-200 font-[family-name:var(--font-poppins)] placeholder:text-gray-400 ${
                errors.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[#156E94] focus:border-[#156E94]"
              } focus:outline-none focus:ring-2 focus:ring-offset-0`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-poppins)]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 font-[family-name:var(--font-poppins)]">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiLock className={`h-4 w-4 ${errors.password ? "text-red-400" : "text-gray-400"}`} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition-colors duration-200 font-[family-name:var(--font-poppins)] placeholder:text-gray-400 ${
                errors.password
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[#156E94] focus:border-[#156E94]"
              } focus:outline-none focus:ring-2 focus:ring-offset-0`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-poppins)]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#156E94] focus:ring-[#156E94] cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-[family-name:var(--font-poppins)]">
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[#156E94] hover:text-[#0F4A63] transition-colors font-[family-name:var(--font-poppins)]"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#156E94] to-[#0F4A63] text-white py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#156E94]/25 hover:from-[#0F4A63] hover:to-[#156E94] disabled:opacity-60 disabled:cursor-not-allowed font-[family-name:var(--font-poppins)]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <FiLogIn className="h-4 w-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-8 text-center text-sm text-gray-500 font-[family-name:var(--font-poppins)]">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-[#156E94] hover:text-[#0F4A63] transition-colors"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
};

export default Login;