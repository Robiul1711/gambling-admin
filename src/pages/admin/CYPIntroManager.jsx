import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload } from "react-icons/fi";
import { FaBookOpen, FaImage } from "react-icons/fa";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop";

export default function CYPIntroManager() {
  const axiosSecure = useAxiosSecure();
  const imageInputRef = useRef(null);

  const [form, setForm] = useState({
    description: "", // Intro statement
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", "cyp-intro"],
    url: "/about/cyp-intro",
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setForm({
        description: d.description || "",
      });
      if (d.image) setImagePreview(d.image);
    }
  }, [responseData]);

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
      formData.append("description", form.description);
      if (imageFile) formData.append("image", imageFile);

      await axiosSecure.put("/about/cyp-intro", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("CYP Intro settings updated successfully!");
      setImageFile(null);
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
        <h1 className="text-xl font-bold tracking-tight">Children & Young People Page CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage the intro statement details and side diagram illustration on the Children & Young People page.
        </p>
      </div>

      {/* Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#156E94] to-[#0D3B4F] text-white px-8 py-6 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaBookOpen size={18} />
            Intro Section Settings
          </h2>
          <p className="text-white/70 text-xs mt-0.5">
            Modify the introduction callout text and upload an advertisement diagram image for the right side.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Intro Callout Text
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Write the introduction paragraph statement here..."
              rows={5}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="w-32 h-24 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative shadow-sm shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <FaImage size={24} className="text-slate-300" />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-800">Right Side Ad Diagram/Image</h4>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Diagram
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(responseData?.data?.image || "");
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
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
