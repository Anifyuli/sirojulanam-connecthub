import { Header } from "@/components/dashboard/Header";
import { EventsPage } from "@/components/dashboard/EventsPage";

export default function EventManagementPage() {
  return (
    <>
      <Header title="Kelola Acara" description="Buat dan kelola acara dan program masjid." />
      <main className="flex-1"><EventsPage /></main>
    </>
  );
}
