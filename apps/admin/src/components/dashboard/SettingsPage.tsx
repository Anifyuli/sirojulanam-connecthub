
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast({ title: "Error", description: "Password baru tidak cocok", variant: "destructive" });
      return;
    }

    if (form.newPassword && !form.currentPassword) {
      toast({ title: "Galat", description: "Kata sandi lama diperlukan untuk mengubah password", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        name: form.name,
        email: form.email,
      };

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await api.put("/admins/profile", payload);

      if (res.data.success) {
        updateUser({
          name: form.name,
          email: form.email,
        });
        setForm({
          ...form,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast({ title: "Berhasil", description: "Perubahan disimpan" });
      } else {
        toast({ title: "Gagal", description: res.data.error || "Gagal menyimpan", variant: "destructive" });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast({ title: "Gagal", description: error.response?.data?.error || "Gagal menyimpan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl space-y-5">
      {/* Account Info */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Informasi Akun</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Informasi akun Anda yang login.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl font-semibold text-primary">{initials}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{user?.name}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === "manager"
                ? "bg-primary/10 text-primary"
                : "bg-accent text-accent-foreground"
                }`}>
                <ShieldCheck className="w-3 h-3" />
                {user?.role === "manager" ? "Manager" : "Editor"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Edit Profile */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Edit Profil</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Perbarui informasi profil Anda.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="st-name">Nama Lengkap</Label>
            <Input
              id="st-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-username">Username</Label>
            <Input
              id="st-username"
              value={form.username}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Username tidak dapat diubah</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-email">Email</Label>
            <Input
              id="st-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Ubah Password</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Kosongkan jika tidak ingin mengubah password.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="st-current-password">Password Saat Ini</Label>
            <Input
              id="st-current-password"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-new-password">Password Baru</Label>
            <Input
              id="st-new-password"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="st-confirm-password">Konfirmasi Password</Label>
            <Input
              id="st-confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
