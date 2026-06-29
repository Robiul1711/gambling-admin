import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload } from "react-icons/fi";
import { FaBookOpen, FaImage } from "react-icons/fa";

export default function OurWorkModifiableManager() {
  const axiosSecure = useAxiosSecure();
  const rightImageInputRef = useRef(null);
  const bottomImageInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", // Section title
    description: "", // Paragraph 1
    audioTitle: "", // Paragraph 2
    audioSource: "", // Position Tagline
    audioUrl: "", // Position Text
  });

  // Right Infographic Image
  const [rightImageFile, setRightImageFile] = useState(null);
  const [rightImagePreview, setRightImagePreview] = useState("");

  // Bottom Team Photo
  const [bottomImageFile, setBottomImageFile] = useState(null);
  const [bottomImagePreview, setBottomImagePreview] = useState("");

  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", "work-modifiable-risk"],
    url: "/about/work-modifiable-risk",
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setForm({
        title: d.title || "1. A modifiable risk factor, and we're not treating it like one",
        description: d.description || '"Modifiable risk factors" is the language public-health systems use for the things that drive disease and death and that can be changed by policy. Smoking. Alcohol. Air quality. Obesity. Gambling belongs on that list. It is largely missing from it.',
        audioTitle: d.audioTitle || "This is not an academic distinction. It determines how much research funding a harm attracts, how seriously it is taken by health systems, and how willing politicians are to act. Until gambling is treated as a modifiable risk factor for ill-health, rather than as discretionary leisure consumption with the occasional unfortunate edge case, the response will continue to be smaller than the harm warrants.",
        audioSource: d.audioSource || "Our position",
        audioUrl: d.audioUrl || "Gambling harm should be classified, measured, funded and regulated as the modifiable public-health risk factor it is. The current regulatory framing (gambling as a leisure activity with industry-led safeguards) is not consistent with the evidence on harm.",
      });
      if (d.image) setRightImagePreview(d.image);
      if (d.videoUrl) setBottomImagePreview(d.videoUrl); // Stored in videoUrl in database
    }
  }, [responseData]);

  const handleRightImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRightImageFile(file);
    setRightImagePreview(URL.createObjectURL(file));
  };

  const handleBottomImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBottomImageFile(file);
    setBottomImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("audioTitle", form.audioTitle);
      formData.append("audioSource", form.audioSource);
      formData.append("audioUrl", form.audioUrl);

      if (rightImageFile) {
        formData.append("image", rightImageFile);
      } else {
        formData.append("image", responseData?.data?.image || "");
      }

      if (bottomImageFile) {
        formData.append("video", bottomImageFile); // Backend maps 'video' file upload buffer to 'videoUrl'
      } else {
        formData.append("videoUrl", responseData?.data?.videoUrl || "");
      }

      await axiosSecure.put("/about/work-modifiable-risk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Modifiable Risk Factor settings updated successfully!");
      setRightImageFile(null);
      setBottomImageFile(null);
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
        <h1 className="text-xl font-bold tracking-tight">Modifiable Risk Factor CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage header text, description paragraphs, our position statement card details, right infographic, and bottom team photo for the Modifiable Risk Factor section.
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
            Modify text descriptions and upload image files shown on the frontend.
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
              placeholder="1. A modifiable risk factor..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Description - Paragraph 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paragraph 1 Text
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Enter Paragraph 1 text..."
              rows={3}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Paragraph 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paragraph 2 Text
            </label>
            <textarea
              value={form.audioTitle}
              onChange={(e) => setForm((p) => ({ ...p, audioTitle: e.target.value }))}
              placeholder="Enter Paragraph 2 text..."
              rows={4}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Our Position Tagline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Our Position - Tagline
            </label>
            <input
              type="text"
              value={form.audioSource}
              onChange={(e) => setForm((p) => ({ ...p, audioSource: e.target.value }))}
              placeholder="Our position"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Our Position Text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Our Position - Text Content
            </label>
            <textarea
              value={form.audioUrl}
              onChange={(e) => setForm((p) => ({ ...p, audioUrl: e.target.value }))}
              placeholder="Enter position description..."
              rows={3}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Images Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Infographic Upload */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Right Infographic Image
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative p-2 shadow-sm">
                {rightImagePreview ? (
                  <img
                    src={rightImagePreview}
                    alt="Infographic Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <FaImage size={24} className="text-slate-300" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => rightImageInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Graphic
                </button>
                {rightImagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setRightImageFile(null);
                      setRightImagePreview(responseData?.data?.image || "");
                      if (rightImageInputRef.current) rightImageInputRef.current.value = "";
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <input
                  type="file"
                  ref={rightImageInputRef}
                  onChange={handleRightImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Bottom Team Photo Upload */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bottom Team Photo Image
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative p-2 shadow-sm">
                {bottomImagePreview ? (
                  <img
                    src={bottomImagePreview}
                    alt="Team Photo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaImage size={24} className="text-slate-300" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => bottomImageInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Photo
                </button>
                {bottomImagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setBottomImageFile(null);
                      setBottomImagePreview(responseData?.data?.videoUrl || "");
                      if (bottomImageInputRef.current) bottomImageInputRef.current.value = "";
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <input
                  type="file"
                  ref={bottomImageInputRef}
                  onChange={handleBottomImageChange}
                  accept="image/*"
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
