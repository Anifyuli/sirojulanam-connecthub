
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Video, Youtube, Link2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton, TableWrapper, Th, Td, Badge, EmptyState } from "./shared";
import { ModalForm } from "./ModalForm";
import { PreviewDialog } from "./PreviewDialog";
import { Pagination } from "./Pagination";
import { TagInput } from "./TagInput";
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
import { useAuth, type AuthUser } from "@/context/AuthContext";
import api from "@/lib/api";

interface VideoItem {
  id: number;
  title: string;
  slug: string;
  categoryId: number | null;
  adminId: number;
  description?: string;
  sourceType: string;
  sourceUrl?: string;
  platformVideoId?: string;
  localFileUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string | null;
  viewCount?: number;
  tags: string[];
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

const typeIcon: Record<string, React.ReactNode> = {
  local: <Video className="w-3.5 h-3.5" />,
  youtube: <Youtube className="w-3.5 h-3.5" />,
  youtube_shorts: <Youtube className="w-3.5 h-3.5" />,
  tiktok: <Link2 className="w-3.5 h-3.5" />,
};

const typeLabels: Record<string, string> = {
  local: "Local",
  youtube: "YouTube",
  youtube_shorts: "YT Shorts",
  tiktok: "TikTok",
};

interface VideoForm {
  title: string;
  slug: string;
  categoryId: string;
  description: string;
  sourceType: string;
  sourceUrl: string;
  platformVideoId: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string;
  tags: string[];
}

const emptyForm: VideoForm = { title: "", slug: "", categoryId: "", description: "", sourceType: "youtube", sourceUrl: "", platformVideoId: "", isPublished: false, isFeatured: false, publishedAt: "", tags: [] };

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const canManageVideo = (video: VideoItem, user: AuthUser | null): boolean => {
  if (!user) return false;
  if (user.role === "manager") return true;
  return video.adminId === parseInt(user.userId);
};

export function VideoPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VideoItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<{ tag: string }[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<VideoItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; video: VideoItem | null }>({ open: false, video: null });

  useEffect(() => {
    fetchVideos();
    fetchCategories();
    fetchTagSuggestions();
  }, []);

