export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  thumbnail: string;
  slug: string;
}

export interface AgendaEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
}

export const DUMMY_NEWS: NewsItem[] = [
  {
    id: 1,
    title: "Peringatan Nuzulul Qur'an di Masjid Sirojul Anam",
    excerpt: "Masjid Sirojul Anam gelar peringatan Nuzulul Qur'an dengan tausiyah dari Ustadz Abdul Somad. Acara dihadiri oleh ratusan jama'ah...",
    thumbnail: "https://placehold.co/300x200/0eb5f1/ffffff?text=Nuzulul+Quran",
    slug: "peringatan-nuzulul-quran-2026",
  },
  {
    id: 2,
    title: " Kegiatan Buka Puasa Bersama Anak Yatim",
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

export const DUMMY_AGENDA: AgendaEvent[] = [
  {
    id: 1,
    title: "Peringatan Nuzulul Qur'an",
    date: "2026-03-17",
    time: "19:30 - 21:30",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 2,
    title: "Buka Puasa Bersama Anak Yatim",
    date: "2026-03-20",
    time: "16:00 - 18:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 3,
    title: "Kajian Fiqih Puasa",
    date: "2026-03-21",
    time: "20:00 - 21:30",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 4,
    title: "Tadarus Akbar Malam 27 Ramadhan",
    date: "2026-03-26",
    time: "18:00 - 23:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 5,
    title: "Shalat Idul Fitri 1447 H",
    date: "2026-03-30",
    time: "06:30 - 08:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 6,
    title: "Halal Bihalal Idul Fitri",
    date: "2026-04-06",
    time: "09:00 - 12:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 7,
    title: "Kajian Rutin Malam Jumat",
    date: "2026-02-27",
    time: "20:00 - 21:30",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 8,
    title: "Penyaluran Zakat Fitrah",
    date: "2026-03-28",
    time: "08:00 - 14:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 9,
    title: "Persiapan Shalat Tarawih",
    date: "2026-03-10",
    time: "15:00 - 17:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 10,
    title: "Santunan Yatim Piatu",
    date: "2026-02-15",
    time: "09:00 - 11:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 11,
    title: "Pengajian Umum Akhir pekan",
    date: "2026-03-22",
    time: "08:00 - 10:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 12,
    title: "Pelatihan Ceramah Anak",
    date: "2026-03-23",
    time: "14:00 - 16:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 13,
    title: "Shalat Tahajud Berjamaah",
    date: "2026-03-18",
    time: "02:00 - 03:30",
    location: "Masjid Sirojul Anam",
  },
];
