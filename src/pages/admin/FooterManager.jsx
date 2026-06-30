import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaSave,
  FaUpload,
  FaImage,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaAlignLeft,
} from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const FooterManager = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const logoInputRef = useRef(null);

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
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: "",
      instagramUrl: "",
      facebookUrl: "",
      xUrl: "",
      copyrightText: "",
      crisisHeaderShow: true,
      crisisHeaderText: "",
      crisisHeaderPhone: "",
      crisisHeaderPhoneLink: "",
      crisisHeaderBtnText: "",
      crisisHeaderBtnLink: "",
      crisisHeaderBgColor: "#C92525",
      crisisHeaderTextColor: "#ffffff",
    },
  });

  // Populate form when data changes
  useEffect(() => {
    if (footerData) {
      reset({
        description: footerData.description || "",
        instagramUrl: footerData.instagramUrl || "",
        facebookUrl: footerData.facebookUrl || "",
        xUrl: footerData.xUrl || "",
        copyrightText: footerData.copyrightText || "",
        crisisHeaderShow: footerData.crisisHeaderShow !== undefined ? footerData.crisisHeaderShow : true,
        crisisHeaderText: footerData.crisisHeaderText || "",
        crisisHeaderPhone: footerData.crisisHeaderPhone || "",
        crisisHeaderPhoneLink: footerData.crisisHeaderPhoneLink || "",
        crisisHeaderBtnText: footerData.crisisHeaderBtnText || "",
        crisisHeaderBtnLink: footerData.crisisHeaderBtnLink || "",
        crisisHeaderBgColor: footerData.crisisHeaderBgColor || "#C92525",
        crisisHeaderTextColor: footerData.crisisHeaderTextColor || "#ffffff",
      });

      // Update logo preview
      setLogoFile(null);
      setLogoPreview(footerData.logo || "");
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
      toast.success(data?.message || "Footer settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["footerSettings"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update settings";
      toast.error(msg);
    },
  });

  // ── 4. Media Handlers ─────────────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleResetLogo = () => {
    setLogoFile(null);
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(footerData?.logo || "");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // ── 5. Submit Handler ─────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    const payload = new FormData();
    payload.append("description", formData.description || "");
    payload.append("instagramUrl", formData.instagramUrl || "");
    payload.append("facebookUrl", formData.facebookUrl || "");
    payload.append("xUrl", formData.xUrl || "");
    payload.append("copyrightText", formData.copyrightText || "");
    payload.append("crisisHeaderShow", formData.crisisHeaderShow);
    payload.append("crisisHeaderText", formData.crisisHeaderText || "");
    payload.append("crisisHeaderPhone", formData.crisisHeaderPhone || "");
    payload.append("crisisHeaderPhoneLink", formData.crisisHeaderPhoneLink || "");
    payload.append("crisisHeaderBtnText", formData.crisisHeaderBtnText || "");
    payload.append("crisisHeaderBtnLink", formData.crisisHeaderBtnLink || "");
    payload.append("crisisHeaderBgColor", formData.crisisHeaderBgColor || "#C92525");
    payload.append("crisisHeaderTextColor", formData.crisisHeaderTextColor || "#ffffff");

    if (logoFile) {
      payload.append("logo", logoFile);
    } else {
      payload.append("logo", footerData?.logo || "");
    }

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading Footer settings...</span>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto  text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Footer Settings CMS
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure the website brand logo, social media page URLs, and copyright/compliance notices.
        </p>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover Element */}
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaAlignLeft size={16} /> Footer Configuration
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify details and social platforms linked in the website footer.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Description */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Footer Brand Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description", { required: "Description is required" })}
                placeholder="An independent UK organisation working to reduce the harm caused by gambling..."
                rows={3}
                className={`px-4 py-2.5 rounded-xl border ${
                  errors.description ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                } outline-none text-sm transition-all duration-200 resize-y`}
              />
              {errors.description && (
                <span className="text-red-500 text-xs">{errors.description.message}</span>
              )}
            </div>

            {/* Logo Image Upload */}
            <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="w-24 h-20 rounded-xl overflow-hidden bg-zinc-800 border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Footer Logo"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-slate-500 text-xs font-bold">No Logo</span>
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-800">Footer Logo Upload</h4>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <FaUpload size={10} className="text-[#156E94]" /> Upload Logo
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div className="md:col-span-2 border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-[#156E94] uppercase tracking-wider">
                Social Media Links (Leave blank to hide in Footer)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Instagram */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FaInstagram className="text-pink-600" /> Instagram URL
                  </label>
                  <input
                    type="text"
                    {...register("instagramUrl")}
                    placeholder="https://instagram.com/gamblingharmuk"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* Facebook */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FaFacebook className="text-blue-600" /> Facebook URL
                  </label>
                  <input
                    type="text"
                    {...register("facebookUrl")}
                    placeholder="https://facebook.com/gamblingharmuk"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* X / Twitter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FaTwitter className="text-slate-800" /> X / Twitter URL
                  </label>
                  <input
                    type="text"
                    {...register("xUrl")}
                    placeholder="https://x.com/gamblingharmuk"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Copyright Text */}
            <div className="flex flex-col gap-1.5 md:col-span-2 border-t border-slate-100 pt-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Copyright Compliance Text
              </label>
              <input
                type="text"
                {...register("copyrightText")}
                placeholder="Gambling Harm UK (GHUK)."
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
              />
            </div>

            {/* Crisis Header Section */}
            <div className="md:col-span-2 border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#C92525] uppercase tracking-wider">
                  Crisis Header Banner Settings
                </h3>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("crisisHeaderShow")}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C92525]"></div>
                  <span className="ms-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enable Banner
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
                    placeholder="In Crisis Or Thinking About Suicide? Call"
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

                {/* Urgent Help Link Text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Action Button / Link Text
                  </label>
                  <input
                    type="text"
                    {...register("crisisHeaderBtnText")}
                    placeholder="Urgent Help →"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* Urgent Help Link Target */}
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
                      placeholder="#C92525"
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

export default FooterManager;
