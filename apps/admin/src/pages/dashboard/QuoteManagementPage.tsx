import { Header } from "@/components/dashboard/Header";
import { QuotePage } from "@/components/dashboard/QuotePage";

export default function QuoteManagementPage() {
  return (
    <>
      <Header title="Kelola Kutipan" description="Kelola kutipan inspiratif untuk komunitas Anda." />
      <main className="flex-1"><QuotePage /></main>
    </>
  );
}