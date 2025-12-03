import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user";
import { authService } from "../services/auth";

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
  // ДОДАЄМО МЕТОДИ
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // СІГНАТУРИ МЕТОДІВ
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
          // ВАЖЛИВО: Зберегти токен в localStorage
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
        const { token } = get();
        if (!token) {
          set({ user: null });
          return;
        }

        try {
          const user = await authService.me();
          set({ user });
        } catch (error: any) {
          if (
            error.message.includes("401") ||
            error.message.includes("Unauthorized")
          ) {
            set({
              user: null,
              token: null,
              error: "Сесія закінчилася. Будь ласка, увійдіть знову.",
            });
          } else {
            console.error("Помилка перевірки авторизації:", error);
          }
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // ДОДАЄМО НОВІ МЕТОДИ
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
