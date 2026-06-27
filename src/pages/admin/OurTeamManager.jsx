import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaSave,
  FaTimes,
  FaUpload,
  FaEnvelope,
  FaIdCard,
  FaSortAmountDown,
  FaLink,
} from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const OurTeamManager = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");

  // ── 1. Fetch current team data ──────────────────────────────────────────
  const { data: responseData, isLoading } = useClient({
    queryKey: ["teamMembers"],
    url: "/team",
  });

  const teamMembers = responseData?.data || [];

  // ── 2. React Hook Form ───────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      initials: "",
      declaredInterests: "",
      email: "",
      displayOrder: 0,
    },
  });

  // Reset form helper
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setSelectedFile(null);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }
    reset({
      name: "",
      role: "",
      bio: "",
      initials: "",
      declaredInterests: "",
      email: "",
      displayOrder: 0,
    });
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    reset({
      name: member.name || "",
      role: member.role || "",
      bio: member.bio || "",
      initials: member.initials || "",
      declaredInterests: member.declaredInterests || "",
      email: member.email || "",
      displayOrder: member.displayOrder || 0,
    });
    if (member.image) {
      setLocalPreview(member.image);
    } else {
      setLocalPreview("");
    }
    setIsModalOpen(true);
  };

  // ── 3. Mutations ──────────────────────────────────────────────────────────
  
  // Create Member Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.post("/team", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Team member added successfully!");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      handleCloseModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to add team member";
      toast.error(msg);
    },
  });

  // Update Member Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosSecure.put(`/team/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Team member updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      handleCloseModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update team member";
      toast.error(msg);
    },
  });

  // Delete Member Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/team/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Team member deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete team member";
      toast.error(msg);
    },
  });

  // ── 4. Image helpers ──────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }

    const blobUrl = URL.createObjectURL(file);
    setLocalPreview(blobUrl);
    setSelectedFile(file);
  };

  const handleRemoveSelectedImage = () => {
    setSelectedFile(null);
    if (localPreview && localPreview.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    // If editing and has existing image, clear it or reset to existing
    if (editingMember && editingMember.image) {
      setLocalPreview(editingMember.image);
    } else {
      setLocalPreview("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── 5. Submit Handler ─────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("role", formData.role);
    payload.append("bio", formData.bio);
    payload.append("initials", formData.initials || "");
    payload.append("declaredInterests", formData.declaredInterests || "");
    payload.append("email", formData.email || "");
    payload.append("displayOrder", formData.displayOrder || 0);

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    if (editingMember) {
      updateMutation.mutate({ id: editingMember._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteMember = (member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      deleteMutation.mutate(member._id);
    }
  };

  // Render Loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading team members...</span>
      </div>
    );
  }

  return (
    <div className=" mx-auto  text-slate-800 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Our Team Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage the profiles of the team members and trustees displayed on the About Page.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-102 active:scale-98"
        >
          <FaPlus size={14} /> Add Team Member
        </button>
      </div>

      {/* Grid of Team Members */}
      {teamMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center px-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
            <FaUser size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Team Members Found</h3>
          <p className="text-slate-500 text-sm max-w-md mt-1">
            Click the "Add Team Member" button to create the first profile on the website.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-300 relative group"
            >
              {/* Card Upper Section */}
              <div className="p-6">
                {/* Photo & Initials */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-sky-50 overflow-hidden relative mb-5 flex items-center justify-center border border-slate-100">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[#156E94] text-5xl font-black tracking-tight">
                      {member.initials || "TM"}
                    </div>
                  )}
                  {/* Order Tag */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <FaSortAmountDown size={10} /> Order: {member.displayOrder}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-lg font-extrabold text-slate-900 line-clamp-1">
                  {member.name}
                </h3>
                <span className="text-[11px] font-bold text-[#156E94] tracking-wider uppercase block mb-3 mt-0.5">
                  {member.role}
                </span>

                {/* Email / Contact */}
                {member.email && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <FaEnvelope size={11} className="text-slate-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}

                {/* Declared Interests */}
                {member.declaredInterests && (
                  <p className="text-xs text-slate-400 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-600 block mb-0.5 text-[10px] uppercase tracking-wider">Interests:</span>
                    {member.declaredInterests}
                  </p>
                )}

                {/* Biography (Truncated) */}
                <p className="text-slate-600 text-sm mt-3 leading-relaxed line-clamp-4">
                  {member.bio}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleOpenEditModal(member)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
                >
                  <FaEdit size={12} className="text-[#156E94]" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteMember(member)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-100 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                >
                  <FaTrash size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add / Edit Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {editingMember ? "Edit Team Member" : "Add Team Member"}
                </h2>
                <p className="text-white/70 text-xs mt-0.5">
                  Fill in the member's detail card below.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Photo Upload / Preview */}
                <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
                    {localPreview ? (
                      <img
                        src={localPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser size={36} className="text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-slate-800">Profile Picture</h4>
                    <p className="text-slate-400 text-xs">
                      Recommend square aspect ratio, max 5MB (JPG, PNG)
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <FaUpload size={10} className="text-[#156E94]" /> Upload Image
                      </button>
                      {localPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveSelectedImage}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Reset
                        </button>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Dr Kishan Patel"
                    className={`px-4 py-2.5 rounded-xl border ${
                      errors.name ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                    } outline-none text-sm transition-all duration-200`}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs">{errors.name.message}</span>
                  )}
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("role", { required: "Role is required" })}
                    placeholder="CEO & Founder"
                    className={`px-4 py-2.5 rounded-xl border ${
                      errors.role ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                    } outline-none text-sm transition-all duration-200`}
                  />
                  {errors.role && (
                    <span className="text-red-500 text-xs">{errors.role.message}</span>
                  )}
                </div>

                {/* Initials */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    Initials <span className="text-slate-400 font-normal lowercase">(Optional, auto generated if empty)</span>
                  </label>
                  <input
                    type="text"
                    {...register("initials")}
                    placeholder="KP"
                    maxLength={3}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* Display Order */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Display Order <span className="text-slate-400 font-normal lowercase">(Lower goes first)</span>
                  </label>
                  <input
                    type="number"
                    {...register("displayOrder", { valueAsNumber: true })}
                    placeholder="0"
                    min={0}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address <span className="text-slate-400 font-normal lowercase">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="kishan@gamblingharm.com"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* Declared Interests */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Declared Interests <span className="text-slate-400 font-normal lowercase">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    {...register("declaredInterests")}
                    placeholder="No financial conflicts of interest."
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* Biography */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Biography <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("bio", { required: "Biography is required" })}
                    placeholder="Write details about the team member here..."
                    rows={4}
                    className={`px-4 py-3 rounded-xl border ${
                      errors.bio ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                    } outline-none text-sm transition-all duration-200 resize-y`}
                  />
                  {errors.bio && (
                    <span className="text-red-500 text-xs">{errors.bio.message}</span>
                  )}
                  <span className="text-slate-400 text-[10px]">
                    Note: To create separate paragraphs, simply press Enter to start a new line.
                  </span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <FaSave size={14} />
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OurTeamManager;
