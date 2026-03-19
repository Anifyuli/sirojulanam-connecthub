import { LoginPageClient } from "@/components/auth/LoginPageClient";
import { IslamicPattern, GeometricBorder } from "@/components/islamic-pattern";
import { MosqueIcon } from "@/components/mosque-icon";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Dekoratif */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 text-primary-foreground">
          <IslamicPattern className="w-full h-full opacity-50" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-primary-foreground">
          <div className="absolute top-0 left-0 right-0 text-accent">
            <GeometricBorder className="w-full h-6" />
          </div>
          <div className="text-center max-w-md">
            <div className="mb-8 flex justify-center">
              <div className="p-6 rounded-full bg-primary-foreground/10 backdrop-blur-sm">
                <MosqueIcon className="w-24 h-24 text-accent" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-balance">
              Sistem Pengelolaan Masjid
            </h1>
            <p className="text-lg text-primary-foreground/80 text-pretty">
              Platform digital untuk mengelola kegiatan masjid, keuangan,
              dan jamaah dengan mudah dan transparan.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-accent rotate-180">
            <GeometricBorder className="w-full h-6" />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <LoginPageClient />
      </div>
    </div>
  );
}
