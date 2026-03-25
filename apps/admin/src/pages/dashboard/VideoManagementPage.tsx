import { Header } from "@/components/dashboard/Header";
import { VideoPage } from "@/components/dashboard/VideoPage";

export default function VideoManagementPage() {
  return (
    <>
      <Header title="Kelola Video" description="Unggah video atau tambahkan tautan YouTube Shorts dan TikTok." />
      <main className="flex-1"><VideoPage /></main>
    </>
  );
}
