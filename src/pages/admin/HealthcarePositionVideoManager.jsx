import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload, FiX } from "react-icons/fi";
import { FaBookOpen, FaFileVideo } from "react-icons/fa";

export default function HealthcarePositionVideoManager() {
  const axiosSecure = useAxiosSecure();
  const videoInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", // Tagline (Our position)
    subtitle: "", // Bold first statement
    description: "", // Remaining paragraphs
    audioTitle: "", // Video meta caption (bold part)
    audioSource: "", // Video meta caption details (italic part)
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", "healthcare-position-video"],
    url: "/about/healthcare-position-video",
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setForm({
        title: d.title || "",
        subtitle: d.subtitle || "",
        description: d.description || "",
        audioTitle: d.audioTitle || "",
        audioSource: d.audioSource || "",
      });
      if (d.audioUrl) setVideoPreview(d.audioUrl);
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
      formData.append("subtitle", form.subtitle);
      formData.append("description", form.description);
      formData.append("audioTitle", form.audioTitle);
      formData.append("audioSource", form.audioSource);
      
      // Upload the video via the 'audio' form field to match backend uploader expectations
      if (videoFile) formData.append("audio", videoFile);

      await axiosSecure.put("/about/healthcare-position-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Position & Video settings updated successfully!");
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
        <h1 className="text-xl font-bold tracking-tight">Healthcare Page CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage the Position callout texts and upload the training video file with its caption settings.
        </p>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaBookOpen size={18} />
            Position & Video Section Settings
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify text paragraphs and upload an MP4 training video for the player.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {/* Tagline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section Tagline
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Our position"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bold Lead Text
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="Making Every Contact Count (MECC) should explicitly include gambling."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Body / Paragraphs (Paragraph 1 details + Paragraph 2)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Write the rest of the text paragraphs here..."
              rows={6}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Video Caption Settings */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Video Caption Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Video Caption Bold Title
                </label>
                <input
                  type="text"
                  value={form.audioTitle}
                  onChange={(e) => setForm((p) => ({ ...p, audioTitle: e.target.value }))}
                  placeholder="MECC for gambling harm"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Video Caption Sub-details (Italic part)
                </label>
                <input
                  type="text"
                  value={form.audioSource}
                  onChange={(e) => setForm((p) => ({ ...p, audioSource: e.target.value }))}
                  placeholder="GHUK's clinical training film. A 30–60-second opportunistic conversation..."
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Video File Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
              <FaFileVideo size={22} className="text-[#156E94]" />
            </div>
            <div className="space-y-2 text-center sm:text-left w-full">
              <h4 className="text-sm font-bold text-slate-800">Upload MP4 Video File</h4>
              
              {videoPreview && (
                <div className="my-3 max-w-md rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-black">
                  <video src={videoPreview} controls className="w-full aspect-video" />
                </div>
              )}
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Select MP4 Video
                </button>
                {videoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview(responseData?.data?.audioUrl || "");
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
                  accept="video/mp4"
                  className="hidden"
                />
              </div>
            </div>
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
