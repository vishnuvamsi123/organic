import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthState {
  token: string | null;
  role: 'user' | 'farmer' | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, role: 'user' | 'farmer') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as 'user' | 'farmer' | null;
    return {
      token,
      role,
      isAuthenticated: !!token,
    };
  });

  const login = useCallback((token: string, role: 'user' | 'farmer') => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setState({ token, role, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('userName');
    localStorage.removeItem('organic_cart');
    localStorage.removeItem('cart');
    setState({ token: null, role: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
