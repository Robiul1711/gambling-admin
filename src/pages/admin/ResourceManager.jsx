import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaSave,
  FaTimes,
  FaUpload,
  FaRegCalendarAlt,
  FaGlobe,
  FaEye,
  FaFolder,
} from "react-icons/fa";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const ResourceManager = () => {
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");

  // ── 1. Fetch current resources data ──────────────────────────────────────
  const { data: responseData, isLoading } = useClient({
    queryKey: ["resources"],
    url: "/blogs", // backend route is registered as /blogs
  });

  const resources = responseData?.data || [];

  // Helper to format date for input field default value (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  // Helper to format date for display (e.g., 02 May 2026)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

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
      title: "",
      slug: "",
      category: "Blog",
      status: "published",
      publishDate: formatDateForInput(),
      description: "",
      content: "",
    },
  });

  const watchedTitle = watch("title");

  // Auto-generate slug preview from title if not custom-written
  useEffect(() => {
    if (watchedTitle && !editingResource) {
      const autoSlug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", autoSlug);
    }
  }, [watchedTitle, setValue, editingResource]);

  // Reset form helper
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setSelectedFile(null);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }
    reset({
      title: "",
      slug: "",
      category: "Blog",
      status: "published",
      publishDate: formatDateForInput(),
      description: "",
      content: "",
    });
  };

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (resource) => {
    setEditingResource(resource);
    reset({
      title: resource.title || "",
      slug: resource.slug || "",
      category: resource.category || "Blog",
      status: resource.status || "published",
      publishDate: formatDateForInput(resource.publishDate),
      description: resource.description || "",
      content: resource.content || "",
    });
    if (resource.image) {
      setLocalPreview(resource.image);
    } else {
      setLocalPreview("");
    }
    setIsModalOpen(true);
  };

  // ── 3. Mutations ──────────────────────────────────────────────────────────
  
  // Create Resource Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosSecure.post("/blogs", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Resource created successfully!");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      handleCloseModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to create resource";
      toast.error(msg);
    },
  });

  // Update Resource Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosSecure.put(`/blogs/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Resource updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      handleCloseModal();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update resource";
      toast.error(msg);
    },
  });

  // Delete Resource Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/blogs/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Resource deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to delete resource";
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
    if (editingResource && editingResource.image) {
      setLocalPreview(editingResource.image);
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
    payload.append("title", formData.title);
    payload.append("slug", formData.slug);
    payload.append("category", formData.category);
    payload.append("status", formData.status);
    payload.append("publishDate", formData.publishDate);
    payload.append("description", formData.description);
    payload.append("content", formData.content || "");

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    if (editingResource) {
      updateMutation.mutate({ id: editingResource._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteResource = (resource) => {
    if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      deleteMutation.mutate(resource._id);
    }
  };

  // Render Loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-600">
        <div className="w-8 h-8 border-4 border-[#156E94] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-medium">Loading resources...</span>
      </div>
    );
  }

  return (
    <div className=" mx-auto w-full  text-slate-800 ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            News & Research Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your dynamic publications, briefings, research items, press statements, and blogs.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-102 active:scale-98"
        >
          <FaPlus size={14} /> Add Publication
        </button>
      </div>

      {/* Grid or Table listing existing articles */}
      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center px-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
            <FaFileAlt size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Publications Found</h3>
          <p className="text-slate-500 text-sm max-w-md mt-1">
            Click the "Add Publication" button to write your first article or uploading briefings/research.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Article Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Publish Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {resources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Cover Photo & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-sky-50 overflow-hidden relative flex items-center justify-center border border-slate-100 shrink-0">
                          {resource.image ? (
                            <img
                              src={resource.image}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaFileAlt size={18} className="text-[#156E94]" />
                          )}
                        </div>
                        <div className="max-w-[400px]">
                          <div className="font-bold text-slate-800 line-clamp-1">
                            {resource.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                            Slug: {resource.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-sky-50 text-[#156E94] text-xs font-bold rounded-lg border border-sky-100">
                        {resource.category}
                      </span>
                    </td>

                    {/* Publish Date */}
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {formatDateForDisplay(resource.publishDate)}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg inline-block border ${
                          resource.status === "published"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(resource)}
                          className="p-2 bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg hover:shadow-sm transition-all"
                          title="Edit"
                        >
                          <FaEdit size={12} className="text-[#156E94]" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource)}
                          className="p-2 bg-red-50 border border-red-100 text-red-600 hover:text-red-700 rounded-lg hover:shadow-sm transition-all"
                          title="Delete"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Add / Edit Resource */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {editingResource ? "Edit Publication" : "Add Publication"}
                </h2>
                <p className="text-white/70 text-xs mt-0.5">
                  Publish a new briefing, research working paper, or blog post.
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
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("title", { required: "Title is required" })}
                    placeholder="The PGSI-8 threshold and why the UK's headline gambling-harm figure understates harm"
                    className={`px-4 py-2.5 rounded-xl border ${
                      errors.title ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                    } outline-none text-sm transition-all duration-200`}
                  />
                  {errors.title && (
                    <span className="text-red-500 text-xs">{errors.title.message}</span>
                  )}
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Slug / URL Path <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("slug", { required: "Slug is required" })}
                    placeholder="pgsi-8-threshold-gambling-harm"
                    className={`px-4 py-2.5 rounded-xl border ${
                      errors.slug ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                    } outline-none text-sm transition-all duration-200`}
                  />
                  {errors.slug && (
                    <span className="text-red-500 text-xs">{errors.slug.message}</span>
                  )}
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("category")}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm bg-white transition-all"
                  >
                    <option value="Briefing">Briefing</option>
                    <option value="Research">Research</option>
                    <option value="Consultation response">Consultation response</option>
                    <option value="Press">Press</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>

                {/* Publish Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    {...register("publishDate")}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200"
                  />
                </div>

                {/* Status Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm bg-white transition-all"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* Cover Image Upload */}
                <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="w-24 aspect-[16/9] rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
                    {localPreview ? (
                      <img
                        src={localPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaFileAlt size={20} className="text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-slate-800">Banner Cover Image</h4>
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

                {/* Short Description */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Short Description (Grid Summary) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("description", { required: "Description is required" })}
                    placeholder="A short technical note explaining the conventional PGSI-8 cut-off..."
                    rows={2}
                    className={`px-4 py-2.5 rounded-xl border ${
                      errors.description ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-[#156E94]"
                    } outline-none text-sm transition-all duration-200 resize-y`}
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs">{errors.description.message}</span>
                  )}
                </div>

                {/* Detailed content body */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Content (Article Body)
                  </label>
                  <textarea
                    {...register("content")}
                    placeholder="Write the full detailed text content of the article here. Support HTML spacing or paragraphs."
                    rows={8}
                    className="px-4 py-3 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 resize-y"
                  />
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
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Publication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
