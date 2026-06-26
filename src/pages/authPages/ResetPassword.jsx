import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import useAxiosPublic from "@/hooks/useAxiosPublic";

const ResetPassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const axiosPublic = useAxiosPublic();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid or missing reset token.", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await axiosPublic.post(`/auth/reset-password/${token}`, {
        password: data.newPassword,
      });

      setIsSuccess(true);
      toast.success("Your password has been reset successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
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

  const strength = passwordStrength(newPassword);

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <FiCheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
          Password Reset Successfully!
        </h3>
        <p className="text-gray-500 text-sm mb-6 font-[family-name:var(--font-poppins)]">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#156E94] to-[#0F4A63] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#156E94]/25 hover:from-[#0F4A63] hover:to-[#156E94] font-[family-name:var(--font-poppins)]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile header */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#156E94] to-[#0F4A63] rounded-2xl mb-4 shadow-lg">
          <FiLock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Reset Password
        </h2>
        <p className="text-gray-500 mt-1 text-sm font-[family-name:var(--font-poppins)]">
          Enter your new password
        </p>
      </div>

      {/* Desktop heading */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Set New Password
        </h2>
        <p className="text-gray-500 mt-2 font-[family-name:var(--font-poppins)]">
          Choose a strong password that you haven&apos;t used before
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 font-[family-name:var(--font-poppins)]">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiLock className={`h-4 w-4 ${errors.newPassword ? "text-red-400" : "text-gray-400"}`} />
            </div>
            <input
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
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
                errors.newPassword
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[#156E94] focus:border-[#156E94]"
              } focus:outline-none focus:ring-2 focus:ring-offset-0`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-poppins)]">
              {errors.newPassword.message}
            </p>
          )}

          {/* Password strength indicator */}
          {newPassword && newPassword.length > 0 && !errors.newPassword && (
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

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 font-[family-name:var(--font-poppins)]">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FiLock className={`h-4 w-4 ${errors.confirmPassword ? "text-red-400" : "text-gray-400"}`} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition-colors duration-200 font-[family-name:var(--font-poppins)] placeholder:text-gray-400 ${
                errors.confirmPassword
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-[#156E94] focus:border-[#156E94]"
              } focus:outline-none focus:ring-2 focus:ring-offset-0`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 font-[family-name:var(--font-poppins)]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Token indicator */}
        {token && (
          <p className="text-xs text-gray-400 text-center font-[family-name:var(--font-poppins)]">
            Reset token: {token.slice(0, 20)}...
          </p>
        )}

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
              <span>Resetting...</span>
            </>
          ) : (
            <>
              <FiCheckCircle className="h-4 w-4" />
              <span>Reset Password</span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-500 font-[family-name:var(--font-poppins)]">
        <Link to="/" className="inline-flex items-center gap-1.5 font-medium text-[#156E94] hover:text-[#0F4A63] transition-colors">
          <FiArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;