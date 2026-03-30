
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuillEditor } from "./QuillEditor";
import { toast } from "@/components/ui/use-toast";
import { TableSkeleton, TableWrapper, Th, Td, Badge, EmptyState } from "./shared";
import { ModalForm } from "./ModalForm";
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
import { PreviewDialog } from "./PreviewDialog";
import { Pagination } from "./Pagination";
import { TagInput } from "./TagInput";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import api from "@/lib/api";

interface Event {
  id: number;
  title: string;
  slug: string;
  categoryId: number | null;
  categoryName?: string;
  adminId: number;
  descriptionMd?: string;
  locationName?: string;
  locationDetail?: string;
  startDatetime: string;
  endDatetime?: string | null;
  isAllDay: boolean;
  status: string;
  coverImageUrl?: string;
  isFree: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  colorHex: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface EventForm {
  title: string;
  slug: string;
  categoryId: string;
  descriptionMd: string;
  locationName: string;
  locationDetail: string;
  startDatetime: string;
  endDatetime: string;
  isAllDay: boolean;
  status: string;
  coverImageUrl: string;
  isFree: boolean;
  tags: string[];
}

const emptyForm: EventForm = { title: "", slug: "", categoryId: "", descriptionMd: "", locationName: "", locationDetail: "", startDatetime: "", endDatetime: "", isAllDay: false, status: "draft", coverImageUrl: "", isFree: true, tags: [] };

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const canManageEvent = (event: Event, user: AuthUser | null): boolean => {
  if (!user) return false;
  if (user.role === "manager") return true;
  return event.adminId === parseInt(user.userId);
};

export function EventsPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; event: Event | null }>({ open: false, event: null });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<{ tag: string }[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchTagSuggestions();
  }, []);

  const fetchEvents = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/events", { params: { page, limit: 10 } });
      if (res.data.success) {
        setEvents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/taxonomies/event/categories");
      if (res.data) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTagSuggestions = async () => {
    try {
      const res = await api.get("/taxonomies/event/tags");
      setTagSuggestions(res.data);
    } catch (error) {
      console.error("Failed to fetch tag suggestions:", error);
    }
  };

  const filteredTagSuggestions = tagSuggestions.filter((t) => {
    const matches = t.tag.toLowerCase().includes(tagInput.toLowerCase());
    const notSelected = !form.tags.includes(t.tag);
    return matches && notSelected;
  });

  const handlePageChange = (page: number) => {
    fetchEvents(page);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setTagInput("");
    setModalOpen(true);
  };

  const openEdit = (e: Event) => {
    setEditTarget(e);
    setForm({
      title: e.title,
      slug: e.slug,
      categoryId: e.categoryId?.toString() || "",
      descriptionMd: typeof e.descriptionMd === "string" ? e.descriptionMd : "",
      locationName: e.locationName || "",
      locationDetail: e.locationDetail || "",
      startDatetime: e.startDatetime ? new Date(e.startDatetime).toISOString().slice(0, 16) : "",
      endDatetime: e.endDatetime ? new Date(e.endDatetime).toISOString().slice(0, 16) : "",
      isAllDay: e.isAllDay || false,
      status: e.status || "draft",
      coverImageUrl: e.coverImageUrl || "",
      isFree: e.isFree !== false,
      tags: Array.isArray(e.tags) ? e.tags : [],
    });
    setTagInput("");
    setModalOpen(true);
  };

  const openPreview = (e: Event) => {
    setPreviewData(e);
    setPreviewOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editTarget ? prev.slug : generateSlug(value),
    }));
  };

  const handleSave = async () => {
    if (!form.title) {
      toast({ title: "Error", description: "Judul event diperlukan", variant: "destructive" });
      return;
    }
    if (!form.startDatetime) {
      toast({ title: "Error", description: "Tanggal & waktu mulai diperlukan", variant: "destructive" });
      return;
    }
    if (!form.locationName) {
      toast({ title: "Error", description: "Lokasi event diperlukan", variant: "destructive" });
      return;
    }
    if (!user?.userId) {
      toast({ title: "Error", description: "User tidak ditemukan", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      adminId: parseInt(user.userId),
      descriptionMd: form.descriptionMd,
      locationName: form.locationName,
      locationDetail: form.locationDetail,
      startDatetime: form.startDatetime,
      endDatetime: form.endDatetime || null,
      isAllDay: form.isAllDay,
      status: form.status,
      coverImageUrl: form.coverImageUrl,
      isFree: form.isFree,
      tags: form.tags,
    };

    try {
      if (editTarget) {
        const res = await api.put(`/admin/events/${editTarget.id}`, payload);
        if (res.data.success) {
          setEvents((prev) =>
            prev.map((e) => (e.id === editTarget.id ? res.data.data : e))
          );
          toast({ title: "Berhasil", description: "Event berhasil diperbarui" });
        } else {
          toast({ title: "Gagal", description: res.data.error || "Gagal memperbarui event", variant: "destructive" });
        }
      } else {
        const res = await api.post("/admin/events", payload);
        if (res.data.success) {
          setEvents((prev) => [...prev, res.data.data]);
          toast({ title: "Berhasil", description: "Event berhasil ditambahkan" });
        } else {
          toast({ title: "Gagal", description: res.data.error || "Gagal menambahkan event", variant: "destructive" });
        }
      }
      setModalOpen(false);
    } catch (error: unknown) {
      console.error("Failed to save event:", error);
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Gagal",
        description: err.response?.data?.error || "Terjadi kesalahan saat menyimpan event",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Berhasil", description: "Event berhasil dihapus" });
    } catch (error: unknown) {
      console.error("Failed to delete event:", error);
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Gagal",
        description: err.response?.data?.error || "Terjadi kesalahan saat menghapus event",
        variant: "destructive"
      });
    }
  };

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{events.length} event(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Acara
        </Button>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border">
          <TableSkeleton rows={4} cols={4} />
        </div>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Judul</Th>
              <Th>Kategori</Th>
              <Th>Tag</Th>
              <Th>Tanggal</Th>
              <Th>Lokasi</Th>
              <Th>Status</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  <EmptyState
                    icon={<CalendarDays className="w-6 h-6 text-accent-foreground" />}
                    title="Belum ada acara"
                    description="Klik 'Tambah Acara' untuk menjadwalkan acara masjid pertama Anda."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Tambah Acara</Button>}
                  />
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors group">
                  <Td className="font-medium">{e.title}</Td>
                  <Td>
                    {e.categoryName ? (
                      <Badge variant="outline" className="font-normal">
                        {e.categoryName}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </Td>
                  <Td>
                    {e.tags && e.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {e.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                        {e.tags.length > 2 && <span className="text-xs text-muted-foreground">+{e.tags.length - 2}</span>}
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </Td>
                  <Td className="text-muted-foreground tabular-nums text-sm">{formatDateTime(e.startDatetime)}</Td>
                  <Td>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />{e.locationName}
                    </span>
                  </Td>
                  <Td><Badge variant={e.status === "active" ? "active" : "draft"}>{e.status}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openPreview(e)} title="Pratinjau">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {canManageEvent(e, user) && (
                        <>
                          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(e)} title="Ubah">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ open: true, event: e })} title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}

      {events.length > 0 && (
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
        title={editTarget ? "Edit Acara" : "Tambah Acara Baru"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Update" : "Create"}
        loading={saving}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Event Title</Label>
            <Input id="ev-title" placeholder="e.g. Pengajian Rutin" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-start">Tanggal & Waktu Mulai</Label>
              <Input id="ev-start" type="datetime-local" value={form.startDatetime} onChange={(e) => setForm((p) => ({ ...p, startDatetime: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-end">Tanggal & Waktu Selesai</Label>
              <Input id="ev-end" type="datetime-local" value={form.endDatetime} onChange={(e) => setForm((p) => ({ ...p, endDatetime: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-category">Kategori</Label>
              <select
                id="ev-category"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-status">Status</Label>
              <select
                id="ev-status"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="draft">Draf</option>
                <option value="published">Dipublikasikan</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-location">Lokasi</Label>
            <Input id="ev-location" placeholder="e.g. Aula Utama" value={form.locationName} onChange={(e) => setForm((p) => ({ ...p, locationName: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <QuillEditor
              value={form.descriptionMd}
              onChange={(v) => setForm((p) => ({ ...p, descriptionMd: v }))}
              placeholder="Describe the event..."
              minHeight="150px"
            />
          </div>
          <TagInput
            id="ev-tags"
            label="Tag"
            placeholder="Ketik tag lalu tekan Enter..."
            value={form.tags}
            onChange={(tags) => setForm((p) => ({ ...p, tags }))}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            suggestions={filteredTagSuggestions}
          />
        </div>
      </ModalForm>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="event"
        data={previewData}
      />

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => !v && setDeleteConfirm({ open: false, event: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Event</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus event "{deleteConfirm.event?.title}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm.event && handleDelete(deleteConfirm.event.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
