import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, User, Eye, Upload, X, Link } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface Figure {
  id: number;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  birthYear: string;
  deathYear: string;
  isPublished: boolean;
  isFeatured: boolean;
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

interface TagSuggestion {
  tag: string;
}

const DEFAULT_FIGURE_CATEGORY_ID = 1; // Kategori fix untuk figures

const emptyForm = {
  name: "",
  title: "",
  bio: "",
  imageUrl: "",
  birthYear: "",
  deathYear: "",
  isPublished: false,
  isFeatured: false,
  tags: [] as string[],
};

export function FigurePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Figure | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; figure: Figure | null }>({ open: false, figure: null });
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Figure | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [importingUrl, setImportingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFigures(1);
    fetchTagSuggestions();
  }, []);

  const fetchTagSuggestions = async () => {
    try {
      const res = await api.get("/admin/figures/tags");
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

  const fetchFigures = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/figures", { params: { page, limit: 10 } });
      setFigures(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch figures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchFigures(page);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (f: Figure) => {
    setEditTarget(f);
    setForm({
      name: f.name || "",
      title: f.title || "",
      bio: f.bio || "",
      imageUrl: f.imageUrl || "",
      birthYear: f.birthYear || "",
      deathYear: f.deathYear || "",
      isPublished: f.isPublished,
      isFeatured: f.isFeatured,
      tags: f.tags || [],
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
    if (!form.name) return;

    const payload = {
      name: form.name,
      title: form.title,
      bio: form.bio,
      imageUrl: form.imageUrl,
      birthYear: form.birthYear || null,
      deathYear: form.deathYear || null,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      tags: form.tags,
      adminId: parseInt(user?.userId || "1"),
    };

    try {
      if (editTarget) {
        const res = await api.put(`/admin/figures/${editTarget.id}`, payload);
        setFigures((prev) =>
          prev.map((f) => (f.id === editTarget.id ? { ...f, ...res.data } : f))
        );
      } else {
        const res = await api.post("/admin/figures", payload);
        setFigures((prev) => [res.data, ...prev]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save figure:", error);
    }
  };

  const handleDelete = async () => {
    const figure = deleteConfirm.figure;
    if (!figure) return;
    try {
      await api.delete(`/admin/figures/${figure.id}`);
      setFigures((prev) => prev.filter((f) => f.id !== figure.id));
      setDeleteConfirm({ open: false, figure: null });
    } catch (error) {
      console.error("Failed to delete figure:", error);
    }
  };

  const getLifespan = (figure: Figure) => {
    if (figure.birthYear || figure.deathYear) {
      return `${figure.birthYear || "?"} - ${figure.deathYear || "Sekarang"}`;
    }
    return "-";
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/admin/figure-images/upload", formData);
      setForm((prev) => ({ ...prev, imageUrl: res.data.data.url }));
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Gagal mengunggah gambar");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImportUrl = async () => {
    if (!urlInput.trim()) return;

    setImportingUrl(true);
    try {
      const res = await api.post("/admin/figure-images/import-url", {
        imageUrl: urlInput.trim(),
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.data.url }));
      setUrlInput("");
      setShowUrlInput(false);
    } catch (error) {
      console.error("Failed to import image:", error);
      alert("Gagal mengimpor gambar dari URL");
    } finally {
      setImportingUrl(false);
    }
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{figures.length} tokoh(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Tokoh
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
              <Th className="w-auto">Nama</Th>
              <Th className="w-auto">Judul</Th>
              <Th className="w-24">Lahir - Wafat</Th>
              <Th className="w-auto">Tag</Th>
              <Th className="w-24">Featured</Th>
              <Th className="w-24">Status</Th>
              <Th className="w-20 text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {figures.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  <EmptyState
                    icon={<User className="w-6 h-6 text-accent-foreground" />}
                    title="Belum ada tokoh"
                    description="Klik 'Tambah Tokoh' untuk menambahkan tokoh pertama Anda."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Tambah Tokoh</Button>}
                  />
                </td>
              </tr>
            ) : (
              figures.map((f) => (
                <tr key={f.id} className="hover:bg-muted/30 transition-colors group">
                  <Td className="font-medium">{f.name}</Td>
                  <Td className="text-muted-foreground text-sm">{f.title || "-"}</Td>
                  <Td className="text-sm">{getLifespan(f)}</Td>
                  <Td>
                    {f.tags && f.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {f.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                        {f.tags.length > 2 && <span className="text-xs text-muted-foreground">+{f.tags.length - 2}</span>}
                      </div>
                    ) : "-"}
                  </Td>
                  <Td>
                    <Badge variant={f.isFeatured === true ? "active" : "draft"}>
                      {f.isFeatured === true ? "Ya" : "Tidak"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge variant={f.isPublished === true ? "active" : "draft"}>
                      {f.isPublished === true ? "Dipublikasikan" : "Draf"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setPreviewData(f); setPreviewOpen(true); }} title="Pratinjau">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(f)} title="Ubah">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ open: true, figure: f })} title="Hapus">
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

      {figures.length > 0 && (
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
        title={editTarget ? "Edit Tokoh" : "Tambah Tokoh Baru"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Perbarui" : "Publikasikan"}
        wide
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="figure-name">Nama</Label>
              <Input
                id="figure-name"
                placeholder="e.g. Mahatma Gandhi"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="figure-title">Judul / Profesi</Label>
              <Input
                id="figure-title"
                placeholder="e.g. Pemimpin Nasional India"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="figure-birth">Tahun Lahir</Label>
              <Input
                id="figure-birth"
                placeholder="e.g. 1869"
                value={form.birthYear}
                onChange={(e) => setForm((p) => ({ ...p, birthYear: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="figure-death">Tahun Wafat</Label>
              <Input
                id="figure-death"
                placeholder="e.g. 1948 (kosongkan jika masih hidup)"
                value={form.deathYear}
                onChange={(e) => setForm((p) => ({ ...p, deathYear: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="figure-image">Gambar Tokoh</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="h-7 gap-1 text-xs"
                >
                  <Upload className="w-3 h-3" />
                  {uploadingImage ? "Mengunggah..." : "Unggah"}
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />

            {form.imageUrl && (
              <div className="relative mt-2 rounded-lg border overflow-hidden">
                <img
                  src={form.imageUrl}
                  alt="Preview"
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
                  onClick={clearImage}
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
                  onKeyDown={(e) => e.key === "Enter" && handleImportUrl()}
                />
                <Button
                  type="button"
                  onClick={handleImportUrl}
                  disabled={importingUrl || !urlInput.trim()}
                >
                  {importingUrl ? "..." : "Import"}
                </Button>
              </div>
            )}

            {!form.imageUrl && !showUrlInput && (
              <p className="text-xs text-muted-foreground mt-1">
                Klik "Unggah" untuk upload dari komputer atau "Dari URL" untuk paste link gambar
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="figure-bio">Biografi</Label>
            <QuillEditor
              value={form.bio}
              onChange={(html) => setForm((p) => ({ ...p, bio: html }))}
              placeholder="Tulis biografi singkat tokoh ini..."
              minHeight="150px"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="figure-tags">Tag</Label>
            <div className="relative flex gap-2">
              <Input
                id="figure-tags"
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
              <Label htmlFor="figure-status">Status</Label>
              <select
                id="figure-status"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.isPublished ? "published" : "draft"}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.value === "published" }))}
              >
                <option value="draft">Draf</option>
                <option value="published">Dipublikasikan</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="figure-featured"
              checked={form.isFeatured}
              onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
              className="rounded border-input"
            />
            <Label htmlFor="figure-featured" className="font-normal">Jadikan tokoh featured</Label>
          </div>
        </div>
      </ModalForm>

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => !v && setDeleteConfirm({ open: false, figure: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tokoh</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tokoh "{deleteConfirm.figure?.name}"? Tindakan ini tidak dapat dibatalkan.
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
        type="figure"
        data={previewData}
      />
    </div>
  );
}