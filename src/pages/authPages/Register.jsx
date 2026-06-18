import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import { setToken } from "@/redux/slices/authSlice";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const axiosPublic = useAxiosPublic();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axiosPublic.post("/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const { token } = response.data.data;
      dispatch(setToken({ token }));

      toast.success("Account created successfully! Welcome aboard.", {
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

  const passwordStrength = (password) => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { level: 2, label: "Medium", color: "bg-yellow-500" };
    if (score === 4) return { level: 3, label: "Strong", color: "bg-green-500" };
    return { level: 4, label: "Very Strong", color: "bg-emerald-500" };
  };

  const strength = passwordStrength(password);

  return (
    <div>
      {/* Mobile header */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#156E94] to-[#0F4A63] rounded-2xl mb-4 shadow-lg">
          <FiUserPlus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Create Account
        </h2>
        <p className="text-gray-500 mt-1 text-sm font-[family-name:var(--font-poppins)]">
          Register your admin account
        </p>
      </div>

      {/* Desktop heading */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Create Account
        </h2>
        <p className="text-gray-500 mt-2 font-[family-name:var(--font-poppins)]">
          Fill in the details below to set up your admin account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 font-[family-name:var(--font-poppins)]">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiUser className={`h-4 w-4 ${errors.name ? "text-red-400" : "text-gray-400"}`} />
            </div>
            <input
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors duration-200 font-[family-name:var(--font-poppins)] placeholder:text-gray-400 ${
                errors.name
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[#156E94] focus:border-[#156E94]"
              } focus:outline-none focus:ring-2 focus:ring-offset-0`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-poppins)]">
              {errors.name.message}
            </p>
          )}
        </div>

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
                validate: {
                  hasUpperCase: (value) =>
                    /[A-Z]/.test(value) || "Must contain an uppercase letter",
                  hasLowerCase: (value) =>
                    /[a-z]/.test(value) || "Must contain a lowercase letter",
                  hasNumber: (value) =>
                    /[0-9]/.test(value) || "Must contain a number",
                },
              })}
              className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition-colors duration-200 font-[family-name:var(--font-poppins)] placeholder:text-gray-400 ${
                errors.password
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[#156E94] focus:border-[#156E94]"
              } focus:outline-none focus:ring-2 focus:ring-offset-0`}
              placeholder="Create a strong password"
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

          {/* Password strength indicator */}
          {password && password.length > 0 && !errors.password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      level <= strength.level ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${strength.color.replace("bg-", "text-")} font-[family-name:var(--font-poppins)]`}>
                {strength.label}
              </p>
            </div>
          )}
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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <FiUserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500 font-[family-name:var(--font-poppins)]">
        Already have an account?{" "}
        <Link
          to="/"
          className="font-medium text-[#156E94] hover:text-[#0F4A63] transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
