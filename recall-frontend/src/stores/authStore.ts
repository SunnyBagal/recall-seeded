import { create } from "zustand";

// Namespaced so the session doesn't collide with other apps served from the
// same origin during local development (several Vite apps share :5173).
export const TOKEN_STORAGE_KEY = "recall:token";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
 
  
  setToken: (token: string) => void;
  logout: () => void;
}
 
export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_STORAGE_KEY),
 
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, isAuthenticated: true });
  },
 
  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, isAuthenticated: false });
  },
}));
