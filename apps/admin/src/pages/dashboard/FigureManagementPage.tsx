import { Header } from "@/components/dashboard/Header";
import { FigurePage } from "@/components/dashboard/FigurePage";

export default function FigureManagementPage() {
  return (
    <>
      <Header title="Kelola Tokoh Inspiratif" description="Kelola profil tokoh-tokoh inspiratif untuk komunitas Anda." />
      <main className="flex-1"><FigurePage /></main>
    </>
  );
}