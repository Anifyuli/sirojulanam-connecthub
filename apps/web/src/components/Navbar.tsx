import { useState } from "react";
import NavbarLogo from "@sirojulanam-connecthub/shared/assets/images/navbar-logo.png";
import { Home, Menu, Xmark, Play, User } from "iconoir-react";
import { Calendar, Journal, Post, Star } from "iconoir-react/regular";
import { Link, useLocation } from "react-router-dom";
import { Quote, Whatsapp } from "iconoir-react/solid";

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
    { path: "/opini", label: "Opini", icon: <Post /> },
    { path: "/quotes", label: "Kutipan", icon: <Quote /> },
    { path: "/figures", label: "Tokoh", icon: <Star /> },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 shadow-lg">
      <div className="relative flex items-center justify-between max-w-2xl lg:max-w-6xl mx-auto">
        {/* Logo Section */}
        <Link to="/" className="hidden lg:flex lg:flex-row lg:items-center lg:gap-3">
          <img
            src={NavbarLogo}
            className="w-10 h-auto rounded-xl shadow-sm"
            alt="SirojulAnam ConnectHub Logo"
          />
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm tracking-wide">
              SirojulAnam ConnectHub
            </span>
            <span className="text-emerald-200 text-xs">
              by Masjid Sirojul Anam
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links - Center */}
        <div className="hidden lg:flex flex-row items-center justify-center gap-1 px-4 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(({ path, label, icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center rounded-lg px-3 py-1.5 gap-0.5 transition-all duration-200 ${isActive
                  ? "bg-white/20 text-white font-bold shadow-sm gap-1"
                  : "text-emerald-100 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span className={`${isActive ? 'w-6 h-6' : 'w-5 h-5'} transition-all`}>{icon}</span>
                <span className="text-xs">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Button - Right */}
        <div className="hidden lg:block">
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
            aria-label="Halaman Admin"
          >
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">Admin</span>
          </a>
        </div>



        {/* Mobile Menu Button */}
        <button
          className="flex rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <Xmark /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-white/20 pt-4 lg:hidden max-w-2xl lg:max-w-6xl mx-auto">
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
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-row items-center gap-3 rounded-lg px-3 py-3 text-emerald-100 hover:bg-white/10 hover:text-white transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <User className="w-5 h-5" />
            <span>Halaman Admin</span>
          </a>
        </div>
      )}
    </nav>
  );
}
