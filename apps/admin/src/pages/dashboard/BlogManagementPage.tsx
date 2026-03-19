import { Header } from "@/components/dashboard/Header";
import { BlogPage } from "@/components/dashboard/BlogPage";

export default function BlogManagementPage() {
  return (
    <>
      <Header title="Blog Management" description="Write and publish articles for your community." />
      <main className="flex-1"><BlogPage /></main>
    </>
  );
}
