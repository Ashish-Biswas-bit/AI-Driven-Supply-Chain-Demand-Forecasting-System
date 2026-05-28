import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  subscription_plan: string;
  subscription_status: string;
  subscription_expires_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const TOKEN_KEY = "sc_access_token";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  token: null,
});

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // Also set a cookie for the Next.js middleware to read (expires in 7 days)
    Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "lax", path: "/" });
  } catch {
    // Storage unavailable
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    Cookies.remove(TOKEN_KEY, { path: "/" });
  } catch {
    // Storage unavailable
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Fetch the current user profile using the stored token
  const fetchUser = useCallback(async (jwt: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUser(res.data);
      return res.data;
    } catch {
      // Token invalid/expired
      clearToken();
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // On mount, check for stored token and validate it
  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
      fetchUser(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const jwt: string = res.data.access_token;
    storeToken(jwt);
    setToken(jwt);
    await fetchUser(jwt);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
