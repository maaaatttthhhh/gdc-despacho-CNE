// ============================================================
// AUTH CONTEXT - Login del sistema con múltiples usuarios
// Estilo: Despacho Ejecutivo - CNE
// Usuarios: Admin + 5 abogados del despacho
// ============================================================
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface UserInfo {
  name: string;
  role: string;
  email: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  allUsers: UserInfo[];
}

// Usuarios del sistema
const USERS: Record<string, { password: string; info: UserInfo }> = {
  admin: {
    password: 'CNE2025*',
    info: { name: 'Benjamín Ortiz Torres', role: 'Magistrado', email: 'bortiz@cne.gov.co', username: 'admin' },
  },
  kpalacio: {
    password: 'CNE2025*',
    info: { name: 'Karen Ines Palacio Ferrer', role: 'Abogada', email: 'kpalacio@cne.gov.co', username: 'kpalacio' },
  },
  lyepes: {
    password: 'CNE2025*',
    info: { name: 'Leidy Tatiana Yepes Joya', role: 'Abogada', email: 'lyepes@cne.gov.co', username: 'lyepes' },
  },
  abastidas: {
    password: 'CNE2025*',
    info: { name: 'Angelica Johanna Bastidas Salgado', role: 'Abogada', email: 'abastidas@cne.gov.co', username: 'abastidas' },
  },
  dvergara: {
    password: 'CNE2025*',
    info: { name: 'Diana Mercedes Vergara Llanos', role: 'Abogada', email: 'dvergara@cne.gov.co', username: 'dvergara' },
  },
  jlopez: {
    password: 'CNE2025*',
    info: { name: 'Julian David López Lovera', role: 'Abogado', email: 'jlopez@cne.gov.co', username: 'jlopez' },
  },
};

const ALL_USERS: UserInfo[] = Object.values(USERS).map(u => u.info);

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = sessionStorage.getItem('cne_auth');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { isAuthenticated: false, user: null };
  });

  const login = useCallback((username: string, password: string) => {
    const userEntry = USERS[username.toLowerCase()];
    if (userEntry && userEntry.password === password) {
      const state: AuthState = {
        isAuthenticated: true,
        user: userEntry.info,
      };
      setAuth(state);
      sessionStorage.setItem('cne_auth', JSON.stringify(state));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuth({ isAuthenticated: false, user: null });
    sessionStorage.removeItem('cne_auth');
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, allUsers: ALL_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
