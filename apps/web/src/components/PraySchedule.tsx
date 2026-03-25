import { useState, useEffect } from "react";
import { PrayerCardGroup } from "./PrayerCardGroup";
import { jumatSchedulesService, type JumatSchedule } from "../lib/api";

async function getPasaranFromAPI(date: Date): Promise<string> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  try {
    const response = await fetch(`https://tanggalanjawa.com/api/calendar?year=${year}&month=${month}&day=${day}`);
    const data = await response.json();
    if (data.pasaran) {
      return data.pasaran;
    }
  } catch (err) {
    console.error("Failed to fetch pasaran:", err);
  }
  return "";
}

function formatDate(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${month} ${year}M`;
}

function getNextJumatDates(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  let currentDate = new Date(today);

  if (currentDate.getDay() !== 5) {
    const daysUntilFriday = (5 - currentDate.getDay() + 7) % 7;
    currentDate.setDate(currentDate.getDate() + daysUntilFriday);
  }

  for (let i = 0; i < count; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return dates;
}

function formatPasaranDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleDateString("id-ID", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

interface ScheduleWithDate extends JumatSchedule {
  date: string;
  isNext: boolean;
}

export function PraySchedule() {
  const [jumatSchedules, setJumatSchedules] = useState<ScheduleWithDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJumatSchedule() {
      try {
        const data = await jumatSchedulesService.getAll();
        if (data.data.length > 0) {
          const today = new Date();
          const todayIsJumat = today.getDay() === 5;

          // Get next 5 friday dates
          const nextJumatDates = getNextJumatDates(5);
          const schedulesWithDates: ScheduleWithDate[] = [];

          // Try to get accurate besok from API, fallback to sequential matching
          try {
            const besokList = await Promise.all(
              nextJumatDates.map(d => getPasaranFromAPI(d).catch(() => ""))
            );

            for (let i = 0; i < 5; i++) {
              const schedule = data.data.find(s =>
                s.pasaran.toLowerCase() === besokList[i].toLowerCase()
              );
              if (schedule) {
                schedulesWithDates.push({
                  ...schedule,
                  date: formatPasaranDate(nextJumatDates[i]),
                  isNext: todayIsJumat && i === 0,
                });
              }
            }
          } catch (e) {
            console.warn("External API failed, using fallback");
          }

          // Fallback: use sequential match if no matches found
          if (schedulesWithDates.length === 0) {
            for (let i = 0; i < Math.min(data.data.length, 5); i++) {
              schedulesWithDates.push({
                ...data.data[i],
                date: formatPasaranDate(nextJumatDates[i]),
                isNext: i === 0,
              });
            }
          }

          console.log("Jumat schedules loaded:", schedulesWithDates);
          setJumatSchedules(schedulesWithDates);
        }
      } catch (err) {
        console.error("Failed to fetch jumat schedule:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchJumatSchedule();
  }, []);

  const today = new Date();
  const dateString = formatDate(today);

  // Get quote based on time of day (rotate every 6 hours)
  const hour = today.getHours();
  const timeIndex = Math.floor(hour / 6) % 7;

  const quranQuotes = [
    {
      surah: "Al-Baqarah",
      ayat: 43,
      arabic: "وَأَقِيمُوا۟ الصَّلَوٰةَ وَءَاتُوا۟ الزَّكَوٰةَ وَارۡكَعُوا۟ مَعَ ٱلرَّٰكِعِينَ",
      translation: "Dan dirikanlah salat, tunaikanlah zakatan, dan rukuklah bersama orang-orang yang rukuk."
    },
    {
      surah: "Al-Baqarah",
      ayat: 110,
      arabic: "وَأَقِيمُوا۟ الصَّلَوٰةَ وَءَاتُوا۟ الزَّكَوٰةَ",
      translation: "Dan dirikanlah salat dan tunaikanlah zakat."
    },
    {
      surah: "Al-Isra",
      ayat: 78,
      arabic: "أَقِمِ الصَّلَوٰةَ لِدُلُوكِ ٱلشَّمۡسِ إِلَىٰ غَسَقِ ٱلَّيۡلِ",
      translation: "Dirikanlah salat dari setelah matahari tergelincir sampai gelap malam."
    },
    {
      surah: "Thaha",
      ayat: 132,
      arabic: "وَأۡمُرۡ أَهۡلَكَ بِٱلصَّلَوٰةِ وَٱصۡطَبِرۡ عَلَیۡهَا",
      translation: "Dan perintahkanlah kepada keluargamu untuk melaksanakan salat."
    },
    {
      surah: "Al-Mukminun",
      ayat: "1-2",
      arabic: "قَدۡ أَفۡلَحَ ٱلۡمُؤۡمِنُونَ ٱلَّذِينَ هُمۡ فِي صَلَاتِهِمۡ خَاشِعُونَ",
      translation: "Sesungguhan beruntungnya orang-orang yang beriman, mereka yang khusyuk dalam salatnya."
    },
    {
      surah: "Al-Ankabut",
      ayat: 45,
      arabic: "وَأَقِمِ ٱلصَّلَوٰةَۖ إِنَّ ٱلصَّلَوٰةَ تَنۡهَىٰ عَنِ ٱلۡفَحۡشَآءِ",
      translation: "Dan dirikanlah salat. Sesungguhnya salat itu mencegah dari kejahatan."
    },
    {
      surah: "As-Sajdah",
      ayat: "15-16",
      arabic: "إِذَا ذُكِّرُوا۟ بِهَا خَرُّوا۟ سُجَّدٗاۤ",
      translation: "Apabila diperingatkan dengan ayat-Nya, mereka menyungkur sujud."
    }
  ];

  const currentQuote = quranQuotes[timeIndex];

  return (
    <section className="w-full bg-white px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-stretch">
          {/* Left Side - Schedule & Date */}
          <div className="flex min-w-0 flex-1 flex-col justify-center py-4 gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                Jadwal Shalat Harian Masjid Sirojul Anam
              </h2>
            </div>
            <div>
              <p className="text-base text-center text-gray-600 md:text-lg">
                {dateString}
              </p>
            </div>
            <PrayerCardGroup />
          </div>

          {/* Right Side - Quran Quote */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl bg-aqua-100 p-6">
              <p className="text-lg md:text-xl font-bold text-teal-800 text-center mb-2">
                {currentQuote.surah} ({currentQuote.ayat})
              </p>
              <p className="text-xl md:text-2xl font-bold text-teal-900 text-right leading-loose font-arabic" dir="rtl" style={{ fontFamily: 'Amiri, Arial, sans-serif' }}>
                {currentQuote.arabic}
              </p>
              <p className="text-base italic text-teal-700 text-center mt-2">
                "{currentQuote.translation}"
              </p>
            </div>

            {/* Nearest Friday - Big Card */}
            {loading ? (
              <div className="bg-cyan-50 rounded-[20px] p-5 text-center text-gray-500">
                Memuat jadwal Jumat...
              </div>
            ) : jumatSchedules.length > 0 ? (
              <div className="bg-cyan-50 rounded-[20px] p-5 font-sans shadow-lg border-2 border-cyan-200">
                <h3 className="text-base text-center font-bold text-cyan-900 mb-4 uppercase tracking-wide">
                  Shalat Jumat Terdekat
                </h3>
                <div className="text-center pb-3 border-b border-cyan-200 mb-4">
                  <p className="text-lg font-bold text-cyan-800">Jumat, {jumatSchedules[0]?.date}</p>
                  <p className="text-md text-cyan-600 font-medium capitalize">{jumatSchedules[0]?.pasaran}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-[12px] uppercase text-cyan-600 font-bold">Imam</p>
                    <p className="text-sm font-medium text-gray-800">{jumatSchedules[0]?.imam}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-[12px] uppercase text-cyan-600 font-bold">Khotib</p>
                    <p className="text-sm font-medium text-gray-800">{jumatSchedules[0]?.khotib}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-[12px] uppercase text-cyan-600 font-bold">Bilal</p>
                    <p className="text-sm font-medium text-gray-800">{jumatSchedules[0]?.bilal}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Other Fridays - Small Table */}
            {!loading && jumatSchedules.length > 1 && (
              <div>
                <h3 className="text-lg text-center font-bold text-cyan-900 uppercase tracking-wide mb-4">
                  Jadwal Jumat Lainnya
                </h3>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex px-2 py-2">
                    <span className="font-bold text-base text-cyan-600 flex-1 uppercase">Pasaran</span>
                    <span className="font-bold text-base text-cyan-600 flex-1 text-center uppercase">Imam</span>
                    <span className="font-bold text-base text-cyan-600 flex-1 text-center uppercase">Khotib</span>
                    <span className="font-bold text-base text-cyan-600 flex-1 text-right uppercase">Bilal</span>
                  </div>
                  {jumatSchedules.slice(1).map((schedule, index) => (
                    <div key={index} className="flex items-center px-2 py-3 last:border-0 gap-3">
                      <span className="flex-1 font-medium text-cyan-800 text-sm capitalize">{schedule.pasaran}</span>
                      <span className="flex-1 text-center text-gray-600 text-sm">{schedule.imam}</span>
                      <span className="flex-1 text-center text-gray-600 text-sm">{schedule.khotib}</span>
                      <span className="flex-1 text-right text-gray-600 text-sm">{schedule.bilal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
