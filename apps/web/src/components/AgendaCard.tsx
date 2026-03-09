export interface AgendaEvent {
  id: string | number;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
}

export interface AgendaCardProps {
  event: AgendaEvent;
}

export function AgendaCard({ event }: AgendaCardProps) {
  const dateObj = new Date(event.date);
  const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "short" });
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("id-ID", { month: "short" });
  const year = dateObj.getFullYear();

  return (
    <div className="flex rounded-[16px] bg-white p-4 shadow-sm border-2 border-gray-100 transition-all duration-200 hover:shadow-md hover:border-cyan-200">
      {/* Date Section - Left */}
      <div className="flex flex-col items-center justify-center rounded-[12px] bg-cyan-100 px-4 py-3 text-cyan-900 min-w-[80px]">
        <span className="text-[11px] font-bold uppercase tracking-wide">
          {dayName}
        </span>
        <span className="text-[28px] font-bold leading-none">
          {day}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {month} {year}
        </span>
      </div>

      {/* Event Info - Right */}
      <div className="ml-4 flex flex-1 flex-col justify-center gap-1">
        <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 text-[13px] text-gray-600">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{event.time}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-[13px] text-gray-600">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export interface AgendaListProps {
  events?: AgendaEvent[];
  filter?: "all" | "upcoming" | "past";
  className?: string;
}

export function AgendaList({
  events = [],
  filter = "all",
  className = "",
}: AgendaListProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (filter === "upcoming") return eventDate >= today;
    if (filter === "past") return eventDate < today;
    return true;
  });

  if (filteredEvents.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        Tidak ada agenda
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {filteredEvents.map((event) => (
        <AgendaCard key={event.id} event={event} />
      ))}
    </div>
  );
}
