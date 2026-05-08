"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users,
  Loader2,
  FolderOpen,
  Shield,
  User as UserIcon,
  Mail,
  Crown,
} from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  projects: { id: string; title: string; memberRole: string }[];
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ADMIN: { label: "Admin", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: Crown },
  MEMBER: { label: "Member", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: UserIcon },
};

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email[0].toUpperCase();
}

const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-indigo-500",
];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get("/team");
        setMembers(res.data.data);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const filtered = members.filter(
    (m) =>
      (m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Get unique projects across all members
  const totalProjects = new Set(members.flatMap((m) => m.projects.map((p) => p.id))).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Team</h1>
          <p className="text-gray-400">
            {members.length} member{members.length !== 1 ? "s" : ""} across {totalProjects} project{totalProjects !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      {!loading && members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-400/10">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{members.length}</p>
                <p className="text-xs text-gray-500">Total Members</p>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-400/10">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {members.filter((m) => m.projects.some((p) => p.memberRole === "ADMIN")).length}
                </p>
                <p className="text-xs text-gray-500">Admins</p>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-400/10">
                <FolderOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalProjects}</p>
                <p className="text-xs text-gray-500">Shared Projects</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!loading && members.length > 0 && (
        <div className="relative">
          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full max-w-sm pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
      )}

      {/* Member Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-12 rounded-2xl bg-white/5 border border-white/10 border-dashed">
          <Users className="w-14 h-14 text-gray-600" />
          <div className="text-center">
            <p className="text-white font-semibold text-lg mb-2">No team members yet</p>
            <p className="text-gray-500 text-sm">
              Create a project and invite others to collaborate. They will appear here once they join.
            </p>
          </div>
          <a
            href="/projects"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
          >
            Go to Projects
          </a>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[20vh] gap-3">
          <p className="text-gray-500">No members match &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((member, idx) => {
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const isAdmin = member.projects.some((p) => p.memberRole === "ADMIN");
            const RoleIcon = isAdmin ? Crown : UserIcon;
            const roleLabel = isAdmin ? "Admin" : "Member";
            const roleColor = isAdmin ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-blue-400 bg-blue-400/10 border-blue-400/20";

            return (
              <div
                key={member.id}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-indigo-500/30 transition-all duration-200 backdrop-blur-xl"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {getInitials(member.name, member.email)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">{member.name || "Unknown"}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${roleColor}`}>
                    <RoleIcon className="w-3.5 h-3.5" />
                    {roleLabel}
                  </span>
                  {member.role === "ADMIN" && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border text-purple-400 bg-purple-400/10 border-purple-400/20">
                      <Shield className="w-3.5 h-3.5" />
                      System Admin
                    </span>
                  )}
                </div>

                {/* Projects */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    {member.projects.length} project{member.projects.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.projects.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-gray-400 truncate max-w-[120px]"
                        title={p.title}
                      >
                        {p.title}
                      </span>
                    ))}
                    {member.projects.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-gray-500">
                        +{member.projects.length - 3} more
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
  );
}
