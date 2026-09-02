import React, { useState, useEffect } from "react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { toast } from "react-toastify";
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiRefreshCw,
  FiMail,
  FiBriefcase,
  FiEye,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { FaUserShield } from "react-icons/fa";

export default function MemberApprovalsManager() {
  const axiosSecure = useAxiosSecure();

  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 15,
  });

  // Action states
  const [processingId, setProcessingId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch member stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axiosSecure.get("/members/stats");
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching member stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch members list
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (statusTab !== "all") params.status = statusTab;
      if (sectorFilter !== "all") params.sector = sectorFilter;
      if (search.trim()) params.search = search.trim();

      const res = await axiosSecure.get("/members", { params });
      if (res.data?.success) {
        setMembers(res.data.data || []);
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
      console.error("Error fetching members:", err);
      toast.error(err?.response?.data?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [page, statusTab, sectorFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusTab("all");
    setSectorFilter("all");
    setPage(1);
  };

  // Status Change Handler (Approve / Reject)
  const handleStatusChange = async (memberId, newStatus) => {
    const actionLabel = newStatus === "approved" ? "approve" : "reject";
    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} this membership application? An email notification will be dispatched.`
      )
    ) {
      return;
    }

    setProcessingId(memberId);
    try {
      const res = await axiosSecure.patch(`/members/${memberId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(
          newStatus === "approved"
            ? "Member approved! Login notification email sent."
            : "Member application rejected."
        );
        fetchMembers();
        fetchStats();
        if (selectedMember?._id === memberId) {
          setSelectedMember((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err?.response?.data?.message || `Failed to ${actionLabel} member.`);
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Handler
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to permanently delete this member record?")) {
      return;
    }
    setProcessingId(memberId);
    try {
      const res = await axiosSecure.delete(`/members/${memberId}`);
      if (res.data?.success) {
        toast.success("Member record deleted successfully.");
        if (selectedMember?._id === memberId) {
          setSelectedMember(null);
        }
        fetchMembers();
        fetchStats();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete member.");
    } finally {
      setProcessingId(null);
    }
  };

  const sectorsList = [
    "All",
    "NHS",
    "Local authority or public health",
    "Education",
    "Research",
    "Third sector",
    "Lived experience",
    "Other",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F4A63] to-[#156E94] rounded-2xl px-7 py-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FaUserShield className="text-xl text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Member Approvals &amp; Portal Access
            </h1>
          </div>
          <p className="text-white/75 text-sm mt-1.5 max-w-2xl">
            Review, verify, and approve professional members requesting access to the GHUK Members Library and exclusive materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchMembers();
              fetchStats();
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            title="Refresh list"
          >
            <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div
          onClick={() => {
            setStatusTab("all");
            setPage(1);
          }}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs ${
            statusTab === "all" ? "border-[#156E94] ring-2 ring-[#156E94]/20" : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applicants
            </p>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <FiUsers size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            {statsLoading ? "..." : stats.total}
          </h3>
        </div>

        {/* Pending Approval */}
        <div
          onClick={() => {
            setStatusTab("pending");
            setPage(1);
          }}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs relative overflow-hidden ${
            statusTab === "pending" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          {stats.pending > 0 && (
            <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full animate-pulse">
              Needs Action
            </span>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending Review
            </p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiClock size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-amber-800 mt-2">
            {statsLoading ? "..." : stats.pending}
          </h3>
        </div>

        {/* Approved */}
        <div
          onClick={() => {
            setStatusTab("approved");
            setPage(1);
          }}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs ${
            statusTab === "approved" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Approved Members
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FiCheckCircle size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-800 mt-2">
            {statsLoading ? "..." : stats.approved}
          </h3>
        </div>

        {/* Rejected */}
        <div
          onClick={() => {
            setStatusTab("rejected");
            setPage(1);
          }}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs ${
            statusTab === "rejected" ? "border-rose-500 ring-2 ring-rose-500/20" : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Rejected
            </p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <FiXCircle size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-800 mt-2">
            {statsLoading ? "..." : stats.rejected}
          </h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          {[
            { id: "all", label: "All Applicants", count: stats.total },
            { id: "pending", label: "Pending Review", count: stats.pending, highlight: true },
            { id: "approved", label: "Approved", count: stats.approved },
            { id: "rejected", label: "Rejected", count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusTab === tab.id
                  ? "bg-[#156E94] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusTab === tab.id
                    ? "bg-white/25 text-white"
                    : tab.highlight && tab.count > 0
                    ? "bg-amber-100 text-amber-800 font-bold"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sector Row */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between"
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, organisation, role..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-slate-700 bg-slate-50/50"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <FiFilter className="text-slate-400 shrink-0 text-sm hidden sm:block" />
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#156E94] outline-none text-slate-700 bg-slate-50/50 cursor-pointer"
            >
              {sectorsList.map((s) => (
                <option key={s} value={s === "All" ? "all" : s}>
                  {s === "All" ? "All Sectors" : s}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-[#156E94] hover:bg-[#0F4A63] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Search
            </button>
            {(search || statusTab !== "all" || sectorFilter !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Members Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Professional Info</th>
                <th className="px-5 py-3.5">Organisation &amp; Sector</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Applied Date</th>
                <th className="px-5 py-3.5 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiRefreshCw className="animate-spin text-2xl text-[#156E94]" />
                      <p className="text-xs font-medium">Loading membership applications...</p>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiUsers className="text-3xl text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No member applications found</p>
                      <p className="text-xs text-slate-400">
                        {search || statusTab !== "all" || sectorFilter !== "all"
                          ? "Try adjusting your search criteria or filter tabs."
                          : "New member registration requests will appear here."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((item, idx) => {
                  const serial = (pagination.page - 1) * pagination.limit + idx + 1;
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
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <span>{item.name}</span>
                          <button
                            onClick={() => setSelectedMember(item)}
                            className="text-slate-400 hover:text-[#156E94] transition-colors"
                            title="View Full Application Details"
                          >
                            <FiEye size={14} />
                          </button>
                        </div>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-xs text-[#156E94] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <FiMail size={11} />
                          {item.email}
                        </a>
                        {item.role && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <FiBriefcase size={11} />
                            {item.role}
                          </div>
                        )}
                      </td>

                      {/* Organisation & Sector */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800 text-xs sm:text-sm">
                          {item.organisation || "Not specified"}
                        </div>
                        <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-50 text-sky-700 border border-sky-200 mt-1">
                          {item.sector || "Other"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {item.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Pending Review
                          </span>
                        )}
                        {item.status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <FiCheckCircle className="text-emerald-600" size={13} />
                            Approved
                          </span>
                        )}
                        {item.status === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                            <FiXCircle className="text-rose-600" size={13} />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Approval Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Button */}
                          {item.status !== "approved" && (
                            <button
                              onClick={() => handleStatusChange(item._id, "approved")}
                              disabled={processingId === item._id}
                              className="px-2.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Approve membership and notify member"
                            >
                              <FiCheck size={14} />
                              Approve
                            </button>
                          )}

                          {/* Reject Button */}
                          {item.status === "pending" && (
                            <button
                              onClick={() => handleStatusChange(item._id, "rejected")}
                              disabled={processingId === item._id}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
                              title="Reject application"
                            >
                              <FiX size={14} />
                              Reject
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteMember(item._id)}
                            disabled={processingId === item._id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Record"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
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
              Showing page <span className="font-semibold text-slate-700">{pagination.page}</span> of{" "}
              <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.total} total)
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
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Member Application Details</h3>
                <p className="text-xs text-slate-500">Submitted on {new Date(selectedMember.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Full Name</span>
                  <p className="font-semibold text-slate-800">{selectedMember.name}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Email Address</span>
                  <p className="font-semibold text-slate-800">{selectedMember.email}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Organisation</span>
                  <p className="font-semibold text-slate-800">{selectedMember.organisation || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Role / Title</span>
                  <p className="font-semibold text-slate-800">{selectedMember.role || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Sector</span>
                  <p className="font-semibold text-slate-800">{selectedMember.sector}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Status</span>
                  <p className="font-bold capitalize text-slate-800">{selectedMember.status}</p>
                </div>
              </div>

              {selectedMember.membershipNeeds && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase">What they'd like from membership:</span>
                  <div className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-700 text-xs leading-relaxed border border-slate-100">
                    {selectedMember.membershipNeeds}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {selectedMember.status !== "approved" && (
                <button
                  onClick={() => handleStatusChange(selectedMember._id, "approved")}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Approve Application
                </button>
              )}
              {selectedMember.status !== "rejected" && (
                <button
                  onClick={() => handleStatusChange(selectedMember._id, "rejected")}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
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
