import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton, TableWrapper, Th, Td, Badge, EmptyState } from "./shared";
import { ModalForm } from "./ModalForm";
import { QuillEditor } from "./QuillEditor";
import { Pagination } from "./Pagination";
import { PreviewDialog } from "./PreviewDialog";
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

interface Post {
  id: number;
  type: "opinion";
  title: string;
  content: string;
  isPublished: boolean;
  viewCount: number;
  reactions: { reactionType: string; count: number }[];
  reactionCount: number;
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

const emptyForm: {
  type: "opinion";
  title: string;
  content: string;
  isPublished: boolean;
  tags: string[];
} = {
  type: "opinion",
  title: "",
  content: "",
  isPublished: false,
  tags: [],
};

const canManagePost = (post: Post, user: AuthUser | null): boolean => {
  if (!user) return false;
  if (user.role === "manager") return true;
  return true;
};

export function PostPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; post: Post | null }>({ open: false, post: null });
  const [tagInput, setTagInput] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/posts", { params: { page, limit: 10 } });
      setPosts(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Post) => {
    setEditTarget(p);
    setForm({
      type: "opinion",
      title: p.title || "",
      content: p.content || "",
      isPublished: p.isPublished,
      tags: p.tags || [],
    });
    setModalOpen(true);
  };

  const addTag = (tag: string) => {
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const handleSave = async () => {
    if (!form.content || !form.title) return;

    const payload = {
      type: "opinion",
      title: form.title,
      content: form.content,
      isPublished: form.isPublished,
      tags: form.tags,
      adminId: parseInt(user?.userId || "1"),
    };

    try {
      if (editTarget) {
        const res = await api.put(`/admin/posts/${editTarget.id}`, payload);
        setPosts((prev) =>
          prev.map((p) => (p.id === editTarget.id ? { ...p, ...res.data } : p))
        );
      } else {
        const res = await api.post("/admin/posts", payload);
        setPosts((prev) => [res.data, ...prev]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handleDelete = async () => {
    const post = deleteConfirm.post;
    if (!post) return;
    try {
      await api.delete(`/admin/posts/${post.id}`);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setDeleteConfirm({ open: false, post: null });
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{posts.length} opini(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Opini
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
              <Th className="w-auto">Judul</Th>
              <Th className="w-auto">Konten</Th>
              <Th className="w-auto">Tag</Th>
              <Th className="w-auto">Status</Th>
              <Th className="w-auto text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  <EmptyState
                    icon={<MessageSquare className="w-6 h-6 text-accent-foreground" />}
                    title="Belum ada opini"
                    description="Klik 'Tambah Opini' untuk menulis opini pertama Anda."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Tambah Opini</Button>}
                  />
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <Td className="font-medium max-w-xs">
                    <p className="truncate">{p.title || "-"}</p>
                  </Td>
                  <Td className="max-w-xs">
                    <p className="truncate text-sm">{stripHtml(p.content)}</p>
                  </Td>
                  <Td>
                    {p.tags && p.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                        {p.tags.length > 2 && <span className="text-xs text-muted-foreground">+{p.tags.length - 2}</span>}
                      </div>
                    ) : "-"}
                  </Td>
                  <Td>
                    <Badge variant={p.isPublished === true ? "active" : "draft"}>
                      {p.isPublished === true ? "Dipublikasikan" : "Draf"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setPreviewData(p); setPreviewOpen(true); }} title="Pratinjau">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {canManagePost(p, user) && (
                        <>
                          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(p)} title="Ubah">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ open: true, post: p })} title="Hapus">
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

      {posts.length > 0 && (
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
        title={editTarget ? "Edit Opini" : "Tambah Opini Baru"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Perbarui" : "Publikasikan"}
        wide
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="post-title">Judul Opini</Label>
            <Input
              id="post-title"
              placeholder="e.g. Pentingnya Menjaga Silaturahmi"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <div className="h-9 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
              Opini (Auto-selected)
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-content">Konten</Label>
            <QuillEditor
              value={form.content}
              onChange={(html) => setForm((p) => ({ ...p, content: html }))}
              placeholder="Tulis opini Anda di sini..."
              minHeight="200px"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-tags">Tag</Label>
            <div className="flex gap-2">
              <Input
                id="post-tags"
                placeholder="Ketik tag lalu tekan Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="post-status">Status</Label>
              <select
                id="post-status"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.isPublished ? "published" : "draft"}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.value === "published" }))}
              >
                <option value="draft">Draf</option>
                <option value="published">Dipublikasikan</option>
              </select>
            </div>
          </div>
        </div>
      </ModalForm>

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => !v && setDeleteConfirm({ open: false, post: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Post</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus post ini? Tindakan ini tidak dapat dibatalkan.
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

      <PreviewDialog
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setPreviewData(null); }}
        type="post"
        data={previewData}
      />
    </div>
  );
}