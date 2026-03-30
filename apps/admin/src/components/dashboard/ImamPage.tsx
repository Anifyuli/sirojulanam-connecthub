
import React, { useState, useEffect } from "react";
import { Pencil, Users, Moon, Sun, Sunrise, Sunset, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton, TableWrapper, Th, Td, EmptyState, CardSkeleton } from "./shared";
import { ModalForm } from "./ModalForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";

type PrayTime = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

type Pasaran = "pon" | "wage" | "kliwon" | "legi" | "pahing";

interface DailyPrayerSchedule {
  id: number;
  prayTime: number; // API returns 1-5
  imam: string;
}

interface JumatSchedule {
  pasaran: Pasaran;
  imam: string;
  khotib: string;
  bilal: string;
}

const prayTimeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  fajr: { label: "Subuh (Fajr)", icon: <Sunrise className="w-4 h-4" /> },
  dhuhr: { label: "Dzuhur (Dhuhr)", icon: <Sun className="w-4 h-4" /> },
  asr: { label: "Ashar (Asr)", icon: <Sunset className="w-4 h-4" /> },
  maghrib: { label: "Maghrib", icon: <Sunset className="w-4 h-4" /> },
  isha: { label: "Isya (Isha)", icon: <Moon className="w-4 h-4" /> },
};

const prayTimeMap: Record<string, PrayTime> = {
  fajr: "fajr",
  dhuhr: "dhuhr",
  asr: "asr",
  maghrib: "maghrib",
  isha: "isha",
};

const pasaranLabels: Record<Pasaran, string> = {
  pon: "Jum'at Pon",
  wage: "Jum'at Wage",
  kliwon: "Jum'at Kliwon",
  legi: "Jum'at Legi",
  pahing: "Jum'at Pahing",
};

const defaultDailySchedules: DailyPrayerSchedule[] = [
  { id: 1, prayTime: 1, imam: "" },
  { id: 2, prayTime: 2, imam: "" },
  { id: 3, prayTime: 3, imam: "" },
  { id: 4, prayTime: 4, imam: "" },
  { id: 5, prayTime: 5, imam: "" },
];

const defaultJumatSchedules: JumatSchedule[] = [
  { pasaran: "pon", imam: "", khotib: "", bilal: "" },
  { pasaran: "wage", imam: "", khotib: "", bilal: "" },
  { pasaran: "kliwon", imam: "", khotib: "", bilal: "" },
  { pasaran: "legi", imam: "", khotib: "", bilal: "" },
  { pasaran: "pahing", imam: "", khotib: "", bilal: "" },
];

