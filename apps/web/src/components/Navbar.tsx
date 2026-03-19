import { useState } from "react";
import NavbarLogo from "@sirojulanam-connecthub/shared/assets/images/navbar-logo.png";
import { Home, Menu, Xmark, Play } from "iconoir-react";
import { Calendar, Journal } from "iconoir-react/regular";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./button/Button";
import { Whatsapp } from "iconoir-react/solid";

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
    <nav className="bg-aqua-600 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex flex-row items-center gap-3">
          <img
            src={NavbarLogo}
            className="w-10 h-auto rounded-xl"
            alt="SirojulAnam ConnectHub Logo"
          />
          <span className="hidden font-semibold text-white md:block">
            SirojulAnam ConnectHub
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden flex-row items-center gap-2 md:flex">
          {navLinks.map(({ path, label, icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex flex-row items-center gap-2 rounded-lg px-3 py-2 transition-colors ${location.pathname === path
                  ? "bg-aqua-700 text-white"
                  : "text-aqua-100 hover:bg-aqua-700 hover:text-white"
                  }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop WhatsApp Button */}
        <div className="hidden md:block">
          <a href="https://wa.me/6285219342959" target="_blank" rel="noopener noreferrer">
            <Button
              color="aqua"
              colorShade={{ base: 700, hover: 800, active: 900 }}
              leftIcon={<Whatsapp />}
              size="medium"
            >
              Hubungi Kami
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex rounded-lg p-2 text-white hover:bg-aqua-700 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <Xmark /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-aqua-700 pt-4 md:hidden">
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-row items-center gap-3 rounded-lg px-3 py-3 transition-colors ${location.pathname === path
                ? "bg-aqua-700 text-white"
                : "text-aqua-100 hover:bg-aqua-700 hover:text-white"
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
          <a
            href="https://wa.me/6285219342959"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Button
              color="aqua"
              colorShade={{ base: 700, hover: 800, active: 900 }}
              leftIcon={<Whatsapp />}
              fullWidth
            >
              Hubungi Kami
            </Button>
          </a>
        </div>
      )}
    </nav>
  );
}
