// Auth removed — no login required.
// This file is kept as a no-op placeholder in case any remaining imports reference it.
import { createContext, useContext, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={{ user: null, loading: false, login: async () => {}, logout: () => {} }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
