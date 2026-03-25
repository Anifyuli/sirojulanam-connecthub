import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";

const DashboardLayout = lazy(() => import("@/pages/dashboard/DashboardLayout"));
const DashboardIndexPage = lazy(() => import("@/pages/dashboard/DashboardIndexPage"));
const BlogManagementPage = lazy(() => import("@/pages/dashboard/BlogManagementPage"));
const EventManagementPage = lazy(() => import("@/pages/dashboard/EventManagementPage"));
const ImamManagementPage = lazy(() => import("@/pages/dashboard/ImamManagementPage"));
const PrayerSchedulePage = lazy(() => import("@/pages/dashboard/PrayerSchedulePage"));
const SettingsPage = lazy(() => import("@/pages/dashboard/SettingsPage"));
const TaxonomyManagementPage = lazy(() => import("@/pages/dashboard/TaxonomyManagementPage"));
const UserManagementPage = lazy(() => import("@/pages/dashboard/UserManagementPage"));
const VideoManagementPage = lazy(() => import("@/pages/dashboard/VideoManagementPage"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public: login page — redirect to dashboard if already logged in */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected: semua route dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardIndexPage />} />
            <Route path="blog" element={<BlogManagementPage />} />
            <Route path="events" element={<EventManagementPage />} />
            <Route path="imam" element={<ImamManagementPage />} />
            <Route path="prayer" element={<PrayerSchedulePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="taxonomy" element={<TaxonomyManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="videos" element={<VideoManagementPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
