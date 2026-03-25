import { useState, useMemo, useEffect } from "react";
import { AgendaList, type AgendaEvent } from "../components/AgendaCard";
import { Pagination, type PaginationData } from "../components/Pagination";
import { EventModal } from "../components/EventModal";
import { eventsService, type Event } from "../lib/api";
import { Search } from "iconoir-react";

const ITEMS_PER_PAGE = 5;

type TabType = "all" | "upcoming" | "past";

function mapEventToAgendaEvent(event: Event): AgendaEvent {
  const startDate = new Date(event.startDatetime);
  const endDate = event.endDatetime ? new Date(event.endDatetime) : startDate;
  const formatTime = (date: Date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  return {
    id: event.id,
    title: event.title,
    date: event.startDatetime.split("T")[0],
    time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
    location: event.locationName || undefined,
    description: typeof event.descriptionMd === 'string' ? event.descriptionMd.replace(/<[^>]*>/g, '').substring(0, 200) : undefined,
  };
}

export function AgendaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<AgendaEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const response = await eventsService.getAll({ limit: 100 });
        setAllEvents(response.data.map(mapEventToAgendaEvent));
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const filteredAgenda = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = allEvents;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          (event.location && event.location.toLowerCase().includes(query))
      );
    }

    return filtered.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      if (activeTab === "upcoming") return eventDate >= today;
      if (activeTab === "past") return eventDate < today;
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents, activeTab, searchQuery]);

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

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Agenda Sirojul Anam</h1>
        <p className="mt-1.5 text-gray-500">
          Kegiatan yang akan dilaksanakan dalam waktu dekat
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari agenda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        />
      </div>

      {searchQuery && (
        <p className="mb-4 text-sm text-gray-600">
          Menampilkan {paginatedAgenda.length} dari {filteredAgenda.length} hasil untuk "{searchQuery}"
        </p>
      )}

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

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
            <p className="text-gray-600">Memuat agenda...</p>
          </div>
        </div>
      ) : (
        <>
          <AgendaList
            events={paginatedAgenda}
            filter={activeTab}
            onEventClick={setSelectedEvent}
          />

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            showingLabel={`Menampilkan ${paginatedAgenda.length} dari ${pagination.totalItems} agenda`}
          />
        </>
      )}

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
