import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, BookOpen, Eye, X, Tag, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton, TableWrapper, Th, Td, Badge, EmptyState } from "./shared";
import { ModalForm } from "./ModalForm";
import { QuillEditor } from "./QuillEditor";
import { PreviewDialog } from "./PreviewDialog";
import { Pagination } from "./Pagination";
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

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  categoryId: number | null;
  adminId: number;
  excerpt: string;
  contentMd: string;
  coverImageUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: any;
  viewCount: number;
  metaTitle: string;
  metaDescription: string;
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

interface TagSuggestion {
  tag: string;
}

const emptyForm: any = { title: "", slug: "", categoryId: "", excerpt: "", contentMd: "", coverImageUrl: "", isPublished: false, isFeatured: false, publishedAt: "", metaTitle: "", metaDescription: "", tags: [] };

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const canManagePost = (post: BlogPost, user: AuthUser | null): boolean => {
  if (!user) return false;
  if (user.role === "manager") return true;
  return post.adminId === parseInt(user.userId);
};

export function BlogPage() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<BlogPost | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; post: BlogPost | null }>({ open: false, post: null });
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [importingUrl, setImportingUrl] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts(pagination.page);
    fetchCategories();
    fetchTagSuggestions();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/taxonomies/blog/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTagSuggestions = async () => {
    try {
      const res = await api.get("/taxonomies/blog/tags");
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

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/blogs", { params: { page, limit: 10 } });
      setPosts(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
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

  const openEdit = (p: BlogPost) => {
    setEditTarget(p);
    const tagsValue = Array.isArray(p.tags) ? p.tags : [];
    setForm({
      title: p.title,
      slug: p.slug,
      categoryId: p.categoryId?.toString() || "",
      excerpt: p.excerpt || "",
      contentMd: p.contentMd || "",
      coverImageUrl: p.coverImageUrl || "",
      isPublished: p.isPublished || false,
      isFeatured: p.isFeatured || false,
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 16) : "",
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
      tags: tagsValue,
    });
    setModalOpen(true);
  };

  const openPreview = (p: BlogPost) => {
    setPreviewData(p);
    setPreviewOpen(true);
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editTarget ? prev.slug : generateSlug(value),
    }));
  };



  const addTag = (tag: string) => {
    setForm((prev) => {
      if (!prev.tags.includes(tag)) {
        return { ...prev, tags: [...prev.tags, tag] };
      }
      return prev;
    });
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tagToRemove) }));
  };

  const handleSave = async () => {
    if (!form.title || !form.contentMd) return;

    // Flush tagInput yang belum di-Enter ke dalam array
    let tagsArray = [...(form.tags || [])];
    const pendingTag = tagInput.trim();
    if (pendingTag && !tagsArray.includes(pendingTag)) {
      tagsArray.push(pendingTag);
    }
    setTagInput(""); // bersihkan input setelah di-flush

    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      adminId: parseInt(user?.userId || "1"),
      excerpt: form.excerpt,
      contentMd: form.contentMd,
      coverImageUrl: form.coverImageUrl,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      publishedAt: form.publishedAt ? new Date(form.publishedAt) : null,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      tags: tagsArray,
    };

    try {
      if (editTarget) {
        const res = await api.put(`/admin/blogs/${editTarget.id}`, payload);
        setPosts((prev) =>
          prev.map((p) => (p.id === editTarget.id ? { ...p, ...res.data } : p))
        );
      } else {
        const res = await api.post("/admin/blogs", payload);
        setPosts((prev) => [...prev, res.data]);
      }
      setModalOpen(false);
      fetchPosts();
      fetchCategories();
    } catch (error) {
      console.error("Failed to save blog:", error);
    }
  };

  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan");
      return;
    }

    setUploadingThumbnail(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/admin/figure-images/upload", formData);
      setForm((prev) => ({ ...prev, coverImageUrl: res.data.data.url }));
    } catch (error) {
      console.error("Failed to upload thumbnail:", error);
      alert("Gagal mengunggah thumbnail");
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const handleImportThumbnailUrl = async () => {
    if (!urlInput.trim()) return;

    setImportingUrl(true);
    try {
      const res = await api.post("/admin/figure-images/import-url", {
        imageUrl: urlInput.trim(),
      });
      setForm((prev) => ({ ...prev, coverImageUrl: res.data.data.url }));
      setUrlInput("");
      setShowUrlInput(false);
    } catch (error) {
      console.error("Failed to import thumbnail:", error);
      alert("Gagal mengimpor thumbnail dari URL");
    } finally {
      setImportingUrl(false);
    }
  };

  const clearThumbnail = () => {
    setForm((prev) => ({ ...prev, coverImageUrl: "" }));
  };

  const handleDelete = async () => {
    const post = deleteConfirm.post;
    if (!post) return;
    try {
      await api.delete(`/admin/blogs/${post.id}`);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setDeleteConfirm({ open: false, post: null });
      fetchPosts();
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "-";
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || "-";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{posts.length} post(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Artikel
        </Button>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border">
          <TableSkeleton rows={4} cols={6} />
        </div>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <Th className="w-20">Thumbnail</Th>
              <Th className="w-auto">Judul</Th>
              <Th className="w-auto">Slug</Th>
              <Th className="w-auto">Tag</Th>
              <Th className="w-24">Published</Th>
              <Th className="w-20 text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  <EmptyState
                    icon={<BookOpen className="w-6 h-6 text-accent-foreground" />}
                    title="Belum ada artikel blog"
                    description="Klik 'Tambah Artikel' untuk menulis artikel pertama Anda."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Tambah Artikel</Button>}
                  />
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <Td>
                    {p.coverImageUrl ? (
                      <img
                        src={p.coverImageUrl}
                        alt={p.title}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </Td>
                  <Td className="font-medium">{p.title}</Td>
                  <Td className="text-muted-foreground text-sm">{p.slug}</Td>
                  <Td>
                    {Array.isArray(p.tags) && p.tags.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1 py-1">
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
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openPreview(p)} title="Pratinjau">
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
        title={editTarget ? "Edit Artikel" : "Tambah Artikel Baru"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Perbarui" : "Publikasikan"}
        wide
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bl-title">Judul</Label>
            <Input
              id="bl-title"
              placeholder="e.g. Keutamaan Bulan Ramadan"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bl-slug">Slug</Label>
            <Input
              id="bl-slug"
              placeholder="e.g. keutamaan-bulan-ramadan"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bl-category">Kategori</Label>
              <select
                id="bl-category"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bl-status">Status</Label>
              <select
                id="bl-status"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.isPublished ? "published" : "draft"}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.value === "published" }))}
              >
                <option value="draft">Draf</option>
                <option value="published">Dipublikasikan</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bl-published">Tanggal Publikasi</Label>
              <Input
                id="bl-published"
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bl-excerpt">Ringkasan (opsional)</Label>
            <Input
              id="bl-excerpt"
              placeholder="Brief summary of the article..."
              value={form.excerpt}
              onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Thumbnail</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="h-7 gap-1 text-xs"
                >
                  <Upload className="w-3 h-3" />
                  {uploadingThumbnail ? "Mengunggah..." : "Unggah"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="h-7 gap-1 text-xs"
                >
                  <Link className="w-3 h-3" />
                  {showUrlInput ? "Sembunyikan" : "URL"}
                </Button>
              </div>
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadThumbnail}
              className="hidden"
            />

            {form.coverImageUrl && (
              <div className="relative mt-2 rounded-lg border overflow-hidden">
                <img
                  src={form.coverImageUrl}
                  alt="Thumbnail"
                  className="w-full max-h-48 object-contain bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23666' font-size='12'%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E";
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6"
                  onClick={clearThumbnail}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            {showUrlInput && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Tempel URL gambar (https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImportThumbnailUrl()}
                />
                <Button
                  type="button"
                  onClick={handleImportThumbnailUrl}
                  disabled={importingUrl || !urlInput.trim()}
                >
                  {importingUrl ? "..." : "Import"}
                </Button>
              </div>
            )}

            {!form.coverImageUrl && !showUrlInput && (
              <p className="text-xs text-muted-foreground mt-1">
                Klik "Unggah" untuk upload dari komputer atau "URL" untuk paste link gambar
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Konten</Label>
            <QuillEditor
              value={form.contentMd}
              onChange={(v) => setForm((p) => ({ ...p, contentMd: v }))}
              placeholder="Write your article content in Markdown..."
              minHeight="250px"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bl-tags">Tag</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="bl-tags"
                  placeholder="Ketik tag lalu tekan Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                />
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-background shadow-md">
                    {filteredTagSuggestions.slice(0, 5).map((suggestion) => (
                      <div
                        key={suggestion.tag}
                        className="cursor-pointer px-3 py-2 hover:bg-muted"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addTag(suggestion.tag);
                        }}
                      >
                        {suggestion.tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {form.tags && form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </ModalForm>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        type="blog"
        data={previewData}
      />

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => !v && setDeleteConfirm({ open: false, post: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Post</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus post "{deleteConfirm.post?.title}"? Tindakan ini tidak dapat dibatalkan.
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
