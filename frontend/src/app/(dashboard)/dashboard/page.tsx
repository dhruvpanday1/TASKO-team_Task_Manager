"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  CheckCircle2, Clock, ListTodo, AlertCircle, FolderOpen,
  User as UserIcon, TrendingUp, ChevronRight, BarChart3, Loader2,
} from "lucide-react";

interface TaskPerUser { name: string; total: number; completed: number; }

interface Stats {
  total: number; completed: number; inProgress: number;
  review: number; overdue: number; projectCount: number;
  tasksPerUser: TaskPerUser[];
}

interface UserData { id: string; name: string; email: string; role: string; }

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, inProgress: 0, review: 0, overdue: 0, projectCount: 0, tasksPerUser: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, statsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/tasks/stats"),
        ]);
        setUser(meRes.data.data);
        setStats(statsRes.data.data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards = [
    { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { label: "In Review", value: stats.review || 0, icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    { label: "Projects", value: stats.projectCount, icon: FolderOpen, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {user?.name || user?.email?.split("@")[0]}! 👋
          </h1>
          <p className="text-gray-400">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {(user?.name || user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{user?.name || "User"}</p>
            <p className="text-gray-500 text-xs capitalize">{user?.role?.toLowerCase() || "member"}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`p-5 rounded-2xl bg-white/5 border ${s.border} backdrop-blur-xl`}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Completion Rate</h2>
          </div>
          <div className="flex items-center gap-6">
            {/* Circle */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" strokeWidth="12"
                  strokeDasharray={`${completionRate * 2.513} 251.3`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{completionRate}%</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: "Completed", val: stats.completed, color: "bg-green-400" },
                { label: "In Progress", val: stats.inProgress, color: "bg-blue-400" },
                { label: "Overdue", val: stats.overdue, color: "bg-red-400" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Per User */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Tasks per User</h2>
          </div>
          {stats.tasksPerUser.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <UserIcon className="w-8 h-8 text-gray-600" />
              <p className="text-gray-500 text-sm text-center">No data yet. Create a project and assign tasks to team members.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.tasksPerUser.slice(0, 5).map((u, idx) => {
                const pct = u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-300 font-medium truncate max-w-[150px]">{u.name}</span>
                      <span className="text-gray-500 flex-shrink-0 ml-2">{u.completed}/{u.total} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "View Projects", desc: "Manage your projects", href: "/projects", color: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20" },
          { label: "My Tasks", desc: `${stats.total - stats.completed} pending tasks`, href: "/tasks", color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20" },
          { label: "Team", desc: "See your teammates", href: "/team", color: "from-green-500/10 to-emerald-500/10 border-green-500/20" },
        ].map(link => (
          <a key={link.href} href={link.href}
            className={`p-5 rounded-2xl bg-gradient-to-br ${link.color} border backdrop-blur-xl flex items-center justify-between hover:scale-[1.02] transition-all group`}>
            <div>
              <p className="text-white font-semibold">{link.label}</p>
              <p className="text-gray-400 text-sm mt-0.5">{link.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </a>
        ))}
      </div>
    </div>
  );
}
