import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Outlet />
      </div>
    </div>
  );
}
