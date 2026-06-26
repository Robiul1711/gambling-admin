import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaUpload, FaPlus, FaTimes, FaSave, FaImage } from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useMutationClient from "@/hooks/useMutationClient";

const HeroBannerManager = () => {
  const [newTag, setNewTag] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(""); // blob URL for newly picked image
  const fileInputRef = useRef(null);

  // ── 1. Fetch current banner data ─────────────────────────────────────────
  const { data: responseData, isLoading } = useClient({
    queryKey: ["banner"],
    url: "/banner",
  });

  const bannerData = responseData?.data;

  // ── 2. React Hook Form ───────────────────────────────────────────────────
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      tags: [],
      title: "",
      description: "",
      primaryBtnText: "",
      primaryBtnLink: "",
      secondaryBtnText: "",
      secondaryBtnLink: "",
      statTitle: "",
      statDescription: "",
      statLinkText: "",
      statLinkUrl: "",
    },
  });

  // Populate form when data arrives from backend
  useEffect(() => {
    if (bannerData) {
      reset({
        tags: bannerData.tags || [],
        title: bannerData.title || "",
        description: bannerData.description || "",
        primaryBtnText: bannerData.primaryBtnText || "",
        primaryBtnLink: bannerData.primaryBtnLink || "",
        secondaryBtnText: bannerData.secondaryBtnText || "",
        secondaryBtnLink: bannerData.secondaryBtnLink || "",
        statTitle: bannerData.statTitle || "",
        statDescription: bannerData.statDescription || "",
        statLinkText: bannerData.statLinkText || "",
        statLinkUrl: bannerData.statLinkUrl || "",
      });
      // Reset selected file when banner data reloads
      setSelectedFile(null);
      setLocalPreview("");
    }
  }, [bannerData, reset]);

  const watchedTags = watch("tags") || [];

  // ── 3. Mutation for saving ────────────────────────────────────────────────
  const { mutate: saveBanner, isPending: isSaving } = useMutationClient({
    url: "/banner",
    method: "put",
    invalidateKeys: [["banner"]],
    successMessage: "Hero Banner updated successfully!",
  });

  // ── Image helpers ────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show instant local preview
    if (localPreview) URL.revokeObjectURL(localPreview);
    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setSelectedFile(file);
  };

  // Determine what image URL to show in preview
  const previewSrc = localPreview || bannerData?.image || "";

  // ── Tag helpers ──────────────────────────────────────────────────────────
  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (watchedTags.includes(trimmed)) {
      toast.warning("Tag already exists");
      return;
    }
    setValue("tags", [...watchedTags, trimmed]);
    setNewTag("");
  };

  const handleRemoveTag = (indexToRemove) => {
    setValue("tags", watchedTags.filter((_, i) => i !== indexToRemove));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    const payload = new FormData();

    // Append all text fields
    const textFields = [
      "title", "description",
      "primaryBtnText", "primaryBtnLink",
      "secondaryBtnText", "secondaryBtnLink",
      "statTitle", "statDescription", "statLinkText", "statLinkUrl",
    ];
    textFields.forEach((key) => {
      payload.append(key, formData[key] || "");
    });

    // Tags as JSON string
    payload.append("tags", JSON.stringify(formData.tags || []));

    // Only append image file if a new one was selected
    // Otherwise the backend will keep the existing DB image
    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    saveBanner({
      data: payload,
      config: { headers: { "Content-Type": "multipart/form-data" } },
    });
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading banner settings...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-slate-800 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Hero Banner Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage the content, tags, links, statistics and image of the Home Page
          hero banner.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* ── Left Column ───────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-sky-500 rounded-full" />
              Primary Info
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Banner Title
              </label>
              <input
                type="text"
                placeholder="e.g. Gambling is a leading modifiable risk factor for ill-health"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-sm"
                {...register("title", { required: true })}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Banner Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter the descriptive paragraph text for the banner..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition resize-y shadow-sm"
                {...register("description", { required: true })}
              />
            </div>

            {/* Tags */}
            <div className="mb-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200 min-h-[46px]">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:bg-sky-200/50 rounded p-0.5 transition"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
                {watchedTags.length === 0 && (
                  <span className="text-slate-400 text-xs self-center">
                    No tags added yet.
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
                >
                  <FaPlus size={12} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full" />
              Call to Action Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary */}
              <div className="space-y-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-200 pb-2">
                  Primary Button
                </h3>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Get Help"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-sm"
                    {...register("primaryBtnText")}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Destination URL / Path
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /get-help"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-sm"
                    {...register("primaryBtnLink")}
                  />
                </div>
              </div>
              {/* Secondary */}
              <div className="space-y-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                <h3 className="font-semibold text-sm text-slate-800 border-b border-slate-200 pb-2">
                  Secondary Button
                </h3>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I'm worried about someone"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-sm"
                    {...register("secondaryBtnText")}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Destination URL / Path
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /get-help/family-friends"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-sm"
                    {...register("secondaryBtnLink")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stat Badge */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full" />
              Overlay Stat Badge
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Stat Title / Metric
                </label>
                <input
                  type="text"
                  placeholder="e.g. ~1 In 5"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-sm"
                  {...register("statTitle")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Stat Link Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Read the burden of harm"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-sm"
                  {...register("statLinkText")}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stat Link Target URL
              </label>
              <input
                type="text"
                placeholder="e.g. #burden-of-harm"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-sky-500 transition shadow-sm"
                {...register("statLinkUrl")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stat Description
              </label>
              <textarea
                rows={3}
                placeholder="Enter content details for the stat overlay card..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-sky-500 transition resize-y shadow-sm"
                {...register("statDescription")}
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
                    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-sky-600 font-medium">
                      Uploading to Cloudinary...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <label className="w-full flex flex-col items-center justify-center px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50/30 text-slate-700 rounded-2xl cursor-pointer transition text-center group">
              <FaUpload
                size={22}
                className="text-slate-400 group-hover:text-sky-600 mb-2 transition"
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
            {bannerData?.image && !selectedFile && (
              <p className="mt-3 text-xs text-slate-400 break-all leading-relaxed">
                <span className="font-semibold text-slate-500">Current:</span>{" "}
                {bannerData.image}
              </p>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-md shadow-sky-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default HeroBannerManager;
