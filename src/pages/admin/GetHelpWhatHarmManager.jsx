import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload } from "react-icons/fi";
import { FaBookOpen, FaFilm } from "react-icons/fa";

// Component to manage a single Film card with Video Uploader
function VideoCard({ sectionId, defaultTitle, defaultCategory, defaultDescription, label }) {
  const axiosSecure = useAxiosSecure();
  const videoInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState(""); // Category/tagline
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", sectionId],
    url: `/about/${sectionId}`,
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setTitle(d.title || defaultTitle);
      setSubtitle(d.subtitle || defaultCategory);
      setDescription(d.description || defaultDescription);
      if (d.videoUrl) setVideoPreview(d.videoUrl);
    }
  }, [responseData, defaultTitle, defaultCategory, defaultDescription]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("description", description);
      if (videoFile) {
        formData.append("video", videoFile);
      } else {
        formData.append("videoUrl", responseData?.data?.videoUrl || "");
      }

      await axiosSecure.put(`/about/${sectionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${label} updated successfully!`);
      setVideoFile(null);
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
          {/* Category Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Category / Label
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Brothers"
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white w-full"
            />
          </div>

          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Film Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Brothers Gambling Harm"
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white w-full"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Description Text
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the film..."
              rows={3}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white w-full resize-y"
            />
          </div>

          {/* Video Player & Upload Zone */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Upload Video
            </label>
            <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center relative shadow-sm">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              ) : (
                <div className="text-center p-4">
                  <FaFilm size={28} className="text-slate-300 mx-auto mb-1" />
                  <span className="text-xs text-slate-400">No video uploaded yet</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <FiUpload size={12} className="text-[#156E94]" /> Upload Video
              </button>
              {videoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(responseData?.data?.videoUrl || "");
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }}
                  className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                >
                  Reset
                </button>
              )}
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
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
          className="flex items-center justify-center gap-2 bg-Primary hover:bg-Primary/90 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-60 w-full"
        >
          <FiSave size={12} />
          {saving ? "Saving..." : `Save ${label}`}
        </button>
      </div>
    </div>
  );
}

export default function GetHelpWhatHarmManager() {
  const axiosSecure = useAxiosSecure();

  const [headerForm, setHeaderForm] = useState({
    title: "",
    description: "",
  });
  const [savingHeader, setSavingHeader] = useState(false);

  // Fetch header data
  const { data: headerResponse, refetch: refetchHeader } = useClient({
    queryKey: ["about", "get-help-harm-header"],
    url: "/about/get-help-harm-header",
  });

  useEffect(() => {
    if (headerResponse?.data) {
      setHeaderForm({
        title: headerResponse.data.title || "What gambling harm looks like inside a home.",
        description: headerResponse.data.description || "Three short films, each made with affected others. Used in our medical-school teaching, safeguarding training and public-health work. Watch them in any order.",
      });
    }
  }, [headerResponse]);

  const handleSaveHeader = async () => {
    setSavingHeader(true);
    try {
      const formData = new FormData();
      formData.append("title", headerForm.title);
      formData.append("description", headerForm.description);

      await axiosSecure.put("/about/get-help-harm-header", formData);
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
        <h1 className="text-xl font-bold tracking-tight">What Harm Looks Like CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage the Safeguarding short films section under Family & Friends page, including uploading videos.
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
            Modify the section title and intro paragraph text.
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
              placeholder="What gambling harm looks like inside a home."
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

      {/* Videos Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Safeguarding Films & Video Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <VideoCard
            sectionId="get-help-harm-video-1"
            defaultCategory="Brothers"
            defaultTitle="Brothers Gambling Harm"
            defaultDescription="An older brother's gambling lands on a younger sibling who didn't choose it. A film about how harm travels sideways inside a family."
            label="Film #1 (Brothers)"
          />
          <VideoCard
            sectionId="get-help-harm-video-2"
            defaultCategory="Father & Daughter"
            defaultTitle="Father and Daughter Gambling Harm"
            defaultDescription="A daughter carries the weight of a father's gambling at home. The harm a parent rarely sees themselves."
            label="Film #2 (Father & Daughter)"
          />
          <VideoCard
            sectionId="get-help-harm-video-3"
            defaultCategory="Mother & Daughter"
            defaultTitle="Mother and Daughter Gambling Harm"
            defaultDescription="A mother gambling on her phone, a daughter watching, a household quietly changing shape."
            label="Film #3 (Mother & Daughter)"
          />
        </div>
      </div>
    </div>
  );
}
