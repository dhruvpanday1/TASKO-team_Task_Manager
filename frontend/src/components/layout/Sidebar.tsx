"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Briefcase, label: "Projects", href: "/projects" },
  { icon: CheckSquare, label: "My Tasks", href: "/tasks" },
  { icon: Users, label: "Team", href: "/team" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white/5 border-r border-white/10 flex flex-col p-4 backdrop-blur-xl fixed left-0 top-0">
      <div className="flex items-center gap-3 px-2 mb-10 mt-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">T</div>
        <span className="text-xl font-bold text-white tracking-tight">Tasko</span>
      </div>

      <div className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                ? "bg-indigo-600/10 text-indigo-400" 
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                ? "text-indigo-400"
                : "text-gray-500 group-hover:text-gray-300"
            )} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t border-white/10 space-y-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full group",
            pathname.startsWith("/settings")
              ? "bg-indigo-600/10 text-indigo-400"
              : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
          )}
        >
          <Settings className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110",
            pathname.startsWith("/settings") ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
          )} />
          <span className="font-medium">Settings</span>
        </Link>
        <button 
          onClick={() => {
            Cookies.remove("token", { path: '/' });
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
