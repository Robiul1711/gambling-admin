import { useState, useEffect } from "react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import {
  FiBarChart2,
  FiCheckCircle,
  FiPhoneCall,
  FiUsers,
  FiRefreshCw,
  FiBookmark,
  FiExternalLink,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function GetHelpCheckInManager() {
  const axiosSecure = useAxiosSecure();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await axiosSecure.get("/check-in-analytics/summary");
      if (res?.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (e) {
      console.error("Failed to load check-in analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalStarted = analytics?.totalStarted || 0;
  const totalCompleted = analytics?.totalCompleted || 0;
  const totalHelplineClicks = analytics?.totalHelplineClicks || 0;
  const totalSaved = analytics?.totalSaved || 0;

  const completionRate =
    totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0F4A63] to-[#156E94] rounded-2xl px-7 py-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <FiShield size={11} /> GDPR Compliant • Zero PII
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check-In Tool Analytics</h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            Real-time anonymous engagement metrics, completion rates, and helpline interactions from the Check-In instrument.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173/get-help/check-in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
          >
            <FiExternalLink size={13} /> View Live Tool
          </a>
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loadingAnalytics}
            className="inline-flex items-center gap-1.5 bg-white text-[#0F4A63] hover:bg-white/90 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <FiRefreshCw className={loadingAnalytics ? "animate-spin" : ""} size={13} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Started */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-[#156E94] flex items-center justify-center shrink-0">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Check-Ins Started</p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-0.5">
              {totalStarted}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Total initiated assessments</p>
          </div>
        </div>

        {/* Card 2: Total Completed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-0.5">
              {totalCompleted}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">
              {completionRate}% completion rate
            </p>
          </div>
        </div>

        {/* Card 3: Helpline Connections */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FiPhoneCall size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Helpline Clicks</p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-0.5">
              {totalHelplineClicks}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Call & live chat clicks</p>
          </div>
        </div>

        {/* Card 4: Copies Saved/Printed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FiBookmark size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved / Printed</p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-0.5">
              {totalSaved}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Offline user copies</p>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Door Selection Breakdown */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FiActivity className="text-[#156E94]" size={18} />
                Door & Path Selection
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Which door users choose when opening the check-in tool.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics?.pathBreakdown && analytics.pathBreakdown.length > 0 ? (
              analytics.pathBreakdown.map((item) => {
                const label =
                  item._id === "self"
                    ? "My own gambling (GHSI-3)"
                    : item._id === "ao"
                    ? "Someone else's gambling (GHSI-AO-7)"
                    : item._id === "unsure"
                    ? "I am not sure"
                    : "Other";
                const percentage =
                  totalStarted > 0 ? Math.round((item.count / totalStarted) * 100) : 0;

                return (
                  <div key={item._id || "unknown"} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-2">
                      <span className="text-slate-800">{label}</span>
                      <span className="text-[#156E94] font-bold">
                        {item.count} <span className="text-slate-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#156E94] rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No door selections recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Helpline Interaction Breakdown */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FiPhoneCall className="text-amber-600" size={18} />
                Helpline Actions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calls initiated vs live chats started from the tool.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics?.helplineBreakdown && analytics.helplineBreakdown.length > 0 ? (
              analytics.helplineBreakdown.map((item) => {
                const label =
                  item._id === "call"
                    ? "Phone Calls (0808 8020 133)"
                    : item._id === "chat"
                    ? "GamCare Live Chat"
                    : item._id === "float"
                    ? "Floating Helpline Button"
                    : item._id;
                const percentage =
                  totalHelplineClicks > 0
                    ? Math.round((item.count / totalHelplineClicks) * 100)
                    : 0;

                return (
                  <div key={item._id || "unknown"} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-2">
                      <span className="text-slate-800">{label}</span>
                      <span className="text-amber-600 font-bold">
                        {item.count} <span className="text-slate-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No helpline clicks recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completed Results Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FiBarChart2 className="text-emerald-600" size={18} />
            Harm Category Distribution (Anonymous Completed Results)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated distribution of result bands without any user identity or personal answers.
          </p>
        </div>

        {analytics?.resultsBreakdown && analytics.resultsBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.resultsBreakdown.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#156E94] block mb-1">
                  {item._id.path === "self" ? "My own (GHSI-3)" : "Someone else (GHSI-AO-7)"}
                </span>
                <b className="text-sm font-bold text-slate-800 block">{item._id.resultBand || "General"}</b>
                <p className="text-xl font-extrabold text-slate-900 mt-2">
                  {item.count} <span className="text-xs text-slate-500 font-normal">completions</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No completed assessments recorded yet.
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed">
        <FiShield className="text-[#156E94] shrink-0 mt-0.5" size={18} />
        <div>
          <strong className="text-slate-800 block mb-0.5">GDPR & Privacy Guarantee:</strong>
          This telemetry records pure operational counts only. No IP addresses, device identifiers, session cookies, or personal question responses are ever transmitted or saved in the database.
        </div>
      </div>
    </div>
  );
}
