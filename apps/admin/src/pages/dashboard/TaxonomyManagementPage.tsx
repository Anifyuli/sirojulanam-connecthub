import { Header } from "@/components/dashboard/Header";
import { TaxonomyPage } from "@/components/dashboard/TaxonomyPage";

export default function TaxonomyManagementPage() {
  return (
    <>
      <Header title="Tags & Categories" description="Kelola kategori dan tag untuk event, blog, dan video." />
      <main className="flex-1"><TaxonomyPage /></main>
    </>
  );
}
