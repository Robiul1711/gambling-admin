import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FiMail, FiArrowLeft, FiSend } from "react-icons/fi";
import useAxiosPublic from "@/hooks/useAxiosPublic";

const ForgetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const axiosPublic = useAxiosPublic();


  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await axiosPublic.post("/auth/forgot-password", {
        email: data.email,
      });

      setEmailSent(true);
      toast.success("Password reset link has been sent to your email.", {
        position: "top-right",
        autoClose: 4000,
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

  return (
    <div>
      {/* Mobile header */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#156E94] to-[#0F4A63] rounded-2xl mb-4 shadow-lg">
          <FiMail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Forgot Password
        </h2>
        <p className="text-gray-500 mt-1 text-sm font-[family-name:var(--font-poppins)]">
          We&apos;ll send you a reset link
        </p>
      </div>

      {/* Desktop heading */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-poppins)]">
          Reset Password
        </h2>
        <p className="text-gray-500 mt-2 font-[family-name:var(--font-poppins)]">
          Enter your email and we&apos;ll send you a link to reset your password
        </p>
      </div>

      {emailSent ? (
        /* Success state */
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-poppins)]">
            Check Your Email
          </h3>
          <p className="text-gray-500 text-sm mb-6 font-[family-name:var(--font-poppins)]">
            We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#156E94] hover:text-[#0F4A63] transition-colors font-[family-name:var(--font-poppins)]"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      ) : (
        /* Form */
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
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FiSend className="h-4 w-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer */}
      {!emailSent && (
        <p className="mt-8 text-center text-sm text-gray-500 font-[family-name:var(--font-poppins)]">
          <Link to="/" className="inline-flex items-center gap-1.5 font-medium text-[#156E94] hover:text-[#0F4A63] transition-colors">
            <FiArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </p>
      )}
    </div>
  );
};

export default ForgetPassword;