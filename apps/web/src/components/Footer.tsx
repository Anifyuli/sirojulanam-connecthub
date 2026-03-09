import Logo from "@sirojulanam-connecthub/shared/assets/images/logo.png";
import { Facebook, Mail, Map, Phone, Youtube } from "iconoir-react";

export function Footer() {
  return (
    <footer className="w-full bg-gray-900 px-4 py-12 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Footer Top - Logo, Kontak, Info */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Left - Logo & Description */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-row items-center gap-3">
              <img
                src={Logo}
                className="w-18 h-auto rounded-xl"
                alt="Masjid Sirojul Anam Logo"
              />
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-white">SirojulAnam ConnectHub</p>
                <p className="text-sm text-gray-400">by Masjid Sirojul Anam</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-xs text-justify">
              Layanan informasi seputar masjid dan berbagai kegiatan, pengumuman, maupun layanan masjid.
            </p>
            {/* Social Media */}
            <div className="flex flex-col gap-3">
              <a href="https://www.facebook.com/masjid.sirojul.anam.wonokerto/" className="flex flex-row gap-2 text-gray-400 hover:text-white transition-colors" target="_blank">
                <Facebook /> Masjid Sirojul Anam Wonokerto
              </a>
              <a href="https://www.youtube.com/@MasjidSirojulAnamWonokerto" target="_blank" className="flex flex-row gap-2 text-gray-400 hover:text-white transition-colors">
                <Youtube /> Masjid Sirojul Anam Wonokerto
              </a>
            </div>
          </div>

          {/* Middle - Kontak */}
          <div className="flex flex-1 flex-col gap-4">
            <h3 className="font-semibold text-white">Kontak</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-400">
              <li>
                <a href="mailto:sirojulanamannam@gmail.com" className="hover:text-white transition-colors flex flex-row gap-2">
                  <span><Mail /></span>
                  sirojulanamannam@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+6285219342959" className="hover:text-white transition-colors flex flex-row gap-2">
                  <span><Phone /></span>
                  +62 852-1934-2959
                </a>
              </li>
              <li className="text-gray-400 flex flex-row gap-2">
                <span><Map /></span>
                Jl. Pasucen-Lahar Km 02, Desa Pasucen RT 04/RW VI Kec. Trangkil, Kab. Pati 59153
              </li>
            </ul>
          </div>

          {/* Right - Info */}
          <div className="flex flex-1 flex-col gap-4">
            <h3 className="font-semibold text-white">Info</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-400">
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom - Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-500">
            © 2026 Masjid Sirojul Anam. Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
