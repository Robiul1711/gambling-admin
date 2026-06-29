import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload, FiMusic } from "react-icons/fi";
import { FaBookOpen, FaImage } from "react-icons/fa";

export default function AboutMissionManager() {
  const axiosSecure = useAxiosSecure();
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    audioSource: "",
    audioTitle: "",
  });

  // Cover Image File & Preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Audio File & Preview
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");

  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["aboutOurMission"],
    url: "/about/our-mission",
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setForm({
        title: d.title || "Our mission",
        description: d.description || "Our mission rests on three commitments, each grounded in the public-health evidence on gambling harm: research, then knowledge, then action.",
        audioSource: d.audioSource || "PhoenixFM, May 2026",
        audioTitle: d.audioTitle || "How GHUK started, and why: charity origins and Covid",
      });
      if (d.image) setImagePreview(d.image);
      if (d.audioUrl) setAudioPreview(d.audioUrl);
    }
  }, [responseData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("audioSource", form.audioSource);
      formData.append("audioTitle", form.audioTitle);

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", responseData?.data?.image || "");
      }

      if (audioFile) {
        formData.append("audio", audioFile);
      } else {
        formData.append("audioUrl", responseData?.data?.audioUrl || "");
      }

      await axiosSecure.put("/about/our-mission", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Our Mission settings updated successfully!");
      setImageFile(null);
      setAudioFile(null);
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
        <h1 className="text-xl font-bold tracking-tight">Our Mission CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage the title, description, illustration graphic, audio clip uploader, and audio text metadata for the Our Mission section.
        </p>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaBookOpen size={18} />
            Section Settings
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify text details and upload separate illustration and audio (MP3) files.
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
              placeholder="Our mission"
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
              placeholder="Write description..."
              rows={4}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Audio Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Source (Label) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Audio Tagline / Source (e.g. PhoenixFM, May 2026)
              </label>
              <input
                type="text"
                value={form.audioSource}
                onChange={(e) => setForm((p) => ({ ...p, audioSource: e.target.value }))}
                placeholder="PhoenixFM, May 2026"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
              />
            </div>

            {/* Audio Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Audio Title
              </label>
              <input
                type="text"
                value={form.audioTitle}
                onChange={(e) => setForm((p) => ({ ...p, audioTitle: e.target.value }))}
                placeholder="How GHUK started, and why..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
              />
            </div>
          </div>

          {/* Two Upload Blocks: Image & Audio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Illustration Image Upload */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mission Illustration Image
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative p-2 shadow-sm">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Illustration Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <FaImage size={24} className="text-slate-300" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Illustration
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

            {/* MP3 Audio Upload */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Audio File (MP3)
              </label>
              <div className="w-full h-40 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center p-4 shadow-sm space-y-4">
                {audioPreview ? (
                  <>
                    <FiMusic size={28} className="text-[#156E94]" />
                    <audio src={audioPreview} controls className="w-full h-8 accent-[#1B80C4]" />
                  </>
                ) : (
                  <FiMusic size={28} className="text-slate-300" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload MP3 Audio
                </button>
                {audioPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setAudioFile(null);
                      setAudioPreview(responseData?.data?.audioUrl || "");
                      if (audioInputRef.current) audioInputRef.current.value = "";
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
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

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-Primary hover:bg-Primary/90 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              <FiSave size={15} />
              {saving ? "Saving..." : "Save Mission Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
