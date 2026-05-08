"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft, Users, CheckSquare, Calendar, Plus, Trash2,
  Loader2, X, AlertCircle, Crown, UserMinus, Circle, Clock,
  CheckCircle2, Tag, UserPlus, Settings, FolderOpen,
} from "lucide-react";

interface Member {
  id: string; userId: string; role: string; joinedAt: string;
  user: { id: string; name: string | null; email: string; avatar: string | null };
}

interface Task {
  id: string; title: string; description?: string; status: string;
  priority: string; dueDate?: string; tags: string[];
  assignee?: { id: string; name: string | null; avatar: string | null };
  _count: { comments: number };
}

interface Project {
  id: string; title: string; description?: string; priority: string;
  status: string; progress: number; deadline?: string;
  owner: { id: string; name: string | null };
  members: Member[];
  tasks: Task[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  TODO:        { label: "To Do",       color: "text-gray-400",   bg: "bg-gray-400/10 border-gray-400/20",   dot: "bg-gray-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20",   dot: "bg-blue-400" },
  REVIEW:      { label: "Review",      color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", dot: "bg-yellow-400" },
  COMPLETED:   { label: "Completed",   color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",  dot: "bg-green-400" },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-400 bg-red-400/10 border-red-400/20",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  LOW: "text-green-400 bg-green-400/10 border-green-400/20",
};

const AVATAR_COLORS = ["from-indigo-500 to-purple-600","from-blue-500 to-cyan-500","from-green-500 to-emerald-500","from-orange-500 to-red-500","from-pink-500 to-rose-500"];

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return email[0].toUpperCase();
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Add member modal
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  // Add task modal
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "" });
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState("");

