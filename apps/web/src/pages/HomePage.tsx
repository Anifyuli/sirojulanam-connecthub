import { Hero } from "../components/Hero";
import { PraySchedule } from "../components/PraySchedule";

export function HomePage() {
  return (
    <div>
      <title>Beranda: SirojulAnam ConnectHub</title>

      {/* Hero Section */}
      <Hero />

      {/* PraySchedule */}
      <PraySchedule />
    </div>
  );
}
