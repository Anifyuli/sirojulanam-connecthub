import { Header } from "@/components/dashboard/Header";
import { VideoPage } from "@/components/dashboard/VideoPage";

export default function VideoManagementPage() {
  return (
    <>
      <Header title="Video Management" description="Upload videos or add YouTube Shorts and TikTok links." />
      <main className="flex-1"><VideoPage /></main>
    </>
  );
}
