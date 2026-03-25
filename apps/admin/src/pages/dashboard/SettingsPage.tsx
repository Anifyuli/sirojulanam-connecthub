import { Header } from "@/components/dashboard/Header";
import { SettingsPage as SettingsContent } from "@/components/dashboard/SettingsPage";

export default function SettingsPage() {
  return (
    <>
      <Header title="Setelan" description="Ubah setelan akun" />
      <main className="flex-1"><SettingsContent /></main>
    </>
  );
}
