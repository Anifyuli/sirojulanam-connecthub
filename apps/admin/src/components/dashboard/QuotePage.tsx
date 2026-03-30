import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Quote, Eye } from "lucide-react";
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

interface Quote {
  id: number;
  categoryId: number | null;
  title: string;
  content: string;
  source: string;
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

const DEFAULT_QUOTE_CATEGORY_ID = 1; // Kategori fix untuk quotes

const emptyForm = {
  categoryId: DEFAULT_QUOTE_CATEGORY_ID,
  title: "",
  content: "",
  source: "",
  isPublished: false,
  isFeatured: false,
  tags: [] as string[],
};

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function QuotePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Quote | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; quote: Quote | null }>({ open: false, quote: null });
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Quote | null>(null);

  useEffect(() => {
    fetchQuotes(1);
    fetchTagSuggestions();
  }, []);

  const fetchTagSuggestions = async () => {
    try {
      const res = await api.get("/admin/quotes/tags");
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

  const fetchQuotes = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/quotes", { params: { page, limit: 10 } });
      setQuotes(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchQuotes(page);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (q: Quote) => {
    setEditTarget(q);
    setForm({
      categoryId: q.categoryId || DEFAULT_QUOTE_CATEGORY_ID,
      title: q.title || "",
      content: q.content || "",
      source: q.source || "",
      isPublished: q.isPublished,
      isFeatured: q.isFeatured,
      tags: q.tags || [],
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
      categoryId: DEFAULT_QUOTE_CATEGORY_ID,
      title: form.title,
      content: form.content,
      source: form.source,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      tags: form.tags,
      adminId: parseInt(user?.userId || "1"),
    };

    try {
      if (editTarget) {
        const res = await api.put(`/admin/quotes/${editTarget.id}`, payload);
        setQuotes((prev) =>
          prev.map((q) => (q.id === editTarget.id ? { ...q, ...res.data } : q))
        );
      } else {
        const res = await api.post("/admin/quotes", payload);
        setQuotes((prev) => [res.data, ...prev]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to save quote:", error);
    }
  };

  const handleDelete = async () => {
    const quote = deleteConfirm.quote;
    if (!quote) return;
    try {
      await api.delete(`/admin/quotes/${quote.id}`);
      setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
      setDeleteConfirm({ open: false, quote: null });
    } catch (error) {
      console.error("Failed to delete quote:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{quotes.length} kutipan(s) total</p>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Kutipan
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
              <Th className="w-auto">Kutipan</Th>
              <Th className="w-auto">Sumber</Th>
              <Th className="w-auto">Kategori</Th>
              <Th className="w-auto">Tag</Th>
              <Th className="w-24">Featured</Th>
              <Th className="w-24">Status</Th>
              <Th className="w-20 text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  <EmptyState
                    icon={<Quote className="w-6 h-6 text-accent-foreground" />}
                    title="Belum ada kutipan"
                    description="Klik 'Tambah Kutipan' untuk menambahkan kutipan pertama Anda."
                    action={<Button size="sm" onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Tambah Kutipan</Button>}
                  />
                </td>
              </tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="hover:bg-muted/30 transition-colors group">
                  <Td className="font-medium max-w-xs">
                    <p className="truncate">{q.title || "-"}</p>
                  </Td>
                  <Td className="max-w-xs">
                    <p className="truncate text-sm">{stripHtml(q.content)}</p>
                  </Td>
                  <Td className="text-muted-foreground text-sm">{q.source || "-"}</Td>
                  <Td>
                    <Badge variant="active">Quote</Badge>
                  </Td>
                  <Td>
                    {q.tags && q.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {q.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                        {q.tags.length > 2 && <span className="text-xs text-muted-foreground">+{q.tags.length - 2}</span>}
                      </div>
                    ) : "-"}
                  </Td>
                  <Td>
                    <Badge variant={q.isFeatured === true ? "active" : "draft"}>
                      {q.isFeatured === true ? "Ya" : "Tidak"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge variant={q.isPublished === true ? "active" : "draft"}>
                      {q.isPublished === true ? "Dipublikasikan" : "Draf"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setPreviewData(q); setPreviewOpen(true); }} title="Pratinjau">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEdit(q)} title="Ubah">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ open: true, quote: q })} title="Hapus">
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

      {quotes.length > 0 && (
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
        title={editTarget ? "Edit Kutipan" : "Tambah Kutipan Baru"}
        onSubmit={handleSave}
        submitLabel={editTarget ? "Perbarui" : "Publikasikan"}
        wide
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="quote-title">Judul Kutipan</Label>
            <Input
              id="quote-title"
              placeholder="e.g. Kutipan Tentang Kepemimpinan"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <div className="h-9 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
              Quote (Auto-selected)
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Kutipan</Label>
            <QuillEditor
              value={form.content}
              onChange={(html) => setForm((p) => ({ ...p, content: html }))}
              placeholder="Tulis kutipan inspiratif di sini..."
              minHeight="150px"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-source">Sumber / Tokoh</Label>
            <Input
              id="quote-source"
              placeholder="e.g. Barack Obama, Albert Einstein"
              value={form.source}
              onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quote-status">Status</Label>
              <select
                id="quote-status"
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
              id="quote-featured"
              checked={form.isFeatured}
              onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
              className="rounded border-input"
            />
            <Label htmlFor="quote-featured" className="font-normal">Jadikan kutipan featured</Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-tags">Tag</Label>
            <div className="relative flex gap-2">
              <Input
                id="quote-tags"
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
        </div>
      </ModalForm>

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => !v && setDeleteConfirm({ open: false, quote: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kutipan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kutipan ini? Tindakan ini tidak dapat dibatalkan.
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
        type="quote"
        data={previewData}
      />
    </div>
  );
}