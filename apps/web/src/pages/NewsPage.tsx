import { useState, useEffect } from "react";
import { NewsList, type NewsItem } from "../components/NewsList";
import { useNavigate } from "react-router-dom";
import { Pagination, type PaginationData } from "../components/Pagination";

const DUMMY_NEWS: NewsItem[] = [
  {
    id: 1,
    title: "Peringatan Nuzulul Qur'an di Masjid Sirojul Anam",
    excerpt: "Masjid Sirojul Anam menggelar peringatan Nuzulul Qur'an dengan tausiyah dari Ustadz Abdul Somad. Acara dihadiri oleh ratusan jama'ah...",
    thumbnail: "https://placehold.co/300x200/0eb5f1/ffffff?text=Nuzulul+Quran",
    slug: "peringatan-nuzulul-quran-2026",
  },
  {
    id: 2,
    title: "Kegiatan Buka Puasa Bersama Anak Yatim",
    excerpt: "Dalam rangka menyemarakkan Ramadhan, pengurus masjid mengadakan buka puasa bersama untuk 100 anak yatim dari sekitar masjid...",
    thumbnail: "https://placehold.co/300x200/87cb34/ffffff?text=Buka+Puasa",
    slug: "buka-puasa-anak-yatim-2026",
  },
  {
    id: 3,
    title: "Jadwal Shalat Idul Fitri 1447 H",
    excerpt: "Pengurus Masjid Sirojul Anam mengumumkan jadwal pelaksanaan salat Idul Fitri 1 Syawal 1447 H yang akan dilaksanakan pada...",
    thumbnail: "https://placehold.co/300x200/ffd63f/1a1a2e?text=Idul+Fitri",
    slug: "jadwal-idul-fitri-1447h",
  },
  {
    id: 4,
    title: "Kajian Rutin Setiap Malam Jumat",
    excerpt: "Mulai bulan Ramadhan ini, Masjid Sirojul Anam mengadakan kajian rutin setiap malam Jumat ba'da Isya dengan materi Fiqih Puasa...",
    thumbnail: "https://placehold.co/300x200/4895f6/ffffff?text=Kajian+Rutin",
    slug: "kajian-rutin-malam-jumat",
  },
  {
    id: 5,
    title: "Penyaluran Zakat Fitrah Mulai 25 Ramadhan",
    excerpt: "Panitia Zakat Masjid Sirojul Anam akan mulai menyalurkan zakat fitrah kepada mustahik sejak tanggal 25 Ramadhan. Total ada 500 paket...",
    thumbnail: "https://placehold.co/300x200/48d4f6/ffffff?text=Zakat+Fitrah",
    slug: "penyaluran-zakat-fitrah-2026",
  },
  {
    id: 6,
    title: "Lomba Tausiyah Ramadhan untuk Remaja",
    excerpt: "Remaja Masjid Sirojul Anam mengadakan lomba tausiyah untuk memeriahkan Ramadhan. Pendaftaran terbuka hingga 20 Ramadhan...",
    thumbnail: "https://placehold.co/300x200/ff5f3f/ffffff?text=Lomba+Tausiyah",
    slug: "lomba-tausiyah-ramadhan-2026",
  },
  {
    id: 7,
    title: "Tadarus Akbar Malam 27 Ramadhan",
    excerpt: "Masjid Sirojul Anam gelar tadarus akbar pada malam 27 Ramadhan untuk mencari Lailatul Qadar. Kegiatan dimulai ba'da Maghrib...",
    thumbnail: "https://placehold.co/300x200/0eb5f1/ffffff?text=Tadarus+Akbar",
    slug: "tadarus-akbar-malam-27",
  },
  {
    id: 8,
    title: "Santunan Yatim Piatu Bulan Ramadhan",
    excerpt: "Pengurus masjid menyalurkan santunan untuk 150 anak yatim piatu. Setiap anak menerima paket sembako dan uang tunai...",
    thumbnail: "https://placehold.co/300x200/87cb34/ffffff?text=Santunan+Yatim",
    slug: "santunan-yatim-piatu-2026",
  },
  {
    id: 9,
    title: "Khataman Al-Qur'an Jilid 5",
    excerpt: "TPA Masjid Sirojul Anam mengadakan khataman Al-Qur'an untuk 50 santi. Acara dihadiri oleh orang tua dan pengurus masjid...",
    thumbnail: "https://placehold.co/300x200/ffd63f/1a1a2e?text=Khataman+Quran",
    slug: "khataman-quran-jilid-5",
  },
  {
    id: 10,
    title: "Persiapan Shalat Tarawih Akhir Ramadhan",
    excerpt: "Panitia Ramadhan mempersiapkan pelaksanaan salat tarawih untuk malam-malam terakhir Ramadhan dengan peningkatan keamanan...",
    thumbnail: "https://placehold.co/300x200/4895f6/ffffff?text=Tarawih+Akhir",
    slug: "persiapan-tarawih-akhir-ramadhan",
  },
  {
    id: 11,
    title: "Pengumuman Hari Raya Idul Fitri 1447 H",
    excerpt: "Pemerintah melalui Kemenag mengumumkan 1 Syawal 1447 H jatuh pada hari Senin. Masjid Sirojul Anam siap melaksanakan salat Ied...",
    thumbnail: "https://placehold.co/300x200/48d4f6/ffffff?text=Pengumuman+Idul+Fitri",
    slug: "pengumuman-idul-fitri-1447h",
  },
  {
    id: 12,
    title: "Bakti Sosial Bersih-Bersih Masjid",
    excerpt: "Remaja masjid mengadakan bakti sosial bersih-bersih area Masjid menjelang hari raya. Kegiatan diikuti oleh 30 remaja...",
    thumbnail: "https://placehold.co/300x200/ff5f3f/ffffff?text=Bakti+Sosial",
    slug: "bakti-sosial-bersih-masjid",
  },
];

const ITEMS_PER_PAGE = 5;

export function NewsPage() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews(page: number) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedNews = DUMMY_NEWS.slice(startIndex, endIndex);

        setNewsList(paginatedNews);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(DUMMY_NEWS.length / ITEMS_PER_PAGE),
          totalItems: DUMMY_NEWS.length,
          itemsPerPage: ITEMS_PER_PAGE,
        });
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews(pagination.currentPage);
  }, [pagination.currentPage]);

  const handleNewsClick = (news: NewsItem) => {
    navigate(`/news/${news.slug || news.id}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          <p className="text-gray-600">Memuat berita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-8 md:px-6">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Sirojul Anam Terkini
      </h1>

      <NewsList items={newsList} onNewsClick={handleNewsClick} />

      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        showingLabel={`Menampilkan ${newsList.length} dari ${pagination.totalItems} berita`}
      />
    </div>
  );
}
