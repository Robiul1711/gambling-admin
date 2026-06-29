import { useState, useEffect, useRef } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave, FiUpload } from "react-icons/fi";
import { FaBookOpen, FaImage } from "react-icons/fa";

export default function GetHelpScaleManager() {
  const axiosSecure = useAxiosSecure();
  const rightImageInputRef = useRef(null);
  const bottomImageInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "", // Section title
    description: "", // Paragraph 1 text
    audioTitle: "", // Paragraph 2 text
    audioSource: "", // Paragraph 3 text
    subtitle: "", // Bottom photo caption
  });

  // Right Illustration Graphic
  const [rightImageFile, setRightImageFile] = useState(null);
  const [rightImagePreview, setRightImagePreview] = useState("");

  // Bottom Photo Image
  const [bottomImageFile, setBottomImageFile] = useState(null);
  const [bottomImagePreview, setBottomImagePreview] = useState("");

  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", "get-help-scale"],
    url: "/about/get-help-scale",
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setForm({
        title: d.title || "The scale: you are not the only one",
        description: d.description || "For every person in the UK experiencing severe gambling harm, an estimated Six To Ten Others (partners, parents, children, siblings, close friends) carry significant harm of their own. That puts the affected-others population, conservatively, in the region of 2.4 Million People In The UK at any given time.",
        audioTitle: d.audioTitle || "It is common to be experiencing some or all of the following: anxiety that doesn't switch off, financial fear, sleep loss, hyper-vigilance about phones and post and bank balances, walking on eggshells, isolation from friends, shame about even talking about it, and a quiet sense that you must be doing something wrong because nothing you've tried has fixed it.",
        audioSource: d.audioSource || "None of that is your fault. And none of it means you're failing.",
        subtitle: d.subtitle || "Still from GHUK's Brothers Gambling Harm safeguarding film — a younger sibling sits with what they're carrying.",
      });
      if (d.image) setRightImagePreview(d.image);
      if (d.audioUrl) setBottomImagePreview(d.audioUrl);
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
      formData.append("subtitle", form.subtitle); // Caption text
      formData.append("description", form.description); // Paragraph 1
      formData.append("audioTitle", form.audioTitle); // Paragraph 2
      formData.append("audioSource", form.audioSource); // Paragraph 3

      if (rightImageFile) {
        formData.append("image", rightImageFile);
      } else {
        formData.append("image", responseData?.data?.image || "");
      }

      if (bottomImageFile) {
        formData.append("audio", bottomImageFile); // Backend maps 'audio' file upload buffer to 'audioUrl'
      } else {
        formData.append("audioUrl", responseData?.data?.audioUrl || "");
      }

      await axiosSecure.put("/about/get-help-scale", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Scale Section settings updated successfully!");
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
        <h1 className="text-xl font-bold tracking-tight">Scale Section CMS</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage section heading, paragraph contents, right illustration, bottom photo, and bottom photo caption for the Scale Section.
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
            Modify text paragraphs and upload image assets shown on the Family & Friends page.
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
              placeholder="The scale: you are not the only one"
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
              rows={4}
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

          {/* Paragraph 3 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paragraph 3 Text
            </label>
            <textarea
              value={form.audioSource}
              onChange={(e) => setForm((p) => ({ ...p, audioSource: e.target.value }))}
              placeholder="Enter Paragraph 3 text..."
              rows={2}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white resize-y"
            />
          </div>

          {/* Image Upload Row (Illustration + Bottom Photo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Right Illustration Upload */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Right Illustration Graphic
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative p-2 shadow-sm">
                {rightImagePreview ? (
                  <img
                    src={rightImagePreview}
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
                  onClick={() => rightImageInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <FiUpload size={10} className="text-[#156E94]" /> Upload Illustration
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

            {/* Bottom Photo Upload */}
            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bottom Photo Image
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative p-2 shadow-sm">
                {bottomImagePreview ? (
                  <img
                    src={bottomImagePreview}
                    alt="Photo Preview"
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

          {/* Bottom Caption */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bottom Photo Caption
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="Still from GHUK's Brothers Gambling Harm safeguarding film — a younger sibling sits with what they're carrying."
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
