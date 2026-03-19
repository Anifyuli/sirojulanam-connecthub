import { Header } from "@/components/dashboard/Header";
import { ImamPage } from "@/components/dashboard/ImamPage";

export default function ImamManagementPage() {
  return (
    <>
      <Header title="Imam Management" description="Manage imam profiles, roles, and schedules." />
      <main className="flex-1"><ImamPage /></main>
    </>
  );
}
