import { MapPin } from "iconoir-react/regular";
import HeroImg from "../assets/hero.png";

export function Hero() {
  return (
    <section className="min-h-screen w-full bg-aqua-100 px-4 py-12 md:px-8">
      <div
        id="hero"
        className="mx-auto flex w-full max-w-2xl lg:max-w-6xl flex-col-reverse gap-8 md:flex-row md:items-center md:justify-between"
      >
        {/* Left Content */}
        <div className="flex min-w-0 flex-col gap-6 md:w-[55%] md:pr-8 lg:pr-12">
          <div>
            <a
              href="https://maps.app.goo.gl/73UuPvTUh3MQ8FJL7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-row items-center gap-3 text-gray-700 hover:text-gray-900"
            >
              <span className="flex-shrink-0">
                <MapPin />
              </span>
              <span className="text-sm md:text-base">
                Masjid Sirojul Anam Dukuh Wonokerto, Pasucen, Trangkil, Pati
              </span>
            </a>
          </div>
          <div>
            <h1 className="text-3xl font-semibold leading-relaxed text-gray-900 md:text-4xl">
              Tetap terhubung <br className="hidden md:block" /> dengan masjid melalui{" "}
              <br className="hidden md:block" /> SirojulAnam ConnectHub
            </h1>
          </div>
          <div>
            <p className="text-base text-gray-700 md:text-lg">
              SirojulAnam ConnectHub hadir sebagai platform informasi masjid yang membantu
              jamaah tetap terhubung dengan berbagai kegiatan, pengumuman, dan layanan masjid
              melalui sistem informasi digital yang mudah diakses.
            </p>
          </div>
        </div>

        {/* Right Content - Hero Image */}
        <div className="flex min-w-0 flex-shrink-0 md:w-[45%]">
          <img
            src={HeroImg}
            className="rounded-xl w-full h-auto object-contain"
            alt="Hero"
          />
        </div>
      </div>
    </section>
  );
}
