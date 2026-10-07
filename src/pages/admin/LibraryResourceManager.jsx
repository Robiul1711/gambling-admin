import React, { useState, useEffect } from "react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import {
  FiBookOpen,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiFileText,
  FiUploadCloud,
  FiX,
  FiExternalLink,
  FiTag,
} from "react-icons/fi";

const SECTION_OPTIONS = [
  "TOOLKITS & GUIDES",
  "BRIEFINGS & POLICY",
  "RESEARCH & EVIDENCE",
  "TRAINING & SLIDES",
  "OTHER",
];

const FILE_TYPE_OPTIONS = ["PDF", "DOCX", "PPTX", "XLSX", "ZIP", "OTHER"];

const initialFormState = {
  title: "",
  sectionTag: "TOOLKITS & GUIDES",
  fileType: "PDF",
  fileUrl: "",
  fileSize: "",
  description: "",
  isMembersOnly: true,
  order: 0,
};

export default function LibraryResourceManager() {
  const axiosSecure = useAxiosSecure();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/library-resources");
      if (res.data?.success) {
        setResources(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching library resources:", err);
      toast.error(err?.response?.data?.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenAdd = (defaultSection) => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      sectionTag: defaultSection && defaultSection !== "All" ? defaultSection : "TOOLKITS & GUIDES",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || "",
      sectionTag: item.sectionTag || "TOOLKITS & GUIDES",
      fileType: item.fileType || "PDF",
      fileUrl: item.fileUrl || "",
      fileSize: item.fileSize || "",
      description: item.description || "",
      isMembersOnly: item.isMembersOnly ?? true,
      order: item.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    setDeletingId(id);
    try {
      const res = await axiosSecure.delete(`/library-resources/${id}`);
      if (res.data?.success) {
        toast.success("Resource deleted successfully.");
        setResources((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect extension
    const ext = file.name.split(".").pop().toUpperCase();
    if (FILE_TYPE_OPTIONS.includes(ext)) {
      setFormData((prev) => ({ ...prev, fileType: ext }));
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploading(true);
    try {
      const res = await axiosSecure.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url || res.data?.data?.url) {
        const url = res.data?.url || res.data?.data?.url;
        setFormData((prev) => ({
          ...prev,
          fileUrl: url,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
        }));
        toast.success("File uploaded successfully.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await axiosSecure.put(`/library-resources/${editingId}`, formData);
        if (res.data?.success) {
          toast.success("Resource updated successfully.");
          setResources((prev) =>
            prev.map((r) => (r._id === editingId ? res.data.data : r))
          );
          setIsModalOpen(false);
        }
      } else {
        const res = await axiosSecure.post("/library-resources", formData);
        if (res.data?.success) {
          toast.success("Resource added successfully.");
          setResources((prev) => [res.data.data, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredResources = resources.filter((r) => {
    if (activeTab === "All") return true;
    return r.sectionTag === activeTab;
  });

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBookOpen className="text-[#156E94]" />
            Members Library Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and organize toolkits, policy briefings, research data and training slide decks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchResources}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => handleOpenAdd(activeTab)}
            className="flex items-center gap-2 bg-[#156E94] hover:bg-[#0E5270] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <FiPlus size={18} />
            Add Resource
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {["All", ...SECTION_OPTIONS].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? "bg-[#156E94] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-[#156E94]" />
          Loading resources...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700">No resources found</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Add Resource" to upload a PDF, toolkit, briefing or slide deck.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100 uppercase tracking-wider">
                    {item.sectionTag}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                    {item.fileType}
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-base leading-snug mt-1">
                  {item.title}
                </h4>

                {item.description && (
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#156E94] hover:underline mt-3"
                  >
                    <FiExternalLink size={12} />
                    View / Download File
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">
                  {item.fileSize || "Members Only"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-gray-600 hover:text-[#156E94] hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiBookOpen className="text-[#156E94]" />
                {editingId ? "Edit Resource" : "Add Library Resource"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section Category *
                </label>
                <select
                  value={formData.sectionTag}
                  onChange={(e) => setFormData({ ...formData, sectionTag: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white"
                >
                  {SECTION_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Document / Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Primary Care Screening Toolkit"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    File Type Badge *
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white"
                  >
                    {FILE_TYPE_OPTIONS.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    File Size (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="e.g. 1.2 MB"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* File Upload or URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 transition-colors bg-gray-50/50">
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold text-[#156E94] hover:underline"
                  >
                    <FiUploadCloud size={16} />
                    {uploading ? "Uploading file..." : "Browse file to upload"}
                  </label>
                  {formData.fileUrl && (
                    <p className="text-xs text-emerald-600 font-medium mt-1 truncate">
                      File linked: {formData.fileUrl}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Or External File URL
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief note about this resource..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg bg-[#156E94] hover:bg-[#0E5270] text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
                >
                  {submitting ? "Saving..." : editingId ? "Update" : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
