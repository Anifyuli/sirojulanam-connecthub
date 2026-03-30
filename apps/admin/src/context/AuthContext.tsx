import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/api";

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = 'connecthub_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount via Express /api/auth/me
  const checkSession = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.success && res.data.data?.user) {
        const u = res.data.data.user;
        const roleName = (u.roleName || "").toLowerCase();
        const userData = {
          userId: String(u.id),
          email: u.email,
          username: u.username,
          name: u.name,
          role: roleName === "manager" ? "manager" : "editor",
        };
        setUser(userData);
        setIsLoading(false);
        return;
      }

      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          setUser(userData);
        } catch {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      setUser(null);
    } catch {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          setUser(userData);
        } catch {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (
    identifier: string,
    password: string,
    rememberMe = false
  ) => {
    const isEmail = identifier.includes('@');
    const res = await api.post("/admins/login", {
      email: isEmail ? identifier : undefined,
      username: isEmail ? undefined : identifier,
      password,
      rememberMe
    });

    if (!res.data.success) throw new Error(res.data.message || "Login gagal");

    const u = res.data.data.admin;
    const roleName = (u.role || "").toLowerCase();
    const userData = {
      userId: String(u.id),
      email: u.email,
      username: u.username,
      name: u.name,
      role: roleName === "manager" ? "manager" : "editor",
    };
    setUser(userData);

    // Persist to localStorage if "Remember Me" is checked
    if (rememberMe) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    }
  };

  const logout = async () => {
    await api.post("/admins/logout");
    setUser(null);
    // Clear localStorage on logout
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const register = async (formData: RegisterData) => {
    const res = await api.post("/admins/register", {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (!res.data.success) throw new Error(res.data.message || "Pendaftaran gagal");

    const u = res.data.data.admin;
    setUser({
      userId: String(u.id),
      email: u.email,
      username: u.username,
      name: u.name,
      role: "editor",
    });
  };

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
