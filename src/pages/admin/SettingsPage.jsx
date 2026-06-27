import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { FaCamera, FaSave, FaLock, FaUser, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useClient from "@/hooks/useClient";
import useMutationClient from "@/hooks/useMutationClient";
import { setUser } from "@/redux/slices/uiSlice";
import { selectUser } from "@/hooks/fetchUserProfile";
import { useQueryClient } from "@tanstack/react-query";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  const [activeTab, setActiveTab] = useState("profile");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef(null);

  // ── Profile Form ──────────────────────────────────────────────────────────
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
  } = useForm({ defaultValues: { name: "", email: "" } });

  // ── Password Form ─────────────────────────────────────────────────────────
  const {
    register: regPass,
    handleSubmit: handlePass,
    reset: resetPass,
    watch: watchPass,
    formState: { errors: passErrors },
  } = useForm();

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name || "", email: user.email || "" });
      if (user.avatar) setAvatarPreview(user.avatar);
    }
  }, [user, resetProfile]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: updateProfile, isPending: isUpdating } = useMutationClient({
    url: "/auth/profile",
    method: "put",
    isPrivate: true,
    invalidateKeys: [["userProfile"]],
    successMessage: "Profile updated successfully!",
  });

  const { mutate: changePassword, isPending: isChangingPass } = useMutationClient({
    url: "/auth/change-password",
    method: "put",
    isPrivate: true,
    successMessage: "Password changed successfully!",
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (avatarPreview && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onProfileSubmit = (formData) => {
    const payload = new FormData();
    payload.append("name", formData.name);
    if (avatarFile) payload.append("avatar", avatarFile);

    updateProfile(
      { data: payload, config: { headers: { "Content-Type": "multipart/form-data" } } },
      {
        onSuccess: (res) => {
          const updated = res?.data?.data;
          if (updated) dispatch(setUser(updated));
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
      }
    );
  };

  const onPasswordSubmit = (formData) => {
    changePassword(
      {
        data: {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
      },
      {
        onSuccess: () => resetPass(),
      }
    );
  };

  const getInitial = () => (user?.name ? user.name.charAt(0).toUpperCase() : "A");

  return (
    <div className="max-w-6xl mx-auto w-full text-slate-800">
      <div className="bg-white  rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Cover Banner with geometric elements */}
        <div className="relative h-48 w-full bg-gradient-to-r from-[#156E94] via-[#105674] to-[#0D3B4F] flex items-end">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent)]" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="p-8 relative z-10 text-white">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Account Settings</h1>
            <p className="text-white/80 text-xs md:text-sm mt-1">
              Customize your profile info and update your account password security details.
            </p>
          </div>
        </div>

        {/* Unified Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 bg-white">
          
          {/* Left Column: Profile Card + Vertical Tabs (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col items-center">
            
            {/* Avatar container overlapping cover slightly */}
            <div className="relative lg:mt-[-5.5rem] z-10 mb-5">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-slate-50 transition-all duration-300 hover:ring-[#156E94]/30 group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setAvatarPreview("")}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#156E94] to-[#0F4A63] flex items-center justify-center text-white text-5xl font-bold transition-transform duration-500 group-hover:scale-105">
                    {getInitial()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#156E94] hover:bg-[#0f4a63] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white"
                title="Upload profile picture"
              >
                <FaCamera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h2 className="font-bold text-slate-900 text-xl leading-tight">{user?.name || "Admin"}</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">{user?.email || ""}</p>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/50 text-xs font-semibold mt-3">
              <FaShieldAlt size={10} className="text-[#156E94]" />
              {user?.role || "admin"}
            </span>

            {avatarFile && (
              <div className="text-[11px] text-emerald-600 font-bold mt-4 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                <span>✓ New avatar selected</span>
              </div>
            )}

            {/* Separator */}
            <div className="w-full border-t border-slate-100 my-6" />

            {/* Vertical Tab Navigation */}
            <div className="w-full space-y-1.5">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  activeTab === "profile"
                    ? "bg-[#156E94]/10 text-[#156E94]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FaUser size={14} className={activeTab === "profile" ? "text-[#156E94]" : "text-slate-400"} />
                Profile Information
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  activeTab === "security"
                    ? "bg-[#156E94]/10 text-[#156E94]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FaLock size={14} className={activeTab === "security" ? "text-[#156E94]" : "text-slate-400"} />
                Change Password
              </button>
            </div>

          </div>

          {/* Right Column: Dynamic Form Content (8 Cols) */}
          <div className="lg:col-span-8 p-6 sm:p-8 md:p-10 min-h-[400px]">
            
            {activeTab === "profile" ? (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900">Profile Information</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Manage your public profile settings and contact details.
                  </p>
                </div>

                <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <FaUser
                        size={13}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#156E94]"
                      />
                      <input
                        type="text"
                        placeholder="Your full name"
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#156E94] focus:ring-2 focus:ring-[#156E94]/10 transition shadow-sm font-medium"
                        {...regProfile("name", { required: true })}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address <span className="text-slate-400 font-normal text-xs">(Cannot be changed)</span>
                    </label>
                    <div className="relative">
                      <FaEnvelope
                        size={13}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed shadow-sm font-medium"
                        readOnly
                        {...regProfile("email")}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#156E94] hover:bg-[#0f4a63] text-white rounded-xl font-bold shadow-md shadow-[#156E94]/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                    >
                      <FaSave size={14} />
                      {isUpdating ? "Saving Details..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Update your password to keep your administrator account secure.
                  </p>
                </div>

                <form onSubmit={handlePass(onPasswordSubmit)} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative group">
                      <FaLock
                        size={13}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-rose-500"
                      />
                      <input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Enter current password"
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/10 transition shadow-sm font-medium"
                        {...regPass("currentPassword", { required: "Current password is required" })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {passErrors.currentPassword && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {passErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <FaLock
                        size={13}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-rose-500"
                      />
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/10 transition shadow-sm font-medium"
                        {...regPass("newPassword", {
                          required: "New password is required",
                          minLength: { value: 6, message: "Minimum 6 characters" },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {passErrors.newPassword && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {passErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <FaLock
                        size={13}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-rose-500"
                      />
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter new password"
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/10 transition shadow-sm font-medium"
                        {...regPass("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (val) =>
                            val === watchPass("newPassword") || "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {passErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {passErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                    >
                      <FaLock size={14} />
                      {isChangingPass ? "Changing Password..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
