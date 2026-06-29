import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload } from "react-icons/fi";
import { FaBookOpen, FaImage, FaFilm } from "react-icons/fa";

// Component for managing a single Safeguarding Film card
function FilmCard({ sectionId, defaultTitle, label }) {
  const axiosSecure = useAxiosSecure();
  const imageInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", sectionId],
    url: `/about/${sectionId}`,
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setTitle(d.title || defaultTitle);
      if (d.image) setImagePreview(d.image);
    }
  }, [responseData, defaultTitle]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", responseData?.data?.image || "");
      }

      await axiosSecure.put(`/about/${sectionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${label} updated successfully!`);
      setImageFile(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-6 py-4">
          <h3 className="font-bold flex items-center gap-2 text-sm">
            <FaFilm size={14} />
            {label}
          </h3>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Film Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Father and Daughter"
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white w-full"
            />
          </div>

          {/* Image Upload Area */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Still Image
            </label>
            <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative shadow-sm">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaImage size={28} className="text-slate-300" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <FiUpload size={12} className="text-[#156E94]" /> Upload Still
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(responseData?.data?.image || "");
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
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
      </div>

      {/* Card Action */}
      <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-Primary hover:bg-Primary/90 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-60 w-full"
        >
          <FiSave size={12} />
          {saving ? "Saving..." : `Save ${label}`}
        </button>
      </div>
    </div>
  );
}

export default function CYPSafeguardingFilmsManager() {
  const axiosSecure = useAxiosSecure();

  const [headerForm, setHeaderForm] = useState({
    title: "",
    description: "",
  });
  const [savingHeader, setSavingHeader] = useState(false);

  // Fetch header data
  const { data: headerResponse, refetch: refetchHeader } = useClient({
    queryKey: ["about", "cyp-safeguarding-header"],
    url: "/about/cyp-safeguarding-header",
  });

  useEffect(() => {
    if (headerResponse?.data) {
      setHeaderForm({
        title: headerResponse.data.title || "Stills from GHUK’s Safeguarding films",
        description: headerResponse.data.description || "Three short films, each made with affected others, illustrate what gambling harm looks like for the children in a household. Watch them all on the Affected others.",
      });
    }
  }, [headerResponse]);

  const handleSaveHeader = async () => {
    setSavingHeader(true);
    try {
      const formData = new FormData();
      formData.append("title", headerForm.title);
      formData.append("description", headerForm.description);

      await axiosSecure.put("/about/cyp-safeguarding-header", formData);
      toast.success("Section Header updated successfully!");
      refetchHeader();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSavingHeader(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0F4A63] to-[#156E94] rounded-2xl px-7 py-5 text-white shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">Children & Young People Page CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage the Safeguarding Films section, including header text and film image preview stills.
        </p>
      </div>

      {/* Header Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaBookOpen size={18} />
            Films Section Header
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify the section title and description text.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section Title
            </label>
            <input
              type="text"
              value={headerForm.title}
              onChange={(e) => setHeaderForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Stills from GHUK’s Safeguarding films"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description Text
            </label>
            <textarea
              value={headerForm.description}
              onChange={(e) => setHeaderForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Enter section description..."
              rows={4}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveHeader}
              disabled={savingHeader}
              className="flex items-center gap-2 bg-Primary hover:bg-Primary/90 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <FiSave size={15} />
              {savingHeader ? "Saving..." : "Save Header Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Films Cards Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Safeguarding Films</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FilmCard
            sectionId="cyp-safeguarding-film-1"
            defaultTitle="Father and Daughter"
            label="Film #1 (Father and Daughter)"
          />
          <FilmCard
            sectionId="cyp-safeguarding-film-2"
            defaultTitle="Mother and Daughter"
            label="Film #2 (Mother and Daughter)"
          />
          <FilmCard
            sectionId="cyp-safeguarding-film-3"
            defaultTitle="Brothers"
            label="Film #3 (Brothers)"
          />
        </div>
      </div>
    </div>
  );
}
