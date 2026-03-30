import { Header } from "@/components/dashboard/Header";
import { PostPage } from "@/components/dashboard/PostPage";

export default function PostManagementPage() {
  return (
    <>
      <Header title="Kelola Opini" description="Tulis dan publikasikan opini untuk komunitas Anda." />
      <main className="flex-1"><PostPage /></main>
    </>
  );
}