  const fetchVideos = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/videos", { params: { page, limit: 10 } });
      setVideos(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/taxonomies/video/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTagSuggestions = async () => {
    try {
      const res = await api.get("/taxonomies/video/tags");
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
    fetchVideos(page);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setTagInput("");
    setModalOpen(true);
  };

  const openEdit = (v: VideoItem) => {
    setEditTarget(v);
    setForm({
      title: v.title,
      slug: v.slug,
      categoryId: v.categoryId?.toString() || "",
      description: v.description || "",
      sourceType: v.sourceType || "youtube",
      sourceUrl: v.sourceUrl || "",
      platformVideoId: v.platformVideoId || "",
      isPublished: v.isPublished || false,
      isFeatured: v.isFeatured || false,
      publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString().slice(0, 16) : "",
      tags: Array.isArray(v.tags) ? v.tags : [],
    });
    setTagInput("");
    setModalOpen(true);
  };

  const openPreview = (v: VideoItem) => {
    setPreviewData(v);
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
    if (!form.title) return;
    if (!user?.userId) {
      console.error("User not logged in");
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      adminId: parseInt(user.userId),
      description: form.description,
      sourceType: form.sourceType,
      sourceUrl: form.sourceUrl,
      platformVideoId: form.platformVideoId,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      publishedAt: form.publishedAt || null,
      tags: form.tags,
    };

    try {
      if (editTarget) {
        const res = await api.put(`/videos/${editTarget.id}`, payload);
        if (res.data.success) {
          setVideos((prev) =>
            prev.map((v) => (v.id === editTarget.id ? { ...v, ...payload } as unknown as VideoItem : v))
          );
        }
      } else {
        const res = await api.post("/videos", payload);
        if (res.data.success) {
          setVideos((prev) => [...prev, res.data.data]);
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save video:", error);
    }
  };

  const handleDelete = async () => {
    const video = deleteConfirm.video;
    if (!video) return;
    try {
      await api.delete(`/videos/${video.id}`);
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
      setDeleteConfirm({ open: false, video: null });
    } catch (error) {
      console.error("Failed to delete video:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{videos.length} video(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Video
        </Button>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border">
          <TableSkeleton rows={4} cols={3} />
        </div>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Judul</Th>
              <Th>Kategori</Th>
              <Th>Tipe</Th>
              <Th>Tag</Th>
              <Th>Status</Th>
              <Th>Dipublikasikan</Th>
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={<Video className="w-6 h-6 text-accent-foreground" />}
                    title="Belum ada video"
                    description="Unggah video atau tambahkan tautan YouTube / TikTok."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Tambah Video</Button>}
                  />
                </td>
              </tr>
            ) : (
              videos.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors group">
                  <Td className="font-medium">{v.title}</Td>
                  <Td>
                    {v.categoryId ? (
                      <Badge variant="outline">{categories.find(c => c.id === v.categoryId)?.name || "Category"}</Badge>
                    ) : <span className="text-muted-foreground">-</span>}
                  </Td>
                  <Td>
                    <Badge variant={v.sourceType === "local" ? "active" : "upcoming"}>
                      <span className="flex items-center gap-1">
                        {typeIcon[v.sourceType] || <Video className="w-3.5 h-3.5" />}
                        {typeLabels[v.sourceType] || v.sourceType}
                      </span>
                    </Badge>
                  </Td>
                  <Td>
                    {v.tags && v.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {v.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                        {v.tags.length > 2 && <span className="text-xs text-muted-foreground">+{v.tags.length - 2}</span>}
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
                  </Td>
                  <Td>
                    <Badge variant={v.isPublished ? "active" : "draft"}>
                      {v.isPublished ? "Dipublikasikan" : "Draf"}
                    </Badge>
                  </Td>
                  <Td className="text-muted-foreground tabular-nums">
                    {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString("id-ID") : "-"}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openPreview(v)} title="Pratinjau">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {canManageVideo(v, user) && (
                        <>
                          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(v)} title="Ubah">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ open: true, video: v })} title="Hapus">
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

      {videos.length > 0 && (
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
        title={editTarget ? "Edit Video" : "Tambah Video Baru"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Perbarui" : "Tambah"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vd-title">Judul</Label>
            <Input id="vd-title" placeholder="e.g. Ceramah Subuh" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vd-slug">Slug</Label>
            <Input id="vd-slug" placeholder="e.g. ceramah-subuh" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vd-type">Tipe Sumber</Label>
              <select
                id="vd-type"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.sourceType}
                onChange={(e) => setForm((p) => ({ ...p, sourceType: e.target.value }))}
              >
                <option value="youtube">YouTube</option>
                <option value="youtube_shorts">YouTube Shorts</option>
                <option value="tiktok">TikTok</option>
                <option value="local">Unggahan Lokal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vd-status">Status</Label>
              <select
                id="vd-status"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.isPublished ? "published" : "draft"}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.value === "published" }))}
              >
                <option value="draft">Draf</option>
                <option value="published">Dipublikasikan</option>
              </select>
            </div>
          </div>
          {form.sourceType !== "local" ? (
            <div className="space-y-1.5">
              <Label htmlFor="vd-url">URL Video</Label>
              <Input id="vd-url" placeholder="https://youtube.com/watch?v=..." value={form.sourceUrl} onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="vd-file">Berkas Video</Label>
              <Input id="vd-file" type="file" accept="video/*" className="cursor-pointer" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="vd-published">Tanggal Publikasi</Label>
            <Input id="vd-published" type="datetime-local" value={form.publishedAt} onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vd-description">Deskripsi</Label>
            <Textarea id="vd-description" placeholder="Brief description of the video..." rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vd-category">Kategori</Label>
            <select
              id="vd-category"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            >
              <option value="">Pilih kategori...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <TagInput
            id="vd-tags"
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
        type="video"
        data={previewData}
      />

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => !v && setDeleteConfirm({ open: false, video: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Video</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus video "{deleteConfirm.video?.title}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
