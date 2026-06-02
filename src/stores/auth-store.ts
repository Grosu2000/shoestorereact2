import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user";
import { authService } from "../services/auth";
import { api } from "../services/api";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

// Тип для відповіді API
interface AuthMeResponse {
  success?: boolean;
  data?: User;
  user?: User;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
          localStorage.setItem("token", response.token);
        } catch (error: any) {
          set({
            error: error.message || "Помилка авторизації",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({
            email,
            password,
            name,
            confirmPassword: "",
          });
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Помилка реєстрації",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout().catch(() => {});
        set({
          user: null,
          token: null,
          error: null,
        });
      },

      checkAuth: async () => {
        const token = get().token;
        console.log('🔍 checkAuth called, token exists:', !!token);
        
        if (!token) {
          set({ user: null, isLoading: false });
          return;
        }
        
        try {
          const response = await api.get<AuthMeResponse>('/auth/me');
          console.log('📡 Auth response:', response);
          
          let userData: User | null = null;
          
          // Перевіряємо різні формати відповіді
          if (response && 'data' in response && response.data) {
            userData = response.data;
          } else if (response && 'user' in response && response.user) {
            userData = response.user as User;
          } else if (response && 'id' in response) {
            userData = response as unknown as User;
          }
          
          if (userData) {
            set({ user: userData, isLoading: false });
          } else {
            console.warn('No user data in response');
            set({ user: null, token: null, isLoading: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, token: null, isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);