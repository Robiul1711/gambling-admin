import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload, FiPlay } from "react-icons/fi";
import { FaBookOpen, FaVideo } from "react-icons/fa";

export default function OurWorkLooksLikeManager() {
  const axiosSecure = useAxiosSecure();
  const videoInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", // Section Title
    description: "", // Description Text
    subtitle: "", // Video Caption
  });

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", "work-looks-like"],
    url: "/about/work-looks-like",
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setForm({
        title: d.title || "1. What gambling harm looks like",
        description: d.description || "Harm is plural. It is rarely just about money, and the money harms are rarely just about debt.",
        subtitle: d.subtitle || "GHUK's MECC training film — a lived-experience interview on how gambling exposure often starts in childhood.",
      });
      if (d.videoUrl) setVideoPreview(d.videoUrl);
    }
  }, [responseData]);

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
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("subtitle", form.subtitle); // Storing caption text

      if (videoFile) {
        formData.append("video", videoFile);
      } else {
        formData.append("videoUrl", responseData?.data?.videoUrl || "");
      }

      await axiosSecure.put("/about/work-looks-like", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Section settings updated successfully!");
      setVideoFile(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0F4A63] to-[#156E94] rounded-2xl px-7 py-5 text-white shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">What Gambling Harm Looks Like CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage header text, description paragraphs, video file upload, and video player caption for the What Gambling Harm Looks Like section.
        </p>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaBookOpen size={18} />
            Section settings
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify text descriptions and upload video files shown on the Understanding Gambling Harms page.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="1. What gambling harm looks like"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description Text
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Enter description text..."
              rows={4}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Video Uploader Container */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="w-48 h-32 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400 gap-1">
                  <FaVideo size={24} />
                  <span className="text-[10px]">No video uploaded</span>
                </div>
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <h4 className="text-sm font-bold text-slate-800">Lived-Experience Video</h4>
              <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
                Select a video file to play on the frontend. Standard MP4 formats are recommended.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Video
                </button>
                {videoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview(responseData?.data?.videoUrl || "");
                      if (videoInputRef.current) videoInputRef.current.value = "";
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
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

          {/* Video Caption */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Video Player Caption
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="GHUK's MECC training film — a lived-experience interview..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-Primary hover:bg-Primary/90 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <FiSave size={15} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
