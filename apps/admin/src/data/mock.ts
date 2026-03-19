export interface Category {
  id: number;
  name: string;
  slug: string;
  color_hex: string | null;
  item_count: number;
  type: "event" | "blog" | "video";
}

export interface Tag {
  tag: string;
  count: number;
  type: "event" | "blog" | "video";
}

export const mockEventCategories: Category[] = [
  { id: 1, name: "Kajian", slug: "kajian", color_hex: "#8B5CF6", item_count: 12, type: "event" },
  { id: 2, name: "Taklim", slug: "taklim", color_hex: "#06B6D4", item_count: 8, type: "event" },
  { id: 3, name: "Sosial", slug: "sosial", color_hex: "#EF4444", item_count: 5, type: "event" },
  { id: 4, name: "Peringatan Hari", slug: "peringatan-hari", color_hex: "#F97316", item_count: 3, type: "event" },
];

export const mockBlogCategories: Category[] = [
  { id: 1, name: "Artikel Islam", slug: "artikel-islam", color_hex: "#10B981", item_count: 24, type: "blog" },
  { id: 2, name: "Kegiatan", slug: "kegiatan", color_hex: "#3B82F6", item_count: 15, type: "blog" },
  { id: 3, name: "Pengumuman", slug: "pengumuman", color_hex: "#F59E0B", item_count: 9, type: "blog" },
];

export const mockVideoCategories: Category[] = [
  { id: 1, name: "Kajian Rutin", slug: "kajian-rutin", color_hex: null, item_count: 45, type: "video" },
  { id: 2, name: "Khutbah Jum'at", slug: "khutbah-jumat", color_hex: null, item_count: 52, type: "video" },
  { id: 3, name: "Ceramah Umum", slug: "ceramah-umum", color_hex: null, item_count: 18, type: "video" },
  { id: 4, name: "Shorts / Clip", slug: "shorts-clip", color_hex: null, item_count: 30, type: "video" },
];

export const mockEventTags: Tag[] = [
  { tag: "ramadhan", count: 8, type: "event" },
  { tag: "idul-fitri", count: 3, type: "event" },
  { tag: "qurban", count: 2, type: "event" },
  { tag: "maulid", count: 4, type: "event" },
];

export const mockBlogTags: Tag[] = [
  { tag: "fiqih", count: 15, type: "blog" },
  { tag: "akhlak", count: 12, type: "blog" },
  { tag: "tauhid", count: 8, type: "blog" },
  { tag: "sirah", count: 6, type: "blog" },
  { tag: "hadits", count: 10, type: "blog" },
];

export const mockVideoTags: Tag[] = [
  { tag: "ceramah", count: 25, type: "video" },
  { tag: "tausiyah", count: 18, type: "video" },
  { tag: "pengajian", count: 30, type: "video" },
  { tag: "khutbah", count: 20, type: "video" },
];

export const upcomingEvents = [
  { id: 1, title: "Pengajian Rutin Ahad Pagi", date: "2025-03-16", location: "Aula Utama", status: "upcoming" },
  { id: 2, title: "Sholat Tarawih Berjamaah", date: "2025-03-18", location: "Masjid Utama", status: "upcoming" },
  { id: 3, title: "Kajian Fiqih Muamalat", date: "2025-03-22", location: "Ruang Kelas A", status: "upcoming" },
];

export const latestPosts = [
  { id: 1, title: "Keutamaan Bulan Ramadan", category: "Fiqih", author: "Ustadz Ahmad", date: "2025-03-10" },
  { id: 2, title: "Tata Cara Sholat Tahajud", category: "Ibadah", author: "Ustadz Malik", date: "2025-03-08" },
  { id: 3, title: "Adab Membaca Al-Qur'an", category: "Akhlak", author: "Ustadzah Fatimah", date: "2025-03-05" },
];

export const recentVideos = [
  { id: 1, title: "Ceramah Subuh: Ikhlas", type: "video", duration: "18 min" },
  { id: 2, title: "Shorts: Doa Sebelum Tidur", type: "youtube", duration: "0:58" },
  { id: 3, title: "Kultum Maghrib", type: "tiktok", duration: "1:02" },
];
