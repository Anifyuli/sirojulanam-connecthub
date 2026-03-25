import { Header } from "@/components/dashboard/Header";
import { ImamPage } from "@/components/dashboard/ImamPage";

export default function ImamManagementPage() {
  return (
    <>
      <Header title="Kelola Imam" description="Kelola profil, peran, dan jadwal imam." />
      <main className="flex-1"><ImamPage /></main>
    </>
  );
}
