import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  Server,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

type ErrorType = "validation" | "network" | "server" | "duplicate" | "unknown";

interface GracefulError {
  type: ErrorType;
  message: string;
  icon: typeof AlertCircle;
}

function parseRegisterError(err: unknown): GracefulError {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused") || msg.includes("timeout")) {
      return { type: "network", message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.", icon: WifiOff };
    }
    if (msg.includes("500") || msg.includes("internal server") || msg.includes("server error")) {
      return { type: "server", message: "Server sedang mengalami gangguan. Silakan coba beberapa saat lagi.", icon: Server };
    }
    if (msg.includes("sudah terdaftar") || msg.includes("sudah digunakan") || msg.includes("duplicate") || msg.includes("exist")) {
      return { type: "duplicate", message: "Email atau username sudah terdaftar. Gunakan yang lain.", icon: AlertCircle };
    }
    if (msg.includes("minimal") || msg.includes("wajib") || msg.includes("tidak valid") || msg.includes("format")) {
      return { type: "validation", message: err.message, icon: AlertCircle };
    }
  }
  return { type: "unknown", message: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.", icon: AlertCircle };
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registerError, setRegisterError] = useState<GracefulError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ["", "Lemah", "Cukup", "Sedang", "Kuat", "Sangat Kuat"][passwordStrength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-400",
    "bg-emerald-600",
  ][passwordStrength];

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Nama wajib diisi";
    }
    if (!formData.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }
    if (!formData.username.trim()) {
      errors.username = "Username wajib diisi";
    } else if (formData.username.length < 3) {
      errors.username = "Username minimal 3 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username hanya boleh huruf, angka, dan underscore";
    }
    if (!formData.password) {
      errors.password = "Kata sandi wajib diisi";
    } else if (formData.password.length < 8) {
      errors.password = "Kata sandi minimal 8 karakter";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Kata sandi tidak cocok";
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterError(null);
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }
    setFieldErrors({});

    try {
      await register(formData);
      setIsSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setRegisterError(parseRegisterError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    if (registerError) setRegisterError(null);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Akun Berhasil Dibuat</p>
          <p className="text-sm text-muted-foreground mt-1">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Global Error */}
      {registerError && (
        <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
          registerError.type === "network" 
            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
            : registerError.type === "server"
            ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
            : registerError.type === "duplicate"
            ? "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
            : "bg-destructive/10 border-destructive/20 dark:bg-destructive/20"
        }`}>
          <div className="flex gap-3">
            <registerError.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              registerError.type === "network" 
                ? "text-amber-600 dark:text-amber-400"
                : registerError.type === "server"
                ? "text-red-600 dark:text-red-400"
                : registerError.type === "duplicate"
                ? "text-orange-600 dark:text-orange-400"
                : "text-destructive"
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                registerError.type === "network" 
                  ? "text-amber-800 dark:text-amber-200"
                  : registerError.type === "server"
                  ? "text-red-800 dark:text-red-200"
                  : registerError.type === "duplicate"
                  ? "text-orange-800 dark:text-orange-200"
                  : "text-destructive"
              }`}>
                {registerError.type === "validation" && "Validasi Gagal"}
                {registerError.type === "network" && "Koneksi Terputus"}
                {registerError.type === "server" && "Server Tidak Merespons"}
                {registerError.type === "duplicate" && "Data Sudah Terdaftar"}
                {registerError.type === "unknown" && "Terjadi Kesalahan"}
              </p>
              <p className={`text-sm mt-0.5 ${
                registerError.type === "network" 
                  ? "text-amber-700 dark:text-amber-300"
                  : registerError.type === "server"
                  ? "text-red-700 dark:text-red-300"
                  : registerError.type === "duplicate"
                  ? "text-orange-700 dark:text-orange-300"
                  : "text-muted-foreground"
              }`}>
                {registerError.message}
              </p>
              {registerError.type === "network" && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Coba lagi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nama Lengkap */}
      <div className="space-y-2">
        <Label htmlFor="reg-name" className="text-sm font-medium text-foreground">
          Nama Lengkap
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User className="w-5 h-5" />
          </div>
          <Input
            id="reg-name"
            type="text"
            placeholder="Nama lengkap Anda"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`pl-11 h-11 bg-card border-border ${
              fieldErrors.name ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            }`}
            disabled={isLoading}
          />
        </div>
        {fieldErrors.name && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email & Username */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="reg-email"
              type="email"
              placeholder="admin@masjid.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`pl-10 h-11 bg-card border-border text-sm ${
                fieldErrors.email ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
              }`}
              disabled={isLoading}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-username" className="text-sm font-medium text-foreground">
            Username
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <span className="text-sm font-medium">@</span>
            </div>
            <Input
              id="reg-username"
              type="text"
              placeholder="nama_admin"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className={`pl-8 h-11 bg-card border-border text-sm ${
                fieldErrors.username ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
              }`}
              disabled={isLoading}
            />
          </div>
          {fieldErrors.username && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.username}
            </p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="reg-password" className="text-sm font-medium text-foreground">
          Kata Sandi
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`pl-11 pr-11 h-11 bg-card border-border ${
              fieldErrors.password ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={isLoading ? -1 : 0}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {formData.password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= passwordStrength ? strengthColor : "bg-border"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Kekuatan: {strengthLabel}</p>
          </div>
        )}
        {fieldErrors.password && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Konfirmasi Password */}
      <div className="space-y-2">
        <Label htmlFor="reg-confirm" className="text-sm font-medium text-foreground">
          Konfirmasi Kata Sandi
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Ulangi kata sandi"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className={`pl-11 pr-11 h-11 bg-card border-border ${
              fieldErrors.confirmPassword ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={isLoading ? -1 : 0}
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Membuat Akun...
          </>
        ) : (
          "Buat Akun Baru"
        )}
      </Button>

      {/* Switch */}
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
        >
          Masuk di sini
        </button>
      </p>
    </form>
  );
}
