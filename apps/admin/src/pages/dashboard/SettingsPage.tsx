import { Header } from "@/components/dashboard/Header";
import { SettingsPage as SettingsContent } from "@/components/dashboard/SettingsPage";

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" description="Manage mosque information and admin account." />
      <main className="flex-1"><SettingsContent /></main>
    </>
  );
}
