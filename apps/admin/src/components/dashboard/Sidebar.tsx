import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Video,
  Clock,
  Users,
  MoonStar,
  Tags,
  UserCog,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Kelola Acara", icon: CalendarDays },
  { href: "/dashboard/blog", label: "Kelola Blog", icon: BookOpen },
  { href: "/dashboard/videos", label: "Kelola Video", icon: Video },
  { href: "/dashboard/taxonomy", label: "Tag & Kategori", icon: Tags },
  { href: "/dashboard/prayer", label: "Jadwal Sholat", icon: Clock },
  { href: "/dashboard/imam", label: "Kelola Imam", icon: Users },
  { href: "/dashboard/users", label: "Kelola Pengguna", icon: UserCog },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "A";

  return (
    <aside className="flex flex-col w-64 h-full bg-sidebar text-sidebar-foreground shrink-0 overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/20">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
          <MoonStar className="w-4 h-4 text-emerald-900" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">SirojulAnam ConnectHub</p>
          <p className="text-xs text-white/60">Sistem Manajemen Konten</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              to={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  isActive ? "text-white" : "text-white/70"
                )}
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-white/20 space-y-1">
        <Link
          to="/dashboard/settings"
          className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-emerald-900">{initials}</span>
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.name ?? "Admin User"}
            </p>
            <p className="text-xs text-white/60 truncate">
              @{user?.username} • {(user?.role ?? "editor") === "manager" ? "Manager" : "Editor"}
            </p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Keluar
        </button>
      </div>
    </aside>
  );
}
