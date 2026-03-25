import { useState } from "react";
import NavbarLogo from "@sirojulanam-connecthub/shared/assets/images/navbar-logo.png";
import { Home, Menu, Xmark, Play, User } from "iconoir-react";
import { Calendar, Journal } from "iconoir-react/regular";
import { Link, useLocation } from "react-router-dom";
import { Whatsapp } from "iconoir-react/solid";

export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/6285219342959"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600"
      aria-label="Hubungi kami via WhatsApp"
    >
      <Whatsapp className="h-7 w-7" />
    </a>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Beranda", icon: <Home /> },
    { path: "/news", label: "Berita", icon: <Journal /> },
    { path: "/agenda", label: "Agenda", icon: <Calendar /> },
    { path: "/video", label: "Video", icon: <Play /> },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Section */}
        <Link to="/" className="flex flex-row items-center gap-3">
          <img
            src={NavbarLogo}
            className="w-10 h-auto rounded-xl shadow-sm"
            alt="SirojulAnam ConnectHub Logo"
          />
          <span className="hidden font-bold text-white md:block tracking-wide">
            SirojulAnam ConnectHub
          </span>
        </Link>

        {/* Desktop Navigation Links - Center */}
        <div className="hidden md:flex flex-row items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-row items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 ${location.pathname === path
                ? "bg-white/20 text-white font-medium shadow-sm"
                : "text-emerald-100 hover:bg-white/10 hover:text-white"
                }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Admin Button - Right */}
        <div className="hidden md:block">
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
            aria-label="Halaman Admin"
          >
            <User className="w-5 h-5" />
          </a>
        </div>



        {/* Mobile Menu Button */}
        <button
          className="flex rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <Xmark /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-white/20 pt-4 md:hidden relative">
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-row items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 ${location.pathname === path
                ? "bg-white/20 text-white font-medium"
                : "text-emerald-100 hover:bg-white/10 hover:text-white"
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-3">
            <a
              href="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-emerald-700 hover:bg-gray-100 transition-all duration-200 shadow-md"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Halaman Admin"
            >
              <User className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
