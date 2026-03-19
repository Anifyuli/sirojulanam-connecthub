
import { useState, useEffect } from "react";
import { CalendarDays, BookOpen, Video, Clock, MapPin, User } from "lucide-react";
import {
  StatCard,
  CardSkeleton,
  TableSkeleton,
  TableWrapper,
  Th,
  Td,
  Badge,
  EmptyState,
} from "./shared";
import api from "@/lib/api";

interface DashboardStats {
  totalEvents: number;
  totalBlogs: number;
  totalVideos: number;
  totalPrayerSchedules: number;
}

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  status: string;
}

interface LatestPost {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
}

interface RecentVideo {
  id: number;
  title: string;
  type: string;
  duration: string;
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalBlogs: 0,
    totalVideos: 0,
    totalPrayerSchedules: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [eventsRes, blogsRes, videosRes, prayerRes] = await Promise.all([
          api.get("/events").catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
          api.get("/blogs").catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
          api.get("/videos").catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
          api.get("/prayer-times").catch(() => ({ data: { data: [] } })),
        ]);

        const events = eventsRes.data.data || [];
        const blogs = blogsRes.data.data || [];
        const videos = videosRes.data.data || [];
        const prayers = prayerRes.data.data || [];

        setStats({
          totalEvents: eventsRes.data.pagination?.total || events.length,
          totalBlogs: blogsRes.data.pagination?.total || blogs.length,
          totalVideos: videosRes.data.pagination?.total || videos.length,
          totalPrayerSchedules: prayers.length,
        });

        const now = new Date();
        const upcoming = events
          .filter((e: any) => new Date(e.startDatetime) >= now)
          .slice(0, 3)
          .map((e: any) => ({
            id: e.id,
            title: e.title,
            date: new Date(e.startDatetime).toLocaleDateString("id-ID"),
            location: e.locationName || "-",
            status: e.status,
          }));
        setUpcomingEvents(upcoming);

        const posts = (blogsRes.data.data || [])
          .slice(0, 3)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category?.name || "-",
            author: p.admin?.name || "-",
            date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("id-ID") : "-",
          }));
        setLatestPosts(posts);

        const vids = (videosRes.data.data || [])
          .slice(0, 3)
          .map((v: any) => ({
            id: v.id,
            title: v.title,
            type: v.sourceType,
            duration: v.durationSeconds ? `${Math.floor(v.durationSeconds / 60)} min` : "-",
          }));
        setRecentVideos(vids);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Events" value={stats.totalEvents} icon={<CalendarDays className="w-4 h-4" />} subtext="Total events" />
            <StatCard title="Blog Posts" value={stats.totalBlogs} icon={<BookOpen className="w-4 h-4" />} subtext="Total posts" />
            <StatCard title="Videos" value={stats.totalVideos} icon={<Video className="w-4 h-4" />} subtext="Total videos" />
            <StatCard title="Prayer Schedules" value={stats.totalPrayerSchedules} icon={<Clock className="w-4 h-4" />} subtext="Total schedules" />
          </>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Upcoming Events</h2>
          {loading ? (
            <div className="bg-card rounded-xl border border-border">
              <TableSkeleton rows={3} cols={3} />
            </div>
          ) : (
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Event</Th>
                  <Th>Date</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        icon={<CalendarDays className="w-6 h-6 text-accent-foreground" />}
                        title="No upcoming events"
                        description="Add your first event to see it here."
                      />
                    </td>
                  </tr>
                ) : (
                  upcomingEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                      <Td className="font-medium">{e.title}</Td>
                      <Td className="text-muted-foreground tabular-nums">{e.date}</Td>
                      <Td>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />{e.location}
                        </span>
                      </Td>
                      <Td><Badge variant={e.status}>{e.status}</Badge></Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableWrapper>
          )}
        </section>

        {/* Latest Blog Posts */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Latest Blog Posts</h2>
          {loading ? (
            <div className="bg-card rounded-xl border border-border">
              <TableSkeleton rows={3} cols={3} />
            </div>
          ) : (
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Author</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {latestPosts.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        icon={<BookOpen className="w-6 h-6 text-accent-foreground" />}
                        title="No blog posts yet"
                        description="Start writing your first post."
                      />
                    </td>
                  </tr>
                ) : (
                  latestPosts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <Td className="font-medium">{p.title}</Td>
                      <Td><Badge>{p.category}</Badge></Td>
                      <Td>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="w-3.5 h-3.5 shrink-0" />{p.author}
                        </span>
                      </Td>
                      <Td className="text-muted-foreground tabular-nums">{p.date}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableWrapper>
          )}
        </section>
      </div>

      {/* Recent Videos */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Recent Videos</h2>
        {loading ? (
          <div className="bg-card rounded-xl border border-border">
            <TableSkeleton rows={3} cols={3} />
          </div>
        ) : (
          <TableWrapper>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Duration</Th>
              </tr>
            </thead>
            <tbody>
              {recentVideos.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyState
                      icon={<Video className="w-6 h-6 text-accent-foreground" />}
                      title="No videos uploaded"
                      description="Upload your first video or add a YouTube/TikTok link."
                    />
                  </td>
                </tr>
              ) : (
                recentVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <Td className="font-medium">{v.title}</Td>
                    <Td><Badge variant={v.type}>{v.type}</Badge></Td>
                    <Td className="text-muted-foreground tabular-nums">{v.duration}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </TableWrapper>
        )}
      </section>
    </div>
  );
}
