import { Header } from "@/components/dashboard/Header";
import { UsersPage } from "@/components/dashboard/UsersPage";

export default function UserManagementPage() {
  return (
    <>
      <Header title="User Management" description="Kelola akun admin dan editor." />
      <main className="flex-1"><UsersPage /></main>
    </>
  );
}
