import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaSave,
  FaUpload,
  FaImage,
  FaFileAudio,
  FaEye,
  FaBookOpen,
} from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const AboutPageManager = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  const [selectedSection, setSelectedSection] = useState("who-we-are");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");

  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // ── 1. Fetch current settings ──────────────────────────────────────────
  const { data: responseData, isLoading } = useClient({
    queryKey: ["aboutSection", selectedSection],
    url: `/about/${selectedSection}`,
  });

  const sectionData = responseData?.data;

  // ── 2. React Hook Form ───────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      audioTitle: "",
      audioSource: "",
    },
  });

  // Populate form when data changes or section changes
  useEffect(() => {
    if (sectionData) {
      reset({
        title: sectionData.title || "",
        subtitle: sectionData.subtitle || "",
        description: sectionData.description || "",
        audioTitle: sectionData.audioTitle || "",
        audioSource: sectionData.audioSource || "",
      });

      // Update image preview
      setImageFile(null);
      setImagePreview(sectionData.image || "");

      // Update audio preview
      setAudioFile(null);
      setAudioPreview(sectionData.audioUrl || "");
    }
  }, [sectionData, reset, selectedSection]);

  // ── 3. Mutations ──────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.put(`/about/${selectedSection}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Section settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["aboutSection", selectedSection] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update settings";
      toast.error(msg);
    },
  });

  // ── 4. Media Handlers ─────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (audioPreview && audioPreview.startsWith("blob:")) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  const handleResetImage = () => {
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(sectionData?.image || "");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleResetAudio = () => {
    setAudioFile(null);
    if (audioPreview && audioPreview.startsWith("blob:")) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioPreview(sectionData?.audioUrl || "");
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  // ── 5. Submit Handler ─────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    const payload = new FormData();
    payload.append("title", formData.title || "");
    payload.append("subtitle", formData.subtitle || "");
    payload.append("description", formData.description || "");
    
    if (selectedSection === "our-mission") {
      payload.append("audioTitle", formData.audioTitle || "");
      payload.append("audioSource", formData.audioSource || "");
    }

    if (imageFile) {
      payload.append("image", imageFile);
    } else {
      payload.append("image", sectionData?.image || "");
    }

    if (selectedSection === "our-mission") {
      if (audioFile) {
        payload.append("audio", audioFile);
      } else {
        payload.append("audioUrl", sectionData?.audioUrl || "");
      }
    }

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading About settings...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-slate-800 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            About Page CMS
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage banner details, mission text, cover media, and audio files for the About page.
          </p>
        </div>

        {/* Section Dropdown Selection */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm w-full md:w-auto">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
            Select Section:
          </span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-sm font-bold text-[#156E94] outline-none bg-transparent cursor-pointer w-full md:w-auto"
          >
            <option value="who-we-are">Who We Are (Banner)</option>
            <option value="our-mission">Our Mission Section</option>
          </select>
        </div>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cover Element */}
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaBookOpen size={18} />
            {selectedSection === "who-we-are" ? "Who We Are Settings" : "Our Mission Settings"}
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify text descriptions and media assets shown on the frontend.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Subtitle (only shown for Who We Are) */}
            {selectedSection === "who-we-are" && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  {...register("subtitle")}
                  placeholder="Who we are"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                />
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                placeholder={selectedSection === "who-we-are" ? "An independent voice on gambling harm." : "Our mission"}
                className={`px-4 py-2.5 rounded-xl border ${
                  errors.title ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                } outline-none text-sm transition-all duration-200`}
              />
              {errors.title && (
                <span className="text-red-500 text-xs">{errors.title.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description Text <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description", { required: "Description is required" })}
                placeholder="Write the description details here..."
                rows={4}
                className={`px-4 py-2.5 rounded-xl border ${
                  errors.description ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                } outline-none text-sm transition-all duration-200 resize-y`}
              />
              {errors.description && (
                <span className="text-red-500 text-xs">{errors.description.message}</span>
              )}
            </div>

            {/* Cover Image Upload (Unified) */}
            <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="w-32 h-24 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaImage size={24} className="text-slate-300" />
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-800">Cover Illustration</h4>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <FaUpload size={10} className="text-[#156E94]" /> Upload Image
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleResetImage}
                      className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Audio Panel (only shown for Our Mission) */}
            {selectedSection === "our-mission" && (
              <div className="md:col-span-2 border-t border-slate-100 pt-6 space-y-6">
                <h3 className="text-sm font-extrabold text-[#156E94] uppercase tracking-wider">
                  Audio settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Audio Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audio Card Title
                    </label>
                    <input
                      type="text"
                      {...register("audioTitle")}
                      placeholder="How GHUK started, and why: charity origins and Covid"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                    />
                  </div>

                  {/* Audio Source (Label) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audio Source / Author
                    </label>
                    <input
                      type="text"
                      {...register("audioSource")}
                      placeholder="PhoenixFM, May 2026"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Audio File Upload Uploader */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
                    <FaFileAudio size={22} className="text-[#156E94]" />
                  </div>
                  <div className="space-y-2 text-center sm:text-left w-full">
                    <h4 className="text-sm font-bold text-slate-800">Upload MP3 Audio File</h4>
                    
                    {audioPreview && (
                      <div className="my-2 max-w-md">
                        <audio src={audioPreview} controls className="w-full h-8 accent-[#156E94]" />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <FaUpload size={10} className="text-[#156E94]" /> Select Audio File
                      </button>
                      {audioPreview && (
                        <button
                          type="button"
                          onClick={handleResetAudio}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Reset
                        </button>
                      )}
                      <input
                        type="file"
                        ref={audioInputRef}
                        onChange={handleAudioChange}
                        accept="audio/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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

export default AboutPageManager;
