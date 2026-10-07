import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload, FiTrash2 } from "react-icons/fi";
import { FaBookOpen, FaImage, FaFilm } from "react-icons/fa";

// Component to manage a single Film Still Card with Image Uploader
function StillCard({ sectionId, defaultTitle, label }) {
  const axiosSecure = useAxiosSecure();
  const fileInputRef = useRef(null);

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
      if (d.image) {
        setImagePreview(d.image);
      }
    } else {
      setTitle(defaultTitle);
    }
  }, [responseData, defaultTitle]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", imagePreview || "");
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
          {/* Film Caption/Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Film Caption / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Father and Daughter"
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white w-full"
            />
          </div>

          {/* Image Preview & Upload Zone */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Film Still Image
            </label>
            <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative shadow-sm">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={title || "Still Preview"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 flex flex-col items-center">
                  <FaImage size={28} className="text-slate-300 mb-1" />
                  <span className="text-xs text-slate-400">No image uploaded</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <FiUpload size={12} className="text-[#156E94]" /> Upload Image
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                  title="Remove image"
                >
                  <FiTrash2 size={12} /> Remove
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Save Button */}
      <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-Primary hover:bg-Primary/90 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60 w-full"
        >
          <FiSave size={12} />
          {saving ? "Saving..." : `Save ${label}`}
        </button>
      </div>
    </div>
  );
}

export default function TeachersCypFilmStillsManager() {
  const axiosSecure = useAxiosSecure();

  const [headerForm, setHeaderForm] = useState({
    title: "",
    description: "",
  });
  const [savingHeader, setSavingHeader] = useState(false);

  // Fetch header data
  const { data: headerResponse, refetch: refetchHeader } = useClient({
    queryKey: ["about", "teachers-cyp-film-stills-header"],
    url: "/about/teachers-cyp-film-stills-header",
  });

  useEffect(() => {
    if (headerResponse?.data) {
      setHeaderForm({
        title:
          headerResponse.data.title ||
          "Stills from GHUK's safeguarding films",
        description:
          headerResponse.data.description ||
          "Three short films, each made with people with lived experience of someone else's gambling, illustrate what gambling harm looks like for the children in a household. Watch them all on the Family & friends page.",
      });
    }
  }, [headerResponse]);

  const handleSaveHeader = async () => {
    setSavingHeader(true);
    try {
      const formData = new FormData();
      formData.append("title", headerForm.title);
      formData.append("description", headerForm.description);

      await axiosSecure.put("/about/teachers-cyp-film-stills-header", formData);
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
        <h1 className="text-xl font-bold tracking-tight">
          Teachers &amp; CYP CMS — Safeguarding Film Stills
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Manage the Safeguarding Film Stills section, descriptions, and uploaded still images on the Teachers &amp; CYP page.
        </p>
      </div>

      {/* Header Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaBookOpen size={18} />
            Section Header &amp; Description
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify the section tag/title and introduction narrative text.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section Tag / Title
            </label>
            <input
              type="text"
              value={headerForm.title}
              onChange={(e) =>
                setHeaderForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Stills from GHUK's safeguarding films"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Narrative Description
            </label>
            <textarea
              value={headerForm.description}
              onChange={(e) =>
                setHeaderForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Enter section description..."
              rows={3}
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

      {/* Film Stills Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">
          Film Stills (3 Items)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StillCard
            sectionId="teachers-cyp-film-still-1"
            defaultTitle="Father and Daughter"
            label="Film Still #1 (Father and Daughter)"
          />
          <StillCard
            sectionId="teachers-cyp-film-still-2"
            defaultTitle="Mother and Daughter"
            label="Film Still #2 (Mother and Daughter)"
          />
          <StillCard
            sectionId="teachers-cyp-film-still-3"
            defaultTitle="Brothers"
            label="Film Still #3 (Brothers)"
          />
        </div>
      </div>
    </div>
  );
}
