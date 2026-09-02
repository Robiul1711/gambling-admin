import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaSave, FaExclamationTriangle, FaEye } from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const CrisisHeaderManager = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  // ── 1. Fetch current settings ──────────────────────────────────────────
  const { data: responseData, isLoading } = useClient({
    queryKey: ["footerSettings"],
    url: "/footer",
  });

  const footerData = responseData?.data;

  // ── 2. React Hook Form ───────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      crisisHeaderShow: true,
      crisisHeaderText: "",
      crisisHeaderPhone: "",
      crisisHeaderPhoneLink: "",
      crisisHeaderBtnText: "",
      crisisHeaderBtnLink: "",
      crisisHeaderBgColor: "#156E94",
      crisisHeaderTextColor: "#ffffff",
    },
  });

  const watchedShow = watch("crisisHeaderShow");
  const watchedText = watch("crisisHeaderText");
  const watchedPhone = watch("crisisHeaderPhone");
  const watchedBtnText = watch("crisisHeaderBtnText");
  const watchedBgColor = watch("crisisHeaderBgColor") || "#156E94";
  const watchedTextColor = watch("crisisHeaderTextColor") || "#ffffff";

  // Populate form when data changes
  useEffect(() => {
    if (footerData) {
      reset({
        crisisHeaderShow:
          footerData.crisisHeaderShow !== undefined
            ? footerData.crisisHeaderShow
            : true,
        crisisHeaderText: footerData.crisisHeaderText || "",
        crisisHeaderPhone: footerData.crisisHeaderPhone || "",
        crisisHeaderPhoneLink: footerData.crisisHeaderPhoneLink || "",
        crisisHeaderBtnText: footerData.crisisHeaderBtnText || "",
        crisisHeaderBtnLink: footerData.crisisHeaderBtnLink || "",
        crisisHeaderBgColor: footerData.crisisHeaderBgColor || "#156E94",
        crisisHeaderTextColor: footerData.crisisHeaderTextColor || "#ffffff",
      });
    }
  }, [footerData, reset]);

  // ── 3. Mutations ──────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.put("/footer", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || "Crisis Header settings updated successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["footerSettings"] });
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to update settings";
      toast.error(msg);
    },
  });

  // ── 4. Submit Handler ─────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    const payload = new FormData();

    // Preserve existing footer settings
    payload.append("description", footerData?.description || "");
    payload.append("instagramUrl", footerData?.instagramUrl || "");
    payload.append("facebookUrl", footerData?.facebookUrl || "");
    payload.append("xUrl", footerData?.xUrl || "");
    payload.append("linkedinUrl", footerData?.linkedinUrl || "");
    payload.append("copyrightText", footerData?.copyrightText || "");
    payload.append("logo", footerData?.logo || "");

    // Update Crisis Header fields
    payload.append("crisisHeaderShow", formData.crisisHeaderShow);
    payload.append("crisisHeaderText", formData.crisisHeaderText || "");
    payload.append("crisisHeaderPhone", formData.crisisHeaderPhone || "");
    payload.append(
      "crisisHeaderPhoneLink",
      formData.crisisHeaderPhoneLink || "",
    );
    payload.append("crisisHeaderBtnText", formData.crisisHeaderBtnText || "");
    payload.append("crisisHeaderBtnLink", formData.crisisHeaderBtnLink || "");
    payload.append(
      "crisisHeaderBgColor",
      formData.crisisHeaderBgColor || "#156E94",
    );
    payload.append(
      "crisisHeaderTextColor",
      formData.crisisHeaderTextColor || "#ffffff",
    );

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading Crisis Header settings...</span>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Crisis Header Banner CMS
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure the top-most urgent helpline alert bar displayed across the entire website.
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="mb-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <FaEye size={14} className="text-[#156E94]" /> Live Banner Preview
        </div>
        
        {watchedShow ? (
          <div
            className="w-full py-2.5 px-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium transition-colors shadow-sm"
            style={{
              backgroundColor: watchedBgColor,
              color: watchedTextColor,
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span>{watchedText || "Need to talk? Free, confidential support is available any time."}</span>
              {watchedPhone && (
                <span className="font-bold underline cursor-pointer">
                  {watchedPhone}
                </span>
              )}
            </div>
            {watchedBtnText && (
              <span className="font-semibold underline cursor-pointer text-xs sm:text-sm">
                {watchedBtnText}
              </span>
            )}
          </div>
        ) : (
          <div className="w-full py-4 px-4 rounded-xl bg-slate-100 border border-dashed border-slate-300 text-center text-slate-400 text-sm font-medium">
            (Banner is currently disabled and will not show on the website)
          </div>
        )}
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover Element */}
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaExclamationTriangle size={16} /> Crisis Header Banner Settings
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Manage top alert text, phone number, quick action links, and colors.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Enable Alert Banner
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle whether the top crisis bar is visible to visitors.
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("crisisHeaderShow")}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C92525]"></div>
              <span className="ms-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                {watchedShow ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner Text */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Banner Alert Text
              </label>
              <input
                type="text"
                {...register("crisisHeaderText")}
                placeholder="Need to talk? Free, confidential support is available any time."
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
              />
            </div>

            {/* Helpline Name/Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Helpline Name & Phone Text
              </label>
              <input
                type="text"
                {...register("crisisHeaderPhone")}
                placeholder="Samaritans 116 123"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
              />
            </div>

            {/* Helpline Tel Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Helpline Tel Number Link (Numbers Only)
              </label>
              <input
                type="text"
                {...register("crisisHeaderPhoneLink")}
                placeholder="116123"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
              />
            </div>

            {/* Action Button Link Text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Action Button / Link Text
              </label>
              <input
                type="text"
                {...register("crisisHeaderBtnText")}
                placeholder="Talk to someone →"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
              />
            </div>

            {/* Action Button Link Target */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Action Button / Link Target
              </label>
              <input
                type="text"
                {...register("crisisHeaderBtnLink")}
                placeholder="/urgent-help"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
              />
            </div>

            {/* Background Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Banner Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...register("crisisHeaderBgColor")}
                  className="w-10 h-10 border border-slate-200 cursor-pointer rounded-lg bg-transparent"
                />
                <input
                  type="text"
                  {...register("crisisHeaderBgColor")}
                  placeholder="#156E94"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 w-full"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Banner Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  {...register("crisisHeaderTextColor")}
                  className="w-10 h-10 border border-slate-200 cursor-pointer rounded-lg bg-transparent"
                />
                <input
                  type="text"
                  {...register("crisisHeaderTextColor")}
                  placeholder="#ffffff"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 w-full"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <FaSave size={14} />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrisisHeaderManager;
