import React, { useState, useEffect } from "react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiTrash2,
  FiRefreshCw,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiEye,
  FiX,
  FiLayers,
  FiCheckSquare,
} from "react-icons/fi";
import { FaRegBuilding } from "react-icons/fa";

export default function BookingManager() {
  const axiosSecure = useAxiosSecure();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 15,
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter && statusFilter !== "All") params.status = statusFilter;

      const res = await axiosSecure.get("/bookings", { params });
      if (res.data?.success) {
        setBookings(res.data.data || []);
        setPagination(
          res.data.pagination || {
            total: 0,
            page: 1,
            totalPages: 1,
            limit: 15,
          }
        );
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await axiosSecure.patch(`/bookings/${bookingId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`Status changed to ${newStatus}`);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking request?"))
      return;

    setDeletingId(bookingId);
    try {
      const res = await axiosSecure.delete(`/bookings/${bookingId}`);
      if (res.data?.success) {
        toast.success("Booking request deleted successfully");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(null);
        }
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
      toast.error(err?.response?.data?.message || "Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "cancelled":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <FiCalendar className="text-[#1d7092]" />
            Session & Workshop Bookings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage incoming talk, workshop, and training booking requests
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full md:w-96 flex items-center"
        >
          <FiSearch className="absolute left-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, organisation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1d7092]"
          />
          <button
            type="submit"
            className="absolute right-1 px-3 py-1 bg-[#1d7092] text-white text-xs font-semibold rounded-md hover:bg-[#155d7a] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-[#1d7092] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <FiRefreshCw className="animate-spin text-3xl mb-3 text-[#1d7092]" />
            <p className="text-sm">Loading booking requests...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <FiCalendar className="text-4xl mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-600">
              No booking requests found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              New submissions from "Book a session or workshop" will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Name / Contact</th>
                  <th className="px-5 py-3.5">Organisation</th>
                  <th className="px-5 py-3.5">People & Format</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-gray-50/75 transition-colors"
                  >
                    {/* Name / Contact */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">
                        {booking.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <FiMail className="shrink-0" />
                        <a
                          href={`mailto:${booking.email}`}
                          className="hover:underline hover:text-[#1d7092]"
                        >
                          {booking.email}
                        </a>
                      </div>
                      {booking.phone && (
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <FiPhone className="shrink-0" />
                          <span>{booking.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Organisation */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">
                        {booking.organisationName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {booking.organisationType}
                        {booking.role ? ` • ${booking.role}` : ""}
                      </div>
                    </td>

                    {/* People & Format */}
                    <td className="px-5 py-4">
                      <div className="text-xs text-gray-900 font-medium">
                        👥 {booking.numberOfPeople} people
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        📍 {booking.format}
                        {booking.venueLocation ? ` (${booking.venueLocation})` : ""}
                      </div>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status dropdown */}
                    <td className="px-5 py-4">
                      <select
                        value={booking.status || "pending"}
                        disabled={updatingId === booking._id}
                        onChange={(e) =>
                          handleStatusChange(booking._id, e.target.value)
                        }
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${getStatusBadge(
                          booking.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-1.5 text-gray-600 hover:text-[#1d7092] hover:bg-gray-100 rounded-md transition-colors"
                        title="View Full Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(booking._id)}
                        disabled={deletingId === booking._id}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} (Total{" "}
              {pagination.total} requests)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Booking Request Details
                </h3>
                <p className="text-xs text-gray-500">
                  Received on{" "}
                  {new Date(selectedBooking.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector in Modal */}
            <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <span className="text-xs font-semibold text-gray-600">
                Current Status:
              </span>
              <select
                value={selectedBooking.status || "pending"}
                onChange={(e) =>
                  handleStatusChange(selectedBooking._id, e.target.value)
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${getStatusBadge(
                  selectedBooking.status
                )}`}
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1 bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase">
                  Contact Person
                </div>
                <div className="font-bold text-gray-900">
                  {selectedBooking.name}
                </div>
                <div className="text-xs text-gray-600">
                  <a
                    href={`mailto:${selectedBooking.email}`}
                    className="text-[#1d7092] hover:underline"
                  >
                    {selectedBooking.email}
                  </a>
                </div>
                {selectedBooking.phone && (
                  <div className="text-xs text-gray-600">
                    Phone: {selectedBooking.phone}
                  </div>
                )}
              </div>

              <div className="space-y-1 bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase">
                  Organisation
                </div>
                <div className="font-bold text-gray-900">
                  {selectedBooking.organisationName}
                </div>
                <div className="text-xs text-gray-600">
                  Type: {selectedBooking.organisationType}
                </div>
                {selectedBooking.role && (
                  <div className="text-xs text-gray-600">
                    Role: {selectedBooking.role}
                  </div>
                )}
              </div>
            </div>

            {/* Session Requirements */}
            <div className="space-y-3 bg-gray-50/70 p-4 rounded-lg border border-gray-100 text-sm">
              <div className="text-xs font-semibold text-gray-400 uppercase">
                Session Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-gray-700">
                    Approximate Number:
                  </span>{" "}
                  {selectedBooking.numberOfPeople}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Format:</span>{" "}
                  {selectedBooking.format}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Venue/Location:
                  </span>{" "}
                  {selectedBooking.venueLocation || "Not specified"}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Preferred Time:
                  </span>{" "}
                  {selectedBooking.preferredTime || "No preference"}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-gray-700">
                    Preferred Date(s)/Timeframe:
                  </span>{" "}
                  {selectedBooking.preferredDates || "Not specified"}
                </div>
              </div>

              {/* Session types */}
              {selectedBooking.sessionTypes?.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Requested Session Types:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBooking.sessionTypes.map((type, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700"
                      >
                        ✓ {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info / Note */}
            {selectedBooking.additionalInfo && (
              <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 text-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Additional Notes / Questions
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedBooking.additionalInfo}
                </p>
              </div>
            )}

            {/* Newsletter Checkbox note */}
            <div className="text-xs text-gray-500">
              Newsletter Subscription:{" "}
              <strong className="text-gray-700">
                {selectedBooking.newsletterUpdates ? "Yes" : "No"}
              </strong>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-2">
              <a
                href={`mailto:${selectedBooking.email}?subject=Gambling Harm UK - Workshop & Session Booking Enquiry`}
                className="px-4 py-2 bg-[#1d7092] hover:bg-[#155d7a] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FiMail /> Reply via Email
              </a>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
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
