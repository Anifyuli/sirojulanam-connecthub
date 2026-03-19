import { Header } from "@/components/dashboard/Header";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export default function DashboardIndexPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome back. Here's an overview of your mosque."
      />
      <main className="flex-1">
        <DashboardPage />
      </main>
    </>
  );
}
