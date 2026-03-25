import { useState, useEffect } from "react";
import { Bell, BookOpen, CalendarDays, Video, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/lib/api";

interface Notification {
  id: string;
  type: "blog" | "event" | "video" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

function getIcon(type: Notification["type"]) {
  switch (type) {
    case "blog":
      return <BookOpen className="w-4 h-4 text-blue-500" />;
    case "event":
      return <CalendarDays className="w-4 h-4 text-green-500" />;
    case "video":
      return <Video className="w-4 h-4 text-purple-500" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("notification_read_ids");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    try {
      const [blogsRes, eventsRes, videosRes] = await Promise.all([
        api.get("/blogs", { params: { limit: 5, isPublished: true } }).catch(() => null),
        api.get("/events", { params: { limit: 5 } }).catch(() => null),
        api.get("/videos", { params: { limit: 5 } }).catch(() => null),
      ]);

      const items: Notification[] = [];

      if (blogsRes?.data?.data) {
        for (const blog of blogsRes.data.data.slice(0, 3)) {
          items.push({
            id: `blog-${blog.id}`,
            type: "blog",
            title: "Artikel baru dipublikasi",
            message: blog.title,
            time: blog.publishedAt || blog.createdAt,
            read: readIds.has(`blog-${blog.id}`),
          });
        }
      }

      if (eventsRes?.data?.data) {
        for (const event of eventsRes.data.data.slice(0, 2)) {
          items.push({
            id: `event-${event.id}`,
            type: "event",
            title: "Acara masjid mendatang",
            message: event.title,
            time: event.startDatetime || event.createdAt,
            read: readIds.has(`event-${event.id}`),
          });
        }
      }

      if (videosRes?.data?.data) {
        for (const video of videosRes.data.data.slice(0, 2)) {
          items.push({
            id: `video-${video.id}`,
            type: "video",
            title: "Video baru ditambahkan",
            message: video.title,
            time: video.createdAt,
            read: readIds.has(`video-${video.id}`),
          });
        }
      }

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(items);
    } catch {
      // silently fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    localStorage.setItem("notification_read_ids", JSON.stringify([...newReadIds]));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    localStorage.setItem("notification_read_ids", JSON.stringify([...allIds]));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Notifikasi</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-foreground truncate">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.time)}</p>
                </div>
                {n.read && (
                  <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
