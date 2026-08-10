import React, { useState, useEffect } from "react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import {
  FiDownload,
  FiSearch,
  FiTrash2,
  FiRefreshCw,
  FiUsers,
  FiMail,
  FiCheckCircle,
  FiBookmark,
  FiFilter,
} from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa";

export default function RegistrationManager() {
  const axiosSecure = useAxiosSecure();

  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    newsletterCount: 0,
    membershipCount: 0,
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 15,
  });
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (search.trim()) params.search = search.trim();
      if (category && category !== "All") params.category = category;

      const res = await axiosSecure.get("/registrations", { params });
      if (res.data?.success) {
        setRegistrations(res.data.data || []);
        setPagination(
          res.data.pagination || {
            total: 0,
            page: 1,
            totalPages: 1,
            limit: 15,
          },
        );
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load registrations.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axiosSecure.get("/registrations/stats");
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [page, category]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRegistrations();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this registration record?",
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await axiosSecure.delete(`/registrations/${id}`);
      if (res.data?.success) {
        toast.success("Registration deleted successfully.");
        fetchRegistrations();
        fetchStats();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await axiosSecure.get("/registrations/export/csv", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `registrations_export_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CSV file downloaded successfully!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export CSV file.");
    } finally {
      setExporting(false);
    }
  };

  const categoriesList = [
    "All",
    "Prefer not to say",
    "I have been harmed by my own gambling",
    "I have been harmed by someone else's gambling",
    "Family member or friend",
    "Healthcare or public-health professional",
    "Researcher or academic",
    "Educator or teacher",
    "Supporter",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F4A63] to-[#156E94] rounded-2xl px-7 py-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FaUserCheck className="text-xl text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Registered Users &amp; Subscribers
            </h1>
          </div>
          <p className="text-white/75 text-sm mt-1.5 max-w-2xl">
            View, filter, and export contacts collected from the "Keep Updated"
            registration form.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchRegistrations();
              fetchStats();
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors"
            title="Refresh list"
          >
            <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting || pagination.total === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FiDownload />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0 font-bold">
            <FiUsers />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Registrations
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
              {statsLoading ? "..." : stats.total}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 font-bold">
            <FiMail />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Newsletter Opt-ins
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
              {statsLoading ? "..." : stats.newsletterCount}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0 font-bold">
            <FiBookmark />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Membership Interest
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">
              {statsLoading
                ? "..."
                : stats.membershipInterestCount || stats.membershipCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between"
        >
          {/* Search Field */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-slate-700 bg-slate-50/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <FiFilter className="text-slate-400 shrink-0 text-sm hidden sm:block" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-slate-700 bg-slate-50/50 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categoriesList
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-[#156E94] hover:bg-[#0F4A63] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Search
            </button>
            {(search || category !== "All") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Registrations Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">User Info</th>
                <th className="px-5 py-3.5">Tailor Category</th>
                <th className="px-5 py-3.5">Preferences</th>
                <th className="px-5 py-3.5">Date Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiRefreshCw className="animate-spin text-2xl text-[#156E94]" />
                      <p className="text-xs font-medium">
                        Loading submissions...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiUsers className="text-3xl text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">
                        No registrations found
                      </p>
                      <p className="text-xs text-slate-400">
                        {search || category !== "All"
                          ? "Try adjusting your search query or filter."
                          : "New user registrations will appear here."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                registrations.map((item, idx) => {
                  const serial =
                    (pagination.page - 1) * pagination.limit + idx + 1;
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A";

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/70 transition-colors duration-150"
                    >
                      {/* Serial */}
                      <td className="px-5 py-4 text-xs font-semibold text-slate-400">
                        {serial}
                      </td>

                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {item.name}
                        </div>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-xs text-[#156E94] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <FiMail size={11} />
                          {item.email}
                        </a>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
                          {item.tailorCategory || "Prefer not to say"}
                        </span>
                      </td>

                      {/* Preferences */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              item.newsletterUpdates
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }`}
                          >
                            <FiCheckCircle
                              size={12}
                              className={
                                item.newsletterUpdates
                                  ? "text-emerald-600"
                                  : "text-slate-300"
                              }
                            />
                            Newsletter: {item.newsletterUpdates ? "Yes" : "No"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              item.membershipInterest
                                ? "text-purple-700"
                                : "text-slate-400"
                            }`}
                          >
                            <FiCheckCircle
                              size={12}
                              className={
                                item.membershipInterest
                                  ? "text-purple-600"
                                  : "text-slate-300"
                              }
                            />
                            Membership: {item.membershipInterest ? "Yes" : "No"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete Registration"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing page{" "}
              <span className="font-semibold text-slate-700">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {pagination.totalPages}
              </span>{" "}
              ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || loading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
