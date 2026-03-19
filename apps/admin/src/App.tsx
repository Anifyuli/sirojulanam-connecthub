import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardIndexPage from "@/pages/dashboard/DashboardIndexPage";
import BlogManagementPage from "@/pages/dashboard/BlogManagementPage";
import EventManagementPage from "@/pages/dashboard/EventManagementPage";
import ImamManagementPage from "@/pages/dashboard/ImamManagementPage";
import PrayerSchedulePage from "@/pages/dashboard/PrayerSchedulePage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import TaxonomyManagementPage from "@/pages/dashboard/TaxonomyManagementPage";
import UserManagementPage from "@/pages/dashboard/UserManagementPage";
import VideoManagementPage from "@/pages/dashboard/VideoManagementPage";

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}
