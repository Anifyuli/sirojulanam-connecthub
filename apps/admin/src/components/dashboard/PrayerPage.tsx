
import { useState, useEffect } from "react";
import { Pencil, Clock, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton, TableWrapper, Th, Td, EmptyState } from "./shared";
import api from "@/lib/api";

interface PrayerTime {
  id: number;
  date: string;
  shortDate: string;
  longDate: Date;
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
  createdAt?: string;
}

export function PrayerPage() {
  const [loading, setLoading] = useState(true);
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<PrayerTime, "id" | "date" | "shortDate" | "longDate" | "day" | "city" | "province" | "createdAt">>({
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

  const startEdit = (prayer: PrayerTime) => {
    setEditId(prayer.id);
    setEditForm({
      imsak: prayer.imsak || "",
      fajr: prayer.fajr || "",
      sunrise: prayer.sunrise || "",
      dhuha: prayer.dhuha || "",
      dhuhr: prayer.dhuhr || "",
      asr: prayer.asr || "",
      maghrib: prayer.maghrib || "",
      isha: prayer.isha || "",
    });
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

  const prayerKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 p-4 bg-accent rounded-xl border border-border">
        <Clock className="w-5 h-5 text-accent-foreground shrink-0" />
        <p className="text-sm text-accent-foreground">
          Prayer times are based on local calculations. Click the edit icon on any row to update the times.
        </p>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border">
          <TableSkeleton rows={7} cols={6} />
        </div>
      ) : prayers.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6 text-accent-foreground" />}
          title="No prayer schedule"
          description="No prayer times have been set yet."
        />
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Fajr</Th>
              <Th>Dhuhr</Th>
              <Th>Asr</Th>
              <Th>Maghrib</Th>
              <Th>Isha</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {prayers.map((prayer) => {
              const isEditing = editId === prayer.id;
              return (
                <tr key={prayer.id} className={`transition-colors ${isEditing ? "bg-accent/30" : "hover:bg-muted/30 group"}`}>
                  <Td className="font-medium tabular-nums">{prayer.date}</Td>
                  {prayerKeys.map((p) => (
                    <Td key={p} className="tabular-nums">
                      {isEditing ? (
                        <Input
                          type="time"
                          value={editForm[p]}
                          onChange={(e) => setEditForm((f) => ({ ...f, [p]: e.target.value }))}
                          className="h-8 w-28 text-sm"
                        />
                      ) : (
                        <span className="text-muted-foreground">{prayer[p]}</span>
                      )}
                    </Td>
                  ))}
                  <Td className="text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="default" className="w-8 h-8" onClick={() => saveEdit(prayer.id)}>
                          <Save className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setEditId(null)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(prayer)}>
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
