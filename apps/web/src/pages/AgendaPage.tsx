import { useState, useMemo } from "react";
import { AgendaList, type AgendaEvent } from "../components/AgendaCard";
import { Pagination, type PaginationData } from "../components/Pagination";

const DUMMY_AGENDA: AgendaEvent[] = [
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
  {
    id: 14,
    title: "Khotbah Shalat Jumat",
    date: "2026-03-27",
    time: "11:30 - 12:30",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 15,
    title: "Pengajian Akbar Malam Nishfu Ramadhan",
    date: "2026-03-15",
    time: "19:00 - 22:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 16,
    title: "Lomba Mewarnai Anak",
    date: "2026-03-29",
    time: "09:00 - 11:30",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 17,
    title: "Ceramah Umum di Mushola",
    date: "2026-04-03",
    time: "16:00 - 17:30",
    location: "Mushola Al-Hidayah",
  },
  {
    id: 18,
    title: "Pembersihan Masjid",
    date: "2026-03-25",
    time: "06:00 - 08:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 19,
    title: "Pengajian Anak TPA",
    date: "2026-03-19",
    time: "15:30 - 17:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 20,
    title: "Ramah Tamah Warga Masjid",
    date: "2026-04-10",
    time: "10:00 - 13:00",
    location: "Aula Masjid Sirojul Anam",
  },
  {
    id: 21,
    title: "Seminar Parenting Islami",
    date: "2026-04-12",
    time: "09:00 - 12:00",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 22,
    title: "Bazar Ramadan",
    date: "2026-03-24",
    time: "10:00 - 15:00",
    location: "Halaman Masjid Sirojul Anam",
  },
  {
    id: 23,
    title: "Pembagian Takjil Gratis",
    date: "2026-03-27",
    time: "15:30 - 17:00",
    location: "Depan Masjid Sirojul Anam",
  },
  {
    id: 24,
    title: "Qiyamulail Malam 21 Ramadhan",
    date: "2026-03-20",
    time: "22:00 - 23:59",
    location: "Masjid Sirojul Anam",
  },
  {
    id: 25,
    title: "Tausiyah Subuh",
    date: "2026-03-31",
    time: "04:30 - 05:30",
    location: "Masjid Sirojul Anam",
  },
];

const ITEMS_PER_PAGE = 5;

type TabType = "all" | "upcoming" | "past";

export function AgendaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAgenda = useMemo(() => {
    const today = new Date("2026-03-06");
    return DUMMY_AGENDA.filter((event) => {
      const eventDate = new Date(event.date);
      if (activeTab === "upcoming") return eventDate >= today;
      if (activeTab === "past") return eventDate < today;
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeTab]);

  const pagination: PaginationData = {
    currentPage,
    totalPages: Math.ceil(filteredAgenda.length / ITEMS_PER_PAGE),
    totalItems: filteredAgenda.length,
    itemsPerPage: ITEMS_PER_PAGE,
  };

  const paginatedAgenda = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAgenda.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAgenda, currentPage]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-8 md:px-6">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Agenda Kegiatan
      </h1>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => handleTabChange("all")}
          className={`
            flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold
            transition-all duration-200
            ${activeTab === "all"
              ? "bg-cyan-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          Semua
        </button>
        <button
          onClick={() => handleTabChange("upcoming")}
          className={`
            flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold
            transition-all duration-200
            ${activeTab === "upcoming"
              ? "bg-cyan-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          Mendatang
        </button>
        <button
          onClick={() => handleTabChange("past")}
          className={`
            flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold
            transition-all duration-200
            ${activeTab === "past"
              ? "bg-cyan-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          Lampau
        </button>
      </div>

      <AgendaList events={paginatedAgenda} filter={activeTab} />

      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        showingLabel={`Menampilkan ${paginatedAgenda.length} dari ${pagination.totalItems} agenda`}
      />
    </div>
  );
}
