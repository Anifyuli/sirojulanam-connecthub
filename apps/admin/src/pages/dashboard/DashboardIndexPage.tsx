import { Header } from "@/components/dashboard/Header";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export default function DashboardIndexPage() {
  return (
    <>
      <Header
        title="Dasbor"
        description="Selamat datang. Berikut ringkasan masjid Anda."
      />
      <main className="flex-1">
        <DashboardPage />
      </main>
    </>
  );
}
