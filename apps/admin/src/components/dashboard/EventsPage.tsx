
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton, TableWrapper, Th, Td, Badge, EmptyState } from "./shared";
import { ModalForm } from "./ModalForm";
import { PreviewDialog } from "./PreviewDialog";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface Event {
  id: number;
  title: string;
  slug: string;
  categoryId: number | null;
  adminId: number;
  descriptionMd?: any;
  locationName?: string;
  locationDetail?: string;
  startDatetime: any;
  endDatetime?: any;
  isAllDay: boolean;
  status: string;
  coverImageUrl?: string;
  isFree: boolean;
  tags: any[];
  createdAt: any;
  updatedAt: any;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const emptyForm: any = { title: "", slug: "", categoryId: "", descriptionMd: "", locationName: "", locationDetail: "", startDatetime: "", endDatetime: "", isAllDay: false, status: "upcoming", coverImageUrl: "", isFree: true, tags: "" };

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function EventsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/events", { params: { page, limit: 10 } });
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

  const handlePageChange = (page: number) => {
    fetchEvents(page);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
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
      status: e.status || "upcoming",
      coverImageUrl: e.coverImageUrl || "",
      isFree: e.isFree !== false,
      tags: e.tags?.join(", ") || "",
    });
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
    if (!form.title || !form.startDatetime || !form.locationName) return;

    const tagsArray = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      adminId: parseInt(user?.userId || "1"),
      descriptionMd: form.descriptionMd,
      locationName: form.locationName,
      locationDetail: form.locationDetail,
      startDatetime: new Date(form.startDatetime),
      endDatetime: form.endDatetime ? new Date(form.endDatetime) : null,
      isAllDay: form.isAllDay,
      status: form.status,
      coverImageUrl: form.coverImageUrl,
      isFree: form.isFree,
      tags: tagsArray,
    };

    try {
      if (editTarget) {
        const res = await api.put(`/events/${editTarget.id}`, payload);
        if (res.data.success) {
          setEvents((prev) =>
            prev.map((e) => (e.id === editTarget.id ? { ...e, ...payload } : e))
          );
        }
      } else {
        const res = await api.post("/events", payload);
        if (res.data.success) {
          setEvents((prev) => [...prev, res.data.data]);
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const formatDateTime = (dateStr: any) => {
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{events.length} event(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Event
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
              <Th>Title</Th>
              <Th>Date</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={<CalendarDays className="w-6 h-6 text-accent-foreground" />}
                    title="No events yet"
                    description="Click 'Add Event' to schedule your first mosque event."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Event</Button>}
                  />
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors group">
                  <Td className="font-medium">{e.title}</Td>
                  <Td className="text-muted-foreground tabular-nums text-sm">{formatDateTime(e.startDatetime)}</Td>
                  <Td>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />{e.locationName}
                    </span>
                  </Td>
                  <Td><Badge variant={e.status === "active" ? "active" : "draft"}>{e.status}</Badge></Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openPreview(e)} title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(e)} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => handleDelete(e.id)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
        title={editTarget ? "Edit Event" : "Add New Event"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Update" : "Create"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Event Title</Label>
            <Input id="ev-title" placeholder="e.g. Pengajian Rutin" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-start">Start Date & Time</Label>
              <Input id="ev-start" type="datetime-local" value={form.startDatetime} onChange={(e) => setForm((p) => ({ ...p, startDatetime: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-end">End Date & Time</Label>
              <Input id="ev-end" type="datetime-local" value={form.endDatetime} onChange={(e) => setForm((p) => ({ ...p, endDatetime: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-status">Status</Label>
              <select
                id="ev-status"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-location">Location</Label>
              <Input id="ev-location" placeholder="e.g. Aula Utama" value={form.locationName} onChange={(e) => setForm((p) => ({ ...p, locationName: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-description">Description (Markdown)</Label>
            <Textarea id="ev-description" placeholder="Describe the event..." rows={3} value={form.descriptionMd} onChange={(e) => setForm((p) => ({ ...p, descriptionMd: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-tags">Tags (comma separated)</Label>
            <Input id="ev-tags" placeholder="e.g. kajian, rutinitas" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
          </div>
        </div>
      </ModalForm>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="event"
        data={previewData}
      />
    </div>
  );
}
