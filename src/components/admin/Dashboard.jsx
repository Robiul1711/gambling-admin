import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useClient from "@/hooks/useClient";
import {
  FiBookOpen,
  FiMusic,
  FiUsers,
  FiActivity,
  FiPlus,
  FiEdit,
  FiExternalLink,
  FiLayers,
  FiHelpCircle,
  FiBriefcase,
  FiGrid,
  FiArrowRight,
  FiInfo,
  FiFileText,
} from "react-icons/fi";

const Dashboard = () => {
  const { user } = useSelector((state) => state.ui);

  // Fetch blogs/publications
  const { data: blogsData, isLoading: blogsLoading } = useClient({
    queryKey: ["dashboard-blogs"],
    url: "/blogs",
  });
  const blogs = blogsData?.data || [];

  // Fetch team members
  const { data: teamData, isLoading: teamLoading } = useClient({
    queryKey: ["dashboard-team"],
    url: "/team",
  });
  const team = teamData?.data || [];

  // Fetch audio clips
  const { data: audioData, isLoading: audioLoading } = useClient({
    queryKey: ["dashboard-audio"],
    url: "/news-research/audio",
  });
  const audioClips = audioData?.data || [];

  // Derived statistics
  const totalBlogs = blogs.length;
  const totalTeam = team.length;
  const totalAudio = audioClips.length;

  // Count by category
  const categoriesCount = blogs.reduce((acc, blog) => {
    const cat = blog.category || "Blog";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categories = ["Briefing", "Research", "Consultation response", "Press", "Blog"];

  // Latest 5 publications
  const recentBlogs = blogs.slice(0, 5);

  const cmsGroups = [
    {
      title: "Core Pages & Footer",
      subtitle: "Manage homepage settings, footer brand files, and news/research settings.",
      icon: <FiInfo className="text-[#156E94]" size={20} />,
      colorClass: "border-l-[#156E94]",
      links: [
        { text: "Edit Home Banner", path: "/dashboard/home/banner" },
        { text: "Edit About Settings", path: "/dashboard/about" },
        { text: "Edit Our Mission Settings", path: "/dashboard/about/mission" },
        { text: "Manage Footer & Brand Info", path: "/dashboard/footer" },
      ],
    },
    {
      title: "Audience Pages & Teams",
      subtitle: "Manage resources for medical, child protection, and public health partners.",
      icon: <FiUsers className="text-[#0092D0]" size={20} />,
      colorClass: "border-l-[#0092D0]",
      links: [
        { text: "Professionals Hub", path: "/dashboard/professionals/stakeholder" },
        { text: "Healthcare Banner", path: "/dashboard/healthcare/banner" },
        { text: "Healthcare Position & Video", path: "/dashboard/healthcare/position-video" },
        { text: "Public Health Banner", path: "/dashboard/public-health/banner" },
        { text: "Public Health Position Section", path: "/dashboard/public-health/position" },
        { text: "Children & Young People Banner", path: "/dashboard/cyp/banner" },
        { text: "Children & Young People Intro", path: "/dashboard/cyp/intro" },
        { text: "Children & Young People Films", path: "/dashboard/cyp/safeguarding-films" },
      ],
    },
    {
      title: "Get Help Pages",
      subtitle: "Configure help banners, clinical treatments, and scale of harm metrics.",
      icon: <FiHelpCircle className="text-[#C92525]" size={20} />,
      colorClass: "border-l-[#C92525]",
      links: [
        { text: "Overview Banner", path: "/dashboard/get-help/overview" },
        { text: "Check-In Banner", path: "/dashboard/get-help/check-in" },
        { text: "Treatment Banner", path: "/dashboard/get-help/treatment" },
        { text: "Family & Friends Banner", path: "/dashboard/get-help/family-friends" },
        { text: "What Harm Looks Like", path: "/dashboard/get-help/what-harm" },
        { text: "Victims Not Bystanders", path: "/dashboard/get-help/victims-not-bystanders" },
        { text: "Scale Section settings", path: "/dashboard/get-help/scale-section" },
      ],
    },
    {
      title: "Our Work & Campaigns",
      subtitle: "Configure research findings, self-exclusion advocacy, and campaign sites.",
      icon: <FiBriefcase className="text-[#0F4A63]" size={20} />,
      colorClass: "border-l-[#0F4A63]",
      links: [
        { text: "Burden of Harm Banner", path: "/dashboard/our-work/burden-of-harm" },
        { text: "Modifiable Risk Factors", path: "/dashboard/our-work/modifiable-risk-factor" },
        { text: "Gambling Explained Banner", path: "/dashboard/our-work/gambling-explained" },
        { text: "Gambling Tactics Banner", path: "/dashboard/our-work/gambling-tactics" },
        { text: "Understanding Harms Banner", path: "/dashboard/our-work/understanding-harms" },
        { text: "What Harm Looks Like (Video)", path: "/dashboard/our-work/looks-like" },
        { text: "Stigma & Language Settings", path: "/dashboard/our-work/stigma" },
        { text: "Inequality Banner Details", path: "/dashboard/our-work/inequality" },
        { text: "Policy & Advocacy Banner", path: "/dashboard/our-work/policy" },
        { text: "Members Only Banner Details", path: "/dashboard/our-work/members-only" },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* 1. WELCOME BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0F4A63] via-[#156E94] to-[#0D3B4F] rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgY3k9IjAlIiBjeD0iNTAlIiByPSI4MCUiIGlkPSJnIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDAuMDYpIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDApIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || "Admin"}!
            </h1>
            <p className="text-white/80 text-sm sm:text-base mt-2 max-w-xl font-normal leading-relaxed">
              Welcome to the site command center. Directly navigate to any CMS section below or manage global resources.
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-3">
            <a
              href="https://gambling-backend.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-2xl border border-white/20 transition-all shadow-md group"
            >
              View Live Website
              <FiExternalLink className="transform transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Publications */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Publications</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight block">
              {blogsLoading ? "..." : totalBlogs}
            </span>
          </div>
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-[#156e94]">
            <FiBookOpen size={22} />
          </div>
        </div>

        {/* Card 2: Audio Clips */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Audio Clips</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight block">
              {audioLoading ? "..." : totalAudio}
            </span>
          </div>
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-[#156e94]">
            <FiMusic size={22} />
          </div>
        </div>

        {/* Card 3: Team Members */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Team Members</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight block">
              {teamLoading ? "..." : totalTeam}
            </span>
          </div>
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-[#156e94]">
            <FiUsers size={22} />
          </div>
        </div>

        {/* Card 4: System Health */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">System Status</span>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 pt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Healthy & Online
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <FiActivity size={22} />
          </div>
        </div>
      </div>

      {/* 3. CMS DIRECTORY MAP */}
      <div className="space-y-5">
        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          <FiGrid size={18} className="text-[#156E94]" />
          CMS Section Directory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cmsGroups.map((group, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl border border-slate-200/80 border-l-4 ${group.colorClass} p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {group.icon}
                  <h3 className="font-extrabold text-slate-800 text-base">{group.title}</h3>
                </div>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">{group.subtitle}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      to={link.path}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#156e94]/30 hover:bg-[#156e94]/5 transition-all text-xs font-bold text-slate-700"
                    >
                      <span className="truncate">{link.text}</span>
                      <FiArrowRight size={12} className="text-slate-400 group-hover:text-[#156e94] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Publications (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Recent Publications</h2>
              <Link
                to="/dashboard/resources"
                className="text-xs font-bold text-[#156e94] hover:text-[#0f4a63] transition-colors flex items-center gap-1"
              >
                Manage All &rarr;
              </Link>
            </div>
            
            {blogsLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading recent entries...</div>
            ) : recentBlogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No publications created yet.</div>
            ) : (
              <div className="overflow-x-auto border-t border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                      <th className="px-6 py-3.5">Title</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Publish Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {recentBlogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700 max-w-[280px] truncate">
                          {blog.title}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {blog.category}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                              blog.status === "published"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {blog.publishDate
                            ? new Date(blog.publishDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : new Date(blog.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Distribution (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FiLayers className="text-[#156e94]" />
              Global Settings
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/dashboard/resources"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all font-medium text-sm text-slate-700 group"
              >
                <span className="flex items-center gap-2">
                  <FiPlus className="text-[#156e94] group-hover:scale-110 transition-transform" />
                  Add Publication
                </span>
                <span className="text-xs text-slate-400 font-bold">&rarr;</span>
              </Link>
              <Link
                to="/dashboard/news-research/settings"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all font-medium text-sm text-slate-700 group"
              >
                <span className="flex items-center gap-2">
                  <FiFileText className="text-[#156e94] group-hover:scale-110 transition-transform" />
                  Publications Settings
                </span>
                <span className="text-xs text-slate-400 font-bold">&rarr;</span>
              </Link>
              <Link
                to="/dashboard/news-research/audio"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all font-medium text-sm text-slate-700 group"
              >
                <span className="flex items-center gap-2">
                  <FiMusic className="text-[#156e94] group-hover:scale-110 transition-transform" />
                  Manage Audio Clips
                </span>
                <span className="text-xs text-slate-400 font-bold">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Resource Distribution
            </h2>
            {blogsLoading ? (
              <div className="text-center text-slate-400 text-sm py-4">Loading stats...</div>
            ) : totalBlogs === 0 ? (
              <div className="text-center text-slate-400 text-sm py-4">No data available.</div>
            ) : (
              <div className="space-y-3.5">
                {categories.map((cat) => {
                  const count = categoriesCount[cat === "Briefings" ? "Briefing" : cat] || 0;
                  const percentage = totalBlogs > 0 ? (count / totalBlogs) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>{cat}</span>
                        <span>
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#156e94] to-[#0D3B4F] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;