import { useState, useEffect } from "react";
import { PrayerCardGroup } from "./PrayerCardGroup";
import { FridayPrayerCard } from "./FridayPrayerCard";
import { jumatSchedulesService, type JumatSchedule } from "../lib/api";

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

export function PraySchedule() {
  const [jumatSchedule, setJumatSchedule] = useState<JumatSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJumatSchedule() {
      try {
        const data = await jumatSchedulesService.getAll();
        if (data.data.length > 0) {
          const today = new Date();
          const upcoming = data.data.find(s => new Date(s.date) >= today);
          if (upcoming) {
            setJumatSchedule(upcoming);
          } else {
            setJumatSchedule(data.data[0]);
          }
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

  return (
    <section className="w-full bg-white px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Left Side - Schedule & Date */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                Jadwal Shalat Harian <br /> Masjid Sirojul Anam
              </h2>
            </div>
            <div>
              <p className="text-base text-gray-600 md:text-lg">
                {dateString}
              </p>
            </div>
            <PrayerCardGroup />
          </div>

          {/* Right Side - Quran Quote */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl bg-aqua-100 p-6">
              <blockquote className="text-base italic text-gray-700 md:text-lg">
                Apabila kamu telah menyelesaikan salat, berzikirlah kepada Allah (mengingat dan menyebut-Nya), baik ketika kamu berdiri, duduk, maupun berbaring. Apabila kamu telah merasa aman, laksanakanlah salat itu (dengan sempurna). Sesungguhnya salat itu merupakan kewajiban yang waktunya telah ditentukan atas orang-orang mukmin.
              </blockquote>
              <cite className="text-sm font-semibold text-gray-900">
                — An-Nisa (4: 103)
              </cite>
            </div>
            <FridayPrayerCard 
              loading={loading} 
              schedule={jumatSchedule} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
