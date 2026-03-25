import { Outlet } from "react-router-dom";
import { Navbar, FloatingWhatsApp } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function HomePageLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
      <FloatingWhatsApp />
      <Footer />
    </div>
  )
}
