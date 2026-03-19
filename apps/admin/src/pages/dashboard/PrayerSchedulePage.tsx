import { Header } from "@/components/dashboard/Header";
import { PrayerPage } from "@/components/dashboard/PrayerPage";

export default function PrayerSchedulePage() {
  return (
    <>
      <Header title="Prayer Schedule" description="Manage the daily prayer time schedule." />
      <main className="flex-1"><PrayerPage /></main>
    </>
  );
}