export function ImamPage() {
  const [loading, setLoading] = useState(true);
  const [dailySchedules, setDailySchedules] = useState<DailyPrayerSchedule[]>(defaultDailySchedules);
  const [jumatSchedules, setJumatSchedules] = useState<JumatSchedule[]>(defaultJumatSchedules);

  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [editDailyTarget, setEditDailyTarget] = useState<DailyPrayerSchedule | null>(null);
  const [dailyForm, setDailyForm] = useState({ imam: "" });

  const [jumatModalOpen, setJumatModalOpen] = useState(false);
  const [editJumatTarget, setEditJumatTarget] = useState<JumatSchedule | null>(null);
  const [jumatForm, setJumatForm] = useState({ imam: "", khotib: "", bilal: "" });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const [dailyRes, jumatRes] = await Promise.all([
        api.get("/daily-prayer-schedules").catch(() => ({ data: { success: true, data: [] } })),
        api.get("/jumat-schedules").catch(() => ({ data: { success: true, data: defaultJumatSchedules } })),
      ]);

      if (dailyRes.data.success && dailyRes.data.data.length > 0) {
        setDailySchedules(dailyRes.data.data);
      }
      if (jumatRes.data.success && jumatRes.data.data.length > 0) {
        setJumatSchedules(jumatRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDaily = (schedule: DailyPrayerSchedule) => {
    setEditDailyTarget(schedule);
    setDailyForm({ imam: schedule.imam });
    setDailyModalOpen(true);
  };

  const handleSaveDaily = async () => {
    if (!editDailyTarget) return;

    try {
      await api.put(`/daily-prayer-schedules/${editDailyTarget.prayTime}`, { imam: dailyForm.imam });
      setDailySchedules((prev) =>
        prev.map((s) => s.prayTime === editDailyTarget.prayTime ? { ...s, imam: dailyForm.imam } : s)
      );
      setDailyModalOpen(false);
    } catch (error) {
      console.error("Failed to update daily prayer schedule:", error);
    }
  };

  const openEditJumat = (schedule: JumatSchedule) => {
    setEditJumatTarget(schedule);
    setJumatForm({ imam: schedule.imam, khotib: schedule.khotib, bilal: schedule.bilal });
    setJumatModalOpen(true);
  };

  const handleSaveJumat = async () => {
    if (!editJumatTarget) return;

    const payload = {
      imam: jumatForm.imam,
      khotib: jumatForm.khotib,
      bilal: jumatForm.bilal,
    };

    try {
      await api.put(`/jumat-schedules/${editJumatTarget.pasaran}`, payload);
      setJumatSchedules((prev) =>
        prev.map((s) => s.pasaran === editJumatTarget.pasaran ? { ...s, ...jumatForm } : s)
      );
      setJumatModalOpen(false);
    } catch (error) {
      console.error("Failed to update jumat schedule:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="daily" className="gap-2">
            <Clock className="w-4 h-4" />
            Jadwal Imam 5 Waktu
          </TabsTrigger>
          <TabsTrigger value="jumat" className="gap-2">
            <Users className="w-4 h-4" />
            Jadwal Jum'at (Pasaran)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Jadwal Imam Sholat 5 Waktu</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Pengaturan imam untuk setiap waktu sholat harian</p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : dailySchedules.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6 text-accent-foreground" />}
              title="Jadwal belum diatur"
              description="Atur jadwal imam untuk setiap waktu sholat."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dailySchedules.map((schedule) => {
                const prayInfo = prayTimeLabels[schedule.prayTime];
                return (
                  <div key={schedule.prayTime} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {prayInfo.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{prayInfo.label}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">Imam</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEditDaily(schedule)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-accent-foreground">
                            {schedule.imam?.[0] || "?"}
                          </span>
                        </div>
                        <span className="font-medium">{schedule.imam || "-"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jumat" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Jadwal Sholat Jum'at (Pasaran Jawa)</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Siklus 5 hari: Pon, Wage, Kliwon, Legi, Pahing</p>
            </div>
          </div>

          {loading ? (
            <div className="bg-card rounded-xl border border-border">
              <TableSkeleton rows={5} cols={4} />
            </div>
          ) : jumatSchedules.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6 text-accent-foreground" />}
              title="Jadwal Jum'at belum diatur"
              description="Atur petugas untuk setiap pasaran Jum'at."
            />
          ) : (
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Pasaran</Th>
                  <Th>Imam</Th>
                  <Th>Khotib</Th>
                  <Th>Bilal</Th>
                  <Th className="text-right">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {jumatSchedules.map((schedule) => (
                  <tr key={schedule.pasaran} className="hover:bg-muted/30 transition-colors group">
                    <Td>
                      <span className="font-medium text-foreground">{pasaranLabels[schedule.pasaran]}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-primary">
                            {schedule.imam?.[0] || "?"}
                          </span>
                        </div>
                        <span>{schedule.imam || "-"}</span>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-accent-foreground">
                            {schedule.khotib?.[0] || "?"}
                          </span>
                        </div>
                        <span>{schedule.khotib || "-"}</span>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {schedule.bilal?.[0] || "?"}
                          </span>
                        </div>
                        <span>{schedule.bilal || "-"}</span>
                      </div>
                    </Td>
                    <Td className="text-right">
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEditJumat(schedule)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrapper>
          )}
        </TabsContent>
      </Tabs>

      <ModalForm
        open={dailyModalOpen}
        onClose={() => setDailyModalOpen(false)}
        title={`Ubah Imam ${editDailyTarget ? prayTimeLabels[editDailyTarget.prayTime].label : ""}`}
        onSubmit={handleSaveDaily}
        submitLabel="Simpan"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="daily-imam">Nama Imam</Label>
            <Input
              id="daily-imam"
              placeholder="e.g. Ust. Ahmad"
              value={dailyForm.imam}
              onChange={(e) => setDailyForm((p) => ({ ...p, imam: e.target.value }))}
            />
          </div>
        </div>
      </ModalForm>

      <ModalForm
        open={jumatModalOpen}
        onClose={() => setJumatModalOpen(false)}
        title={`Ubah Petugas ${editJumatTarget ? pasaranLabels[editJumatTarget.pasaran] : ""}`}
        onSubmit={handleSaveJumat}
        submitLabel="Simpan"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="jumat-imam">Imam</Label>
            <Input
              id="jumat-imam"
              placeholder="e.g. Ust. Ahmad"
              value={jumatForm.imam}
              onChange={(e) => setJumatForm((p) => ({ ...p, imam: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jumat-khotib">Khotib</Label>
            <Input
              id="jumat-khotib"
              placeholder="e.g. Ust. Budi"
              value={jumatForm.khotib}
              onChange={(e) => setJumatForm((p) => ({ ...p, khotib: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jumat-bilal">Bilal</Label>
            <Input
              id="jumat-bilal"
              placeholder="e.g. Pak Cahyo"
              value={jumatForm.bilal}
              onChange={(e) => setJumatForm((p) => ({ ...p, bilal: e.target.value }))}
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
