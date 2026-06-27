import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaUpload, FaTimes, FaSave, FaImage } from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useMutationClient from "@/hooks/useMutationClient";

const NewsResearchSettingsManager = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(""); // blob URL for newly picked image
  const fileInputRef = useRef(null);

  // ── 1. Fetch current settings data ─────────────────────────────────────────
  const { data: responseData, isLoading } = useClient({
    queryKey: ["newsResearchSettings"],
    url: "/news-research/settings",
  });

  const settingsData = responseData?.data;

  // ── 2. React Hook Form ───────────────────────────────────────────────────
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: "",
      description: "",
      audioTitle: "",
      audioDescription: "",
      audioDateText: "",
    },
  });

  // Populate form when data arrives from backend
  useEffect(() => {
    if (settingsData) {
      reset({
        title: settingsData.title || "",
        description: settingsData.description || "",
        audioTitle: settingsData.audioTitle || "",
        audioDescription: settingsData.audioDescription || "",
        audioDateText: settingsData.audioDateText || "",
      });
      setSelectedFile(null);
      setLocalPreview("");
    }
  }, [settingsData, reset]);

  // ── 3. Mutation for saving ────────────────────────────────────────────────
  const { mutate: saveSettings, isPending: isSaving } = useMutationClient({
    url: "/news-research/settings",
    method: "put",
    isPrivate: true,
    invalidateKeys: [["newsResearchSettings"]],
    successMessage: "Settings updated successfully!",
  });

  // ── Image helpers ────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (localPreview) URL.revokeObjectURL(localPreview);
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setSelectedFile(file);
  };

  // Determine what image URL to show in preview
  const previewSrc = localPreview || settingsData?.image || "";

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    const payload = new FormData();

    // Append all text fields
    payload.append("title", formData.title || "");
    payload.append("description", formData.description || "");
    payload.append("audioTitle", formData.audioTitle || "");
    payload.append("audioDescription", formData.audioDescription || "");
    payload.append("audioDateText", formData.audioDateText || "");

    // Only append image file if a new one was selected
    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    saveSettings({
      data: payload,
      config: { headers: { "Content-Type": "multipart/form-data" } },
    });
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto text-slate-800 max-w-6xl w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          News & Research Page Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage the content, titles, and banner image of the News & Research Page.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* ── Left Column ───────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Page Banner / Intro Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#156E94] rounded-full" />
              Page Banner / Introduction
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Banner Title
              </label>
              <input
                type="text"
                placeholder="e.g. What we're publishing."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#156E94] focus:ring-1 focus:ring-[#156E94] transition shadow-sm"
                {...register("title", { required: true })}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Banner Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter the description paragraph text for the top banner..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#156E94] focus:ring-1 focus:ring-[#156E94] transition resize-y shadow-sm"
                {...register("description", { required: true })}
              />
            </div>
          </div>

          {/* Audio Section Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full" />
              Audio Section Header
            </h2>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Audio Section Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. On PhoenixFM with John Gilham"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#156E94] focus:ring-1 focus:ring-[#156E94] transition shadow-sm"
                  {...register("audioTitle")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Audio Tagline / Date Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audio · May 2026"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#156E94] focus:ring-1 focus:ring-[#156E94] transition shadow-sm"
                  {...register("audioDateText")}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Audio Section Description
              </label>
              <textarea
                rows={3}
                placeholder="Enter description for the audio clips section..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#156E94] focus:ring-1 focus:ring-[#156E94] transition resize-y shadow-sm"
                {...register("audioDescription")}
              />
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-pink-500 rounded-full" />
              Banner Image
            </h2>

            {/* Image Preview */}
            <div className="w-full aspect-[4/3] bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden mb-4 relative group shadow-sm">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Banner preview"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FaImage size={40} className="opacity-30" />
                  <span className="text-xs">No image selected</span>
                </div>
              )}

              {localPreview && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                  New Image
                </div>
              )}

              {isSaving && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[#156E94] font-medium">
                      Uploading to Cloudinary...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <label className="w-full flex flex-col items-center justify-center px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#156E94] hover:bg-sky-50/30 text-slate-700 rounded-2xl cursor-pointer transition text-center group">
              <FaUpload
                size={22}
                className="text-slate-400 group-hover:text-[#156E94] mb-2 transition"
              />
              <span className="text-sm font-semibold">
                {selectedFile ? selectedFile.name : "Choose a new image"}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                PNG, JPG or WebP · max 5 MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (localPreview) URL.revokeObjectURL(localPreview);
                  setLocalPreview("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-medium transition"
              >
                <FaTimes size={11} /> Remove selected file
              </button>
            )}

            {/* Current image info */}
            {settingsData?.image && !selectedFile && (
              <p className="mt-3 text-xs text-slate-400 break-all leading-relaxed">
                <span className="font-semibold text-slate-500">Current:</span>{" "}
                {settingsData.image}
              </p>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white rounded-xl font-bold shadow-md shadow-sky-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsResearchSettingsManager;
