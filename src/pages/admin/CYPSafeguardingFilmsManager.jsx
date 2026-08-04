import { useState, useEffect } from "react";
import useClient from "@/hooks/useClient";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FiSave } from "react-icons/fi";
import { FaBookOpen, FaFilm, FaYoutube } from "react-icons/fa";

// Component for managing a single Safeguarding Film card
function FilmCard({ sectionId, defaultTitle, defaultDesc, label }) {
  const axiosSecure = useAxiosSecure();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl1, setVideoUrl1] = useState("");
  const [videoUrl2, setVideoUrl2] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: responseData, refetch } = useClient({
    queryKey: ["about", sectionId],
    url: `/about/${sectionId}`,
  });

  useEffect(() => {
    if (responseData?.data) {
      const d = responseData.data;
      setTitle(d.title || defaultTitle);
      setDescription(d.description || defaultDesc || "");
      setVideoUrl1(d.videoUrl1 || d.videoUrl || "");
      setVideoUrl2(d.videoUrl2 || "");
    } else {
      setTitle(defaultTitle);
      setDescription(defaultDesc || "");
    }
  }, [responseData, defaultTitle, defaultDesc]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("videoUrl1", videoUrl1);
      formData.append("videoUrl2", videoUrl2);

      await axiosSecure.put(`/about/${sectionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${label} updated successfully!`);
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
              placeholder="e.g. Mother and Daughter"
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white w-full"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Film Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter film description..."
              rows={3}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-xs transition-all duration-200 text-slate-700 bg-white w-full resize-y"
            />
          </div>

          {/* YouTube Video URL 1 Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FaYoutube className="text-red-500" size={12} /> YouTube Video URL 1
            </label>
            <input
              type="url"
              value={videoUrl1}
              onChange={(e) => setVideoUrl1(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-xs transition-all duration-200 text-slate-700 bg-white w-full"
            />
          </div>

          {/* YouTube Video URL 2 Input (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FaYoutube className="text-red-500" size={12} /> YouTube Video URL 2 (Optional)
            </label>
            <input
              type="url"
              value={videoUrl2}
              onChange={(e) => setVideoUrl2(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-xs transition-all duration-200 text-slate-700 bg-white w-full"
            />
          </div>
        </div>
      </div>

      {/* Card Action */}
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
        title: headerResponse.data.title || "Safeguarding films",
        description:
          headerResponse.data.description ||
          "These films were developed with lived experience input to ensure authenticity and reflect real safeguarding scenarios reported by children and families affected by gambling harm.",
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
        <h1 className="text-xl font-bold tracking-tight">
          Children & Safeguarding CMS — Safeguarding Films
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Manage Safeguarding Films section title, descriptions, and YouTube video URLs.
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
              onChange={(e) =>
                setHeaderForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Safeguarding films"
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-sm transition-all duration-200 text-slate-700 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description Text
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

      {/* Films Cards Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">
          Safeguarding Films & Video Embeds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FilmCard
            sectionId="cyp-safeguarding-film-1"
            defaultTitle="Mother and Daughter"
            defaultDesc="This film focuses on how gambling can dominate attention and decision-making, leading to repeated emotional and practical neglect. When gambling becomes a priority, children become unseen."
            label="Film #1 (Mother and Daughter)"
          />
          <FilmCard
            sectionId="cyp-safeguarding-film-2"
            defaultTitle="Birthday Card"
            defaultDesc="This film highlights how children can be harmed through subtle pressure rather than overt force, and how such behaviour can become normalised. Often those who are harmed the most are the people we love the most."
            label="Film #2 (Birthday Card)"
          />
          <FilmCard
            sectionId="cyp-safeguarding-film-3"
            defaultTitle="Brothers"
            defaultDesc="Gambling takes more than money. It can take you away from those who need you most. The film ends before the football cards are given, leaving the younger brother standing alone and disappointed."
            label="Film #3 (Brothers)"
          />
        </div>
      </div>
    </div>
  );
}
