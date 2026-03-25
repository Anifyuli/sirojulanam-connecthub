import { Header } from "@/components/dashboard/Header";
import { BlogPage } from "@/components/dashboard/BlogPage";

export default function BlogManagementPage() {
  return (
    <>
      <Header title="Kelola Blog" description="Tulis dan publikasikan artikel untuk komunitas Anda." />
      <main className="flex-1"><BlogPage /></main>
    </>
  );
}
