import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, User, Lock, Loader2, AlertCircle, WifiOff, Server, ShieldOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function isEmail(value: string) {
  return value.includes("@");
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

type ErrorType = "invalid" | "network" | "server" | "inactive" | "unknown";

interface GracefulError {
  type: ErrorType;
  message: string;
  icon: typeof AlertCircle;
}

function parseLoginError(err: unknown): GracefulError {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnrefused") || msg.includes("timeout")) {
      return { type: "network", message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.", icon: WifiOff };
    }
    if (msg.includes("500") || msg.includes("internal server") || msg.includes("server error")) {
      return { type: "server", message: "Server sedang mengalami gangguan. Silakan coba beberapa saat lagi.", icon: Server };
    }
    if (msg.includes("salah") || msg.includes("invalid") || msg.includes("tidak ditemukan") || msg.includes("tidak cocok")) {
      return { type: "invalid", message: "Email/username atau kata sandi salah. Pastikan Anda memasukkan data yang benar.", icon: AlertCircle };
    }
    if (msg.includes("dinonaktifkan") || msg.includes("inactive") || msg.includes("nonaktif")) {
      return { type: "inactive", message: "Akun Anda telah dinonaktifkan. Hubungi administrator untuk bantuan.", icon: ShieldOff };
    }
  }
  return { type: "unknown", message: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.", icon: AlertCircle };
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });
  const [loginError, setLoginError] = useState<GracefulError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  const identifierIsEmail = isEmail(formData.identifier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    setFieldErrors({});

    if (!formData.identifier.trim()) {
      setFieldErrors((prev) => ({ ...prev, identifier: "Email atau username wajib diisi" }));
      setIsLoading(false);
      return;
    }
    if (!formData.password) {
      setFieldErrors((prev) => ({ ...prev, password: "Kata sandi wajib diisi" }));
      setIsLoading(false);
      return;
    }

    try {
      await login(formData.identifier, formData.password, formData.rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setLoginError(parseLoginError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: "identifier" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    if (loginError) setLoginError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Global Error */}
      {loginError && (
        <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
          loginError.type === "network" 
            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
            : loginError.type === "server"
            ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
            : "bg-destructive/10 border-destructive/20 dark:bg-destructive/20"
        }`}>
          <div className="flex gap-3">
            <loginError.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              loginError.type === "network" 
                ? "text-amber-600 dark:text-amber-400"
                : loginError.type === "server"
                ? "text-red-600 dark:text-red-400"
                : "text-destructive"
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                loginError.type === "network" 
                  ? "text-amber-800 dark:text-amber-200"
                  : loginError.type === "server"
                  ? "text-red-800 dark:text-red-200"
                  : "text-destructive"
              }`}>
                {loginError.type === "invalid" && "Login Gagal"}
                {loginError.type === "network" && "Koneksi Terputus"}
                {loginError.type === "server" && "Server Tidak Merespons"}
                {loginError.type === "inactive" && "Akun Nonaktif"}
                {loginError.type === "unknown" && "Terjadi Kesalahan"}
              </p>
              <p className={`text-sm mt-0.5 ${
                loginError.type === "network" 
                  ? "text-amber-700 dark:text-amber-300"
                  : loginError.type === "server"
                  ? "text-red-700 dark:text-red-300"
                  : "text-muted-foreground"
              }`}>
                {loginError.message}
              </p>
              {loginError.type === "network" && (
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

      {/* Identifier */}
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-sm font-medium text-foreground">
          Email atau Username
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {identifierIsEmail ? (
              <Mail className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <Input
            id="identifier"
            type="text"
            placeholder="admin@masjid.com atau admin_masjid"
            value={formData.identifier}
            onChange={(e) => handleInputChange("identifier", e.target.value)}
            className={`pl-11 h-12 bg-card border-border focus:border-primary focus:ring-primary ${
              fieldErrors.identifier ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            }`}
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.identifier && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.identifier}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Kata Sandi
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan kata sandi"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`pl-11 pr-11 h-12 bg-card border-border focus:border-primary focus:ring-primary ${
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
        {fieldErrors.password && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={formData.rememberMe}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, rememberMe: checked as boolean })
            }
            disabled={isLoading}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label
            htmlFor="remember"
            className={`text-sm cursor-pointer ${isLoading ? "text-muted-foreground" : "text-muted-foreground"}`}
          >
            Ingat saya
          </Label>
        </div>
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-50"
          disabled={isLoading}
        >
          Lupa kata sandi?
        </button>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk ke Dashboard"
        )}
      </Button>

      {/* Switch */}
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          disabled={isLoading}
          className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
        >
          Daftar sekarang
        </button>
      </p>
    </form>
  );
}
