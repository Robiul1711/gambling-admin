import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUpload,
  FaVolumeUp,
  FaSortAmountDown,
} from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const PhoenixAudioManager = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClip, setEditingClip] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localAudioUrl, setLocalAudioUrl] = useState("");

  // ── 1. Fetch current audio clips ─────────────────────────────────────────
  const { data: responseData, isLoading } = useClient({
    queryKey: ["phoenixAudios"],
    url: "/news-research/audio",
  });

  const audioClips = responseData?.data || [];

  // ── 2. React Hook Form ───────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tag: "",
      title: "",
      displayOrder: 0,
    },
  });

  // Reset form helper
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClip(null);
    setSelectedFile(null);
    if (localAudioUrl && localAudioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localAudioUrl);
    }
    setLocalAudioUrl("");
    reset({
      tag: "",
      title: "",
      displayOrder: 0,
    });
  };

  const handleOpenAddModal = () => {
    setEditingClip(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (clip) => {
    setEditingClip(clip);
    reset({
      tag: clip.tag || "",
      title: clip.title || "",
      displayOrder: clip.displayOrder || 0,
    });
    setLocalAudioUrl(clip.audioUrl || "");
    setIsModalOpen(true);
  };

  // ── 3. Mutations ──────────────────────────────────────────────────────────
  
  // Create Clip Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.post("/news-research/audio", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Audio clip uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["phoenixAudios"] });
      handleCloseModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to upload audio clip";
      toast.error(msg);
    },
  });

  // Update Clip Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosSecure.put(`/news-research/audio/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Audio clip updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["phoenixAudios"] });
      handleCloseModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update audio clip";
      toast.error(msg);
    },
  });

  // Delete Clip Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/news-research/audio/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Audio clip deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["phoenixAudios"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete audio clip";
      toast.error(msg);
    },
  });

  // ── 4. File upload handlers ────────────────────────────────────────────────
  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (localAudioUrl && localAudioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localAudioUrl);
    }

    const blobUrl = URL.createObjectURL(file);
    setLocalAudioUrl(blobUrl);
    setSelectedFile(file);
  };

  const handleRemoveAudioFile = () => {
    setSelectedFile(null);
    if (localAudioUrl && localAudioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localAudioUrl);
    }
    if (editingClip && editingClip.audioUrl) {
      setLocalAudioUrl(editingClip.audioUrl);
    } else {
      setLocalAudioUrl("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── 5. Submit Handler ─────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    const payload = new FormData();
    payload.append("tag", formData.tag);
    payload.append("title", formData.title);
    payload.append("displayOrder", formData.displayOrder || 0);

    if (selectedFile) {
      payload.append("audio", selectedFile);
    }

    if (editingClip) {
      updateMutation.mutate({ id: editingClip._id, payload });
    } else {
      if (!selectedFile) {
        toast.error("Please select an audio file to upload");
        return;
      }
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClip = (clip) => {
    if (window.confirm(`Are you sure you want to delete the clip "${clip.title}"?`)) {
      deleteMutation.mutate(clip._id);
    }
  };

  // Render Loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading audio clips...</span>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto text-slate-800 max-w-6xl w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            PhoenixFM Audio Clips Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage the list of audio interview clips, categories, and players displayed on the News & Research Page.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-102 active:scale-98"
        >
          <FaPlus size={14} /> Add Audio Clip
        </button>
      </div>

      {/* Grid of Audio Clips */}
      {audioClips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center px-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
            <FaVolumeUp size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Audio Clips Found</h3>
          <p className="text-slate-500 text-sm max-w-md mt-1">
            Click the "Add Audio Clip" button to upload the first MP3 recording to the section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audioClips.map((clip) => (
            <div
              key={clip._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-300 relative group"
            >
              {/* Card Upper Section */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category Tag & Sorting */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-sky-50 text-[#1B80C4] border border-sky-100 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {clip.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <FaSortAmountDown size={10} /> Order: {clip.displayOrder}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-slate-800 leading-snug mb-5">
                    {clip.title}
                  </h3>
                </div>

                {/* Audio Player Preview */}
                <div className="w-full mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <audio
                    src={clip.audioUrl}
                    controls
                    className="w-full h-8 accent-[#156E94]"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleOpenEditModal(clip)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                >
                  <FaEdit size={12} className="text-[#156E94]" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteClip(clip)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-100 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                >
                  <FaTrash size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add / Edit Clip */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {editingClip ? "Edit Audio Clip" : "Add Audio Clip"}
                </h2>
                <p className="text-white/70 text-xs mt-0.5">
                  Upload an audio track and set details.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                disabled={isPending}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* Audio File Upload */}
              <div className="flex flex-col gap-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Audio MP3 File <span className="text-red-500">*</span>
                </label>
                
                {localAudioUrl && (
                  <div className="mb-3 bg-white p-3 rounded-xl border border-slate-150 shadow-inner">
                    <p className="text-xs text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                      <FaVolumeUp size={11} className="text-[#156E94]" /> Player Preview:
                    </p>
                    <audio src={localAudioUrl} controls className="w-full h-8 accent-[#156E94]" />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <FaUpload size={10} className="text-[#156E94]" /> Choose Audio File
                  </button>
                  {localAudioUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAudioFile}
                      disabled={isPending}
                      className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Reset
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAudioChange}
                    accept="audio/*"
                    className="hidden"
                  />
                </div>
                {selectedFile && (
                  <span className="text-xs text-emerald-600 font-medium">
                    Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
                <span className="text-slate-400 text-[10px]">
                  Supports standard MP3, WAV or AAC, max 20MB.
                </span>
              </div>

              {/* Tag / Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("tag", { required: "Category tag is required" })}
                  placeholder="e.g. SCALE, STIGMA, ORIGINS, CHILDREN"
                  className={`px-4 py-2.5 rounded-xl border ${
                    errors.tag ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                  } outline-none text-sm transition-all duration-200`}
                  disabled={isPending}
                />
                {errors.tag && (
                  <span className="text-red-500 text-xs">{errors.tag.message}</span>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Clip Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g. Shame, stigma and the language we use"
                  className={`px-4 py-2.5 rounded-xl border ${
                    errors.title ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                  } outline-none text-sm transition-all duration-200`}
                  disabled={isPending}
                />
                {errors.title && (
                  <span className="text-red-500 text-xs">{errors.title.message}</span>
                )}
              </div>

              {/* Display Order */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Display Order <span className="text-slate-400 font-normal lowercase">(Lower values sorted first)</span>
                </label>
                <input
                  type="number"
                  {...register("displayOrder", { valueAsNumber: true })}
                  placeholder="0"
                  min={0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  disabled={isPending}
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <FaSave size={14} />
                  {isPending ? "Uploading Media..." : "Save Clip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoenixAudioManager;
