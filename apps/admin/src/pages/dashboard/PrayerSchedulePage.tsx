import { Header } from "@/components/dashboard/Header";
import { PrayerPage } from "@/components/dashboard/PrayerPage";

export default function PrayerSchedulePage() {
  return (
    <>
      <Header title="Jadwal Sholat" description="Kelola jadwal waktu salat harian." />
      <main className="flex-1"><PrayerPage /></main>
    </>
  );
}
