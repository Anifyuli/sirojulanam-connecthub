
import { useState, useEffect } from "react";
import {
  TableWrapper,
  Th,
  Td,
  TableSkeleton,
  EmptyState,
  Badge,
} from "@/components/dashboard/shared";
import { ModalForm } from "@/components/dashboard/ModalForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Pagination } from "./Pagination";

interface Admin {
  id: number;
  username: string;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Admin | null>(null);
  const [deleteItem, setDeleteItem] = useState<Admin | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("2");
  const [isActive, setIsActive] = useState(true);

  const isManager = currentUser?.role === "manager";

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/admins", { params: { page, limit: 10 } });
      if (res.data.success) {
        setAdmins(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchAdmins(page);
  };

  const openAdd = () => {
    setEditItem(null);
    setName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setRoleId("2");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditItem(admin);
    setName(admin.name);
    setEmail(admin.email);
    setUsername(admin.username);
    setPassword("");
    setRoleId(admin.roleId.toString());
    setIsActive(admin.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name,
        email,
        username,
        passwordHash: password,
        roleId: parseInt(roleId),
        isActive,
      };

      if (editItem) {
        const updatePayload: Record<string, string | number | boolean> = { name, email, roleId: parseInt(roleId), isActive };
        await api.put(`/admins/${editItem.id}`, updatePayload);
        setAdmins((prev) =>
          prev.map((a) =>
            a.id === editItem.id
              ? {
                ...a,
                name,
                email,
                roleId: parseInt(roleId),
                isActive,
              }
              : a
          )
        );
      } else {
        const res = await api.post("/admins", payload);
        if (res.data.success) {
          setAdmins((prev) => [...prev, res.data.data]);
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save admin:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/admins/${deleteItem.id}`);
      setAdmins((prev) => prev.filter((a) => a.id !== deleteItem.id));
      setDeleteItem(null);
      fetchAdmins();
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  if (!isManager) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight text-balance">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola akun manager dan editor
          </p>
        </div>
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Akses Terbatas
          </h3>
          <p className="text-muted-foreground max-w-md">
            Hanya manager yang dapat mengelola pengguna.
            Hubungi administrator jika Anda memerlukan akses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight text-balance">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola akun manager dan editor
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {admins.length}
              </p>
              <p className="text-sm text-muted-foreground">Total User</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {admins.filter((a) => a.roleName === "manager").length}
              </p>
              <p className="text-sm text-muted-foreground">Managers</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Pencil className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {admins.filter((a) => a.roleName === "editor").length}
              </p>
              <p className="text-sm text-muted-foreground">Editors</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : admins.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-accent-foreground" />}
          title="Belum ada user"
          description="Tambahkan user baru untuk mulai mengelola manager dan editor."
          action={
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah User
            </Button>
          }
        />
      ) : (
        <TableWrapper>
          <thead>
            <tr className="border-b border-border">
              <Th>Nama</Th>
              <Th>Nama pengguna</Th>
              <Th>Surel</Th>
              <Th>Peran</Th>
              <Th>Status</Th>
              <Th>Dibuat</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr
                key={admin.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <Td className="font-medium">{admin.name}</Td>
                <Td className="text-muted-foreground">{admin.username}</Td>
                <Td className="text-muted-foreground">{admin.email}</Td>
                <Td>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${admin.roleName === "manager"
                      ? "bg-primary/10 text-primary"
                      : "bg-accent text-accent-foreground"
                      }`}
                  >
                    {admin.roleName === "manager" ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <Pencil className="w-3 h-3" />
                    )}
                    {admin.roleName === "manager" ? "Manager" : "Editor"}
                  </span>
                </Td>
                <Td>
                  <Badge variant={admin.isActive ? "active" : "draft"}>
                    {admin.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </Td>
                <Td className="text-muted-foreground tabular-nums">
                  {new Date(admin.createdAt).toLocaleDateString("id-ID")}
                </Td>
                <Td className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(admin)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Ubah
                      </DropdownMenuItem>
                      {admin.id !== Number(currentUser?.userId) && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteItem(admin)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      )}

      {admins.length > 0 && (
        <div className="mt-4">
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Edit User" : "Tambah User"}
        onSubmit={handleSubmit}
        submitLabel={editItem ? "Simpan" : "Tambah"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              disabled={!!editItem}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@masjid.org"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {editItem ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editItem ? "Biarkan kosong" : "Masukkan password"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Editor</SelectItem>
                {isManager && <SelectItem value="1">Manager</SelectItem>}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {isManager
                ? "Manager dapat mengelola semua konten dan user. Editor hanya dapat mengelola konten."
                : "Anda dapat membuat akun Editor. Hubungi Manager untuk membuat akun Manager."}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="is_active" className="font-medium">
                Status Aktif
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                User nonaktif tidak dapat login
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      </ModalForm>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus user <strong>{deleteItem?.name}</strong>. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
