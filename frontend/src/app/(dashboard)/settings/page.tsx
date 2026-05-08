"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  User, Lock, Shield, LogOut, Save, Loader2, CheckCircle2,
  AlertCircle, Eye, EyeOff, Camera, Mail, Calendar, Crown,
} from "lucide-react";

interface UserData {
  id: string; name: string | null; email: string;
  role: string; avatar: string | null; createdAt: string;
}

type Tab = "profile" | "password" | "account";

const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600", "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500", "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
];

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  const isSuccess = type === "success";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
      isSuccess ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
    }`}>
      {isSuccess ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logout
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/auth/me");
        const data: UserData = res.data.data;
        setUser(data);
        setProfileName(data.name || "");
        setProfileAvatar(data.avatar || "");
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true); setProfileMsg(null);
    try {
      const res = await api.put("/auth/profile", {
        name: profileName,
        avatar: profileAvatar || undefined,
      });
      setUser(res.data.data);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.response?.data?.error || "Failed to update profile" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.new !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "New passwords do not match" }); return;
    }
    if (pwForm.new.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" }); return;
    }
    setSavingPw(true);
    try {
      await api.put("/auth/password", { currentPassword: pwForm.current, newPassword: pwForm.new });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPwForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      setPwMsg({ type: "error", text: err.response?.data?.error || "Failed to change password" });
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } finally {
      router.push("/login");
    }
  };

  const getInitials = () => {
    if (user?.name) return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return user?.email[0].toUpperCase() || "U";
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "account", label: "Account", icon: Shield },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account preferences</p>
      </div>

      {/* Profile Preview Card */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-5">
        <div className="relative flex-shrink-0">
          {profileAvatar ? (
            <img src={profileAvatar} alt="avatar" className="w-16 h-16 rounded-2xl object-cover" onError={() => setProfileAvatar("")} />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {getInitials()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-lg">{user?.name || "No name set"}</p>
          <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              user?.role === "ADMIN"
                ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                : "text-blue-400 bg-blue-400/10 border-blue-400/20"
            }`}>
              <Crown className="w-3 h-3" /> {user?.role}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {new Date(user?.createdAt || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <div className="p-7 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Profile Information
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {profileMsg && <Alert type={profileMsg.type} msg={profileMsg.text} />}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Avatar URL
              </label>
              <input
                type="url"
                value={profileAvatar}
                onChange={e => setProfileAvatar(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {profileAvatar && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={profileAvatar} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <p className="text-xs text-gray-500">Avatar preview</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-105 active:scale-95">
              {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {/* ── PASSWORD TAB ── */}
      {activeTab === "password" && (
        <div className="p-7 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-5">
            {pwMsg && <Alert type={pwMsg.type} msg={pwMsg.text} />}

            {(["current", "new", "confirm"] as const).map((field) => {
              const labels = { current: "Current Password", new: "New Password", confirm: "Confirm New Password" };
              return (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{labels[field]}</label>
                  <div className="relative">
                    <input
                      type={showPw[field] ? "text" : "password"}
                      value={pwForm[field]}
                      onChange={e => setPwForm({ ...pwForm, [field]: e.target.value })}
                      required minLength={field === "current" ? 1 : 6}
                      placeholder={field === "current" ? "••••••••" : field === "new" ? "Min. 6 characters" : "Repeat new password"}
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}

            <button type="submit" disabled={savingPw}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 hover:scale-105 active:scale-95">
              {savingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Lock className="w-4 h-4" /> Update Password</>}
            </button>
          </form>
        </div>
      )}

      {/* ── ACCOUNT TAB ── */}
      {activeTab === "account" && (
        <div className="space-y-5">
          {/* Account Info */}
          <div className="p-7 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Account Details
            </h2>
            <div className="space-y-4">
              {[
                { label: "User ID", value: user?.id },
                { label: "Role", value: user?.role },
                { label: "Email", value: user?.email },
                { label: "Member Since", value: new Date(user?.createdAt || "").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium font-mono truncate max-w-[280px]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-7 rounded-2xl bg-red-500/5 border border-red-500/20 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <LogOut className="w-5 h-5" /> Sign Out
            </h2>
            <p className="text-gray-400 text-sm mb-5">You will be logged out from all devices.</p>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-medium transition-all disabled:opacity-50">
              {loggingOut ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing out...</> : <><LogOut className="w-4 h-4" /> Sign Out</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
