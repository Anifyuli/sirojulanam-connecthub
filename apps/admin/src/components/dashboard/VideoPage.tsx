
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
import { useAuth } from "@/context/AuthContext";
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
  publishedAt?: any;
  viewCount?: number;
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

const emptyForm: any = { title: "", slug: "", categoryId: "", description: "", sourceType: "youtube" as const, sourceUrl: "", platformVideoId: "", thumbnailUrl: "", isPublished: false, isFeatured: false, publishedAt: "", tags: "" };

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function VideoPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VideoItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/videos", { params: { page, limit: 10 } });
      if (res.data.success) {
        setVideos(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchVideos(page);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
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
      thumbnailUrl: v.thumbnailUrl || "",
      isPublished: v.isPublished || false,
      isFeatured: v.isFeatured || false,
      publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString().slice(0, 16) : "",
      tags: v.tags?.join(", ") || "",
    });
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

    const tagsArray = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      adminId: parseInt(user?.userId || "1"),
      description: form.description,
      sourceType: form.sourceType,
      sourceUrl: form.sourceUrl,
      platformVideoId: form.platformVideoId,
      thumbnailUrl: form.thumbnailUrl,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      publishedAt: form.publishedAt ? new Date(form.publishedAt) : null,
      tags: tagsArray,
    };

    try {
      if (editTarget) {
        const res = await api.put(`/videos/${editTarget.id}`, payload);
        if (res.data.success) {
          setVideos((prev) =>
            prev.map((v) => (v.id === editTarget.id ? { ...v, ...payload } : v))
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

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error("Failed to delete video:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{videos.length} video(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Video
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
              <Th>Title</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Published</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={<Video className="w-6 h-6 text-accent-foreground" />}
                    title="No videos yet"
                    description="Upload a video or add a YouTube / TikTok link."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Video</Button>}
                  />
                </td>
              </tr>
            ) : (
              videos.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors group">
                  <Td className="font-medium">{v.title}</Td>
                  <Td>
                    <Badge variant={v.sourceType === "local" ? "active" : "upcoming"}>
                      <span className="flex items-center gap-1">
                        {typeIcon[v.sourceType] || <Video className="w-3.5 h-3.5" />}
                        {typeLabels[v.sourceType] || v.sourceType}
                      </span>
                    </Badge>
                  </Td>
                  <Td>
                    <Badge variant={v.isPublished ? "active" : "draft"}>
                      {v.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </Td>
                  <Td className="text-muted-foreground tabular-nums">
                    {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString("id-ID") : "-"}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openPreview(v)} title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(v)} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => handleDelete(v.id)} title="Delete">
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
        title={editTarget ? "Edit Video" : "Add New Video"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Update" : "Add"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vd-title">Title</Label>
            <Input id="vd-title" placeholder="e.g. Ceramah Subuh" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vd-slug">Slug</Label>
            <Input id="vd-slug" placeholder="e.g. ceramah-subuh" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vd-type">Source Type</Label>
              <select
                id="vd-type"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.sourceType}
                onChange={(e) => setForm((p) => ({ ...p, sourceType: e.target.value as any }))}
              >
                <option value="youtube">YouTube</option>
                <option value="youtube_shorts">YouTube Shorts</option>
                <option value="tiktok">TikTok</option>
                <option value="local">Local Upload</option>
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
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          {form.sourceType !== "local" ? (
            <div className="space-y-1.5">
              <Label htmlFor="vd-url">Video URL</Label>
              <Input id="vd-url" placeholder="https://youtube.com/watch?v=..." value={form.sourceUrl} onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="vd-file">Video File</Label>
              <Input id="vd-file" type="file" accept="video/*" className="cursor-pointer" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="vd-thumbnail">Thumbnail URL</Label>
            <Input id="vd-thumbnail" placeholder="https://..." value={form.thumbnailUrl} onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vd-published">Publish Date</Label>
            <Input id="vd-published" type="datetime-local" value={form.publishedAt} onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vd-description">Description</Label>
            <Textarea id="vd-description" placeholder="Brief description of the video..." rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vd-tags">Tags (comma separated)</Label>
            <Input id="vd-tags" placeholder="e.g. ceramah, kajian" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
          </div>
        </div>
      </ModalForm>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="video"
        data={previewData}
      />
    </div>
  );
}
