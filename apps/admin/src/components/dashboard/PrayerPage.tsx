import { useState, useEffect } from "react";
import { Clock, Pencil, Save, X, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableWrapper, Th, Td, TableSkeleton, EmptyState } from "./shared";
import api from "@/lib/api";

interface PrayerTime {
  id: number;
  date: string;
  shortDate: string;
  longDate: string;
  day: string;
  city: string;
  province: string;
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuha: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  createdAt: string;
}

type TimeKey = "imsak" | "fajr" | "sunrise" | "dhuha" | "dhuhr" | "asr" | "maghrib" | "isha";

const TIME_LABELS: { key: TimeKey; label: string }[] = [
  { key: "imsak", label: "Imsak" },
  { key: "fajr", label: "Subuh" },
  { key: "sunrise", label: "Terbit" },
  { key: "dhuha", label: "Dhuha" },
  { key: "dhuhr", label: "Dzuhur" },
  { key: "asr", label: "Ashar" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isya" },
];

function formatTime(time: string | null | undefined): string {
  if (!time) return "-";
  return time.substring(0, 5);
}

export function PrayerPage() {
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<TimeKey, string>>({
    imsak: "",
    fajr: "",
    sunrise: "",
    dhuha: "",
    dhuhr: "",
    asr: "",
    maghrib: "",
    isha: "",
  });

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/prayer-times");
      if (res.data.success) {
        setPrayers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch prayer times:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFromApi = async () => {
    try {
      setFetching(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const res = await api.post("/prayer-times/fetch", {
        province: "Jawa Tengah",
        city: "Kab. Pati",
        month,
        year,
      });
      
      if (res.data.success) {
        await fetchPrayerTimes();
      }
    } catch (error) {
      console.error("Failed to fetch prayer times from API:", error);
    } finally {
      setFetching(false);
    }
  };

  const startEdit = (prayer: PrayerTime) => {
    setEditId(prayer.id);
    const form: Record<TimeKey, string> = {} as Record<TimeKey, string>;
    for (const { key } of TIME_LABELS) {
      form[key] = prayer[key] ? prayer[key].substring(0, 5) : "";
    }
    setEditForm(form);
  };

  const saveEdit = async (id: number) => {
    try {
      await api.put(`/prayer-times/${id}`, editForm);
      setPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...editForm } : p))
      );
      setEditId(null);
    } catch (error) {
      console.error("Failed to update prayer time:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <div className="flex items-center justify-between gap-3 p-4 bg-accent rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent-foreground shrink-0" />
          <p className="text-sm text-accent-foreground">
            Jadwal sholat untuk {prayers[0]?.city || "kota"}, {prayers[0]?.province || "provinsi"}. Klik ikon edit untuk mengubah waktu.
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleFetchFromApi}
          disabled={fetching}
          className="gap-2"
        >
          {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Reset dari API
        </Button>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border">
          <TableSkeleton rows={7} cols={10} />
        </div>
      ) : prayers.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6 text-accent-foreground" />}
          title="Belum ada jadwal sholat"
          description="Belum ada data jadwal sholat. Gunakan tombol Fetch untuk mengambil data."
        />
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <Th className="whitespace-normal text-center">Hari</Th>
              <Th className="whitespace-normal text-center">Tanggal</Th>
              {TIME_LABELS.map(({ key, label }) => (
                <Th key={key} className="text-center">{label}</Th>
              ))}
              <Th className="text-right">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {prayers.map((prayer) => {
              const isEditing = editId === prayer.id;
              return (
                <tr key={prayer.id} className={`transition-colors ${isEditing ? "bg-accent/30" : "hover:bg-muted/30 group"}`}>
                  <Td className="font-medium text-center">{prayer.day}</Td>
                  <Td className="text-center tabular-nums whitespace-normal">{prayer.date}</Td>
                  {TIME_LABELS.map(({ key }) => (
                    <Td key={key} className="text-center tabular-nums">
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editForm[key]}
                          onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                          className="h-7 w-24 text-xs text-center mx-auto"
                        />
                      ) : (
                        <span className="text-muted-foreground">{formatTime(prayer[key])}</span>
                      )}
                    </Td>
                  ))}
                  <Td className="text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="default" className="w-7 h-7" onClick={() => saveEdit(prayer.id)}>
                          <Save className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => setEditId(null)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(prayer)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrapper>
      )}
    </div>
  );
}
