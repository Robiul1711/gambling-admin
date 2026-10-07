import React, { useState, useEffect } from "react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiUsers,
  FiEye,
  FiX,
  FiCheckCircle,
  FiTag,
} from "react-icons/fi";

const initialFormState = {
  title: "",
  category: "WEBINAR",
  day: "DD",
  month: "MON",
  date: "",
  time: "",
  format: "Online",
  location: "Online via Zoom",
  cost: "Free",
  whoItIsFor: "",
  oneLineDescription: "",
  summary: "",
  aboutParagraphs: ["", ""],
  howToJoin:
    "Registration is required. Click the button below to reserve your place.",
  status: "upcoming",
  order: 0,
};

export default function EventManager() {
  const axiosSecure = useAxiosSecure();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { all: "true" };
      if (statusFilter !== "All") params.status = statusFilter;
      const res = await axiosSecure.get("/events", { params });
      if (res.data?.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error(err?.response?.data?.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      title: event.title || "",
      category: event.category || "WEBINAR",
      day: event.day || "DD",
      month: event.month || "MON",
      date: event.date || "",
      time: event.time || "",
      format: event.format || "Online",
      location: event.location || "",
      cost: event.cost || "Free",
      whoItIsFor: event.whoItIsFor || "",
      oneLineDescription: event.oneLineDescription || "",
      summary: event.summary || "",
      aboutParagraphs:
        event.aboutParagraphs && event.aboutParagraphs.length > 0
          ? event.aboutParagraphs
          : ["", ""],
      howToJoin: event.howToJoin || "",
      status: event.status || "upcoming",
      order: event.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(id);
    try {
      const res = await axiosSecure.delete(`/events/${id}`);
      if (res.data?.success) {
        toast.success("Event deleted successfully.");
        setEvents((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Event title is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await axiosSecure.put(`/events/${editingId}`, formData);
        if (res.data?.success) {
          toast.success("Event updated successfully.");
          setEvents((prev) =>
            prev.map((item) => (item._id === editingId ? res.data.data : item)),
          );
          setIsModalOpen(false);
        }
      } else {
        const res = await axiosSecure.post("/events", formData);
        if (res.data?.success) {
          toast.success("Event created successfully.");
          setEvents((prev) => [res.data.data, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleParagraphChange = (index, value) => {
    const updated = [...formData.aboutParagraphs];
    updated[index] = value;
    setFormData({ ...formData, aboutParagraphs: updated });
  };

  const addParagraph = () => {
    setFormData({
      ...formData,
      aboutParagraphs: [...formData.aboutParagraphs, ""],
    });
  };

  const removeParagraph = (index) => {
    const updated = formData.aboutParagraphs.filter((_, i) => i !== index);
    setFormData({ ...formData, aboutParagraphs: updated });
  };

  const filteredEvents = events.filter((ev) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(q) ||
      ev.category?.toLowerCase().includes(q) ||
      ev.location?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => e.status === "upcoming").length,
    completed: events.filter((e) => e.status === "completed").length,
    draft: events.filter((e) => e.status === "draft").length,
  };

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiCalendar className="text-[#156E94]" />
            Events Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, update and manage upcoming webinars, training sessions and
            talks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#156E94] hover:bg-[#0E5270] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <FiPlus size={18} />
            Add New Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Total Events
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-sky-200 bg-sky-50/40 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-sky-700 uppercase">
            Upcoming
          </p>
          <p className="text-2xl font-bold text-sky-900 mt-1">
            {stats.upcoming}
          </p>
        </div>
        <div className="bg-white border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase">
            Completed
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {stats.completed}
          </p>
        </div>
        <div className="bg-white border border-amber-200 bg-amber-50/40 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-amber-700 uppercase">
            Draft
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {stats.draft}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#156E94]/30 focus:border-[#156E94]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            Status:
          </span>
          {["All", "upcoming", "completed", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === status
                  ? "bg-[#156E94] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-[#156E94]" />
            Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">
              No events found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add New Event" to publish your first talk or workshop.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Date Badge</th>
                  <th className="py-3 px-4">Event Info</th>
                  <th className="py-3 px-4">Format / Location</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map((ev) => (
                  <tr
                    key={ev._id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-gray-800 leading-none">
                          {ev.day}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mt-0.5">
                          {ev.month}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 mb-1">
                        {ev.category}
                      </span>
                      <h4 className="font-bold text-gray-900 leading-snug">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {ev.oneLineDescription || ev.summary}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-600">
                      <p className="font-medium text-gray-800">{ev.format}</p>
                      <p className="text-gray-500 line-clamp-1">
                        {ev.location}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {ev.time}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold text-gray-800">
                      {ev.cost}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          ev.status === "upcoming"
                            ? "bg-sky-100 text-sky-800"
                            : ev.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/event-registrations?eventId=${ev._id}`}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="View Registrations"
                        >
                          <FiUsers size={16} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(ev)}
                          className="p-1.5 text-gray-600 hover:text-[#156E94] hover:bg-gray-100 rounded transition-colors"
                          title="Edit Event"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ev._id)}
                          disabled={deletingId === ev._id}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                          title="Delete Event"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiCalendar className="text-[#156E94]" />
                {editingId ? "Edit Event" : "Add New Event"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {/* Row 1: Title and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Systems-Level Approaches to Gambling Harm"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#156E94]/30 focus:border-[#156E94]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#156E94]/30 focus:border-[#156E94]"
                  >
                    <option value="WEBINAR">WEBINAR</option>
                    <option value="TRAINING">TRAINING</option>
                    <option value="TALK">TALK</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="CONFERENCE">CONFERENCE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Date Badges and Full Date String */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Day (Badge, max 4 chars) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.day}
                    onChange={(e) =>
                      setFormData({ ...formData, day: e.target.value })
                    }
                    placeholder="e.g. 24 or DD"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                  />
                  <span className="text-[10px] text-gray-400">
                    Card badge day
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Month (Badge, max 4 chars) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        month: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. OCT or MON"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg uppercase"
                  />
                  <span className="text-[10px] text-gray-400">
                    Card badge month
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Date Display *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    placeholder="e.g. Wednesday, 24 October 2026"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                  />
                  <span className="text-[10px] text-gray-400">
                    Shown in details and register pages
                  </span>
                </div>
              </div>

              {/* Row 3: Time, Format, Location, Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g. 1:00pm – 2:30pm GMT"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Format *
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) =>
                      setFormData({ ...formData, format: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Online (Zoom)">Online (Zoom)</option>
                    <option value="Online live stream">
                      Online live stream
                    </option>
                    <option value="In person">In person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cost
                  </label>
                  <input
                    type="text"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    placeholder="e.g. Free or £25"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Location & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Online via Zoom or City Hall, London"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Who it is for (Audience)
                  </label>
                  <input
                    type="text"
                    value={formData.whoItIsFor}
                    onChange={(e) =>
                      setFormData({ ...formData, whoItIsFor: e.target.value })
                    }
                    placeholder="e.g. Healthcare professionals, teachers, researchers"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* One line description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  One-line Description (Subtitle for details page)
                </label>
                <input
                  type="text"
                  value={formData.oneLineDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      oneLineDescription: e.target.value,
                    })
                  }
                  placeholder="e.g. A one-line description of the event, who it is for and why it matters."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Card Summary (1-2 sentences for the listing page)
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  placeholder="Short summary displayed on the event card..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              {/* About Paragraphs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    About this event Paragraphs
                  </label>
                  <button
                    type="button"
                    onClick={addParagraph}
                    className="text-xs text-[#156E94] hover:underline font-semibold"
                  >
                    + Add Paragraph
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.aboutParagraphs.map((para, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <textarea
                        rows={2}
                        value={para}
                        onChange={(e) =>
                          handleParagraphChange(i, e.target.value)
                        }
                        placeholder={`Paragraph ${i + 1}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                      {formData.aboutParagraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(i)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-[#156E94] hover:bg-[#0E5270] text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update Event"
                      : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
