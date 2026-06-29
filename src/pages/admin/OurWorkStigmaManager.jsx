import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload } from "react-icons/fi";
import { FaBookOpen, FaImage } from "react-icons/fa";

export default function OurWorkStigmaManager() {
  const axiosSecure = useAxiosSecure();
  const mainImageInputRef = useRef(null);
  const bottomImageInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", // Banner Title
    subtitle: "", // Banner Tagline
    description: "", // Banner Description
    audioTitle: "", // Bottom Image Caption
  });

  // Right Banner Image
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");

  // Bottom Still Image
  const [bottomImageFile, setBottomImageFile] = useState(null);
  const [bottomImagePreview, setBottomImagePreview] = useState("");

  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", "work-stigma"],
    url: "/about/work-stigma",
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setForm({
        title: d.title || "Stigma is the rate-limiting step.",
        subtitle: d.subtitle || "Our work · Stigma",
        description: d.description || "Whatever else is true about UK gambling-harm policy (treatment capacity, levy design, advertising rules) the single largest reason people experiencing harm don't reach help is the social cost of saying so out loud.",
        audioTitle: d.audioTitle || "Still from GHUK's Brothers Gambling Harm safeguarding film — the people behind the statistics are not problems to be solved.",
      });
      if (d.image) setMainImagePreview(d.image);
      if (d.audioUrl) setBottomImagePreview(d.audioUrl);
    }
  }, [responseData]);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
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
      formData.append("subtitle", form.subtitle);
      formData.append("description", form.description);
      formData.append("audioTitle", form.audioTitle); // Caption

      if (mainImageFile) {
        formData.append("image", mainImageFile);
      } else {
        formData.append("image", responseData?.data?.image || "");
      }

      if (bottomImageFile) {
        formData.append("audio", bottomImageFile); // Backend maps 'audio' file upload to 'audioUrl'
      } else {
        formData.append("audioUrl", responseData?.data?.audioUrl || "");
      }

      await axiosSecure.put("/about/work-stigma", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Stigma & Language settings updated successfully!");
      setMainImageFile(null);
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
        <h1 className="text-xl font-bold tracking-tight">Stigma & Language CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage header text, tagline, description, right banner image, bottom still image, and bottom caption for the Stigma & Language page.
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
            Modify text details and upload separate image files shown on the Stigma & Language page.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {/* Tagline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Banner Tagline / Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="Our work · Stigma"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Banner Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Stigma is the rate-limiting step."
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Banner Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Enter banner description text..."
              rows={4}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Two Images Upload Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Main Right Banner Image */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Right Banner Image
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative p-2 shadow-sm">
                {mainImagePreview ? (
                  <img
                    src={mainImagePreview}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaImage size={24} className="text-slate-300" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Banner Image
                </button>
                {mainImagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setMainImageFile(null);
                      setMainImagePreview(responseData?.data?.image || "");
                      if (mainImageInputRef.current) mainImageInputRef.current.value = "";
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <input
                  type="file"
                  ref={mainImageInputRef}
                  onChange={handleMainImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Bottom Still Image */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bottom Still Image
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative p-2 shadow-sm">
                {bottomImagePreview ? (
                  <img
                    src={bottomImagePreview}
                    alt="Bottom Image Preview"
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
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Bottom Image
                </button>
                {bottomImagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setBottomImageFile(null);
                      setBottomImagePreview(responseData?.data?.audioUrl || "");
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

          {/* Bottom Image Caption */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bottom Image Caption
            </label>
            <input
              type="text"
              value={form.audioTitle}
              onChange={(e) => setForm((p) => ({ ...p, audioTitle: e.target.value }))}
              placeholder="Still from GHUK's Brothers Gambling Harm safeguarding film — the people behind..."
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
