import { PrayerCardGroup } from "./PrayerCardGroup";
import { FridayPrayerCard } from "./FridayPrayerCard";

export function PraySchedule() {
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
                Ahad, 1 Maret 2026M (10 Ramadhan 1447H)
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
            <FridayPrayerCard />
          </div>
        </div>
      </div>
    </section>
  );
}
