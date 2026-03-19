import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { MosqueIcon } from "@/components/mosque-icon";

type Tab = "login" | "register";

export function LoginPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("login");

  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
          <MosqueIcon className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Sistem Pengelolaan Masjid</h1>
      </div>

      {/* Card */}
      <div className="bg-card rounded-2xl shadow-xl shadow-primary/5 border border-border overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "login"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "register"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="hidden lg:inline-flex p-3 rounded-full bg-primary/10 mb-3">
              <MosqueIcon className="w-10 h-10 text-primary" />
            </div>
            {activeTab === "login" ? (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-1">Selamat Datang</h2>
                <p className="text-sm text-muted-foreground">
                  Masuk ke panel admin untuk mengelola masjid
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-1">Buat Akun Baru</h2>
                <p className="text-sm text-muted-foreground">
                  Daftarkan akun pengurus atau admin masjid
                </p>
              </>
            )}
          </div>

          {/* Forms */}
          {activeTab === "login" ? (
            <LoginForm onSwitchToRegister={() => setActiveTab("register")} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setActiveTab("login")} />
          )}

          {/* Footer */}
          {activeTab === "login" && (
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-center text-xs text-muted-foreground">
                Dengan masuk, Anda menyetujui{" "}
                <a href="#" className="text-primary hover:underline">
                  Syarat & Ketentuan
                </a>{" "}
                dan{" "}
                <a href="#" className="text-primary hover:underline">
                  Kebijakan Privasi
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Butuh bantuan?{" "}
        <a href="#" className="text-primary hover:underline font-medium">
          Hubungi Administrator
        </a>
      </p>
    </div>
  );
}
