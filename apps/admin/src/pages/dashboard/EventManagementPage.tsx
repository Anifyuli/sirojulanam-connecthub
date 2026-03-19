import { Header } from "@/components/dashboard/Header";
import { EventsPage } from "@/components/dashboard/EventsPage";

export default function EventManagementPage() {
  return (
    <>
      <Header title="Event Management" description="Create and manage mosque events and programs." />
      <main className="flex-1"><EventsPage /></main>
    </>
  );
}
