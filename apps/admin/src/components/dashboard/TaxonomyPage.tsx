
import { useState, useEffect } from "react";
import {
  TableWrapper,
  Th,
  Td,
  TableSkeleton,
  EmptyState,
} from "./shared";
import { ModalForm } from "./ModalForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FolderOpen,
  Tags,
  CalendarDays,
  BookOpen,
  Video,
} from "lucide-react";
import api from "@/lib/api";
import {
  mockEventCategories,
  mockBlogCategories,
  mockVideoCategories,
  mockEventTags,
  mockBlogTags,
  mockVideoTags,
  type Category,
  type Tag,
} from "@/data/mock";

type ContentType = "event" | "blog" | "video";
type TaxonomyType = "category" | "tag";

export function TaxonomyPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContentType>("event");
  const [taxonomyType, setTaxonomyType] = useState<TaxonomyType>("category");

  const [eventCategories, setEventCategories] = useState<Category[]>([]);
  const [blogCategories, setBlogCategories] = useState<Category[]>([]);
  const [videoCategories, setVideoCategories] = useState<Category[]>([]);
  const [eventTags, setEventTags] = useState<Tag[]>([]);
  const [blogTags, setBlogTags] = useState<Tag[]>([]);
  const [videoTags, setVideoTags] = useState<Tag[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [colorHex, setColorHex] = useState("#10B981");
  const [tagName, setTagName] = useState("");

  useEffect(() => {
    async function fetchTaxonomies() {
      try {
        const [eventCats, blogCats, videoCats, eventTags, blogTags, videoTags] = await Promise.all([
          api.get("/taxonomies/event/categories").then((r) => r.data),
          api.get("/taxonomies/blog/categories").then((r) => r.data),
          api.get("/taxonomies/video/categories").then((r) => r.data),
          api.get("/taxonomies/event/tags").then((r) => r.data),
          api.get("/taxonomies/blog/tags").then((r) => r.data),
          api.get("/taxonomies/video/tags").then((r) => r.data),
        ]);

        setEventCategories(eventCats);
        setBlogCategories(blogCats);
        setVideoCategories(videoCats);
        setEventTags(eventTags);
        setBlogTags(blogTags);
        setVideoTags(videoTags);
      } catch (error) {
        console.error("Error fetching taxonomies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTaxonomies();
  }, []);

  function getCurrentCategories(): Category[] {
    switch (activeTab) {
      case "event":
        return eventCategories;
      case "blog":
        return blogCategories;
      case "video":
        return videoCategories;
    }
  }

  function getCurrentTags(): Tag[] {
    switch (activeTab) {
      case "event":
        return eventTags;
      case "blog":
        return blogTags;
      case "video":
        return videoTags;
    }
  }

  function setCurrentCategories(categories: Category[]) {
    switch (activeTab) {
      case "event":
        setEventCategories(categories);
        break;
      case "blog":
        setBlogCategories(categories);
        break;
      case "video":
        setVideoCategories(categories);
        break;
    }
  }

  function setCurrentTags(tags: Tag[]) {
    switch (activeTab) {
      case "event":
        setEventTags(tags);
        break;
      case "blog":
        setBlogTags(tags);
        break;
      case "video":
        setVideoTags(tags);
        break;
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function openAddCategory() {
    setEditCategory(null);
    setName("");
    setSlug("");
    setColorHex("#10B981");
    setTaxonomyType("category");
    setModalOpen(true);
  }

  function openEditCategory(cat: Category) {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setColorHex(cat.color_hex || "#10B981");
    setTaxonomyType("category");
    setModalOpen(true);
  }

  function openAddTag() {
    setEditTag(null);
    setTagName("");
    setTaxonomyType("tag");
    setModalOpen(true);
  }

  function openEditTag(tag: Tag) {
    setEditTag(tag);
    setTagName(tag.tag);
    setTaxonomyType("tag");
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (taxonomyType === "category") {
        const categories = getCurrentCategories();
        if (editCategory) {
          console.log("Updating category:", `/taxonomies/${activeTab}/categories/${editCategory.id}`, { name, slug, colorHex });
          const res = await api.put(`/taxonomies/${activeTab}/categories/${editCategory.id}`, {
            name,
            slug,
            colorHex,
          });
          console.log("Update response:", res.data);
          setCurrentCategories(
            categories.map((c) =>
              c.id === editCategory.id
                ? { ...c, name, slug, color_hex: colorHex }
                : c
            )
          );
        } else {
          console.log("Creating category:", `/taxonomies/${activeTab}/categories`, { name, slug: slug || generateSlug(name), colorHex });
          const res = await api.post(`/taxonomies/${activeTab}/categories`, {
            name,
            slug: slug || generateSlug(name),
            colorHex,
          });
          console.log("Create response:", res.data);
          const newCat: Category = {
            id: res.data.id,
            name,
            slug: slug || generateSlug(name),
            color_hex: colorHex,
            item_count: 0,
            type: activeTab,
          };
          setCurrentCategories([...categories, newCat]);
        }
      } else {
        const tags = getCurrentTags();
        if (editTag) {
          // Tags are unique by name, can't really rename - just delete old and add new
          await api.delete(`/taxonomies/${activeTab}/tags/${encodeURIComponent(editTag.tag)}`);
          setCurrentTags(
            tags.map((t) =>
              t.tag === editTag.tag ? { ...t, tag: tagName } : t
            )
          );
        } else {
          // Create new tag via API
          const res = await api.post(`/taxonomies/${activeTab}/tags`, {
            tag: tagName,
          });
          const newTag: Tag = {
            tag: tagName,
            count: 0,
            type: activeTab,
          };
          setCurrentTags([...tags, newTag]);
        }
      }
    } catch (error) {
      console.error("Error saving taxonomy:", error);
      alert("Gagal menyimpan data");
      return;
    }
    setModalOpen(false);
  }

  async function handleDeleteCategory() {
    if (deleteCategory) {
      try {
        await api.delete(`/taxonomies/${activeTab}/categories/${deleteCategory.id}`);
        setCurrentCategories(
          getCurrentCategories().filter((c) => c.id !== deleteCategory.id)
        );
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Gagal menghapus kategori");
      }
      setDeleteCategory(null);
    }
  }

  async function handleDeleteTag() {
    if (deleteTag) {
      try {
        await api.delete(`/taxonomies/${activeTab}/tags/${encodeURIComponent(deleteTag.tag)}`);
        setCurrentTags(getCurrentTags().filter((t) => t.tag !== deleteTag.tag));
      } catch (error) {
        console.error("Error deleting tag:", error);
        alert("Gagal menghapus tag");
      }
      setDeleteTag(null);
    }
  }

  const contentTypeIcon = {
    event: CalendarDays,
    blog: BookOpen,
    video: Video,
  };

  const contentTypeLabel = {
    event: "Event",
    blog: "Blog",
    video: "Video",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight text-balance">
          Tags & Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola kategori dan tag untuk event, blog, dan video
        </p>
      </div>

      {/* Content Type Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)} className="mb-6">
        <TabsList className="bg-muted/50 p-1">
          {(["event", "blog", "video"] as ContentType[]).map((type) => {
            const Icon = contentTypeIcon[type];
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <Icon className="w-4 h-4" />
                {contentTypeLabel[type]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(["event", "blog", "video"] as ContentType[]).map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            {/* Categories Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Kategori {contentTypeLabel[type]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getCurrentCategories().length} kategori
                    </p>
                  </div>
                </div>
                <Button onClick={openAddCategory} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Tambah Kategori
                </Button>
              </div>

              {loading ? (
                <TableSkeleton rows={3} cols={4} />
              ) : getCurrentCategories().length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="w-6 h-6 text-accent-foreground" />}
                  title="Belum ada kategori"
                  description={`Tambahkan kategori untuk mengorganisir ${contentTypeLabel[type].toLowerCase()}.`}
                  action={
                    <Button onClick={openAddCategory} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Tambah Kategori
                    </Button>
                  }
                />
              ) : (
                <TableWrapper>
                  <thead>
                    <tr className="border-b border-border">
                      <Th className="w-auto">Nama</Th>
                      <Th className="w-auto">Slug</Th>
                      <Th className="w-32">Warna</Th>
                      <Th className="w-20">Jumlah</Th>
                      <Th className="w-16 text-right">Aksi</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentCategories().map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                          <Td className="font-medium">{cat.name}</Td>
                          <Td className="text-muted-foreground font-mono text-sm">
                            {cat.slug}
                          </Td>
                          <Td>
                            {cat.color_hex ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-5 h-5 rounded-md border border-border"
                                  style={{ backgroundColor: cat.color_hex }}
                                />
                                <span className="font-mono text-sm text-muted-foreground">
                                  {cat.color_hex}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </Td>
                          <Td className="tabular-nums">{cat.item_count}</Td>
                          <Td className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditCategory(cat)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteCategory(cat)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                </TableWrapper>
              )}
            </div>

            {/* Tags Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <Tags className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Tag {contentTypeLabel[type]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getCurrentTags().length} tag
                    </p>
                  </div>
                </div>
                <Button onClick={openAddTag} size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Tambah Tag
                </Button>
              </div>

              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-24 rounded-full skeleton-shimmer" />
                  ))}
                </div>
              ) : getCurrentTags().length === 0 ? (
                <EmptyState
                  icon={<Tags className="w-6 h-6 text-accent-foreground" />}
                  title="Belum ada tag"
                  description={`Tambahkan tag untuk memudahkan pencarian ${contentTypeLabel[type].toLowerCase()}.`}
                  action={
                    <Button onClick={openAddTag} size="sm" variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Tambah Tag
                    </Button>
                  }
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {getCurrentTags().map((tag) => (
                    <div
                      key={tag.tag}
                      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">
                        #{tag.tag}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        ({tag.count})
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-background">
                            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditTag(tag)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTag(tag)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Modal */}
      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          taxonomyType === "category"
            ? editCategory
              ? "Edit Kategori"
              : "Tambah Kategori"
            : editTag
              ? "Edit Tag"
              : "Tambah Tag"
        }
        onSubmit={handleSubmit}
        submitLabel={editCategory || editTag ? "Simpan" : "Tambah"}
      >
        {taxonomyType === "category" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editCategory) {
                    setSlug(generateSlug(e.target.value));
                  }
                }}
                placeholder="Masukkan nama kategori"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="nama-kategori"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier. Otomatis dihasilkan dari nama.
              </p>
            </div>
            {activeTab !== "video" && (
              <div className="space-y-2">
                <Label htmlFor="color">Warna</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="color"
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    placeholder="#10B981"
                    className="font-mono flex-1"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag">Nama Tag</Label>
              <Input
                id="tag"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Masukkan nama tag"
              />
              <p className="text-xs text-muted-foreground">
                Tag akan dikonversi ke format lowercase dengan tanda hubung.
              </p>
            </div>
          </div>
        )}
      </ModalForm>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus kategori <strong>{deleteCategory?.name}</strong>.
              {deleteCategory?.item_count && deleteCategory.item_count > 0 && (
                <span className="block mt-2 text-destructive">
                  Kategori ini memiliki {deleteCategory.item_count} item terkait.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tag Confirmation */}
      <AlertDialog open={!!deleteTag} onOpenChange={() => setDeleteTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus tag <strong>#{deleteTag?.tag}</strong>.
              {deleteTag?.count && deleteTag.count > 0 && (
                <span className="block mt-2 text-destructive">
                  Tag ini digunakan di {deleteTag.count} item.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
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
