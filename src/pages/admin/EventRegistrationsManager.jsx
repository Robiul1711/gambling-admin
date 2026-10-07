import React, { useState, useEffect } from "react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import {
  FiUsers,
  FiSearch,
  FiTrash2,
  FiRefreshCw,
  FiCalendar,
  FiMail,
  FiPhone,
  FiEye,
  FiX,
  FiDownload,
  FiCheckCircle,
  FiFilter,
} from "react-icons/fi";
import { FaRegBuilding } from "react-icons/fa";

export default function EventRegistrationsManager() {
  const axiosSecure = useAxiosSecure();
  const [searchParams] = useSearchParams();
  const urlEventId = searchParams.get("eventId") || "All";

  const [registrations, setRegistrations] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(urlEventId);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 20,
  });

  const [selectedReg, setSelectedReg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch events list for dropdown filter
  const fetchEventsList = async () => {
    try {
      const res = await axiosSecure.get("/events?all=true");
      if (res.data?.success) {
        setEventsList(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching events list:", err);
    }
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedEventId && selectedEventId !== "All") params.eventId = selectedEventId;
      if (statusFilter && statusFilter !== "All") params.status = statusFilter;

      const res = await axiosSecure.get("/events/admin/registrations", { params });
      if (res.data?.success) {
        setRegistrations(res.data.data || []);
        setPagination(
          res.data.pagination || {
            total: 0,
            page: 1,
            totalPages: 1,
            limit: 20,
          }
        );
      }
    } catch (err) {
      console.error("Error fetching event registrations:", err);
      toast.error(err?.response?.data?.message || "Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsList();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [page, selectedEventId, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRegistrations();
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await axiosSecure.put(`/events/admin/registrations/${id}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`Status updated to ${newStatus}`);
        setRegistrations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedReg && selectedReg._id === id) {
          setSelectedReg((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this registration?")) return;
    setDeletingId(id);
    try {
      const res = await axiosSecure.delete(`/events/admin/registrations/${id}`);
      if (res.data?.success) {
        toast.success("Registration deleted successfully.");
        setRegistrations((prev) => prev.filter((r) => r._id !== id));
        if (selectedReg && selectedReg._id === id) setSelectedReg(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete registration.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast.info("No registrations to export.");
      return;
    }

    const headers = [
      "Event Title",
      "Name",
      "Email",
      "Phone",
      "Organisation",
      "Role",
      "Places",
      "Describe You",
      "Hear About",
      "Access/Dietary Needs",
      "Newsletter Opt-In",
      "Status",
      "Registration Date",
    ];

    const rows = registrations.map((r) => [
      `"${r.eventTitle || ""}"`,
      `"${r.name || ""}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.organisation || ""}"`,
      `"${r.role || ""}"`,
      `"${r.places || "1"}"`,
      `"${r.describeYou || ""}"`,
      `"${r.hearAbout || ""}"`,
      `"${(r.accessRequirements || "").replace(/"/g, '""')}"`,
      r.newsletter ? "Yes" : "No",
      r.status || "confirmed",
      new Date(r.createdAt).toLocaleString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Event_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-[#156E94]" />
            Event Registrations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage attendees for all upcoming talks, webinars and training sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRegistrations}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#156E94] hover:bg-[#0E5270] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <FiDownload size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search attendee or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#156E94]/30 focus:border-[#156E94]"
          />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter by Event */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#156E94]/30"
            >
              <option value="All">All Events</option>
              {eventsList.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({ev.category})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#156E94]/30"
            >
              <option value="All">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-[#156E94]" />
            Loading registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No registrations found</p>
            <p className="text-sm text-gray-400 mt-1">
              Attendee registrations will appear here when users submit the registration form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Organisation / Role</th>
                  <th className="py-3 px-4 text-center">Places</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900 leading-snug">{reg.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiMail size={12} /> {reg.email}
                      </p>
                      {reg.phone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <FiPhone size={12} /> {reg.phone}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900 line-clamp-1 max-w-xs">
                        {reg.eventTitle}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-600">
                      <p className="font-medium text-gray-800">{reg.organisation || "—"}</p>
                      <p className="text-gray-500">{reg.role || ""}</p>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-gray-800">
                      {reg.places || "1"}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={reg.status || "confirmed"}
                        onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                        disabled={updatingId === reg._id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer capitalize ${
                          reg.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : reg.status === "pending"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(reg._id)}
                          disabled={deletingId === reg._id}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {registrations.length} of {pagination.total} registrations
            </span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border ${
                    page === p
                      ? "bg-[#156E94] text-white border-[#156E94]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiUsers className="text-[#156E94]" />
                Attendee Details
              </h3>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
                <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                  Event
                </p>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {selectedReg.eventTitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Attendee Name</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedReg.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Email Address</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedReg.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                  <p className="text-gray-800 mt-0.5">{selectedReg.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Places Booked</p>
                  <p className="font-bold text-sky-900 mt-0.5">{selectedReg.places || "1"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Organisation</p>
                  <p className="text-gray-800 mt-0.5">{selectedReg.organisation || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Role / Title</p>
                  <p className="text-gray-800 mt-0.5">{selectedReg.role || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                  <p className="text-gray-800 mt-0.5">{selectedReg.describeYou || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">How Heard</p>
                  <p className="text-gray-800 mt-0.5">{selectedReg.hearAbout || "—"}</p>
                </div>
              </div>

              {selectedReg.accessRequirements && (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-900 uppercase">
                    Access / Dietary Requirements
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    {selectedReg.accessRequirements}
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>Newsletter Opt-in: <strong>{selectedReg.newsletter ? "Yes" : "No"}</strong></span>
                <span>Registered: {new Date(selectedReg.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