  // Status update
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, meRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/auth/me"),
      ]);
      const proj: Project = projRes.data.data;
      const me = meRes.data.data;
      setProject(proj);
      setCurrentUserId(me.id);
      const myMembership = proj.members.find(m => m.user.id === me.id);
      setIsAdmin(myMembership?.role === "ADMIN");
    } catch {
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMember(true); setMemberError("");
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setMemberEmail(""); setMemberRole("MEMBER"); setShowAddMember(false);
      fetchProject();
    } catch (err: any) {
      setMemberError(err.response?.data?.error || "Failed to add member");
    } finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      fetchProject();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to remove member");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTask(true); setTaskError("");
    try {
      await api.post("/tasks", {
        title: taskForm.title,
        description: taskForm.description || undefined,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
        assigneeId: taskForm.assigneeId || undefined,
        projectId: id,
      });
      setTaskForm({ title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "" });
      setShowAddTask(false);
      fetchProject();
    } catch (err: any) {
      setTaskError(err.response?.data?.error || "Failed to create task");
    } finally { setAddingTask(false); }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    setUpdatingTaskId(taskId);
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setProject(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status } : t)
      } : prev);
    } catch { /* silent */ }
    finally { setUpdatingTaskId(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  if (!project) return null;

  const todoCount = project.tasks.filter(t => t.status === "TODO").length;
  const inProgressCount = project.tasks.filter(t => t.status === "IN_PROGRESS").length;
  const reviewCount = project.tasks.filter(t => t.status === "REVIEW").length;
  const completedCount = project.tasks.filter(t => t.status === "COMPLETED").length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Back + Header */}
      <div>
        <button onClick={() => router.push("/projects")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{project.title}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${PRIORITY_COLORS[project.priority] || PRIORITY_COLORS.MEDIUM}`}>
                {project.priority}
              </span>
              {isAdmin && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
                  <Crown className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            {project.description && <p className="text-gray-400">{project.description}</p>}
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg shadow-indigo-500/20">
              <Plus className="w-5 h-5" /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Progress + Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "To Do", count: todoCount, color: "text-gray-400", dot: "bg-gray-400" },
          { label: "In Progress", count: inProgressCount, color: "text-blue-400", dot: "bg-blue-400" },
          { label: "Review", count: reviewCount, color: "text-yellow-400", dot: "bg-yellow-400" },
          { label: "Completed", count: completedCount, color: "text-green-400", dot: "bg-green-400" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {project.tasks.length > 0 && (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white font-semibold">{Math.round((completedCount / project.tasks.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((completedCount / project.tasks.length) * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks — takes 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" /> Tasks
              <span className="text-sm text-gray-500 font-normal">({project.tasks.length})</span>
            </h2>
            {isAdmin && (
              <button onClick={() => setShowAddTask(true)} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                <Plus className="w-4 h-4" /> Add task
              </button>
            )}
          </div>

          {project.tasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 border-dashed text-center">
              <CheckSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tasks yet. {isAdmin ? "Add the first task!" : "Wait for an admin to add tasks."}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {project.tasks.map(task => {
                const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
                return (
                  <div key={task.id} className={`p-4 rounded-xl border transition-all ${task.status === "COMPLETED" ? "bg-white/3 border-white/5 opacity-60" : "bg-white/5 border-white/10 hover:border-indigo-500/30"}`}>
                    <div className="flex items-center gap-3">
                      {/* Status selector */}
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        disabled={updatingTaskId === task.id}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border bg-transparent cursor-pointer focus:outline-none ${sc.bg} ${sc.color}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                          <option key={v} value={v} className="bg-gray-900 text-white">{c.label}</option>
                        ))}
                      </select>

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${task.status === "COMPLETED" ? "line-through text-gray-500" : "text-white"}`}>{task.title}</p>
                        {task.description && <p className="text-xs text-gray-500 truncate">{task.description}</p>}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${pc}`}>{task.priority}</span>
                        {task.assignee && (
                          <span className="text-xs text-gray-500 hidden sm:block">{task.assignee.name || "?"}</span>
                        )}
                        {task.dueDate && (
                          <span className={`text-xs hidden sm:flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" ? "text-red-400" : "text-gray-500"}`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Members Panel — 1/3 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Members
              <span className="text-sm text-gray-500 font-normal">({project.members.length})</span>
            </h2>
            {isAdmin && (
              <button onClick={() => setShowAddMember(true)} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                <UserPlus className="w-4 h-4" /> Add
              </button>
            )}
          </div>

          <div className="space-y-2">
            {project.members.map((m, idx) => {
              const isOwner = m.user.id === project.owner.id;
              const isSelf = m.user.id === currentUserId;
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {getInitials(m.user.name, m.user.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {m.user.name || m.user.email}
                      {isSelf && <span className="text-gray-500 font-normal"> (you)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{m.user.email}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {m.role === "ADMIN" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-yellow-400 bg-yellow-400/10">
                        <Crown className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs text-blue-400 bg-blue-400/10">Member</span>
                    )}
                    {isAdmin && !isOwner && !isSelf && (
                      <button onClick={() => handleRemoveMember(m.user.id)}
                        className="ml-1 p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Remove member">
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Add Member</h2>
              <button onClick={() => { setShowAddMember(false); setMemberError(""); }} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            {memberError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {memberError}
              </div>
            )}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User Email <span className="text-red-400">*</span></label>
                <input type="email" required value={memberEmail} onChange={e => setMemberEmail(e.target.value)} autoFocus
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select value={memberRole} onChange={e => setMemberRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="MEMBER" className="bg-gray-900">Member</option>
                  <option value="ADMIN" className="bg-gray-900">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAddMember(false); setMemberError(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all font-medium text-sm">Cancel</button>
                <button type="submit" disabled={addingMember}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {addingMember ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> : <><UserPlus className="w-4 h-4" />Add Member</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Add Task</h2>
              <button onClick={() => { setShowAddTask(false); setTaskError(""); }} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            {taskError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {taskError}
              </div>
            )}
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title <span className="text-red-400">*</span></label>
                <input type="text" required minLength={2} value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} autoFocus
                  placeholder="Task title..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Optional..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign To</label>
                <select value={taskForm.assigneeId} onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="" className="bg-gray-900">Assign to myself</option>
                  {project.members.map(m => (
                    <option key={m.user.id} value={m.user.id} className="bg-gray-900">{m.user.name || m.user.email}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                    <option value="LOW" className="bg-gray-900">Low</option>
                    <option value="MEDIUM" className="bg-gray-900">Medium</option>
                    <option value="HIGH" className="bg-gray-900">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAddTask(false); setTaskError(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all font-medium text-sm">Cancel</button>
                <button type="submit" disabled={addingTask}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {addingTask ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> : <><Plus className="w-4 h-4" />Add Task</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
