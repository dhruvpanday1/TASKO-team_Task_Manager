"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/lib/api";
import {
  CheckSquare,
  Clock,
  Circle,
  CheckCircle2,
  AlertCircle,
  Filter,
  Loader2,
  Calendar,
  Tag,
  FolderOpen,
  Plus,
  X,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  tags: string[];
  project: { id: string; title: string };
  assignee?: { id: string; name: string; avatar?: string };
  _count: { comments: number };
  createdAt: string;
}

interface Project { id: string; title: string; }

const STATUS_OPTIONS = [
  { value: "", label: "All Tasks", icon: CheckSquare },
  { value: "TODO", label: "To Do", icon: Circle },
  { value: "IN_PROGRESS", label: "In Progress", icon: Clock },
  { value: "REVIEW", label: "In Review", icon: AlertCircle },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle2 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  TODO:        { label: "To Do",       color: "text-gray-400",   bg: "bg-gray-400/10 border-gray-400/30",   dot: "bg-gray-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30",   dot: "bg-blue-400" },
  REVIEW:      { label: "Review",      color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", dot: "bg-yellow-400" },
  COMPLETED:   { label: "Completed",   color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30",  dot: "bg-green-400" },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  HIGH:   { color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30" },
  MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  LOW:    { color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30" },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return {
    text: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    isOverdue: d < new Date(),
  };
}

function TasksContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState(searchParams.get("status") || "");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", projectId: "", priority: "MEDIUM", dueDate: "" });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeStatus ? `?status=${activeStatus}` : "";
      const res = await api.get(`/tasks${params}`);
      setTasks(res.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [activeStatus]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTasks(); fetchProjects(); }, [fetchTasks, fetchProjects]);

  // Status cycle: click the badge to go to next status
  const cycleStatus = async (task: Task) => {
    const order = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
    const currentIdx = order.indexOf(task.status);
    const nextStatus = order[(currentIdx + 1) % order.length];
    await updateStatus(task.id, nextStatus);
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    setOpenDropdown(null);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) { setFormError("Please select a project"); return; }
    setSubmitting(true); setFormError("");
    try {
      await api.post("/tasks", {
        title: form.title,
        description: form.description || undefined,
        projectId: form.projectId,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
      });
      setShowModal(false);
      setForm({ title: "", description: "", projectId: "", priority: "MEDIUM", dueDate: "" });
      fetchTasks();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Tasks</h1>
          <p className="text-gray-400">All tasks assigned to you across all projects</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(""); }}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {STATUS_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeStatus === opt.value;
          return (
            <button key={opt.value} onClick={() => setActiveStatus(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" /> {opt.label}
            </button>
          );
        })}
      </div>

      {!loading && <p className="text-sm text-gray-500">Showing <span className="text-white font-medium">{tasks.length}</span> task{tasks.length !== 1 ? "s" : ""}</p>}

      {/* Tasks */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-12 rounded-2xl bg-white/5 border border-white/10 border-dashed">
          <CheckSquare className="w-14 h-14 text-gray-600" />
          <div className="text-center">
            <p className="text-white font-semibold text-lg mb-2">{activeStatus ? `No ${activeStatus.replace("_", " ").toLowerCase()} tasks` : "No tasks yet"}</p>
            <p className="text-gray-500 text-sm mb-4">{activeStatus ? "Try a different filter." : "Create your first task using the button above."}</p>
            {!activeStatus && (
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all mx-auto">
                <Plus className="w-4 h-4" /> Create Task
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
            const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
            const due = formatDate(task.dueDate);
            const isUpdating = updatingId === task.id;

            return (
              <div key={task.id}
                className={`p-5 rounded-2xl border transition-all duration-200 backdrop-blur-xl ${
                  task.status === "COMPLETED"
                    ? "bg-white/3 border-white/5 opacity-60"
                    : "bg-white/5 border-white/10 hover:border-indigo-500/30 hover:bg-white/8"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Dropdown */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === task.id ? null : task.id)}
                      disabled={isUpdating}
                      title="Change status"
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      {isUpdating
                        ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        : <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            task.status === "COMPLETED" ? "bg-green-400 border-green-400" : "border-gray-500 hover:border-indigo-400 transition-colors"
                          }`}>
                            {task.status === "COMPLETED" && <span className="text-white text-xs font-bold">✓</span>}
                          </span>
                      }
                    </button>

                    {openDropdown === task.id && (
                      <div
                        className="absolute left-0 top-8 z-30 w-48 bg-gray-950 border border-white/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <p className="px-3 pt-3 pb-1 text-xs text-gray-500 font-semibold uppercase tracking-wider">Set Status</p>
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                          <button
                            key={val}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); updateStatus(task.id, val); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                              task.status === val ? "bg-white/5" : ""
                            }`}
                          >
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            <span className={cfg.color}>{cfg.label}</span>
                            {task.status === val && <span className="ml-auto text-xs text-gray-500">current</span>}
                          </button>
                        ))}
                        <div className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0" onClick={() => setOpenDropdown(null)}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <h3 className={`font-semibold truncate ${task.status === "COMPLETED" ? "line-through text-gray-500" : "text-white"}`}>
                          {task.title}
                        </h3>
                        {task.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${pc.bg} ${pc.color}`}>{task.priority}</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-gray-500">
                      <span className="flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" />{task.project.title}</span>
                      {due && (
                        <span className={`flex items-center gap-1.5 ${due.isOverdue && task.status !== "COMPLETED" ? "text-red-400" : ""}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {due.isOverdue && task.status !== "COMPLETED" ? "⚠ Overdue · " : ""}{due.text}
                        </span>
                      )}
                      {task.tags?.length > 0 && (
                        <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{task.tags.slice(0, 2).join(", ")}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">New Task</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">Create a project first before adding tasks.</p>
                <button onClick={() => { setShowModal(false); window.location.href = "/projects"; }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
                  Go to Projects
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTask} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title <span className="text-red-400">*</span></label>
                  <input type="text" required minLength={2} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Design homepage" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    placeholder="Optional..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project <span className="text-red-400">*</span></label>
                  <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                    <option value="" className="bg-gray-900">Select project...</option>
                    {projects.map((p) => <option key={p.id} value={p.id} className="bg-gray-900">{p.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option value="LOW" className="bg-gray-900">Low</option>
                      <option value="MEDIUM" className="bg-gray-900">Medium</option>
                      <option value="HIGH" className="bg-gray-900">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-all font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Task</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>}>
      <TasksContent />
    </Suspense>
  );
}
