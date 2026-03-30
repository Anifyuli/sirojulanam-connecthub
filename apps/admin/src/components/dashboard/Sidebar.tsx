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
  MessageSquare,
  Quote,
  Star,
  ChevronDown,
  ChevronRight,
  Settings,
  FileText,
  ListTodo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "content",
    label: "Konten",
    icon: FileText,
    items: [
      { href: "/dashboard/blog", label: "Kelola Blog", icon: BookOpen },
      { href: "/dashboard/videos", label: "Kelola Video", icon: Video },
      { href: "/dashboard/posts", label: "Kelola Opini", icon: MessageSquare },
      { href: "/dashboard/quotes", label: "Kelola Kutipan", icon: Quote },
      { href: "/dashboard/figures", label: "Tokoh Inspiratif", icon: Star },
    ],
  },
  {
    id: "schedule",
    label: "Jadwal & Petugas",
    icon: ListTodo,
    items: [
      { href: "/dashboard/prayer", label: "Jadwal Sholat", icon: Clock },
      { href: "/dashboard/imam", label: "Kelola Imam", icon: Users },
      { href: "/dashboard/events", label: "Kelola Acara", icon: CalendarDays },
    ],
  },
  {
    id: "settings",
    label: "Pengaturan",
    icon: Settings,
    items: [
      { href: "/dashboard/taxonomy", label: "Tag & Kategori", icon: Tags },
      { href: "/dashboard/users", label: "Kelola Pengguna", icon: UserCog },
    ],
  },
];

const mainNavItem = { href: "/dashboard", label: "Dasbor", icon: LayoutDashboard };

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["content"]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isItemActive = (href: string) => {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
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
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {/* Main Nav - Dasbor */}
        <Link
          to={mainNavItem.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-2",
            isItemActive(mainNavItem.href)
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <mainNavItem.icon
            className={cn(
              "w-[18px] h-[18px] shrink-0",
              isItemActive(mainNavItem.href) ? "text-white" : "text-white/70"
            )}
          />
          {mainNavItem.label}
          {isItemActive(mainNavItem.href) && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </Link>

        {/* Divider */}
        <div className="border-t border-white/10 my-2" />

        {/* Nav Groups */}
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          const hasActiveItem = group.items.some((item) => isItemActive(item.href));
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="space-y-0.5">
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  hasActiveItem
                    ? "text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <GroupIcon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0",
                    hasActiveItem ? "text-white" : "text-white/70"
                  )}
                />
                <span className="flex-1 text-left">{group.label}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-white/50" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/50" />
                )}
              </button>

              {/* Group Items */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                {group.items.map((item) => {
                  const isActive = isItemActive(item.href);
                  const ItemIcon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 pl-11 pr-3 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/50 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <ItemIcon className="w-4 h-4 shrink-0" />
                      {item.label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
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